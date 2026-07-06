import { NextResponse } from "next/server";
import { searchContent } from "@/lib/db/queries";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const query = searchParams.get("q")?.trim() ?? "";

  if (!query) {
    return NextResponse.json({ results: [] });
  }

  // TODO(Stage 8): Postgres full-text search via tsvector
  const results = await searchContent(query);

  return NextResponse.json({ results });
}
