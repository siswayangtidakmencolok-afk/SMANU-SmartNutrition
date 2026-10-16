/**
 * /api/food-scanner — AI Food Recognition Endpoint
 *
 * POST /api/food-scanner
 *
 * Accepts a base64-encoded food image, runs Gemini Vision to produce
 * candidate food names, then matches against the local food database.
 *
 * REQUEST (multipart/form-data or JSON):
 *   { imageBase64: string, mimeType: "image/jpeg"|"image/png"|"image/webp" }
 *
 * RESPONSE 200:
 *   {
 *     candidates: { foodId, namePrimary, confidence: "high"|"medium"|"low",
 *                   reason: string }[],
 *     imageQuality: "ok" | "unclear" | "not_food",
 *     message?: string,   // shown when imageQuality != "ok"
 *   }
 *
 * RESPONSE 4xx / 5xx: { error: string }
 *
 * SECURITY NOTES:
 * - GEMINI_API_KEY is server-side only.
 * - Images are NOT stored — processed in memory only.
 * - File size is capped at MAX_IMAGE_BYTES.
 * - Auth is NOT required for the recognition step (demo-friendly),
 *   but saving a scan log to the DB DOES require a valid session
 *   (handled in POST /api/food-scanner/save).
 */

import { NextRequest } from "next/server";
import { GoogleGenerativeAI, HarmCategory, HarmBlockThreshold } from "@google/generative-ai";
import { searchFoodByName } from "@/lib/food-database";

export const runtime = "nodejs";

// ── Constants ────────────────────────────────────────────────────────────────
const MAX_IMAGE_BYTES  = 4 * 1024 * 1024; // 4 MB
const ALLOWED_MIMES    = ["image/jpeg", "image/png", "image/webp"] as const;
type AllowedMime = (typeof ALLOWED_MIMES)[number];

// ── Types ────────────────────────────────────────────────────────────────────
export interface ScanCandidate {
  foodId:      string | null;  // null = not in our DB
  namePrimary: string;
  confidence:  "high" | "medium" | "low";
  reason:      string;
}

interface ScanResponse {
  candidates:   ScanCandidate[];
  imageQuality: "ok" | "unclear" | "not_food";
  message?:     string;
}

// ── Vision prompt ────────────────────────────────────────────────────────────
const VISION_PROMPT = `Kamu adalah asisten pengenal makanan Indonesia untuk aplikasi edukasi gizi pelajar.

Analisa gambar berikut dengan TELITI. Berikan respons HANYA dalam format JSON berikut, tanpa teks lain:

{
  "imageQuality": "ok" | "unclear" | "not_food",
  "qualityReason": "<alasan singkat jika bukan ok>",
  "candidates": [
    {
      "name": "<nama makanan dalam Bahasa Indonesia>",
      "confidence": "high" | "medium" | "low",
      "reason": "<1 kalimat: ciri visual yang kamu lihat>"
    }
  ]
}

ATURAN:
- imageQuality "ok" hanya jika gambar jelas DAN berisi makanan yang dapat diidentifikasi.
- imageQuality "unclear" jika gambar buram, terlalu gelap, atau sudut tidak memadai.
- imageQuality "not_food" jika gambar bukan makanan.
- Berikan MAKSIMAL 3 kandidat, diurutkan dari yang paling yakin.
- confidence "high" hanya jika ciri visual sangat khas dan jelas.
- confidence "medium" jika ada kemungkinan lain yang serupa.
- confidence "low" jika hanya memperkirakan.
- JANGAN mengarang nama makanan jika tidak yakin — gunakan confidence "low" dan sebut kemungkinan.
- JANGAN menyebut kandungan gizi, berat, atau bahan tersembunyi — kamu hanya melihat gambar.
- Jika ada beberapa makanan dalam satu piring, sebutkan makanan yang paling dominan.
- Berikan respons dalam Bahasa Indonesia.`;

// ── Handler ──────────────────────────────────────────────────────────────────
export async function POST(req: NextRequest) {
  // 1. API key check
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    console.error("[food-scanner] GEMINI_API_KEY not configured");
    return Response.json({ error: "Scanner AI belum tersedia." }, { status: 503 });
  }

  // 2. Parse request
  let imageBase64: string;
  let mimeType: AllowedMime;

  try {
    const body = await req.json() as { imageBase64?: unknown; mimeType?: unknown };
    if (typeof body.imageBase64 !== "string" || !body.imageBase64) {
      return Response.json({ error: "imageBase64 diperlukan." }, { status: 400 });
    }
    if (!ALLOWED_MIMES.includes(body.mimeType as AllowedMime)) {
      return Response.json(
        { error: "Format gambar tidak didukung. Gunakan JPEG, PNG, atau WebP." },
        { status: 400 }
      );
    }
    imageBase64 = body.imageBase64;
    mimeType    = body.mimeType as AllowedMime;
  } catch {
    return Response.json({ error: "Format request tidak valid." }, { status: 400 });
  }

  // 3. Validate size (base64 → ~75% of raw bytes)
  const approxBytes = Math.ceil((imageBase64.length * 3) / 4);
  if (approxBytes > MAX_IMAGE_BYTES) {
    return Response.json(
      { error: "Ukuran gambar terlalu besar. Maksimal 4 MB." },
      { status: 413 }
    );
  }

  // 4. Call Gemini Vision
  let rawJson: string;
  try {
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({
      model: "gemini-2.0-flash",
      generationConfig: {
        temperature: 0.2,
        maxOutputTokens: 512,
        responseMimeType: "application/json",
      },
      safetySettings: [
        { category: HarmCategory.HARM_CATEGORY_HARASSMENT,        threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE },
        { category: HarmCategory.HARM_CATEGORY_HATE_SPEECH,       threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE },
        { category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT, threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE },
      ],
    });

    const result = await model.generateContent([
      { inlineData: { data: imageBase64, mimeType } },
      { text: VISION_PROMPT },
    ]);

    rawJson = result.response.text().trim();
  } catch (err) {
    console.error("[food-scanner] Gemini error:", err instanceof Error ? err.message : String(err));
    return Response.json(
      { error: "Analisis gambar gagal. Coba lagi atau pilih makanan secara manual." },
      { status: 502 }
    );
  }

  // 5. Parse Gemini JSON response
  let parsed: {
    imageQuality: string;
    qualityReason?: string;
    candidates: { name: string; confidence: string; reason: string }[];
  };

  try {
    // Strip possible markdown fences
    const clean = rawJson.replace(/^```json\s*/i, "").replace(/```\s*$/i, "").trim();
    parsed = JSON.parse(clean);
  } catch {
    console.error("[food-scanner] JSON parse failed:", rawJson.slice(0, 200));
    return Response.json(
      { error: "Respons model tidak dapat diproses. Coba ambil foto ulang." },
      { status: 502 }
    );
  }

  // 6. Image quality gate
  const quality = parsed.imageQuality;
  if (quality === "unclear") {
    return Response.json({
      candidates:   [],
      imageQuality: "unclear",
      message:
        "Foto kurang jelas. Pastikan pencahayaan cukup, kamera tidak buram, " +
        "dan makanan terlihat dengan jelas.",
    } satisfies ScanResponse);
  }
  if (quality === "not_food") {
    return Response.json({
      candidates:   [],
      imageQuality: "not_food",
      message:
        "Gambar tidak terdeteksi sebagai makanan. " +
        "Coba foto makanan secara langsung atau pilih makanan secara manual.",
    } satisfies ScanResponse);
  }

  // 7. Match candidates to food database
  const rawCandidates = Array.isArray(parsed.candidates) ? parsed.candidates : [];
  const candidates: ScanCandidate[] = rawCandidates.slice(0, 3).map((c) => {
    const matches = searchFoodByName(c.name ?? "");
    const best    = matches[0] ?? null;
    return {
      foodId:      best?.foodId ?? null,
      namePrimary: best?.namePrimary ?? c.name ?? "Makanan tidak dikenal",
      confidence:  (["high", "medium", "low"].includes(c.confidence) ? c.confidence : "low") as
                   "high" | "medium" | "low",
      reason:      (c.reason ?? "").slice(0, 200),
    };
  });

  return Response.json({
    candidates,
    imageQuality: "ok",
  } satisfies ScanResponse);
}

// Export type for use in client
export type { ScanResponse };
