"use server";

import { redirect } from "next/navigation";

import {
  assertValidCsrf,
  clearCsrfCookie,
  generateCsrfToken,
  setCsrfCookie,
} from "@/lib/auth/csrf";
import { getClientIp, getUserAgent } from "@/lib/auth/request";
import {
  CLIENT_INVALID_CREDENTIALS_MESSAGE,
  CLIENT_SESSION_MAX_AGE_SECONDS,
} from "@/lib/portal/constants";
import { verifyPassword } from "@/lib/portal/password";
import {
  clearClientSessionCookie,
  createClientSession,
  deleteClientSession,
  getClientSessionExpiryDate,
  getClientSessionTokenFromCookies,
  getCurrentClient,
  generateClientSessionToken,
  setClientSessionCookie,
} from "@/lib/portal/session";
import {
  portalLoginSchema,
  portalLogoutSchema,
} from "@/lib/schemas/portal";
import { createServerSupabaseClient } from "@/lib/supabase/server";

export type PortalLoginActionResult =
  | { success: true }
  | { success: false; error: string };

export type PortalLogoutActionResult =
  | { success: true }
  | { success: false; error: string };

export async function loginAction(
  input: unknown,
): Promise<PortalLoginActionResult> {
  const parsed = portalLoginSchema.safeParse(input);

  if (!parsed.success) {
    return { success: false, error: CLIENT_INVALID_CREDENTIALS_MESSAGE };
  }

  const email = parsed.data.email.trim().toLowerCase();
  const { password } = parsed.data;
  const ip = (await getClientIp()) ?? "unknown";
  const userAgent = await getUserAgent();
  const supabase = createServerSupabaseClient();

  const { data: client, error: clientError } = await supabase
    .from("clients")
    .select("id, password_hash, is_active")
    .eq("email", email)
    .maybeSingle();

  if (clientError) throw clientError;

  if (!client || !client.is_active) {
    return { success: false, error: CLIENT_INVALID_CREDENTIALS_MESSAGE };
  }

  const passwordValid = await verifyPassword(password, client.password_hash);

  if (!passwordValid) {
    return { success: false, error: CLIENT_INVALID_CREDENTIALS_MESSAGE };
  }

  const sessionToken = generateClientSessionToken();
  const expiresAt = getClientSessionExpiryDate();

  await createClientSession(client.id, sessionToken, expiresAt, ip, userAgent);
  await setClientSessionCookie(sessionToken, CLIENT_SESSION_MAX_AGE_SECONDS);

  const csrfToken = generateCsrfToken();
  await setCsrfCookie(csrfToken);

  redirect("/portal");
}

export async function logoutAction(
  input: unknown,
): Promise<PortalLogoutActionResult> {
  const parsed = portalLogoutSchema.safeParse(input);

  if (!parsed.success) {
    return { success: false, error: "Invalid request" };
  }

  try {
    await assertValidCsrf(parsed.data.csrfToken);
  } catch {
    return { success: false, error: "Invalid request" };
  }

  const client = await getCurrentClient();
  const token = await getClientSessionTokenFromCookies();

  if (client) {
    await deleteClientSession(client.sessionId);
  } else if (token) {
    const { deleteClientSessionByToken } = await import("@/lib/portal/session");
    await deleteClientSessionByToken(token);
  }

  await clearClientSessionCookie();
  await clearCsrfCookie();

  redirect("/portal/login");
}
