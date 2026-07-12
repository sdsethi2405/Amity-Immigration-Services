import { createHash, randomBytes } from "node:crypto";
import { cookies } from "next/headers";

import {
  SESSION_COOKIE_NAME,
  SESSION_MAX_AGE_SECONDS,
} from "@/lib/auth/constants";
import type { CurrentAdmin, CurrentAdminRole, CurrentAdminTeam } from "@/lib/auth/types";
import { createServerSupabaseClient } from "@/lib/supabase/server";

export function generateSessionToken(): string {
  return randomBytes(32).toString("hex");
}

export function hashSessionToken(token: string): string {
  return createHash("sha256").update(token).digest("hex");
}

export async function setSessionCookie(
  token: string,
  maxAgeSeconds: number = SESSION_MAX_AGE_SECONDS,
): Promise<void> {
  const cookieStore = await cookies();

  cookieStore.set(SESSION_COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: maxAgeSeconds,
  });
}

export async function clearSessionCookie(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.delete(SESSION_COOKIE_NAME);
}

export async function getSessionTokenFromCookies(): Promise<string | null> {
  const cookieStore = await cookies();
  return cookieStore.get(SESSION_COOKIE_NAME)?.value ?? null;
}

type SessionAdminRow = {
  id: string;
  username: string;
  is_active: boolean;
  team_id: string | null;
  locked_until: string | null;
  roles: CurrentAdminRole | CurrentAdminRole[] | null;
  teams: CurrentAdminTeam | CurrentAdminTeam[] | null;
};

function unwrapRelation<T>(value: T | T[] | null): T | null {
  if (!value) return null;
  return Array.isArray(value) ? (value[0] ?? null) : value;
}

/**
 * Validate the session cookie, load admin + role + team from the database.
 * Returns null when unauthenticated or the session is invalid/expired.
 */
export async function getCurrentAdmin(): Promise<CurrentAdmin | null> {
  const token = await getSessionTokenFromCookies();

  if (!token) {
    return null;
  }

  const tokenHash = hashSessionToken(token);
  const supabase = createServerSupabaseClient();

  const { data: session, error: sessionError } = await supabase
    .from("sessions")
    .select("id, expires_at, admin_id")
    .eq("token_hash", tokenHash)
    .gt("expires_at", new Date().toISOString())
    .maybeSingle();

  if (sessionError) throw sessionError;
  if (!session) return null;

  const { data: admin, error: adminError } = await supabase
    .from("admins")
    .select(
      `
      id,
      username,
      is_active,
      team_id,
      locked_until,
      roles ( id, name, level, scope ),
      teams ( id, name, slug )
    `,
    )
    .eq("id", session.admin_id)
    .maybeSingle();

  if (adminError) throw adminError;
  if (!admin?.is_active) return null;

  const role = unwrapRelation(
    (admin as SessionAdminRow).roles,
  );

  if (!role) return null;

  return {
    id: admin.id,
    username: admin.username,
    is_active: admin.is_active,
    team_id: admin.team_id,
    role,
    team: unwrapRelation((admin as SessionAdminRow).teams),
    sessionId: session.id,
  };
}

export async function createSession(
  adminId: string,
  token: string,
  expiresAt: Date,
  ip: string | null,
  userAgent: string | null,
): Promise<string> {
  const supabase = createServerSupabaseClient();
  const tokenHash = hashSessionToken(token);

  const { data, error } = await supabase
    .from("sessions")
    .insert({
      admin_id: adminId,
      token_hash: tokenHash,
      expires_at: expiresAt.toISOString(),
      ip,
      user_agent: userAgent,
    })
    .select("id")
    .single();

  if (error) throw error;
  return data.id;
}

export async function deleteSession(sessionId: string): Promise<void> {
  const supabase = createServerSupabaseClient();

  const { error } = await supabase.from("sessions").delete().eq("id", sessionId);

  if (error) throw error;
}

export async function deleteSessionByToken(token: string): Promise<void> {
  const supabase = createServerSupabaseClient();
  const tokenHash = hashSessionToken(token);

  const { error } = await supabase
    .from("sessions")
    .delete()
    .eq("token_hash", tokenHash);

  if (error) throw error;
}

export function getSessionExpiryDate(): Date {
  return new Date(Date.now() + SESSION_MAX_AGE_SECONDS * 1000);
}
