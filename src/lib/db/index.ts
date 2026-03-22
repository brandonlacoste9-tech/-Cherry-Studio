/**
 * AdgenAI — Lazy Neon PostgreSQL connection
 *
 * The neon() client is intentionally NOT called at module load time.
 * It is instantiated inside `getDb()` so it only runs at request time,
 * never during Next.js static page data collection / build phase.
 *
 * This prevents the Vercel build error:
 *   "No database connection string was provided to neon()"
 */

import { neon, type NeonQueryFunction } from "@neondatabase/serverless";
import { drizzle, type NeonHttpDatabase } from "drizzle-orm/neon-http";
import * as schema from "./schema";

export type Database = NeonHttpDatabase<typeof schema>;

// Module-level cache — populated on first request, reused thereafter.
let _db: Database | null = null;
let _sql: NeonQueryFunction<false, false> | null = null;

/**
 * Returns the singleton Drizzle + Neon client.
 * Safe to call from any API route or Server Action.
 * Throws a clear error at runtime if DATABASE_URL is missing.
 */
export function getDb(): Database {
  if (_db) return _db;

  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) {
    throw new Error(
      "[AdgenAI] DATABASE_URL is not set. " +
        "Add it to your Vercel environment variables or .env.local file."
    );
  }

  _sql = neon(connectionString);
  _db = drizzle(_sql, { schema });
  return _db;
}

/**
 * Convenience re-export — use `db` in API routes exactly as before.
 * It is a Proxy that lazily initialises the connection on first property access.
 */
export const db: Database = new Proxy({} as Database, {
  get(_target, prop) {
    return (getDb() as unknown as Record<string | symbol, unknown>)[prop];
  },
});
