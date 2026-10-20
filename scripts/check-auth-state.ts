import { config } from "dotenv";
config({ path: ".env.local" });

import { neon } from "@neondatabase/serverless";

async function main() {
  const sql = neon(process.env.DATABASE_URL!) as unknown as (
    strings: TemplateStringsArray, ...values: unknown[]
  ) => Promise<Record<string, unknown>[]>;

  // Count users (no email/password shown)
  const userCount = await sql`SELECT COUNT(*) as cnt FROM users`;
  console.log("User count:", userCount[0]?.cnt);

  // Show usernames only (not passwords or emails)
  const users = await sql`SELECT username, created_at FROM users ORDER BY created_at DESC LIMIT 5`;
  console.log("Recent usernames:", users.map(u => u.username));

  // Count food items
  const foodCount = await sql`SELECT COUNT(*) as cnt FROM food_items`;
  console.log("Food items seeded:", foodCount[0]?.cnt);

  // Sample 3 food names
  const foods = await sql`SELECT food_id, name_primary FROM food_items ORDER BY name_primary LIMIT 3`;
  console.log("Sample foods:", foods.map(f => f.name_primary));
}

main()
  .then(() => process.exit(0))
  .catch(e => { console.error(e); process.exit(1); });
