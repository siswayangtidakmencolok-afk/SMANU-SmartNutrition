/**
 * scripts/validate-http-endpoints.ts
 *
 * HTTP integration validation for SMANU Food Scanner endpoints.
 * Requires the Next.js dev server to be running on localhost:3000.
 *
 * Run:  npx tsx scripts/validate-http-endpoints.ts
 */

import "dotenv/config";

const BASE = "http://localhost:3000";
// PORT NOTE: The Next.js dev server PID 16200 is already running on :3000.

let passed = 0;
let failed = 0;
type Status = "PASS" | "FAIL" | "SKIP";
const log: { id: string; status: Status; detail: string }[] = [];

function record(id: string, status: Status, detail: string) {
  log.push({ id, status, detail });
  const icon = status === "PASS" ? "✅" : status === "FAIL" ? "❌" : "⚠";
  console.log(`${icon} [${id}] ${detail}`);
  if (status === "PASS") passed++;
  if (status === "FAIL") failed++;
}

// ── Helper ─────────────────────────────────────────────────────────────────────

async function get(path: string): Promise<{ status: number; body: unknown }> {
  const res = await fetch(`${BASE}${path}`, { signal: AbortSignal.timeout(10000) });
  const body = await res.json().catch(() => null);
  return { status: res.status, body };
}

async function post(path: string, payload: unknown): Promise<{ status: number; body: unknown }> {
  const res = await fetch(`${BASE}${path}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
    signal: AbortSignal.timeout(10000),
  });
  const body = await res.json().catch(() => null);
  return { status: res.status, body };
}

// ── 1. NUTRITION ENDPOINT — /api/food-scanner/nutrition ──────────────────────

async function test_N1_TKPI_basic() {
  // TKPI foodId = "nasi-putih", 100g baseline
  const r = await get("/api/food-scanner/nutrition?foodId=nasi-putih&portionG=100");
  const b = r.body as Record<string, unknown>;

  if (r.status !== 200) {
    record("N1: TKPI 100g", "FAIL", `Expected 200, got ${r.status}. body=${JSON.stringify(b)}`);
    return;
  }
  // From food-database.ts: nasi-putih energyKcal=180, proteinG=3 per 100g
  if (b.energyKcal !== 180) {
    record("N1: TKPI 100g", "FAIL", `energyKcal: expected 180, got ${b.energyKcal}`);
    return;
  }
  if (b.dataSource !== "TKPI-2017") {
    record("N1: TKPI 100g", "FAIL", `dataSource: expected TKPI-2017, got ${b.dataSource}`);
    return;
  }
  if (b.foodId !== "nasi-putih") {
    record("N1: TKPI 100g", "FAIL", `foodId echo: expected nasi-putih, got ${b.foodId}`);
    return;
  }
  record("N1: TKPI 100g", "PASS",
    `nasi-putih 100g → energy=${b.energyKcal}kkal, protein=${b.proteinG}g, source=${b.dataSource}`
  );
}

async function test_N2_TKPI_portion_scaling() {
  // 200g should be exactly 2× the 100g values
  const r100 = await get("/api/food-scanner/nutrition?foodId=nasi-putih&portionG=100");
  const r200 = await get("/api/food-scanner/nutrition?foodId=nasi-putih&portionG=200");
  const b100 = r100.body as Record<string, unknown>;
  const b200 = r200.body as Record<string, unknown>;

  if (r100.status !== 200 || r200.status !== 200) {
    record("N2: Portion scaling", "FAIL", `Status: 100g=${r100.status}, 200g=${r200.status}`);
    return;
  }

  const e100 = b100.energyKcal as number;
  const e200 = b200.energyKcal as number;
  const expectedE200 = Math.round(e100 * 2);

  if (e200 !== expectedE200) {
    record("N2: Portion scaling", "FAIL",
      `Double-scaling detected! 100g=${e100}kkal, 200g=${e200}kkal, expected ${expectedE200}kkal. ` +
      `Check for scale-on-top-of-scale bug.`
    );
    return;
  }

  const p100 = b100.proteinG as number;
  const p200 = b200.proteinG as number;
  if (Math.abs(p200 - p100 * 2) > 0.1) {
    record("N2: Portion scaling", "FAIL",
      `Protein scaling wrong: 100g=${p100}g, 200g=${p200}g, expected ${Math.round(p100 * 2 * 10) / 10}g`
    );
    return;
  }

  record("N2: Portion scaling", "PASS",
    `nasi-putih: 100g=${e100}kkal, 200g=${e200}kkal (correct 2×). ` +
    `Protein: 100g=${p100}g, 200g=${p200}g (correct). No double-scaling.`
  );
}

async function test_N3_USDA_basic() {
  // usda-hummus-commercial: energy=229, protein=7.35 per 100g (from DB query)
  const r = await get("/api/food-scanner/nutrition?foodId=usda-hummus-commercial&portionG=100");
  const b = r.body as Record<string, unknown>;

  if (r.status !== 200) {
    record("N3: USDA 100g", "FAIL", `Expected 200, got ${r.status}. body=${JSON.stringify(b)}`);
    return;
  }
  if (b.dataSource !== "USDA-FDC") {
    record("N3: USDA 100g", "FAIL", `dataSource: expected USDA-FDC, got ${b.dataSource}`);
    return;
  }
  if (b.energyKcal !== 229) {
    record("N3: USDA 100g", "FAIL", `energyKcal: expected 229, got ${b.energyKcal}`);
    return;
  }
  if (typeof b.assumptions !== "string" || !b.assumptions.includes("USDA")) {
    record("N3: USDA 100g", "FAIL",
      `assumptions missing USDA mention: "${b.assumptions}"`
    );
    return;
  }
  record("N3: USDA 100g", "PASS",
    `usda-hummus-commercial 100g → energy=${b.energyKcal}kkal, protein=${b.proteinG}g, ` +
    `source=${b.dataSource}, typicalPortionG=${b.typicalPortionG ?? "null (expected)"}`
  );
}

async function test_N4_USDA_portion_scaling() {
  // 50g of hummus should be exactly 229*0.5 = 114 or 115 kkal
  const r = await get("/api/food-scanner/nutrition?foodId=usda-hummus-commercial&portionG=50");
  const b = r.body as Record<string, unknown>;

  if (r.status !== 200) {
    record("N4: USDA 50g scaling", "FAIL", `Expected 200, got ${r.status}`);
    return;
  }
  const expected = Math.round(229 * 0.5); // 115
  if (b.energyKcal !== expected) {
    record("N4: USDA 50g scaling", "FAIL",
      `energyKcal: expected ${expected}, got ${b.energyKcal} for 50g hummus. ` +
      "Possible double-scaling if route scales already-scaled values."
    );
    return;
  }
  if (b.portionG !== 50) {
    record("N4: USDA 50g scaling", "FAIL", `portionG echo: expected 50, got ${b.portionG}`);
    return;
  }
  record("N4: USDA 50g scaling", "PASS",
    `usda-hummus-commercial 50g → energy=${b.energyKcal}kkal (expected ${expected}), portionG=${b.portionG}`
  );
}

async function test_N5_partial_null_nutrients() {
  // usda-beans-dry-red-0-moisture: energyKcal=null, proteinG=21.3
  const r = await get("/api/food-scanner/nutrition?foodId=usda-beans-dry-red-0-moisture&portionG=100");
  const b = r.body as Record<string, unknown>;

  if (r.status !== 200) {
    record("N5: Partial-null USDA", "FAIL", `Expected 200, got ${r.status}. body=${JSON.stringify(b)}`);
    return;
  }
  if (b.energyKcal !== null) {
    record("N5: Partial-null USDA", "FAIL",
      `energyKcal should be null (not measured), got: ${b.energyKcal}. ` +
      "Fabricated values must not replace null."
    );
    return;
  }
  if (typeof b.proteinG !== "number" || (b.proteinG as number) <= 0) {
    record("N5: Partial-null USDA", "FAIL",
      `proteinG should be a positive number, got: ${b.proteinG}`
    );
    return;
  }
  if (!b.assumptions || !(b.assumptions as string).includes("energi")) {
    record("N5: Partial-null USDA", "FAIL",
      `assumptions must mention missing 'energi', got: "${b.assumptions}"`
    );
    return;
  }
  record("N5: Partial-null USDA", "PASS",
    `usda-beans-dry-red-0-moisture 100g → energyKcal=null ✓, protein=${b.proteinG}g, ` +
    `dataSource=${b.dataSource}, assumptions mentions missing fields ✓`
  );
}

async function test_N6_not_found() {
  const r = await get("/api/food-scanner/nutrition?foodId=makanan-tidak-ada-xyz-999&portionG=100");
  if (r.status !== 404) {
    record("N6: Not found → 404", "FAIL", `Expected 404, got ${r.status}. body=${JSON.stringify(r.body)}`);
    return;
  }
  const b = r.body as Record<string, unknown>;
  if (!b.error || typeof b.error !== "string") {
    record("N6: Not found → 404", "FAIL", `Expected error string in body, got: ${JSON.stringify(b)}`);
    return;
  }
  record("N6: Not found → 404", "PASS",
    `Unknown foodId → 404 with error="${b.error}"`
  );
}

async function test_N7_missing_foodId() {
  const r = await get("/api/food-scanner/nutrition?portionG=100");
  if (r.status !== 400) {
    record("N7: Missing foodId → 400", "FAIL", `Expected 400, got ${r.status}`);
    return;
  }
  record("N7: Missing foodId → 400", "PASS", `Missing foodId → ${r.status} ✓`);
}

async function test_N8_invalid_portionG() {
  const r1 = await get("/api/food-scanner/nutrition?foodId=nasi-putih&portionG=0");
  const r2 = await get("/api/food-scanner/nutrition?foodId=nasi-putih&portionG=9999");
  if (r1.status !== 400) {
    record("N8: Invalid portionG", "FAIL", `portionG=0 expected 400, got ${r1.status}`);
    return;
  }
  if (r2.status !== 400) {
    record("N8: Invalid portionG", "FAIL", `portionG=9999 expected 400, got ${r2.status}`);
    return;
  }
  record("N8: Invalid portionG", "PASS", `portionG=0→400, portionG=9999→400 ✓`);
}

async function test_N9_data_consistency() {
  // Verify: response fields that should always be present
  const r = await get("/api/food-scanner/nutrition?foodId=nasi-putih&portionG=150");
  const b = r.body as Record<string, unknown>;
  if (r.status !== 200) {
    record("N9: Response shape", "FAIL", `Status ${r.status}`);
    return;
  }

  const required = ["foodId", "namePrimary", "portionG", "dataSource", "isEstimate", "assumptions"];
  const missing = required.filter(k => !(k in b));
  if (missing.length > 0) {
    record("N9: Response shape", "FAIL", `Missing fields: ${missing.join(", ")}`);
    return;
  }
  if (b.portionG !== 150) {
    record("N9: Response shape", "FAIL", `portionG echo: expected 150, got ${b.portionG}`);
    return;
  }
  // energyKcal for 150g nasi-putih = round(180 * 1.5) = 270
  if (b.energyKcal !== 270) {
    record("N9: Response shape", "FAIL", `energyKcal for 150g: expected 270, got ${b.energyKcal}`);
    return;
  }
  record("N9: Response shape", "PASS",
    `All required fields present. portionG echo=150 ✓. energyKcal for 150g=270 ✓`
  );
}

// ── 2. FOOD SCANNER — /api/food-scanner (POST, no image) ─────────────────────

async function test_S1_missing_image() {
  const r = await post("/api/food-scanner", {});
  if (r.status !== 400) {
    record("S1: Scanner missing image", "FAIL", `Expected 400, got ${r.status}`);
    return;
  }
  record("S1: Scanner missing image", "PASS", `No imageBase64 → 400 ✓`);
}

async function test_S2_invalid_mime() {
  const r = await post("/api/food-scanner", {
    imageBase64: "aGVsbG8=",
    mimeType: "image/gif",
  });
  if (r.status !== 400) {
    record("S2: Scanner invalid mime", "FAIL", `Expected 400, got ${r.status}`);
    return;
  }
  record("S2: Scanner invalid mime", "PASS", `image/gif → 400 ✓`);
}

async function test_S3_oversized_image() {
  // ~5MB base64 string > 4MB limit
  const bigB64 = "A".repeat(7 * 1024 * 1024);
  const r = await post("/api/food-scanner", {
    imageBase64: bigB64,
    mimeType: "image/jpeg",
  });
  if (r.status !== 413) {
    record("S3: Scanner oversized", "FAIL", `Expected 413, got ${r.status}`);
    return;
  }
  record("S3: Scanner oversized", "PASS", `>4MB image → 413 ✓`);
}

async function test_S4_gemini_real_call() {
  record("S4: Gemini Vision real call", "SKIP",
    "Requires a real food image + live Gemini API. " +
    "Not safe to embed binary image data in a script. " +
    "Must be tested via browser/Postman with actual photo upload."
  );
}

// ── 3. SAVE ENDPOINT — /api/food-scanner/save ─────────────────────────────────

async function test_V1_save_no_auth() {
  // Server MUST reject unauthenticated saves — not just rely on UI hiding the button
  const r = await post("/api/food-scanner/save", {
    recognizedFoodName: "Test Food",
    portionG: 100,
    portionLabel: "100 g",
  });
  if (r.status !== 401) {
    record("V1: Save without auth → 401", "FAIL",
      `Expected 401 (unauthenticated), got ${r.status}. ` +
      "Server must enforce auth, not just hide UI button for guests."
    );
    return;
  }
  record("V1: Save without auth → 401", "PASS",
    `Unauthenticated POST /save → 401 ✓. Server enforces auth correctly.`
  );
}

async function test_V2_save_missing_fields() {
  // Even without auth, the shape check should give 401 first (auth checked first)
  // But test with empty body to confirm handler is robust
  const r = await post("/api/food-scanner/save", {});
  // Auth is checked first, so should still be 401
  if (r.status === 401) {
    record("V2: Save empty body", "PASS",
      `Empty body → 401 (auth gate fires before validation) ✓`
    );
  } else if (r.status === 400) {
    record("V2: Save empty body", "PASS",
      `Empty body → 400 (validation gate) ✓`
    );
  } else {
    record("V2: Save empty body", "FAIL",
      `Unexpected status ${r.status} for empty body. body=${JSON.stringify(r.body)}`
    );
  }
}

async function test_V3_save_authenticated() {
  record("V3: Save with real auth session", "SKIP",
    "Requires a valid Auth.js JWT session cookie. " +
    "Cannot be obtained in a script without a browser login flow. " +
    "Must be tested via browser: login → scan → save → check DB row."
  );
}

// ── 4. CANDIDATE ENDPOINT — /api/food-scanner/candidate ──────────────────────

async function test_C1_candidate_submit() {
  // Auth is optional for candidates — this should succeed for unauthenticated users too
  const r = await post("/api/food-scanner/candidate", {
    foodNameRaw: "test-makanan-validasi-e2e",
    submissionSource: "vision_unmatched",
    originalVisionName: "test-makanan-validasi-e2e",
    originalConfidence: "low",
  });
  if (r.status !== 200) {
    record("C1: Candidate submit", "FAIL", `Expected 200, got ${r.status}. body=${JSON.stringify(r.body)}`);
    return;
  }
  const b = r.body as Record<string, unknown>;
  if (!b.id || typeof b.id !== "string") {
    record("C1: Candidate submit", "FAIL", `Expected id string, got: ${JSON.stringify(b)}`);
    return;
  }
  record("C1: Candidate submit", "PASS",
    `Submitted candidate → id=${(b.id as string).slice(0, 8)}…, existing=${b.existing} ✓`
  );
}

async function test_C2_candidate_dedup() {
  // Submitting the same name again should return existing=true
  const r = await post("/api/food-scanner/candidate", {
    foodNameRaw: "test-makanan-validasi-e2e",
    submissionSource: "vision_unmatched",
  });
  if (r.status !== 200) {
    record("C2: Candidate dedup", "FAIL", `Expected 200, got ${r.status}`);
    return;
  }
  const b = r.body as Record<string, unknown>;
  if (b.existing !== true) {
    record("C2: Candidate dedup", "FAIL",
      `Second submission should have existing=true, got existing=${b.existing}`
    );
    return;
  }
  record("C2: Candidate dedup", "PASS",
    `Duplicate candidate → existing=true ✓. No duplicate DB row.`
  );
}

async function test_C3_candidate_too_short() {
  const r = await post("/api/food-scanner/candidate", {
    foodNameRaw: "x",
    submissionSource: "vision_unmatched",
  });
  if (r.status !== 400) {
    record("C3: Candidate too short", "FAIL", `Expected 400, got ${r.status}`);
    return;
  }
  record("C3: Candidate too short", "PASS", `1-char name → 400 ✓`);
}

// ── 5. DATA INTEGRITY CHECKS ──────────────────────────────────────────────────

async function test_D1_nutrition_matches_expected() {
  // Cross-check: API response values must match what we know from DB (no fabrication)
  const r = await get("/api/food-scanner/nutrition?foodId=usda-tomatoes-grape-raw&portionG=100");
  const b = r.body as Record<string, unknown>;

  if (r.status !== 200) {
    record("D1: Data integrity USDA", "FAIL", `Expected 200, got ${r.status}`);
    return;
  }
  // From DB query: energy=27, protein=0.83 for tomatoes-grape-raw
  if (b.energyKcal !== 27) {
    record("D1: Data integrity USDA", "FAIL",
      `energyKcal: expected 27 (from DB), got ${b.energyKcal}. Possible fabrication.`
    );
    return;
  }
  if (Math.abs((b.proteinG as number) - 0.8) > 0.1) {
    record("D1: Data integrity USDA", "FAIL",
      `proteinG: expected ~0.8 (from DB), got ${b.proteinG}`
    );
    return;
  }
  record("D1: Data integrity USDA", "PASS",
    `usda-tomatoes-grape-raw 100g → energy=${b.energyKcal}kkal (DB=27 ✓), protein=${b.proteinG}g (DB=0.83 ✓). No fabrication.`
  );
}

async function test_D2_assumptions_always_present() {
  // All valid responses must have non-empty assumptions string
  const foodIds = ["nasi-putih", "usda-hummus-commercial", "usda-beans-dry-red-0-moisture"];
  for (const fid of foodIds) {
    const r = await get(`/api/food-scanner/nutrition?foodId=${encodeURIComponent(fid)}&portionG=100`);
    const b = r.body as Record<string, unknown>;
    if (r.status !== 200 || !b.assumptions || typeof b.assumptions !== "string" || b.assumptions.length < 10) {
      record("D2: Assumptions present", "FAIL",
        `foodId=${fid}: assumptions missing or too short. Got: "${b.assumptions}"`
      );
      return;
    }
  }
  record("D2: Assumptions present", "PASS",
    `All 3 tested foods have non-empty assumptions string ✓`
  );
}

async function test_D3_null_not_zero() {
  // Ensure null stays null — not replaced by 0 or any fabricated value
  const r = await get("/api/food-scanner/nutrition?foodId=usda-beans-dry-red-0-moisture&portionG=100");
  const b = r.body as Record<string, unknown>;
  if (r.status !== 200) {
    record("D3: Null stays null", "FAIL", `Expected 200, got ${r.status}`);
    return;
  }
  if (b.energyKcal === 0) {
    record("D3: Null stays null", "FAIL",
      `energyKcal=0 (should be null — 0 would be a fabricated value for an unmeasured field)`
    );
    return;
  }
  if (b.energyKcal !== null) {
    record("D3: Null stays null", "FAIL",
      `energyKcal should be null, got ${b.energyKcal}`
    );
    return;
  }
  record("D3: Null stays null", "PASS",
    `usda-beans-dry-red-0-moisture energyKcal=null (not 0, not fabricated) ✓`
  );
}

// ── Main ──────────────────────────────────────────────────────────────────────

async function main() {
  console.log("═══════════════════════════════════════════════════════════");
  console.log("  SMANU Food Scanner — HTTP Integration Validation");
  console.log("  Server: http://localhost:3000");
  console.log("═══════════════════════════════════════════════════════════\n");

  // Check server is up
  try {
    const ping = await fetch(`${BASE}/api/food-scanner/nutrition?foodId=ping`, {
      signal: AbortSignal.timeout(3000),
    });
    console.log(`Server reachable (status ${ping.status})\n`);
  } catch {
    console.error("❌ FATAL: Server not reachable at localhost:3000. Start dev server first.");
    process.exit(1);
  }

  console.log("── 1. Nutrition Endpoint ──────────────────────────────────");
  await test_N1_TKPI_basic();
  await test_N2_TKPI_portion_scaling();
  await test_N3_USDA_basic();
  await test_N4_USDA_portion_scaling();
  await test_N5_partial_null_nutrients();
  await test_N6_not_found();
  await test_N7_missing_foodId();
  await test_N8_invalid_portionG();
  await test_N9_data_consistency();

  console.log("\n── 2. Scanner Endpoint (input validation) ─────────────────");
  await test_S1_missing_image();
  await test_S2_invalid_mime();
  await test_S3_oversized_image();
  await test_S4_gemini_real_call();

  console.log("\n── 3. Save Endpoint (auth enforcement) ────────────────────");
  await test_V1_save_no_auth();
  await test_V2_save_missing_fields();
  await test_V3_save_authenticated();

  console.log("\n── 4. Candidate Endpoint ───────────────────────────────────");
  await test_C1_candidate_submit();
  await test_C2_candidate_dedup();
  await test_C3_candidate_too_short();

  console.log("\n── 5. Data Integrity ──────────────────────────────────────");
  await test_D1_nutrition_matches_expected();
  await test_D2_assumptions_always_present();
  await test_D3_null_not_zero();

  // Summary
  const skipped = log.filter(r => r.status === "SKIP").length;
  console.log("\n═══════════════════════════════════════════════════════════");
  console.log(`  Results: ${passed} passed  |  ${failed} failed  |  ${skipped} skipped`);
  console.log("═══════════════════════════════════════════════════════════\n");

  if (failed > 0) {
    console.log("FAILURES:");
    log.filter(r => r.status === "FAIL").forEach(r => {
      console.log(`  ❌ ${r.id}: ${r.detail}`);
    });
    process.exit(1);
  } else {
    console.log("All HTTP-testable scenarios passed.\n");
    console.log("SKIPPED (require live deployment / browser session):");
    log.filter(r => r.status === "SKIP").forEach(r => {
      console.log(`  ⚠  ${r.id}: ${r.detail}`);
    });
  }
}

main().catch(err => {
  console.error("\nTest runner crashed:", err);
  process.exit(1);
});
