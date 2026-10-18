import { config } from "dotenv";
config({ path: ".env.local" });
import { neon } from "@neondatabase/serverless";

// Removes only the test account created during login testing — not real user accounts.
async function main() {
  const sql = neon(process.env.DATABASE_URL!) as unknown as (
    strings: TemplateStringsArray, ...values: unknown[]
  ) => Promise<Record<string, unknown>[]>;
  await sql`DELETE FROM users WHERE username = 'testlogin123'`;
  console.log("Cleaned up test account.");
}
main().then(() => process.exit(0)).catch(e => { console.error(e); process.exit(1); });
