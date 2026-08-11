import { createHash, randomBytes } from "node:crypto";
import { cookies } from "next/headers";

import {
  CLIENT_SESSION_COOKIE_NAME,
  CLIENT_SESSION_MAX_AGE_SECONDS,
} from "@/lib/portal/constants";
import { createServerSupabaseClient } from "@/lib/supabase/server";

export type CurrentClient = {
  id: string;
  email: string;
  fullName: string;
  isActive: boolean;
  sessionId: string;
};

export function generateClientSessionToken(): string {
  return randomBytes(32).toString("hex");
}

export function hashClientSessionToken(token: string): string {
  return createHash("sha256").update(token).digest("hex");
}

export async function setClientSessionCookie(
  token: string,
  maxAgeSeconds: number = CLIENT_SESSION_MAX_AGE_SECONDS,
): Promise<void> {
  const cookieStore = await cookies();

  cookieStore.set(CLIENT_SESSION_COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: maxAgeSeconds,
  });
}

export async function clearClientSessionCookie(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.delete(CLIENT_SESSION_COOKIE_NAME);
}

export async function getClientSessionTokenFromCookies(): Promise<string | null> {
  const cookieStore = await cookies();
  return cookieStore.get(CLIENT_SESSION_COOKIE_NAME)?.value ?? null;
}

/**
 * Validate the client session cookie and load the active client row.
 * Returns null when unauthenticated or the session is invalid/expired.
 */
export async function getCurrentClient(): Promise<CurrentClient | null> {
  const token = await getClientSessionTokenFromCookies();

  if (!token) {
    return null;
  }

  const tokenHash = hashClientSessionToken(token);
  const supabase = createServerSupabaseClient();

  const { data: session, error: sessionError } = await supabase
    .from("client_sessions")
    .select("id, expires_at, client_id")
    .eq("token_hash", tokenHash)
    .gt("expires_at", new Date().toISOString())
    .maybeSingle();

  if (sessionError) throw sessionError;
  if (!session) return null;

  const { data: client, error: clientError } = await supabase
    .from("clients")
    .select("id, email, full_name, is_active")
    .eq("id", session.client_id)
    .eq("is_active", true)
    .maybeSingle();

  if (clientError) throw clientError;
  if (!client?.is_active) return null;

  return {
    id: client.id,
    email: client.email,
    fullName: client.full_name,
    isActive: client.is_active,
    sessionId: session.id,
  };
}

export async function createClientSession(
  clientId: string,
  token: string,
  expiresAt: Date,
  ip: string | null,
  userAgent: string | null,
): Promise<string> {
  const supabase = createServerSupabaseClient();
  const tokenHash = hashClientSessionToken(token);

  const { data, error } = await supabase
    .from("client_sessions")
    .insert({
      client_id: clientId,
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

export async function deleteClientSession(sessionId: string): Promise<void> {
  const supabase = createServerSupabaseClient();

  const { error } = await supabase
    .from("client_sessions")
    .delete()
    .eq("id", sessionId);

  if (error) throw error;
}

export async function deleteClientSessionByToken(token: string): Promise<void> {
  const supabase = createServerSupabaseClient();
  const tokenHash = hashClientSessionToken(token);

  const { error } = await supabase
    .from("client_sessions")
    .delete()
    .eq("token_hash", tokenHash);

  if (error) throw error;
}

export function getClientSessionExpiryDate(): Date {
  return new Date(Date.now() + CLIENT_SESSION_MAX_AGE_SECONDS * 1000);
}
