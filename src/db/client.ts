import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";
import * as schema from "./schema";

function envDatabaseUrl(): string | undefined {
  const u = process.env.DATABASE_URL?.trim();
  return u ? u : undefined;
}

/** Local dev fallback only — Vercel must set DATABASE_URL to a hosted Postgres URL. */
const connectionString =
  envDatabaseUrl() ??
  "postgresql://localhost:5432/keine_burokratie";

if (process.env.VERCEL === "1" && !envDatabaseUrl()) {
  console.error(
    "[db] DATABASE_URL is missing. Set it under Vercel → Settings → Environment Variables (hosted Postgres URL), then redeploy.",
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
