/**
 * /api/food-scanner/explain
 *
 * POST — AI Nutrition Fallback + Deep Food Explanation
 *
 * Called when a food is NOT found in the TKPI-2017 / USDA-FDC database.
 * Uses Gemini to produce a structured nutrition ESTIMATE and a 7-section
 * educational food report.
 *
 * THIS IS AN ESTIMATE — not verified reference data.
 * The response carries dataStatus: "ai_estimate" so the UI can label it clearly.
 *
 * REQUEST body:
 * {
 *   foodName:             string,   // required — confirmed food name
 *   portionG:             number,   // required — portion weight entered by user
 *   recognitionContext?:  string,   // optional — reason string from vision step
 *   weightIsAiEstimate?:  boolean,  // true if portionG was estimated by AI, not user input
 * }
 *
 * RESPONSE 200: ExplainApiResponse (see interface below)
 * RESPONSE 400: { error: string }   validation error
 * RESPONSE 503: { error: string }   Gemini not configured
 * RESPONSE 502: { error: string }   Gemini call failed
 *
 * SECURITY: GEMINI_API_KEY is server-side only. No auth required (no PII in request).
 */

import { NextRequest } from "next/server";
import { GoogleGenerativeAI, HarmCategory, HarmBlockThreshold } from "@google/generative-ai";

export const runtime = "nodejs";

// ── Response interface ────────────────────────────────────────────────────────

export interface ExplainApiResponse {
  foodName:             string;
  portionG:             number;
  weightIsAiEstimate:   boolean;
  dataStatus:           "ai_estimate";

  // ── Nutrition estimates ──
  energyKcal:    number | null;
  proteinG:      number | null;
  fatG:          number | null;
  carbG:         number | null;
  fiberG:        number | null;
  energyRange:   string | null;  // "450–600 kcal" when uncertainty is high

  // ── 7-section structured explanation ──
  sections: {
    /** A. What the food is, main ingredients, cooking method, presentation */
    whatIsIt:          string;
    /** B. Composition: main ingredients and how they affect macros */
    composition:       string;
    /** C. Nutritional explanation: function of macros present in this food */
    nutritionExplain:  string;
    /** D. Portion context: how weight affects calculation, weight source */
    portionContext:    string;
    /** E. Variation factors: recipe, toppings, cooking method uncertainty */
    variations:        string;
    /** F. Source & limitations: clearly separates AI estimate from verified data */
    sourceLimits:      string;
    /** G. Educational summary: 2-3 sentence takeaway */
    eduSummary:        string;
  };

  assumptions:   string;   // compact version for assumptions panel
  disclaimer:    string;   // standard disclaimer text
}

// ── Request interface ─────────────────────────────────────────────────────────

interface ExplainBody {
  foodName:             string;
  portionG:             number;
  recognitionContext?:  string;
  weightIsAiEstimate?:  boolean;
}

// ── Prompt ────────────────────────────────────────────────────────────────────

function buildPrompt(
  foodName: string,
  portionG: number,
  context?: string,
  weightIsAiEstimate?: boolean
): string {
  return `Kamu adalah asisten gizi edukatif untuk aplikasi pelajar Indonesia.
Tugasmu memberikan ESTIMASI nutrisi DAN penjelasan mendalam tentang makanan ini.

Makanan: "${foodName}"
Berat porsi: ${portionG} gram (${weightIsAiEstimate ? "berat ini merupakan estimasi AI, bukan input pengguna" : "berat dimasukkan oleh pengguna"})
${context ? `Konteks visual dari kamera: ${context}` : ""}

Berikan respons HANYA dalam format JSON berikut — TIDAK ada teks lain di luar JSON.
Setiap field string harus berisi kalimat lengkap dalam Bahasa Indonesia.
Untuk field explanation, tulis cukup panjang dan informatif (2–5 kalimat per bagian).

{
  "energyKcal": <angka bulat estimasi kalori untuk porsi ${portionG}g, atau null>,
  "proteinG":   <angka desimal 1 tempat estimasi protein gram, atau null>,
  "fatG":       <angka desimal 1 tempat estimasi lemak gram, atau null>,
  "carbG":      <angka desimal 1 tempat estimasi karbohidrat gram, atau null>,
  "fiberG":     <angka desimal 1 tempat estimasi serat gram, atau null>,
  "energyRange": "<misal '350–500 kcal' jika ketidakpastian tinggi, atau null>",

  "whatIsIt": "<Bagian A: Jelaskan apa makanan ini, bahan utama yang biasanya digunakan, cara pengolahan umum, ciri khas bentuk/tekstur/rasa, variasi berdasarkan resep atau budaya, dan perbedaan versi sederhana vs komersial vs dengan topping.>",

  "composition": "<Bagian B: Jelaskan bahan utama yang mungkin ada dan pengaruhnya terhadap energi/protein/karbohidrat/lemak/serat. Bedakan bahan yang terlihat dari foto dari bahan yang hanya diasumsikan.>",

  "nutritionExplain": "<Bagian C: Uraikan nilai energi dan zat gizi yang diperkirakan. Jelaskan fungsi umum zat gizi tersebut dalam tubuh. Jelaskan mengapa nilainya dapat berbeda berdasarkan bahan, resep, ukuran, saus, minyak, dan metode memasak.>",

  "portionContext": "<Bagian D: Jelaskan berat ${portionG}g dalam konteks porsi normal makanan ini. Jelaskan bagaimana berat mempengaruhi perhitungan nutrisi. Sebutkan asumsi ukuran porsi yang digunakan.>",

  "variations": "<Bagian E: Sebutkan faktor yang dapat menyebabkan nilai berbeda: perbedaan resep, ukuran, minyak/saus/keju/gula/topping, dan metode memasak. Nyatakan ketidakpastian jika informasi tidak cukup.>",

  "sourceLimits": "<Bagian F: Jelaskan bahwa nilai ini adalah estimasi AI — bukan dari TKPI-2017 atau USDA-FDC. Sebutkan data yang benar-benar diketahui vs hanya diperkirakan. Jelaskan keterbatasan estimasi ini.>",

  "eduSummary": "<Bagian G: 2–3 kalimat ringkasan edukatif yang membantu pengguna memahami karakteristik makanan ini, mengapa estimasi gizinya memiliki ketidakpastian, dan apa yang perlu diperhatikan saat mengonsumsinya.>",

  "assumptions": "<Ringkasan kompak asumsi utama: bahan yang diasumsikan, porsi, metode memasak — 1–2 kalimat.>",

  "uncertaintyNote": "<1 kalimat mengapa estimasi ini tidak pasti, atau null jika ketidakpastian rendah.>"
}

ATURAN WAJIB:
- Berikan nilai numerik HANYA jika ada basis pengetahuan yang masuk akal.
- Untuk makanan campuran kompleks (misalnya burger + kentang goreng), gunakan energyRange dan boleh null untuk nilai yang tidak dapat dipastikan.
- JANGAN mengarang angka presisi palsu. Rentang lebih baik dari kepastian palsu.
- Semua nilai nutrisi adalah untuk PORSI ${portionG}g, bukan per 100g.
- Semua field string harus dalam Bahasa Indonesia yang baik dan informatif.
- Respons harus valid JSON tanpa karakter kontrol, komentar, atau trailing comma.`;
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

  // 2. Parse & validate
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

  const portionG = typeof body.portionG === "number"
    ? body.portionG
    : parseFloat(String(body.portionG));
  if (!portionG || portionG <= 0 || portionG > 5000) {
    return Response.json(
      { error: "portionG harus angka positif antara 1–5000 gram." },
      { status: 400 }
    );
  }

  const context            = body.recognitionContext?.trim().slice(0, 300);
  const weightIsAiEstimate = body.weightIsAiEstimate === true;

  // 3. Call Gemini
  let rawJson: string;
  try {
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({
      model: "gemini-flash-lite-latest",
      generationConfig: {
        temperature: 0.35,
        maxOutputTokens: 1800,   // enough for 7 rich sections
      },
      safetySettings: [
        { category: HarmCategory.HARM_CATEGORY_HARASSMENT,        threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE },
        { category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT, threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE },
      ],
    });

    const result = await model.generateContent(
      buildPrompt(foodName, portionG, context, weightIsAiEstimate)
    );
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
  type RawParsed = {
    energyKcal?:       number | null;
    proteinG?:         number | null;
    fatG?:             number | null;
    carbG?:            number | null;
    fiberG?:           number | null;
    energyRange?:      string | null;
    whatIsIt?:         string;
    composition?:      string;
    nutritionExplain?: string;
    portionContext?:   string;
    variations?:       string;
    sourceLimits?:     string;
    eduSummary?:       string;
    assumptions?:      string;
    uncertaintyNote?:  string | null;
  };

  let parsed: RawParsed;
  try {
    const clean = rawJson
      .replace(/^```json\s*/i, "")
      .replace(/^```\s*/i, "")
      .replace(/```\s*$/i, "")
      .trim();
    parsed = JSON.parse(clean) as RawParsed;
  } catch {
    console.error("[food-scanner/explain] JSON parse failed:", rawJson.slice(0, 400));
    return Response.json(
      { error: "Respons AI tidak dapat diproses. Coba lagi." },
      { status: 502 }
    );
  }

  // 5. Sanitise numeric values
  function safeNum(v: unknown, min: number, max: number): number | null {
    const n = typeof v === "number" ? v : parseFloat(String(v));
    if (isNaN(n) || n < min || n > max) return null;
    return Math.round(n * 10) / 10;
  }

  function safeStr(v: unknown, fallback: string, maxLen = 2000): string {
    return typeof v === "string" && v.trim() ? v.trim().slice(0, maxLen) : fallback;
  }

  const energyKcal = safeNum(parsed.energyKcal, 0, 5000);
  const proteinG_  = safeNum(parsed.proteinG,   0, 500);
  const fatG_      = safeNum(parsed.fatG,        0, 500);
  const carbG_     = safeNum(parsed.carbG,       0, 1000);
  const fiberG_    = safeNum(parsed.fiberG,      0, 200);
  const energyRange = parsed.energyRange
    ? String(parsed.energyRange).slice(0, 80)
    : null;

  const assumptions = [
    safeStr(parsed.assumptions, ""),
    safeStr(parsed.uncertaintyNote ?? "", ""),
  ].filter(Boolean).join(" ").slice(0, 800) ||
    `Estimasi untuk porsi ${portionG} g berdasarkan pengetahuan umum komposisi makanan.`;

  const sections = {
    whatIsIt:         safeStr(parsed.whatIsIt,         `${foodName} adalah makanan yang dianalisis berdasarkan nama dan konteks visual.`),
    composition:      safeStr(parsed.composition,      "Komposisi makanan ini belum dapat dianalisis secara rinci."),
    nutritionExplain: safeStr(parsed.nutritionExplain, "Informasi nutrisi berdasarkan estimasi pengetahuan umum makanan ini."),
    portionContext:   safeStr(parsed.portionContext,   `Porsi ${portionG} g digunakan sebagai dasar perhitungan nutrisi.`),
    variations:       safeStr(parsed.variations,       "Nilai nutrisi dapat bervariasi tergantung bahan dan metode memasak."),
    sourceLimits:     safeStr(parsed.sourceLimits,     "Nilai ini adalah estimasi AI dan bukan data dari TKPI-2017 atau USDA-FDC."),
    eduSummary:       safeStr(parsed.eduSummary,       `Estimasi gizi ${foodName} untuk porsi ${portionG} g bersifat indikatif dan perlu dikonfirmasi dengan sumber data terverifikasi.`),
  };

  const response: ExplainApiResponse = {
    foodName,
    portionG,
    weightIsAiEstimate,
    dataStatus: "ai_estimate",
    energyKcal,
    proteinG:   proteinG_,
    fatG:       fatG_,
    carbG:      carbG_,
    fiberG:     fiberG_,
    energyRange,
    sections,
    assumptions,
    disclaimer:
      "Nilai ini adalah estimasi AI — bukan data dari TKPI-2017 atau USDA-FDC. " +
      "Resep, ukuran, saus, minyak, topping, dan bahan tambahan dapat mengubah hasil secara signifikan. " +
      "Gunakan hanya sebagai referensi edukatif, bukan pengukuran nutrisi yang presisi.",
  };

  return Response.json(response);
}
