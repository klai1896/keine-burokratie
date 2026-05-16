import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";
import { getDatabaseUrlDiagnostics, resolveDatabaseUrl } from "@/lib/database-url";
import * as schema from "./schema";

export { resolveDatabaseUrl as envDatabaseUrl };

/** Local dev fallback only — on Vercel use hosted DATABASE_URL or linked POSTGRES_URL. */
const connectionString = resolveDatabaseUrl() ?? "postgresql://localhost:5432/keine_burokratie";

if (process.env.VERCEL === "1") {
  const diag = getDatabaseUrlDiagnostics();
  if (!diag.resolved) {
    console.error(
      "[db] No hosted Postgres URL. Connect Vercel Postgres (POSTGRES_URL) or set DATABASE_URL to a non-localhost URL, then redeploy.",
    );
  } else if (diag.skippedLocalhostDatabaseUrl) {
    console.warn(
      `[db] Ignoring localhost DATABASE_URL on Vercel; using ${diag.host ?? "hosted"} instead. Remove the localhost DATABASE_URL from Environment Variables to avoid confusion.`,
    );
  }
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
