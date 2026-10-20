/**
 * /api/food-scanner/candidate — Submit a food candidate for review
 *
 * POST /api/food-scanner/candidate
 *
 * Called when:
 *   1. Vision returns a food name not found in food_items (vision_unmatched).
 *   2. User manually enters a food name not in the database (manual_entry).
 *   3. User corrects a wrong recognition result (user_correction).
 *
 * Auth: Optional. Authenticated submissions are higher priority for review.
 * Duplicate: If a pending candidate with the same normalized name already
 *            exists, returns 200 with existing=true (no duplicate insert).
 *
 * REQUEST:
 *   {
 *     foodNameRaw: string;        // food name as entered/recognized
 *     submissionSource: "vision_unmatched" | "manual_entry" | "user_correction";
 *     originalVisionName?: string;
 *     originalConfidence?: "high" | "medium" | "low";
 *     suggestedPortionG?: number;
 *     suggestedPortionLabel?: string;
 *     userNotes?: string;
 *   }
 *
 * RESPONSE 200:
 *   { id: string; existing: boolean; message: string }
 *
 * RESPONSE 400:
 *   { error: string }
 */

import { NextRequest } from "next/server";
import { auth } from "@/auth";
import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import { eq, and } from "drizzle-orm";
import { candidateFoods } from "@/lib/db/schema";

export const runtime = "nodejs";

function normalizeName(name: string): string {
  return name.trim().toLowerCase().replace(/\s+/g, " ");
}

const VALID_SOURCES = ["vision_unmatched", "manual_entry", "user_correction"] as const;
type SubmissionSource = (typeof VALID_SOURCES)[number];

export async function POST(req: NextRequest) {
  // ── Parse body ──────────────────────────────────────────────────────────────
  let body: Record<string, unknown>;
  try {
    body = (await req.json()) as Record<string, unknown>;
  } catch {
    return Response.json({ error: "Request body tidak valid." }, { status: 400 });
  }

  const foodNameRaw = typeof body.foodNameRaw === "string" ? body.foodNameRaw.trim() : "";
  if (!foodNameRaw || foodNameRaw.length < 2 || foodNameRaw.length > 200) {
    return Response.json(
      { error: "foodNameRaw wajib diisi (2–200 karakter)." },
      { status: 400 }
    );
  }

  const submissionSource: SubmissionSource =
    VALID_SOURCES.includes(body.submissionSource as SubmissionSource)
      ? (body.submissionSource as SubmissionSource)
      : "vision_unmatched";

  const originalVisionName =
    typeof body.originalVisionName === "string" ? body.originalVisionName.slice(0, 200) : null;
  const originalConfidence =
    ["high", "medium", "low"].includes(body.originalConfidence as string)
      ? (body.originalConfidence as string)
      : null;

  const suggestedPortionG =
    typeof body.suggestedPortionG === "number" &&
    body.suggestedPortionG > 0 &&
    body.suggestedPortionG <= 5000
      ? body.suggestedPortionG
      : null;

  const suggestedPortionLabel =
    typeof body.suggestedPortionLabel === "string"
      ? body.suggestedPortionLabel.slice(0, 100)
      : null;

  const userNotes =
    typeof body.userNotes === "string" ? body.userNotes.slice(0, 500) : null;

  const foodNameNormalized = normalizeName(foodNameRaw);

  // ── Auth (optional) ──────────────────────────────────────────────────────────
  const session = await auth();
  const userId = session?.user?.id ?? null;

  // ── DB ────────────────────────────────────────────────────────────────────────
  const db_url = process.env.DATABASE_URL;
  if (!db_url) {
    return Response.json({ error: "Database tidak tersedia." }, { status: 503 });
  }
  const client = neon(db_url);
  const db = drizzle(client);

  try {
    // Check for existing pending candidate with same normalized name
    const existing = await db
      .select({ id: candidateFoods.id })
      .from(candidateFoods)
      .where(
        and(
          eq(candidateFoods.foodNameNormalized, foodNameNormalized),
          eq(candidateFoods.status, "pending")
        )
      )
      .limit(1);

    if (existing.length > 0) {
      return Response.json({
        id: existing[0].id,
        existing: true,
        message:
          "Makanan ini sudah ada dalam daftar kandidat yang menunggu review. Terima kasih!",
      });
    }

    // Insert new candidate
    const [inserted] = await db
      .insert(candidateFoods)
      .values({
        foodNameRaw,
        foodNameNormalized,
        userId,
        submissionSource,
        originalVisionName,
        originalConfidence,
        suggestedPortionG,
        suggestedPortionLabel,
        userNotes,
        status: "pending",
      })
      .returning({ id: candidateFoods.id });

    return Response.json({
      id: inserted.id,
      existing: false,
      message:
        "Makanan berhasil disimpan sebagai kandidat. Tim SMANU akan meninjau dan menambahkannya ke database jika sesuai.",
    });
  } catch (err) {
    console.error("[food-scanner/candidate] DB error:", err);
    return Response.json(
      { error: "Gagal menyimpan kandidat. Coba lagi." },
      { status: 500 }
    );
  }
}
