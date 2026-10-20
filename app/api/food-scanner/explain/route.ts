/**
 * /api/food-scanner/explain
 *
 * POST — AI Nutrition Fallback
 *
 * Called when a food is NOT found in the TKPI-2017 / USDA-FDC database.
 * Uses Gemini to produce a structured nutrition ESTIMATE based on food name,
 * portion weight, and optional image context from the recognition step.
 *
 * THIS IS AN ESTIMATE — not verified reference data.
 * The response carries dataStatus: "ai_estimate" so the UI can label it clearly.
 *
 * REQUEST body:
 * {
 *   foodName:     string,           // required, confirmed food name from user
 *   portionG:     number,           // required, portion weight entered by user
 *   recognitionContext?: string,    // optional: reason string from vision candidates
 * }
 *
 * RESPONSE 200:
 * {
 *   foodName:         string,
 *   portionG:         number,
 *   dataStatus:       "ai_estimate",
 *   energyKcal:       number | null,
 *   proteinG:         number | null,
 *   fatG:             number | null,
 *   carbG:            number | null,
 *   fiberG:           number | null,
 *   energyRange?:     string,   // e.g. "400–550 kcal" when uncertainty is high
 *   explanation:      string,   // what this food is + composition reasoning
 *   assumptions:      string,   // portion assumptions + uncertainty
 *   disclaimer:       string,
 * }
 *
 * RESPONSE 400: { error: string }   validation error
 * RESPONSE 503: { error: string }   Gemini not configured
 * RESPONSE 502: { error: string }   Gemini call failed
 *
 * SECURITY: GEMINI_API_KEY is server-side only.
 */

import { NextRequest } from "next/server";
import { GoogleGenerativeAI, HarmCategory, HarmBlockThreshold } from "@google/generative-ai";

export const runtime = "nodejs";

export interface ExplainApiResponse {
  foodName:     string;
  portionG:     number;
  dataStatus:   "ai_estimate";
  energyKcal:   number | null;
  proteinG:     number | null;
  fatG:         number | null;
  carbG:        number | null;
  fiberG:       number | null;
  energyRange:  string | null;   // provided when estimate uncertainty is high
  explanation:  string;
  assumptions:  string;
  disclaimer:   string;
}

interface ExplainBody {
  foodName:             string;
  portionG:             number;
  recognitionContext?:  string;
}

// ── Prompt ────────────────────────────────────────────────────────────────────

function buildPrompt(foodName: string, portionG: number, context?: string): string {
  return `Kamu adalah asisten gizi edukatif untuk aplikasi pelajar Indonesia.
Tugasmu memberikan ESTIMASI nutrisi berdasarkan nama makanan dan berat porsi.

Makanan: "${foodName}"
Berat porsi: ${portionG} gram
${context ? `Konteks visual: ${context}` : ""}

Berikan respons HANYA dalam format JSON berikut, tanpa teks lain di luar JSON:

{
  "explanation": "<1–2 kalimat: apa makanan ini, komposisi umum yang diperkirakan>",
  "energyKcal": <angka bulat estimasi kalori untuk porsi ${portionG}g, atau null jika tidak dapat diperkirakan>,
  "proteinG": <angka desimal 1 tempat estimasi protein gram untuk porsi ${portionG}g, atau null>,
  "fatG": <angka desimal 1 tempat estimasi lemak gram untuk porsi ${portionG}g, atau null>,
  "carbG": <angka desimal 1 tempat estimasi karbohidrat gram untuk porsi ${portionG}g, atau null>,
  "fiberG": <angka desimal 1 tempat estimasi serat gram untuk porsi ${portionG}g, atau null>,
  "energyRange": "<misal '350–500 kcal' jika ada ketidakpastian tinggi, atau null jika estimasi cukup spesifik>",
  "assumptions": "<1–2 kalimat: asumsi komposisi, porsi, metode memasak yang digunakan>",
  "uncertaintyNote": "<1 kalimat: mengapa estimasi ini tidak pasti, atau null jika ketidakpastian rendah>"
}

ATURAN WAJIB:
- Berikan nilai numerik HANYA jika kamu memiliki basis pengetahuan yang masuk akal untuk makanan tersebut.
- Jika makanan sangat spesifik (resep lokal unik, merek tertentu, campuran kompleks), gunakan null untuk nilai yang tidak dapat diperkirakan dan berikan energyRange saja.
- JANGAN mengarang angka presisi palsu. Lebih baik rentang daripada kepastian palsu.
- JANGAN menyebut angka yang jauh melebihi batas gizi normal untuk porsi tersebut.
- Nilai harus untuk PORSI ${portionG}g, bukan per 100g.
- Gunakan Bahasa Indonesia untuk explanation, assumptions, dan uncertaintyNote.
- Respons harus valid JSON yang dapat di-parse langsung.`;
}

// ── Handler ───────────────────────────────────────────────────────────────────

export async function POST(req: NextRequest) {
  // 1. API key check
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return Response.json(
      { error: "AI fallback tidak tersedia saat ini — API key belum dikonfigurasi." },
      { status: 503 }
    );
  }

  // 2. Parse & validate body
  let body: ExplainBody;
  try {
    body = await req.json() as ExplainBody;
  } catch {
    return Response.json({ error: "Format request tidak valid." }, { status: 400 });
  }

  const foodName = body.foodName?.trim().slice(0, 200);
  if (!foodName) {
    return Response.json({ error: "foodName diperlukan." }, { status: 400 });
  }

  const portionG = typeof body.portionG === "number" ? body.portionG : parseFloat(String(body.portionG));
  if (!portionG || portionG <= 0 || portionG > 5000) {
    return Response.json(
      { error: "portionG harus angka positif antara 1–5000 gram." },
      { status: 400 }
    );
  }

  const context = body.recognitionContext?.trim().slice(0, 300);

  // 3. Call Gemini
  let rawJson: string;
  try {
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({
      model: "gemini-flash-lite-latest",
      generationConfig: {
        temperature: 0.3,
        maxOutputTokens: 600,
      },
      safetySettings: [
        { category: HarmCategory.HARM_CATEGORY_HARASSMENT,        threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE },
        { category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT, threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE },
      ],
    });

    const result = await model.generateContent(buildPrompt(foodName, portionG, context));
    rawJson = result.response.text().trim();
    if (!rawJson) throw new Error("Empty response from model");
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    console.error("[food-scanner/explain] Gemini error:", msg);
    return Response.json(
      { error: "Estimasi AI gagal. Coba lagi atau pilih makanan dari database." },
      { status: 502 }
    );
  }

  // 4. Parse Gemini JSON
  let parsed: {
    explanation?:     string;
    energyKcal?:      number | null;
    proteinG?:        number | null;
    fatG?:            number | null;
    carbG?:           number | null;
    fiberG?:          number | null;
    energyRange?:     string | null;
    assumptions?:     string;
    uncertaintyNote?: string | null;
  };

  try {
    const clean = rawJson
      .replace(/^```json\s*/i, "")
      .replace(/^```\s*/i, "")
      .replace(/```\s*$/i, "")
      .trim();
    parsed = JSON.parse(clean);
  } catch {
    console.error("[food-scanner/explain] JSON parse failed:", rawJson.slice(0, 300));
    return Response.json(
      { error: "Respons AI tidak dapat diproses. Coba lagi." },
      { status: 502 }
    );
  }

  // 5. Sanitise values — reject wildly out-of-range numbers
  function safeNum(v: unknown, min: number, max: number): number | null {
    const n = typeof v === "number" ? v : parseFloat(String(v));
    if (isNaN(n) || n < min || n > max) return null;
    return Math.round(n * 10) / 10;
  }

  const energyKcal = safeNum(parsed.energyKcal, 0, 5000);
  const proteinG_  = safeNum(parsed.proteinG,   0,  500);
  const fatG_      = safeNum(parsed.fatG,        0,  500);
  const carbG_     = safeNum(parsed.carbG,       0, 1000);
  const fiberG_    = safeNum(parsed.fiberG,      0,  200);

  const explanation    = (parsed.explanation ?? "").slice(0, 400);
  const assumptions    = [
    parsed.assumptions ?? "",
    parsed.uncertaintyNote ?? "",
  ].filter(Boolean).join(" ").slice(0, 600);
  const energyRange    = parsed.energyRange
    ? String(parsed.energyRange).slice(0, 100)
    : null;

  const response: ExplainApiResponse = {
    foodName,
    portionG,
    dataStatus:   "ai_estimate",
    energyKcal,
    proteinG:     proteinG_,
    fatG:         fatG_,
    carbG:        carbG_,
    fiberG:       fiberG_,
    energyRange,
    explanation,
    assumptions:  assumptions || `Estimasi untuk porsi ${portionG} g berdasarkan pengetahuan umum komposisi makanan.`,
    disclaimer:
      "Nilai ini adalah estimasi AI — bukan data dari TKPI-2017 atau USDA-FDC. " +
      "Resep, ukuran, saus, minyak, dan bahan tambahan dapat mengubah hasil secara signifikan. " +
      "Gunakan hanya sebagai referensi edukatif, bukan pengukuran nutrisi yang presisi.",
  };

  return Response.json(response);
}
