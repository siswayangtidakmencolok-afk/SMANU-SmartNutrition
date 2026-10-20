/**
 * scripts/migrate-candidate-foods.ts
 *
 * Applies migration 0002_candidate_foods.sql to Neon.
 * Safe to run multiple times (CREATE TABLE IF NOT EXISTS + CREATE INDEX IF NOT EXISTS).
 *
 * Usage:
 *   npx tsx scripts/migrate-candidate-foods.ts
 */

import * as fs from "fs";
import * as path from "path";
import { neon } from "@neondatabase/serverless";
import * as dotenv from "dotenv";

dotenv.config({ path: path.join(process.cwd(), ".env.local") });

const DATABASE_URL = process.env.DATABASE_URL;
if (!DATABASE_URL) {
  console.error("❌ DATABASE_URL not found in .env.local");
  process.exit(1);
}

async function main() {
  const migrationPath = path.join(
    process.cwd(),
    "lib/db/migrations/0002_candidate_foods.sql"
  );
  const sql_client = neon(DATABASE_URL!);

  console.log("📂 Reading migration file...");
  const migrationSql = fs.readFileSync(migrationPath, "utf-8");

  // Remove full-line SQL comments, split on semicolons to get individual statements.
  // Neon serverless does not support multiple statements in one call.
  const withoutComments = migrationSql
    .split("\n")
    .filter((line) => !line.trimStart().startsWith("--"))
    .join("\n")
    // Also strip the drizzle statement-breakpoint marker lines
    .replace(/--> statement-breakpoint/g, "");

  // Split on semicolons and keep only non-empty statements
  const statements = withoutComments
    .split(";")
    .map((s) => s.trim())
    .filter((s) => s.length > 10);

  console.log(`🚀 Applying ${statements.length} SQL statements...`);

  for (let i = 0; i < statements.length; i++) {
    // Re-add semicolon since Neon needs it
    const stmt = statements[i] + ";";
    try {
      await sql_client.query(stmt);
      console.log(`   ✅ Statement ${i + 1} OK`);
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      // Expected: table/index already exists — safe to skip
      if (
        msg.includes("already exists") ||
        msg.includes("duplicate_object") ||
        msg.includes("42P07") ||
        msg.includes("42710")
      ) {
        console.log(`   ⏭️  Statement ${i + 1} skipped (already exists)`);
      } else {
        console.error(`   ❌ Statement ${i + 1} failed: ${msg}`);
        throw err;
      }
    }
  }

  console.log("\n✅ Migration 0002_candidate_foods complete.");
}

main().catch((e) => {
  console.error("Fatal:", e);
  process.exit(1);
});
