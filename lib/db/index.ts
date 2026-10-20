/**
 * Database connection — Neon Postgres via @neondatabase/serverless
 * Connection string is read from DATABASE_URL (server-side only, never exposed to browser).
 *
 * Lazy initialization: the connection is created only when first accessed,
 * so build-time evaluation (Next.js static analysis) doesn't fail without DATABASE_URL.
 *
 * Neon serverless fix: strip unsupported connection parameters (channel_binding)
 * that cause failures on mobile/serverless environments.
 */

import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import * as schema from "./schema";

type DbInstance = ReturnType<typeof drizzle<typeof schema>>;

const globalForDb = global as unknown as { _smanuDb?: DbInstance };

/**
 * Strip query params that are not supported by the neon() HTTP driver.
 * The JDBC-style "channel_binding=require" param breaks the serverless driver
 * when Neon auto-appends it in some connection strings.
 */
function sanitizeNeonUrl(rawUrl: string): string {
  try {
    const u = new URL(rawUrl);
    // Remove params unsupported by the Neon serverless HTTP driver
    u.searchParams.delete("channel_binding");
    // Ensure sslmode is set (required for Neon)
    if (!u.searchParams.has("sslmode")) {
      u.searchParams.set("sslmode", "require");
    }
    return u.toString();
  } catch {
    // If URL parsing fails, return as-is and let neon() surface the real error
    return rawUrl;
  }
}

function createDb(): DbInstance {
  const rawUrl = process.env.DATABASE_URL;
  if (!rawUrl) {
    throw new Error(
      "[SMANU DB] DATABASE_URL is not set. Add it to .env.local.\n" +
      "Get your connection string from neon.tech → Project → Connection string."
    );
  }
  const url = sanitizeNeonUrl(rawUrl);
  const sql = neon(url);
  return drizzle(sql, { schema });
}

/**
 * Lazily-initialized database proxy.
 * Accessing any property (e.g. db.select()) triggers initialization on first use.
 * In serverless (Vercel/Edge) each request may get a fresh module scope —
 * the proxy ensures we never cache a dead connection across cold starts.
 */
export const db: DbInstance = new Proxy({} as DbInstance, {
  get(_target, prop) {
    // Always create fresh in serverless (no globalForDb caching in production)
    if (!globalForDb._smanuDb) {
      globalForDb._smanuDb = createDb();
    }
    const instance = globalForDb._smanuDb;
    const value = (instance as unknown as Record<string | symbol, unknown>)[prop];
    if (typeof value === "function") {
      return value.bind(instance);
    }
    return value;
  },
});
