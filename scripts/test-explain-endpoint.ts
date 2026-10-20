/**
 * test-explain-endpoint.ts
 *
 * Quick test: calls the /api/food-scanner/explain endpoint via a live Next.js
 * dev server (must be running on localhost:3000), OR directly calls the
 * Gemini model with the same logic.
 *
 * Run from: nutripath/
 *   npx tsx scripts/test-explain-endpoint.ts
 */

import { GoogleGenerativeAI, HarmCategory, HarmBlockThreshold } from "@google/generative-ai";
import * as dotenv from "dotenv";
import * as path from "path";
import * as fs from "fs";

// Load env
const envPath = path.join(process.cwd(), ".env.local");
if (fs.existsSync(envPath)) {
  dotenv.config({ path: envPath });
}

const apiKey = process.env.GEMINI_API_KEY;
if (!apiKey) {
  console.error("❌  GEMINI_API_KEY not set in .env.local");
  process.exit(1);
}

// ── Same prompt as the endpoint ──────────────────────────────────────────────

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

// ── Test cases ────────────────────────────────────────────────────────────────

const TEST_CASES = [
  { foodName: "Burger dengan Kentang Goreng", portionG: 250, context: "terlihat burger besar dengan patty daging, roti, kentang goreng di pinggir" },
  { foodName: "Croissant",                    portionG: 80,  context: null },
  { foodName: "Nasi Goreng Spesial",          portionG: 300, context: "nasi goreng dengan telur mata sapi di atas" },
];

async function runTest(foodName: string, portionG: number, context?: string | null) {
  console.log(`\n${"=".repeat(60)}`);
  console.log(`🍽  Testing: "${foodName}" (${portionG}g)`);
  console.log("=".repeat(60));

  const genAI = new GoogleGenerativeAI(apiKey!);
  const model = genAI.getGenerativeModel({
    model: "gemini-flash-lite-latest",
    generationConfig: { temperature: 0.3, maxOutputTokens: 600 },
    safetySettings: [
      { category: HarmCategory.HARM_CATEGORY_HARASSMENT,        threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE },
      { category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT, threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE },
    ],
  });

  const result = await model.generateContent(buildPrompt(foodName, portionG, context ?? undefined));
  const raw = result.response.text().trim();

  let parsed: Record<string, unknown>;
  try {
    const clean = raw.replace(/^```json\s*/i, "").replace(/^```\s*/i, "").replace(/```\s*$/i, "").trim();
    parsed = JSON.parse(clean);
  } catch {
    console.error("❌  JSON parse failed:", raw.slice(0, 200));
    return;
  }

  console.log("✅  Parsed response:");
  console.log(`   explanation:  ${parsed.explanation}`);
  console.log(`   energyKcal:   ${parsed.energyKcal}`);
  console.log(`   proteinG:     ${parsed.proteinG}`);
  console.log(`   fatG:         ${parsed.fatG}`);
  console.log(`   carbG:        ${parsed.carbG}`);
  console.log(`   fiberG:       ${parsed.fiberG}`);
  console.log(`   energyRange:  ${parsed.energyRange}`);
  console.log(`   assumptions:  ${parsed.assumptions}`);
  console.log(`   uncertainty:  ${parsed.uncertaintyNote}`);

  // Validate no out-of-range numbers
  const checks = [
    { key: "energyKcal", min: 0, max: 5000, val: parsed.energyKcal },
    { key: "proteinG",   min: 0, max: 500,  val: parsed.proteinG   },
    { key: "fatG",       min: 0, max: 500,  val: parsed.fatG       },
    { key: "carbG",      min: 0, max: 1000, val: parsed.carbG      },
    { key: "fiberG",     min: 0, max: 200,  val: parsed.fiberG     },
  ];
  for (const c of checks) {
    if (c.val === null || c.val === undefined) continue;
    const n = Number(c.val);
    if (isNaN(n) || n < c.min || n > c.max) {
      console.warn(`⚠  ${c.key} value ${c.val} is out of range [${c.min}, ${c.max}]`);
    }
  }
}

async function main() {
  console.log("🚀 SMANU AI Food Scanner — explain endpoint test");
  console.log(`   Model: gemini-flash-lite-latest`);
  console.log(`   API key: ${apiKey!.slice(0, 8)}...`);

  for (const tc of TEST_CASES) {
    await runTest(tc.foodName, tc.portionG, tc.context);
  }

  console.log("\n\n✅ All test cases completed.");
}

main().catch((e) => { console.error("Fatal:", e); process.exit(1); });
