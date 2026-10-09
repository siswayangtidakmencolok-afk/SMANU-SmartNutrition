/**
 * Database connection — Neon Postgres via @neondatabase/serverless
 * Connection string is read from DATABASE_URL (server-side only, never exposed to browser).
 *
 * Lazy initialization: the connection is created only when first accessed,
 * so build-time evaluation (Next.js static analysis) doesn't fail without DATABASE_URL.
 */

import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import * as schema from "./schema";

type DbInstance = ReturnType<typeof drizzle<typeof schema>>;

const globalForDb = global as unknown as { _smanuDb?: DbInstance };

function createDb(): DbInstance {
  const url = process.env.DATABASE_URL;
  if (!url) {
    throw new Error(
      "[SMANU DB] DATABASE_URL is not set. Add it to .env.local.\n" +
      "Get your connection string from neon.tech → Project → Connection string."
    );
  }
  const sql = neon(url);
  return drizzle(sql, { schema });
}

/**
 * Lazily-initialized database proxy.
 * Accessing any property (e.g. db.select()) triggers initialization on first use.
 */
export const db: DbInstance = new Proxy({} as DbInstance, {
  get(_target, prop) {
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
