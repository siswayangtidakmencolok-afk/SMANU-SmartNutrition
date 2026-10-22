import { config } from "dotenv";
import { neon } from "@neondatabase/serverless";
import { readFileSync } from "fs";
import { resolve } from "path";

config({ path: resolve(process.cwd(), ".env.local") });

function splitSqlStatements(source: string): string[] {
  const statements: string[] = [];
  let current = "";
  let hasSql = false;
  let quote: "'" | '"' | null = null;
  let lineComment = false;
  let blockComment = false;

  for (let index = 0; index < source.length; index += 1) {
    const char = source[index];
    const next = source[index + 1];

    if (lineComment) {
      current += char;
      if (char === "\n") lineComment = false;
      continue;
    }
    if (blockComment) {
      current += char;
      if (char === "*" && next === "/") {
        current += next;
        index += 1;
        blockComment = false;
      }
      continue;
    }
    if (quote) {
      current += char;
      if (char === quote && next === quote) {
        current += next;
        index += 1;
      } else if (char === quote) {
        quote = null;
      }
      continue;
    }
    if (char === "-" && next === "-") {
      current += "--";
      index += 1;
      lineComment = true;
      continue;
    }
    if (char === "/" && next === "*") {
      current += "/*";
      index += 1;
      blockComment = true;
      continue;
    }
    if (char === "'" || char === '"') {
      quote = char;
      hasSql = true;
      current += char;
      continue;
    }
    if (char === ";") {
      if (hasSql) statements.push(current.trim());
      current = "";
      hasSql = false;
      continue;
    }

    current += char;
    if (!/\s/.test(char)) hasSql = true;
  }

  if (hasSql) statements.push(current.trim());
  return statements;
}

async function runMigration() {
  const databaseUrl = process.env.DATABASE_URL;
  if (!databaseUrl) {
    throw new Error("DATABASE_URL is not set in .env.local.");
  }

  const migrationPath = resolve(process.cwd(), "lib/db/migrations/0006_league.sql");
  const migrationSql = readFileSync(migrationPath, "utf8");
  const statements = splitSqlStatements(migrationSql);
  const sql = neon(databaseUrl);

  for (const [index, statement] of statements.entries()) {
    await sql.query(statement, []);
    console.info(`[migrate-league] Applied SQL block ${index + 1}/${statements.length}.`);
  }
}

runMigration().catch((err: unknown) => {
  console.error("[migrate-league] Migration failed:", err instanceof Error ? err.message : err);
  process.exitCode = 1;
});
