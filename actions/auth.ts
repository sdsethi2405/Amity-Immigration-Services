"use server";

import { redirect } from "next/navigation";

import {
  assertValidCsrf,
  clearCsrfCookie,
  generateCsrfToken,
  setCsrfCookie,
} from "@/lib/auth/csrf";
import {
  INVALID_CREDENTIALS_MESSAGE,
  SESSION_MAX_AGE_SECONDS,
} from "@/lib/auth/constants";
import { hashPassword, verifyPassword } from "@/lib/auth/password";
import { getClientIp, getUserAgent } from "@/lib/auth/request";
import {
  checkLoginRateLimits,
  getUsernameLockUntil,
} from "@/lib/auth/rate-limit";
import {
  clearSessionCookie,
  createSession,
  deleteSession,
  getCurrentAdmin,
  getSessionExpiryDate,
  getSessionTokenFromCookies,
  setSessionCookie,
  generateSessionToken,
} from "@/lib/auth/session";
import { loginSchema, logoutSchema } from "@/lib/schemas/auth";
import { createServerSupabaseClient } from "@/lib/supabase/server";

export type LoginActionResult =
  | { success: true }
  | { success: false; error: string };

export type LogoutActionResult =
  | { success: true }
  | { success: false; error: string };

async function recordFailedLogin(adminId: string): Promise<void> {
  const supabase = createServerSupabaseClient();

  const { data: admin, error: fetchError } = await supabase
    .from("admins")
    .select("failed_login_count")
    .eq("id", adminId)
    .single();

  if (fetchError) throw fetchError;

  const { error } = await supabase
    .from("admins")
    .update({
      failed_login_count: (admin.failed_login_count ?? 0) + 1,
    })
    .eq("id", adminId);

  if (error) throw error;
}

async function resetFailedLogin(adminId: string): Promise<void> {
  const supabase = createServerSupabaseClient();

  const { error } = await supabase
    .from("admins")
    .update({
      failed_login_count: 0,
      locked_until: null,
      last_login_at: new Date().toISOString(),
    })
    .eq("id", adminId);

  if (error) throw error;
}

async function lockAdminAccount(adminId: string): Promise<void> {
  const supabase = createServerSupabaseClient();

  const { error } = await supabase
    .from("admins")
    .update({ locked_until: getUsernameLockUntil().toISOString() })
    .eq("id", adminId);

  if (error) throw error;
}

export async function loginAction(
  input: unknown,
): Promise<LoginActionResult> {
  const parsed = loginSchema.safeParse(input);

  if (!parsed.success) {
    return { success: false, error: INVALID_CREDENTIALS_MESSAGE };
  }

  const { username, password } = parsed.data;
  const ip = (await getClientIp()) ?? "unknown";
  const userAgent = await getUserAgent();
  const supabase = createServerSupabaseClient();

  const rateLimit = await checkLoginRateLimits(ip, username);

  if (!rateLimit.allowed) {
    if (rateLimit.reason === "username") {
      const { data: admin } = await supabase
        .from("admins")
        .select("id")
        .eq("username", username)
        .maybeSingle();

      if (admin) {
        await lockAdminAccount(admin.id);
      }
    }

    return { success: false, error: INVALID_CREDENTIALS_MESSAGE };
  }

  const { data: admin, error: adminError } = await supabase
    .from("admins")
    .select("id, password_hash, is_active, locked_until")
    .eq("username", username)
    .maybeSingle();

  if (adminError) throw adminError;

  const fail = async (): Promise<LoginActionResult> => {
    if (admin) {
      await recordFailedLogin(admin.id);
    }

    return { success: false, error: INVALID_CREDENTIALS_MESSAGE };
  };

  if (!admin || !admin.is_active) {
    return fail();
  }

  if (admin.locked_until && new Date(admin.locked_until) > new Date()) {
    return fail();
  }

  const passwordValid = await verifyPassword(password, admin.password_hash);

  if (!passwordValid) {
    return fail();
  }

  const sessionToken = generateSessionToken();
  const expiresAt = getSessionExpiryDate();

  await createSession(admin.id, sessionToken, expiresAt, ip, userAgent);
  await resetFailedLogin(admin.id);
  await setSessionCookie(sessionToken, SESSION_MAX_AGE_SECONDS);

  const csrfToken = generateCsrfToken();
  await setCsrfCookie(csrfToken);

  redirect("/admin");
}

export async function logoutAction(
  input: unknown,
): Promise<LogoutActionResult> {
  const parsed = logoutSchema.safeParse(input);

  if (!parsed.success) {
    return { success: false, error: "Invalid request" };
  }

  try {
    await assertValidCsrf(parsed.data.csrfToken);
  } catch {
    return { success: false, error: "Invalid request" };
  }

  const admin = await getCurrentAdmin();
  const token = await getSessionTokenFromCookies();

  if (admin) {
    await deleteSession(admin.sessionId);
  } else if (token) {
    const supabase = createServerSupabaseClient();
    const { createHash } = await import("node:crypto");
    const tokenHash = createHash("sha256").update(token).digest("hex");
    await supabase.from("sessions").delete().eq("token_hash", tokenHash);
  }

  await clearSessionCookie();
  await clearCsrfCookie();

  redirect("/admin/login");
}
