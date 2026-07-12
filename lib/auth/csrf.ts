import { createHmac, randomBytes, timingSafeEqual } from "node:crypto";
import { cookies } from "next/headers";

import { CSRF_COOKIE_NAME } from "@/lib/auth/constants";

function getSessionSecret(): string {
  const secret = process.env.SESSION_SECRET;

  if (!secret || secret.length < 32) {
    throw new Error("SESSION_SECRET must be set and at least 32 characters");
  }

  return secret;
}

function signToken(token: string): string {
  const signature = createHmac("sha256", getSessionSecret())
    .update(token)
    .digest("hex");

  return `${token}.${signature}`;
}

function verifySignedToken(signed: string): string | null {
  const separatorIndex = signed.lastIndexOf(".");

  if (separatorIndex === -1) {
    return null;
  }

  const token = signed.slice(0, separatorIndex);
  const signature = signed.slice(separatorIndex + 1);
  const expected = createHmac("sha256", getSessionSecret())
    .update(token)
    .digest("hex");

  try {
    const signatureBuffer = Buffer.from(signature, "hex");
    const expectedBuffer = Buffer.from(expected, "hex");

    if (
      signatureBuffer.length !== expectedBuffer.length ||
      !timingSafeEqual(signatureBuffer, expectedBuffer)
    ) {
      return null;
    }
  } catch {
    return null;
  }

  return token;
}

export function generateCsrfToken(): string {
  const token = randomBytes(32).toString("hex");
  return signToken(token);
}

export async function setCsrfCookie(signedToken: string): Promise<void> {
  const cookieStore = await cookies();

  cookieStore.set(CSRF_COOKIE_NAME, signedToken, {
    httpOnly: false,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 8 * 60 * 60,
  });
}

export async function clearCsrfCookie(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.delete(CSRF_COOKIE_NAME);
}

export async function validateCsrfToken(submittedToken: string): Promise<boolean> {
  const cookieStore = await cookies();
  const cookieValue = cookieStore.get(CSRF_COOKIE_NAME)?.value;

  if (!cookieValue || !submittedToken) {
    return false;
  }

  const cookieToken = verifySignedToken(cookieValue);
  const bodyToken = verifySignedToken(submittedToken);

  if (!cookieToken || !bodyToken) {
    return false;
  }

  try {
    return timingSafeEqual(
      Buffer.from(cookieToken, "hex"),
      Buffer.from(bodyToken, "hex"),
    );
  } catch {
    return false;
  }
}

export async function assertValidCsrf(submittedToken: string): Promise<void> {
  const valid = await validateCsrfToken(submittedToken);

  if (!valid) {
    throw new Error("Invalid CSRF token");
  }
}
