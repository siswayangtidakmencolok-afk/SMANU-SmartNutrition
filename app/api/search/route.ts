/**
 * /api/search
 * Server-side search endpoint — architecture-ready for Astra DB swap.
 * GET /api/search?q=protein
 */

import { NextRequest, NextResponse } from "next/server";
import { searchKnowledgeBase } from "@/lib/search";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const q = (searchParams.get("q") ?? "").trim();

  if (!q) {
    return NextResponse.json(
      { query: "", results: [], count: 0, error: "Query is required" },
      { status: 400 }
    );
  }

  if (q.length > 200) {
    return NextResponse.json(
      { query: q, results: [], count: 0, error: "Query too long" },
      { status: 400 }
    );
  }

  const results = searchKnowledgeBase(q);

  return NextResponse.json({
    query: q,
    results,
    count: results.length,
  });
}
