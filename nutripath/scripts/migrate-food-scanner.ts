/**
 * scripts/migrate-food-scanner.ts
 *
 * PURPOSE:
 *   The Neon database already has `users`, `sessions`, `verification_tokens`
 *   created outside of Drizzle's migration tracking (no __drizzle_migrations table).
 *   Running `drizzle-kit migrate` blindly would try to CREATE those tables again
 *   and fail with "relation already exists".
 *
 * WHAT THIS SCRIPT DOES (in order):
 *   1. Creates the __drizzle_migrations table if it does not exist.
 *   2. Marks migration 0000_wild_vargas as already applied (pre-existing tables).
 *   3. Applies 0001_food_scanner.sql using IF NOT EXISTS (idempotent).
 *   4. Marks 0001_food_scanner as applied in the tracking table.
 *   5. Verifies food_items and food_scan_logs exist.
 *
 * SAFETY:
 *   - No DROP TABLE. No data deletion. No destructive operations.
 *   - All CREATE TABLE statements use IF NOT EXISTS.
 *   - All ALTER TABLE constraints use DO $$ ... EXCEPTION WHEN duplicate_object.
 *   - Safe to run multiple times.
 *
 * USAGE:
 *   npx tsx scripts/migrate-food-scanner.ts
 */

import { config } from "dotenv";
config({ path: ".env.local" });

import { neon } from "@neondatabase/serverless";

// SHA-256 of the migration file contents (computed at generation time)
const HASH_0000 = "4a3575d43fe858c0b076db383eb966d23fc5d39ac908a6996f153305b737b0b2";
const HASH_0001 = "cab2a560f72f8d19aee5f08a09c064fcb8c9806a8ec0f8d600fcf237bdff6284";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type SqlFn = (strings: TemplateStringsArray, ...values: any[]) => Promise<any[]>;

async function main() {
  const rawUrl = process.env.DATABASE_URL;
  if (!rawUrl) {
    console.error("❌  DATABASE_URL not set in .env.local");
    process.exit(1);
  }

  const sql = neon(rawUrl) as unknown as SqlFn;

  console.log("\n🔍  Checking current database state…");

  // ── Show existing tables ──────────────────────────────────────────────────
  const tables = await sql`
    SELECT table_name
    FROM information_schema.tables
    WHERE table_schema = 'public'
    ORDER BY table_name
  `;
  console.log("    Existing tables:", tables.map((t: { table_name: string }) => t.table_name).join(", ") || "(none)");

  // ── Create __drizzle_migrations if not present ────────────────────────────
  console.log("\n📋  Ensuring migration tracking table exists…");
  await sql`
    CREATE TABLE IF NOT EXISTS __drizzle_migrations (
      id         SERIAL PRIMARY KEY,
      hash       TEXT NOT NULL,
      created_at BIGINT
    )
  `;
  console.log("    ✓ __drizzle_migrations ready");

  // ── Mark 0000 as applied (pre-existing tables) ────────────────────────────
  const existing0000 = await sql`
    SELECT id FROM __drizzle_migrations WHERE hash = ${HASH_0000}
  `;
  if (existing0000.length === 0) {
    await sql`
      INSERT INTO __drizzle_migrations (hash, created_at)
      VALUES (${HASH_0000}, ${1792075746593})
    `;
    console.log("    ✓ Recorded 0000_wild_vargas as pre-existing (tables already in DB)");
  } else {
    console.log("    ✓ 0000_wild_vargas already recorded — skipping");
  }

  // ── Check if 0001 was already applied ─────────────────────────────────────
  const existing0001 = await sql`
    SELECT id FROM __drizzle_migrations WHERE hash = ${HASH_0001}
  `;

  if (existing0001.length > 0) {
    console.log("\n✅  0001_food_scanner already applied — nothing to do.\n");
    await verifyTables(sql);
    process.exit(0);
  }

  // ── Apply 0001 — food_items ───────────────────────────────────────────────
  console.log("\n🚀  Applying 0001_food_scanner…");

  await sql`
    CREATE TABLE IF NOT EXISTS "food_items" (
      "id" text PRIMARY KEY NOT NULL,
      "food_id" text NOT NULL,
      "name_primary" text NOT NULL,
      "name_aliases" text[] DEFAULT '{}' NOT NULL,
      "name_english" text,
      "category" text NOT NULL,
      "sub_category" text,
      "cooking_method" text,
      "energy_kcal" real,
      "protein_g" real,
      "fat_g" real,
      "carb_g" real,
      "fiber_g" real,
      "water_g" real,
      "sodium_mg" real,
      "calcium_mg" real,
      "iron_mg" real,
      "vitamin_c_mg" real,
      "typical_portion_g" real,
      "typical_portion_label" text,
      "data_source" text NOT NULL,
      "data_source_id" text,
      "data_captured_at" timestamp with time zone,
      "verified" boolean DEFAULT false NOT NULL,
      "is_estimate" boolean DEFAULT false NOT NULL,
      "estimate_note" text,
      "created_at" timestamp with time zone DEFAULT now() NOT NULL,
      "updated_at" timestamp with time zone DEFAULT now() NOT NULL,
      CONSTRAINT "food_items_food_id_unique" UNIQUE("food_id")
    )
  `;
  console.log("    ✓ food_items created");

  // ── Apply 0001 — food_scan_logs ───────────────────────────────────────────
  await sql`
    CREATE TABLE IF NOT EXISTS "food_scan_logs" (
      "id" text PRIMARY KEY NOT NULL,
      "user_id" text NOT NULL,
      "recognized_food_id" text,
      "recognized_food_name" text NOT NULL,
      "candidates_json" jsonb,
      "portion_g" real,
      "portion_label" text,
      "estimated_energy_kcal" real,
      "estimated_protein_g" real,
      "estimated_fat_g" real,
      "estimated_carb_g" real,
      "model_used" text,
      "confidence_note" text,
      "data_source_used" text,
      "assumptions" text,
      "scanned_at" timestamp with time zone DEFAULT now() NOT NULL
    )
  `;
  console.log("    ✓ food_scan_logs created");

  // ── Add FK constraints — idempotent via DO/EXCEPTION ─────────────────────
  await sql`
    DO $$ BEGIN
      ALTER TABLE "food_scan_logs"
        ADD CONSTRAINT "food_scan_logs_user_id_users_id_fk"
        FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;
    EXCEPTION WHEN duplicate_object THEN null;
    END $$
  `;
  await sql`
    DO $$ BEGIN
      ALTER TABLE "food_scan_logs"
        ADD CONSTRAINT "food_scan_logs_recognized_food_id_food_items_id_fk"
        FOREIGN KEY ("recognized_food_id") REFERENCES "public"."food_items"("id") ON DELETE set null ON UPDATE no action;
    EXCEPTION WHEN duplicate_object THEN null;
    END $$
  `;
  console.log("    ✓ Foreign key constraints applied");

  // ── Record 0001 as applied ────────────────────────────────────────────────
  await sql`
    INSERT INTO __drizzle_migrations (hash, created_at)
    VALUES (${HASH_0001}, ${Date.now()})
  `;
  console.log("    ✓ Recorded 0001_food_scanner in migration history");

  await verifyTables(sql);
}

async function verifyTables(sql: SqlFn) {
  const tables = await sql`
    SELECT table_name
    FROM information_schema.tables
    WHERE table_schema = 'public' AND table_name IN ('food_items', 'food_scan_logs')
    ORDER BY table_name
  `;
  const names = tables.map((t: { table_name: string }) => t.table_name) as string[];

  if (names.includes("food_items") && names.includes("food_scan_logs")) {
    console.log("\n✅  Verification passed — both tables exist in Neon:");
    console.log("      • food_items");
    console.log("      • food_scan_logs\n");
  } else {
    const missing = ["food_items", "food_scan_logs"].filter((t) => !names.includes(t));
    console.error("\n❌  Verification FAILED — missing tables:", missing.join(", "));
    process.exit(1);
  }
}

main().catch((err) => {
  console.error("\n❌  Migration failed:", err instanceof Error ? err.message : String(err));
  process.exit(1);
});
