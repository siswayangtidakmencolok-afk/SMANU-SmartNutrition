import { neon } from "@neondatabase/serverless";
import * as dotenv from "dotenv";
import { join } from "path";
dotenv.config({ path: join(process.cwd(), ".env.local") });

const sql = neon(process.env.DATABASE_URL!);

async function main() {
  const r = await sql`SELECT data_source, COUNT(*)::int as n FROM food_items GROUP BY data_source ORDER BY data_source`;
  console.log("food_items per source:", JSON.stringify(r));
  const c = await sql`SELECT COUNT(*)::int as n FROM candidate_foods`;
  console.log("candidate_foods total:", c[0].n);
}
main().catch(console.error);
