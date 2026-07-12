import { NextResponse } from "next/server";

import { checkSearchRateLimit } from "@/lib/auth/rate-limit";
import { searchContent } from "@/lib/db/queries";

function getRequestIp(request: Request): string {
  const forwarded = request.headers.get("x-forwarded-for");
  if (forwarded) {
    return forwarded.split(",")[0]?.trim() || "unknown";
  }
  return request.headers.get("x-real-ip") ?? "unknown";
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const query = searchParams.get("q")?.trim() ?? "";

  if (!query) {
    return NextResponse.json({ results: [] });
  }

  if (query.length > 120) {
    return NextResponse.json(
      { error: "Query too long", results: [] },
      { status: 400 },
    );
  }

  const rate = await checkSearchRateLimit(getRequestIp(request));
  if (!rate.allowed) {
    return NextResponse.json(
      { error: "Too many requests", results: [] },
      {
        status: 429,
        headers: rate.retryAfterSeconds
          ? { "Retry-After": String(rate.retryAfterSeconds) }
          : undefined,
      },
    );
  }

  try {
    const results = await searchContent(query);
    return NextResponse.json({ results });
  } catch {
    return NextResponse.json(
      { error: "Search unavailable", results: [] },
      { status: 500 },
    );
  }
}
