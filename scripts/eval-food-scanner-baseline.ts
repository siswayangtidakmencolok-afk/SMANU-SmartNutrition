/**
 * scripts/eval-food-scanner-baseline.ts
 *
 * Baseline evaluation script — zero-shot food recognition via Gemini Vision.
 *
 * PURPOSE:
 *   Measures how well the current vision model identifies foods WITHOUT
 *   any fine-tuning. Results are the reference baseline before any decision
 *   about dataset collection or model training.
 *
 * USAGE:
 *   npx tsx scripts/eval-food-scanner-baseline.ts [--dataset <path>] [--limit <n>]
 *
 *   --dataset  Path to evaluation JSON file (see format below).
 *              Default: data/food-scanner/eval-samples.json (if it exists)
 *   --limit    Max samples to evaluate per class (for quick smoke-test).
 *              Default: no limit
 *
 * EVALUATION DATA FORMAT (eval-samples.json):
 *   Array of objects:
 *   {
 *     "image_id":     "nasi-putih_own_0001",
 *     "file_path":    "data/food-scanner/images/train/nasi-putih/...",
 *     "label_primary": "nasi-putih",
 *     "human_verified": true
 *   }
 *   Only samples with human_verified=true are evaluated.
 *
 * OUTPUT:
 *   - Console: per-class accuracy, precision, recall, confusion matrix stub
 *   - File:    eval/results/baseline_<timestamp>.json
 *
 * NOTE:
 *   This script ONLY evaluates food RECOGNITION (correct class?).
 *   Nutrition estimation accuracy is evaluated separately via:
 *     scripts/eval-nutrition-accuracy.ts (not yet implemented)
 *
 * ─────────────────────────────────────────────────────────────────────────
 * IMPORTANT: Do NOT interpret confidence scores from the model as calibrated
 * probabilities. "high confidence wrong" is a real failure mode.
 * ─────────────────────────────────────────────────────────────────────────
 */

import { config } from "dotenv";
import fs from "fs";
import path from "path";
config({ path: ".env.local" });

import { GoogleGenerativeAI, HarmCategory, HarmBlockThreshold } from "@google/generative-ai";

// ── Types ─────────────────────────────────────────────────────────────────────

interface EvalSample {
  image_id:       string;
  file_path:      string;
  label_primary:  string;
  human_verified: boolean;
}

interface EvalResult {
  image_id:        string;
  true_label:      string;
  predicted_label: string | null;
  predicted_rank:  number | null;  // 1=top candidate, 2=second, 3=third, null=not in top-3
  confidence:      "high" | "medium" | "low" | null;
  image_quality:   string;
  correct:         boolean;
  in_top3:         boolean;
  error?:          string;
}

// ── CLI args ──────────────────────────────────────────────────────────────────

const args = process.argv.slice(2);
const datasetArg = args[indexOf(args, "--dataset") + 1] ?? "data/food-scanner/eval-samples.json";
const limitArg   = args[indexOf(args, "--limit")   + 1];
const perClassLimit = limitArg ? parseInt(limitArg) : Infinity;

function indexOf(arr: string[], item: string): number {
  const i = arr.indexOf(item);
  return i === -1 ? -999 : i;
}

// ── Vision prompt (same as production API) ───────────────────────────────────

const VISION_PROMPT = `Analisa gambar dan identifikasi makanan. Respons HANYA dalam JSON:
{
  "imageQuality": "ok" | "unclear" | "not_food",
  "candidates": [
    { "name": "<nama makanan Bahasa Indonesia>", "confidence": "high"|"medium"|"low", "reason": "<1 kalimat>" }
  ]
}
Berikan MAKSIMAL 3 kandidat, dari paling yakin ke paling tidak yakin.`;

// ── Main ──────────────────────────────────────────────────────────────────────

async function main() {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    console.error("❌  GEMINI_API_KEY not set in .env.local");
    process.exit(1);
  }

  // Load eval dataset
  if (!fs.existsSync(datasetArg)) {
    console.error(`\n❌  Dataset file not found: ${datasetArg}`);
    console.error(`\n    No images have been collected yet (see data/food-scanner/dataset-manifest.yaml).`);
    console.error(`    This script cannot run until labeled images are available.\n`);
    process.exit(1);
  }

  const rawSamples: EvalSample[] = JSON.parse(fs.readFileSync(datasetArg, "utf-8"));
  const samples = rawSamples.filter((s) => s.human_verified === true);

  if (samples.length === 0) {
    console.error("❌  No human-verified samples found in dataset.");
    process.exit(1);
  }

  console.log(`\n📊  SMANU Food Scanner — Baseline Evaluation`);
  console.log(`    Dataset: ${datasetArg}`);
  console.log(`    Verified samples: ${samples.length}`);
  if (perClassLimit !== Infinity) {
    console.log(`    Limit per class: ${perClassLimit}`);
  }
  console.log("");

  // Count per-class and apply limit
  const classCounts: Record<string, number> = {};
  const filteredSamples: EvalSample[] = [];
  for (const s of samples) {
    classCounts[s.label_primary] = (classCounts[s.label_primary] ?? 0) + 1;
    if (classCounts[s.label_primary] <= perClassLimit) {
      filteredSamples.push(s);
    }
  }
  console.log(`    Running on ${filteredSamples.length} samples after class limit.`);

  // Init Gemini
  const genAI = new GoogleGenerativeAI(apiKey);
  const model = genAI.getGenerativeModel({
    model: "gemini-flash-lite-latest",
    generationConfig: {
      temperature: 0.1,
      maxOutputTokens: 512,
      responseMimeType: "application/json",
    },
    safetySettings: [
      { category: HarmCategory.HARM_CATEGORY_HARASSMENT,        threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE },
      { category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT, threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE },
    ],
  });

  // Run evaluation
  const results: EvalResult[] = [];
  let done = 0;

  for (const sample of filteredSamples) {
    const absPath = path.resolve(sample.file_path);
    if (!fs.existsSync(absPath)) {
      results.push({
        image_id: sample.image_id,
        true_label: sample.label_primary,
        predicted_label: null,
        predicted_rank: null,
        confidence: null,
        image_quality: "file_missing",
        correct: false,
        in_top3: false,
        error: `File not found: ${absPath}`,
      });
      done++;
      continue;
    }

    const imgBuffer = fs.readFileSync(absPath);
    const base64    = imgBuffer.toString("base64");
    const mimeType  = absPath.endsWith(".png") ? "image/png" : "image/jpeg";

    let parsed: { imageQuality: string; candidates: { name: string; confidence: string; reason: string }[] };
    try {
      const result = await model.generateContent([
        { inlineData: { data: base64, mimeType } },
        { text: VISION_PROMPT },
      ]);
      const raw = result.response.text().replace(/^```json\s*/i, "").replace(/```\s*$/i, "").trim();
      parsed = JSON.parse(raw);
    } catch (err) {
      results.push({
        image_id: sample.image_id,
        true_label: sample.label_primary,
        predicted_label: null,
        predicted_rank: null,
        confidence: null,
        image_quality: "api_error",
        correct: false,
        in_top3: false,
        error: err instanceof Error ? err.message : String(err),
      });
      done++;
      process.stdout.write(`  [${done}/${filteredSamples.length}] ${sample.image_id} — API error\n`);
      // Rate limit back-off
      await new Promise((r) => setTimeout(r, 2000));
      continue;
    }

    // Match top candidates to true label (simple name-based matching)
    const candidates = (parsed.candidates ?? []).slice(0, 3);
    let matchRank: number | null = null;
    let matchConfidence: "high" | "medium" | "low" | null = null;

    for (let i = 0; i < candidates.length; i++) {
      const predName = (candidates[i].name ?? "").toLowerCase();
      // Check if true label name appears in predicted name or vice versa
      if (
        predName.includes(sample.label_primary.replace(/-/g, " ")) ||
        sample.label_primary.replace(/-/g, " ").split(" ").some((w) => predName.includes(w))
      ) {
        matchRank = i + 1;
        matchConfidence = (candidates[i].confidence as "high" | "medium" | "low") ?? "low";
        break;
      }
    }

    const result: EvalResult = {
      image_id:        sample.image_id,
      true_label:      sample.label_primary,
      predicted_label: candidates[0]?.name ?? null,
      predicted_rank:  matchRank,
      confidence:      matchConfidence ?? (candidates[0] ? (candidates[0].confidence as "high" | "medium" | "low") : null),
      image_quality:   parsed.imageQuality ?? "unknown",
      correct:         matchRank === 1,
      in_top3:         matchRank != null,
    };
    results.push(result);

    const icon = result.correct ? "✓" : result.in_top3 ? "~" : "✗";
    process.stdout.write(
      `  [${done + 1}/${filteredSamples.length}] ${icon} ${sample.image_id.padEnd(30)} ` +
      `true=${sample.label_primary.padEnd(16)} pred=${candidates[0]?.name?.slice(0, 20) ?? "none"}\n`
    );
    done++;

    // Rate limit: ~1 req/sec to avoid 429
    await new Promise((r) => setTimeout(r, 1100));
  }

  // ── Compute metrics ──────────────────────────────────────────────────────────

  const totalEvaluated = results.filter((r) => !r.error || r.error !== "file_missing").length;
  const totalCorrect   = results.filter((r) => r.correct).length;
  const totalInTop3    = results.filter((r) => r.in_top3).length;

  const top1Acc = totalEvaluated > 0 ? (totalCorrect / totalEvaluated) : 0;
  const top3Acc = totalEvaluated > 0 ? (totalInTop3  / totalEvaluated) : 0;

  // Per-class accuracy
  const classMetrics: Record<string, { correct: number; total: number; top3: number }> = {};
  for (const r of results) {
    if (!classMetrics[r.true_label]) classMetrics[r.true_label] = { correct: 0, total: 0, top3: 0 };
    classMetrics[r.true_label].total++;
    if (r.correct) classMetrics[r.true_label].correct++;
    if (r.in_top3) classMetrics[r.true_label].top3++;
  }

  console.log("\n════════════════════════════════════════════════");
  console.log("  BASELINE EVALUATION RESULTS");
  console.log("════════════════════════════════════════════════");
  console.log(`  Samples evaluated:  ${totalEvaluated}`);
  console.log(`  Top-1 Accuracy:     ${(top1Acc * 100).toFixed(1)}%  (${totalCorrect}/${totalEvaluated})`);
  console.log(`  Top-3 Accuracy:     ${(top3Acc * 100).toFixed(1)}%  (${totalInTop3}/${totalEvaluated})`);
  console.log("\n  Per-class breakdown:");
  for (const [cls, m] of Object.entries(classMetrics)) {
    const pct = m.total > 0 ? (m.correct / m.total * 100).toFixed(0) : "—";
    console.log(`    ${cls.padEnd(20)} ${pct.padStart(4)}%  (${m.correct}/${m.total})`);
  }
  console.log("════════════════════════════════════════════════\n");

  // ── Save results ────────────────────────────────────────────────────────────

  const timestamp = new Date().toISOString().replace(/[:.]/g, "-").slice(0, 19);
  const outDir    = "eval/results";
  fs.mkdirSync(outDir, { recursive: true });

  const outFile = path.join(outDir, `baseline_${timestamp}.json`);
  const summary = {
    run_at:          new Date().toISOString(),
    model:           "gemini-flash-lite-latest",
    dataset_file:    datasetArg,
    samples_total:   results.length,
    samples_evaluated: totalEvaluated,
    top1_accuracy:   top1Acc,
    top3_accuracy:   top3Acc,
    per_class:       classMetrics,
    raw_results:     results,
    disclaimer:      "Confidence scores from Gemini are NOT calibrated probabilities. " +
                     "Do not use these results to claim model accuracy without statistical analysis.",
  };
  fs.writeFileSync(outFile, JSON.stringify(summary, null, 2));
  console.log(`  Results saved to: ${outFile}\n`);
}

main().catch((err) => {
  console.error("❌  Evaluation failed:", err);
  process.exit(1);
});
