/**
 * Test the exact authorize() flow from auth.ts against the real DB.
 * Does NOT start a server — calls DB + bcrypt directly.
 */
import { config } from "dotenv";
config({ path: ".env.local" });

import { neon } from "@neondatabase/serverless";
import bcrypt from "bcryptjs";

async function testAuth(identifier: string, password: string) {
  const sql = neon(process.env.DATABASE_URL!) as unknown as (
    strings: TemplateStringsArray, ...values: unknown[]
  ) => Promise<Record<string, unknown>[]>;

  console.log(`\n--- Testing login: "${identifier}" ---`);

  const results = await sql`
    SELECT id, username, email, password_hash, display_name
    FROM users
    WHERE email = ${identifier.toLowerCase()} OR username = ${identifier.toLowerCase()}
    LIMIT 1
  `;

  if (results.length === 0) {
    console.log("  Result: USER NOT FOUND");
    return;
  }

  const user = results[0];
  console.log("  Found user:", user.username, "/ email:", user.email);

  const hash = user.password_hash as string;
  console.log("  Hash prefix (first 7):", hash.slice(0, 7));
  console.log("  Hash length:", hash.length);

  const match = await bcrypt.compare(password, hash);
  console.log("  Password match:", match);

  if (match) {
    console.log("  ✅ authorize() would return user object — login SHOULD work");
  } else {
    console.log("  ❌ authorize() would return null — wrong password");
  }
}

async function main() {
  // Check what users exist
  const sql = neon(process.env.DATABASE_URL!) as unknown as (
    strings: TemplateStringsArray, ...values: unknown[]
  ) => Promise<Record<string, unknown>[]>;

  const users = await sql`SELECT username, email, created_at FROM users ORDER BY created_at DESC`;
  console.log("=== Users in DB ===");
  users.forEach(u => console.log(`  username=${u.username}  email=${u.email}  created=${String(u.created_at).slice(0, 10)}`));

  // Test with a known bad password to confirm the path works
  if (users.length > 0) {
    const u = users[0];
    await testAuth(u.username as string, "wrongpassword123");
    await testAuth(u.email as string, "wrongpassword123");
  }
}

main()
  .then(() => process.exit(0))
  .catch(e => { console.error("FATAL:", e.message); process.exit(1); });
