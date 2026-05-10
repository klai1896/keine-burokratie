import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";
import * as schema from "./schema";

/**
 * Vercel Storage / marketplace Postgres often injects `POSTGRES_URL` (or `POSTGRES_PRISMA_URL`);
 * this app historically used `DATABASE_URL` only. Prefer explicit DATABASE_URL when set.
 */
export function envDatabaseUrl(): string | undefined {
  const u =
    process.env.DATABASE_URL?.trim() ||
    process.env.POSTGRES_URL?.trim() ||
    process.env.POSTGRES_PRISMA_URL?.trim();
  return u || undefined;
}

/** Local dev fallback only — on Vercel use DATABASE_URL or linked Storage `POSTGRES_URL`. */
const connectionString = envDatabaseUrl() ?? "postgresql://localhost:5432/keine_burokratie";

if (process.env.VERCEL === "1" && !envDatabaseUrl()) {
  console.error(
    "[db] No Postgres URL: set DATABASE_URL, or connect Vercel Postgres so POSTGRES_URL is injected, then redeploy.",
  );
}

const globalForDb = globalThis as unknown as { pool?: Pool };

function createPool(): Pool {
  return new Pool({ connectionString, max: 10 });
}

export const pool = globalForDb.pool ?? createPool();

if (process.env.NODE_ENV !== "production") {
  globalForDb.pool = pool;
}

export const db = drizzle(pool, { schema });
