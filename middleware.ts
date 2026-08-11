import { createClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

import { SESSION_COOKIE_NAME } from "@/lib/auth/constants";
import { CLIENT_SESSION_COOKIE_NAME } from "@/lib/portal/constants";

async function hashSessionToken(token: string): Promise<string> {
  const data = new TextEncoder().encode(token);
  const hashBuffer = await crypto.subtle.digest("SHA-256", data);

  return Array.from(new Uint8Array(hashBuffer))
    .map((byte) => byte.toString(16).padStart(2, "0"))
    .join("");
}

function getServiceSupabase() {
  const url =
    process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL;
  const serviceRoleKey =
    process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SECRET_KEY;

  if (!url || !serviceRoleKey) {
    return null;
  }

  return createClient(url, serviceRoleKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  });
}

async function hasValidAdminSession(request: NextRequest): Promise<boolean> {
  const token = request.cookies.get(SESSION_COOKIE_NAME)?.value;

  if (!token) {
    return false;
  }

  const supabase = getServiceSupabase();
  if (!supabase) return false;

  const tokenHash = await hashSessionToken(token);

  const { data: session, error: sessionError } = await supabase
    .from("sessions")
    .select("id, admin_id")
    .eq("token_hash", tokenHash)
    .gt("expires_at", new Date().toISOString())
    .maybeSingle();

  if (sessionError || !session) {
    return false;
  }

  const { data: admin, error: adminError } = await supabase
    .from("admins")
    .select("id")
    .eq("id", session.admin_id)
    .eq("is_active", true)
    .maybeSingle();

  return !adminError && Boolean(admin);
}

async function hasValidClientSession(request: NextRequest): Promise<boolean> {
  const token = request.cookies.get(CLIENT_SESSION_COOKIE_NAME)?.value;

  if (!token) {
    return false;
  }

  const supabase = getServiceSupabase();
  if (!supabase) return false;

  const tokenHash = await hashSessionToken(token);

  const { data: session, error: sessionError } = await supabase
    .from("client_sessions")
    .select("id, client_id")
    .eq("token_hash", tokenHash)
    .gt("expires_at", new Date().toISOString())
    .maybeSingle();

  if (sessionError || !session) {
    return false;
  }

  const { data: client, error: clientError } = await supabase
    .from("clients")
    .select("id")
    .eq("id", session.client_id)
    .eq("is_active", true)
    .maybeSingle();

  return !clientError && Boolean(client);
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (pathname.startsWith("/admin")) {
    const requestHeaders = new Headers(request.headers);
    requestHeaders.set("x-pathname", pathname);

    if (pathname === "/admin/login") {
      return NextResponse.next({
        request: { headers: requestHeaders },
      });
    }

    const valid = await hasValidAdminSession(request);

    if (!valid) {
      const loginUrl = new URL("/admin/login", request.url);
      return NextResponse.redirect(loginUrl);
    }

    return NextResponse.next({
      request: { headers: requestHeaders },
    });
  }

  if (pathname.startsWith("/portal")) {
    const requestHeaders = new Headers(request.headers);
    requestHeaders.set("x-pathname", pathname);

    if (pathname === "/portal/login") {
      return NextResponse.next({
        request: { headers: requestHeaders },
      });
    }

    const valid = await hasValidClientSession(request);

    if (!valid) {
      const loginUrl = new URL("/portal/login", request.url);
      return NextResponse.redirect(loginUrl);
    }

    return NextResponse.next({
      request: { headers: requestHeaders },
    });
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin", "/admin/:path*", "/portal", "/portal/:path*"],
};
