/**
 * scripts/migrate-scan-log-enrich.ts
 *
 * Applies migration 0005_scan_log_enrich.sql to Neon:
 * Adds new columns to food_scan_logs:
 *   - data_status (text, default 'database_verified')
 *   - estimated_fiber_g (real)
 *   - energy_range (text)
 *   - explanation_json (jsonb)
 *
 * Also applies 0003_learning_profile.sql and 0004_photo_contributions.sql
 * if they haven't been applied yet.
 *
 * Safe to run multiple times (ADD COLUMN IF NOT EXISTS, CREATE TABLE IF NOT EXISTS).
 *
 * Usage:
 *   npx tsx scripts/migrate-scan-log-enrich.ts
 */

import { config } from "dotenv";
config({ path: ".env.local" });

import { neon } from "@neondatabase/serverless";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type SqlFn = (strings: TemplateStringsArray, ...values: any[]) => Promise<any[]>;

async function main() {
  const rawUrl = process.env.DATABASE_URL;
  if (!rawUrl) throw new Error("DATABASE_URL not set in .env.local");

  const sql = neon(rawUrl) as SqlFn;
  console.log("🔗 Connected to Neon");

  // ── 0003: learning profile tables ─────────────────────────────────────────
  console.log("\n▶  0003_learning_profile — role column + activity tables");

  await sql`ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "role" text NOT NULL DEFAULT 'student'`;
  console.log("  ✓ users.role");

  await sql`
    CREATE TABLE IF NOT EXISTS "user_activities" (
      "id"               text PRIMARY KEY NOT NULL DEFAULT gen_random_uuid()::text,
      "user_id"          text NOT NULL REFERENCES "users"("id") ON DELETE CASCADE,
      "activity_type"    text NOT NULL,
      "activity_label"   text NOT NULL,
      "source_ref"       text,
      "score"            integer,
      "domain"           text,
      "idempotency_key"  text NOT NULL,
      "occurred_at"      timestamp with time zone DEFAULT now() NOT NULL
    )
  `;
  await sql`CREATE INDEX IF NOT EXISTS "user_activities_user_id_idx" ON "user_activities"("user_id", "occurred_at" DESC)`;
  await sql`CREATE UNIQUE INDEX IF NOT EXISTS "user_activities_idem_key_uniq" ON "user_activities"("user_id", "idempotency_key")`;
  console.log("  ✓ user_activities");

  await sql`
    CREATE TABLE IF NOT EXISTS "user_exp_ledger" (
      "id"               text PRIMARY KEY NOT NULL DEFAULT gen_random_uuid()::text,
      "user_id"          text NOT NULL REFERENCES "users"("id") ON DELETE CASCADE,
      "delta"            integer NOT NULL,
      "reason"           text NOT NULL,
      "activity_ref"     text REFERENCES "user_activities"("id") ON DELETE SET NULL,
      "idempotency_key"  text NOT NULL,
      "created_at"       timestamp with time zone DEFAULT now() NOT NULL
    )
  `;
  await sql`CREATE INDEX IF NOT EXISTS "user_exp_ledger_user_id_idx" ON "user_exp_ledger"("user_id")`;
  await sql`CREATE UNIQUE INDEX IF NOT EXISTS "user_exp_ledger_idem_key_uniq" ON "user_exp_ledger"("user_id", "idempotency_key")`;
  console.log("  ✓ user_exp_ledger");

  // ── 0004: photo contributions ─────────────────────────────────────────────
  console.log("\n▶  0004_photo_contributions");

  await sql`
    CREATE TABLE IF NOT EXISTS "photo_contributions" (
      "id"                  text PRIMARY KEY NOT NULL DEFAULT gen_random_uuid()::text,
      "user_id"             text REFERENCES "users"("id") ON DELETE SET NULL,
      "scan_log_id"         text REFERENCES "food_scan_logs"("id") ON DELETE SET NULL,
      "consent_given"       boolean NOT NULL DEFAULT false,
      "retain_photo"        boolean NOT NULL DEFAULT false,
      "photo_storage_ref"   text,
      "storage_provider"    text,
      "vision_label"        text,
      "verified_label"      text,
      "status"              text NOT NULL DEFAULT 'pending',
      "reviewer_notes"      text,
      "reviewed_at"         timestamp with time zone,
      "lighting_condition"  text,
      "angle_description"   text,
      "background_type"     text,
      "contributed_at"      timestamp with time zone DEFAULT now() NOT NULL,
      "updated_at"          timestamp with time zone DEFAULT now() NOT NULL
    )
  `;
  await sql`CREATE INDEX IF NOT EXISTS "photo_contributions_status_idx" ON "photo_contributions"("status")`;
  await sql`CREATE INDEX IF NOT EXISTS "photo_contributions_user_id_idx" ON "photo_contributions"("user_id")`;
  console.log("  ✓ photo_contributions");

  // ── 0005: enrich food_scan_logs ───────────────────────────────────────────
  console.log("\n▶  0005_scan_log_enrich — new columns on food_scan_logs");

  await sql`ALTER TABLE "food_scan_logs" ADD COLUMN IF NOT EXISTS "data_status" text DEFAULT 'database_verified'`;
  console.log("  ✓ data_status");

  await sql`ALTER TABLE "food_scan_logs" ADD COLUMN IF NOT EXISTS "estimated_fiber_g" real`;
  console.log("  ✓ estimated_fiber_g");

  await sql`ALTER TABLE "food_scan_logs" ADD COLUMN IF NOT EXISTS "energy_range" text`;
  console.log("  ✓ energy_range");

  await sql`ALTER TABLE "food_scan_logs" ADD COLUMN IF NOT EXISTS "explanation_json" jsonb`;
  console.log("  ✓ explanation_json");

  // ── Verify ────────────────────────────────────────────────────────────────
  console.log("\n▶  Verifying columns...");

  const cols = await sql`
    SELECT column_name FROM information_schema.columns
    WHERE table_name = 'food_scan_logs'
    ORDER BY ordinal_position
  `;
  const colNames = cols.map((c: Record<string, string>) => c.column_name);
  const required = ["data_status", "estimated_fiber_g", "energy_range", "explanation_json"];
  for (const col of required) {
    if (colNames.includes(col)) {
      console.log(`  ✓ food_scan_logs.${col}`);
    } else {
      console.error(`  ✗ food_scan_logs.${col} MISSING`);
      process.exit(1);
    }
  }

  const tables = await sql`
    SELECT table_name FROM information_schema.tables
    WHERE table_schema = 'public' AND table_name IN ('user_activities', 'user_exp_ledger', 'photo_contributions')
    ORDER BY table_name
  `;
  for (const t of tables as { table_name: string }[]) {
    console.log(`  ✓ table: ${t.table_name}`);
  }

  console.log("\n✅  All migrations applied successfully.\n");
}

main().catch((e) => {
  console.error("Fatal:", e instanceof Error ? e.message : e);
  process.exit(1);
});
