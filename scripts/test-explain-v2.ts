/**
 * test-explain-v2.ts
 *
 * Tests the upgraded /api/food-scanner/explain endpoint directly
 * (calls Gemini with the 7-section prompt and verifies all sections return).
 *
 * Usage: npx tsx scripts/test-explain-v2.ts
 */

import { config } from "dotenv";
import path from "path";
config({ path: path.join(process.cwd(), ".env.local") });

import { GoogleGenerativeAI, HarmCategory, HarmBlockThreshold } from "@google/generative-ai";

const apiKey = process.env.GEMINI_API_KEY;
if (!apiKey) { console.error("❌  GEMINI_API_KEY not set"); process.exit(1); }

function buildPrompt(foodName: string, portionG: number, context?: string, weightIsAiEstimate?: boolean): string {
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
  "whatIsIt": "<Bagian A: Jelaskan apa makanan ini, bahan utama, cara pengolahan, ciri khas, variasi.>",
  "composition": "<Bagian B: Bahan utama dan pengaruhnya terhadap nutrisi.>",
  "nutritionExplain": "<Bagian C: Nilai energi dan fungsi zat gizi.>",
  "portionContext": "<Bagian D: Konteks berat ${portionG}g dan asumsi porsi.>",
  "variations": "<Bagian E: Faktor yang menyebabkan nilai berbeda.>",
  "sourceLimits": "<Bagian F: Ini estimasi AI, bukan TKPI/USDA.>",
  "eduSummary": "<Bagian G: 2–3 kalimat kesimpulan edukatif.>",
  "assumptions": "<Ringkasan asumsi utama.>",
  "uncertaintyNote": "<Mengapa estimasi tidak pasti, atau null.>"
}

ATURAN WAJIB:
- Nilai nutrisi untuk PORSI ${portionG}g, bukan per 100g.
- Bahasa Indonesia yang baik dan informatif.
- Respons harus valid JSON.`;
}

async function testFood(foodName: string, portionG: number, context?: string) {
  console.log(`\n${"=".repeat(60)}\n🍽  ${foodName} (${portionG}g)\n${"=".repeat(60)}`);

  const genAI = new GoogleGenerativeAI(apiKey!);
  const model = genAI.getGenerativeModel({
    model: "gemini-flash-lite-latest",
    generationConfig: { temperature: 0.35, maxOutputTokens: 1800 },
    safetySettings: [
      { category: HarmCategory.HARM_CATEGORY_HARASSMENT,        threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE },
      { category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT, threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE },
    ],
  });

  const result = await model.generateContent(buildPrompt(foodName, portionG, context));
  const raw = result.response.text().trim();
  const clean = raw.replace(/^```json\s*/i, "").replace(/^```\s*/i, "").replace(/```\s*$/i, "").trim();

  let parsed: Record<string, unknown>;
  try {
    parsed = JSON.parse(clean);
  } catch {
    console.error("❌  JSON parse FAILED. Raw:", raw.slice(0, 300));
    return false;
  }

  // Check all 7 sections present
  const sections = ["whatIsIt", "composition", "nutritionExplain", "portionContext", "variations", "sourceLimits", "eduSummary"];
  let allPresent = true;
  for (const s of sections) {
    if (typeof parsed[s] === "string" && (parsed[s] as string).length > 10) {
      console.log(`  ✓ ${s}: ${(parsed[s] as string).slice(0, 70)}…`);
    } else {
      console.error(`  ✗ ${s}: MISSING or too short`);
      allPresent = false;
    }
  }

  console.log(`\n  nutrition → energy: ${parsed.energyKcal ?? "null"} kcal | range: ${parsed.energyRange ?? "null"}`);
  console.log(`             protein: ${parsed.proteinG ?? "null"}g | fat: ${parsed.fatG ?? "null"}g | carb: ${parsed.carbG ?? "null"}g | fiber: ${parsed.fiberG ?? "null"}g`);
  console.log(`  assumptions: ${String(parsed.assumptions ?? "").slice(0, 100)}`);

  return allPresent;
}

async function main() {
  console.log("🚀 SMANU AI Food Scanner — explain v2 (7-section) test");

  const results = await Promise.allSettled([
    testFood("Burger dengan Kentang Goreng", 250, "burger besar dengan patty daging, roti, saus tomat, kentang goreng di pinggir"),
    testFood("Croissant", 80),
    testFood("Tahu Goreng", 150, "dua potong tahu kuning goreng kering dengan kulit kecoklatan"),
  ]);

  const pass = results.filter(r => r.status === "fulfilled" && r.value === true).length;
  const fail = results.length - pass;
  console.log(`\n${"=".repeat(60)}`);
  console.log(`Result: ${pass}/${results.length} pass, ${fail} fail`);
  if (fail > 0) process.exit(1);
}

main().catch(e => { console.error("Fatal:", e); process.exit(1); });
