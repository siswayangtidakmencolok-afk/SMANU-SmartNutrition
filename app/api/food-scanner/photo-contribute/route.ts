/**
 * /api/food-scanner/photo-contribute
 *
 * POST — Record photo contribution METADATA with explicit user consent.
 *
 * ⚠️  Object storage (Vercel Blob) is NOT yet configured.
 * This endpoint currently stores consent + metadata only.
 * Photo upload will be enabled once BLOB_READ_WRITE_TOKEN is set in .env.local.
 *
 * REQUEST body (multipart/json — photo upload is future work):
 * {
 *   scanLogId:          string,   // the scan_log this contributes to
 *   consentGiven:       true,     // must be explicitly true
 *   visionLabel:        string,   // label from the scanner
 *   lightingCondition?: string,   // 'bright' | 'dim' | 'outdoor' | 'indoor'
 *   angleDescription?:  string,   // 'top' | 'side' | 'angled'
 *   backgroundType?:    string,   // 'plain' | 'complex'
 * }
 *
 * RESPONSE 200: { id: string, storageEnabled: boolean }
 * RESPONSE 401: not authenticated
 * RESPONSE 400: consent not given, or validation error
 */

import { NextRequest } from "next/server";
import { auth } from "@/auth";
import { db } from "@/lib/db";
import { photoContributions } from "@/lib/db/schema";

export const runtime = "nodejs";

const STORAGE_ENABLED = !!process.env.BLOB_READ_WRITE_TOKEN;

interface ContributeBody {
  scanLogId:          string;
  consentGiven:       boolean;
  visionLabel?:       string;
  lightingCondition?: string;
  angleDescription?:  string;
  backgroundType?:    string;
}

export async function POST(req: NextRequest) {
  // 1. Auth check
  const session = await auth();
  if (!session?.user?.id) {
    return Response.json({ error: "Login diperlukan." }, { status: 401 });
  }
  const userId = session.user.id;

  // 2. Parse body
  let body: ContributeBody;
  try {
    body = await req.json() as ContributeBody;
  } catch {
    return Response.json({ error: "Format request tidak valid." }, { status: 400 });
  }

  // 3. Consent is mandatory
  if (body.consentGiven !== true) {
    return Response.json({
      error: "Kontribusi foto memerlukan persetujuan eksplisit (consentGiven: true).",
    }, { status: 400 });
  }

  if (!body.scanLogId?.trim()) {
    return Response.json({ error: "scanLogId diperlukan." }, { status: 400 });
  }

  // 4. Validate optional fields (only allow known values)
  const allowedLighting = ["bright", "dim", "outdoor", "indoor"];
  const allowedAngles   = ["top", "side", "angled"];
  const allowedBg       = ["plain", "complex"];

  const lightingCondition =
    body.lightingCondition && allowedLighting.includes(body.lightingCondition)
      ? body.lightingCondition
      : null;
  const angleDescription =
    body.angleDescription && allowedAngles.includes(body.angleDescription)
      ? body.angleDescription
      : null;
  const backgroundType =
    body.backgroundType && allowedBg.includes(body.backgroundType)
      ? body.backgroundType
      : null;

  // 5. Insert contribution metadata
  try {
    const [saved] = await db.insert(photoContributions).values({
      userId,
      scanLogId:          body.scanLogId.trim(),
      consentGiven:       true,
      retainPhoto:        false,                  // default: delete after analysis
      photoStorageRef:    null,                   // not yet uploaded
      storageProvider:    STORAGE_ENABLED ? "vercel-blob" : null,
      visionLabel:        body.visionLabel?.trim().slice(0, 200) ?? null,
      lightingCondition,
      angleDescription,
      backgroundType,
      status:             "pending",
    }).returning({ id: photoContributions.id });

    return Response.json({
      id: saved.id,
      storageEnabled: STORAGE_ENABLED,
      message: STORAGE_ENABLED
        ? "Metadata disimpan. Upload foto aktif."
        : "Metadata disimpan. Upload foto belum aktif — perlu BLOB_READ_WRITE_TOKEN.",
    });
  } catch (err) {
    console.error("[photo-contribute] DB error:", err instanceof Error ? err.message : err);
    return Response.json({ error: "Gagal menyimpan kontribusi." }, { status: 500 });
  }
}
