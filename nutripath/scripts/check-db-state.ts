import { config } from "dotenv";
config({ path: ".env.local" });

import { neon } from "@neondatabase/serverless";

async function main() {
  const sql = neon(process.env.DATABASE_URL!);

  // 1. Check drizzle migration history
  let migrations: unknown[] = [];
  try {
    const rows = await sql`SELECT hash, created_at FROM __drizzle_migrations ORDER BY created_at`;
    migrations = rows as unknown[];
  } catch (e: unknown) {
    migrations = [{ error: e instanceof Error ? e.message : String(e) }];
  }
  console.log("=== Applied migrations ===");
  console.log(JSON.stringify(migrations, null, 2));

  // 2. Check existing tables
  const tables = await sql`
    SELECT table_name
    FROM information_schema.tables
    WHERE table_schema = 'public'
    ORDER BY table_name
  ` as unknown as Array<{ table_name: string }>;
  console.log("\n=== Existing tables ===");
  console.log(tables.map((t) => t.table_name).join(", "));
}

main()
  .then(() => process.exit(0))
  .catch((e) => { console.error(e); process.exit(1); });
