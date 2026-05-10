import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";
import * as schema from "./schema";

const connectionString =
  process.env.DATABASE_URL ?? "postgresql://localhost:5432/keine_burokratie";

const globalForDb = globalThis as unknown as { pool?: Pool };

function createPool(): Pool {
  return new Pool({ connectionString, max: 10 });
}

export const pool = globalForDb.pool ?? createPool();

if (process.env.NODE_ENV !== "production") {
  globalForDb.pool = pool;
}

export const db = drizzle(pool, { schema });
