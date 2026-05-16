/** Full connection strings (checked first, in order). */
const URL_ENV_KEYS = [
  "DATABASE_URL",
  "POSTGRES_URL",
  "POSTGRES_PRISMA_URL",
  "POSTGRES_URL_NON_POOLING",
  "SUPABASE_DB_URL",
] as const;

/** Set by Vercel ↔ Supabase Storage / Marketplace sync (used to build a URL if no string var exists). */
const POSTGRES_PART_KEYS = [
  "POSTGRES_HOST",
  "POSTGRES_USER",
  "POSTGRES_PASSWORD",
  "POSTGRES_DATABASE",
  "POSTGRES_PORT",
] as const;

/** Supabase client/API keys — present when the integration is linked, but not enough for Drizzle alone. */
const SUPABASE_CLIENT_KEYS = [
  "NEXT_PUBLIC_SUPABASE_URL",
  "SUPABASE_URL",
  "NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY",
  "NEXT_PUBLIC_SUPABASE_ANON_KEY",
] as const;

export type DatabaseUrlEnvKey = (typeof URL_ENV_KEYS)[number];
export type PostgresPartEnvKey = (typeof POSTGRES_PART_KEYS)[number];
export type SupabaseClientEnvKey = (typeof SUPABASE_CLIENT_KEYS)[number];

export function isLocalhostDatabaseHost(url: string): boolean {
  try {
    const normalized = url.replace(/^postgres:/, "postgresql:");
    const host = new URL(normalized).hostname.toLowerCase();
    return host === "localhost" || host === "127.0.0.1" || host === "::1";
  } catch {
    return /localhost|127\.0\.0\.1/i.test(url);
  }
}

function readEnv(key: string): string | undefined {
  const u = process.env[key]?.trim();
  return u || undefined;
}

/** On Vercel/production, ignore localhost URLs (often copied from local `.env`). */
export function shouldSkipLocalhostDatabaseUrl(): boolean {
  return process.env.VERCEL === "1" || process.env.NODE_ENV === "production";
}

export function databaseUrlHostname(url: string): string | undefined {
  try {
    return new URL(url.replace(/^postgres:/, "postgresql:")).hostname;
  } catch {
    return undefined;
  }
}

function buildFromPostgresParts(): string | undefined {
  const host = readEnv("POSTGRES_HOST");
  const user = readEnv("POSTGRES_USER");
  const password = readEnv("POSTGRES_PASSWORD");
  const database = readEnv("POSTGRES_DATABASE") ?? "postgres";
  const port = readEnv("POSTGRES_PORT") ?? "5432";
  if (!host || !user || !password) return undefined;

  const encUser = encodeURIComponent(user);
  const encPass = encodeURIComponent(password);
  return `postgresql://${encUser}:${encPass}@${host}:${port}/${database}`;
}

function resolveFromUrlEnvVars(): string | undefined {
  const skipLocal = shouldSkipLocalhostDatabaseUrl();

  for (const key of URL_ENV_KEYS) {
    const u = readEnv(key);
    if (!u) continue;
    if (skipLocal && isLocalhostDatabaseHost(u)) continue;
    return u;
  }

  return undefined;
}

/**
 * Hosted Postgres URL for runtime and drizzle-kit.
 * Supports Vercel Postgres, Supabase via Vercel Storage (POSTGRES_*), and manual DATABASE_URL.
 */
export function resolveDatabaseUrl(): string | undefined {
  return resolveFromUrlEnvVars() ?? buildFromPostgresParts();
}

function hasSupabaseClientEnv(): boolean {
  return SUPABASE_CLIENT_KEYS.some((key) => Boolean(readEnv(key)));
}

export function databaseUrlSetupHint(diag: DatabaseUrlDiagnostics): string | undefined {
  if (diag.resolved) return undefined;

  if (diag.supabaseClientLinked && !diag.postgresEnvLinked) {
    return (
      "Supabase API keys are on this deployment (SUPABASE_URL / NEXT_PUBLIC_SUPABASE_URL) but no Postgres " +
      "connection env vars (POSTGRES_URL or DATABASE_URL). In Vercel: open your Supabase database under " +
      "Storage → Connect to this project (Production), or copy the connection string from Supabase " +
      "Dashboard → Project Settings → Database → URI (Transaction pooler, port 6543) into DATABASE_URL, then redeploy."
    );
  }

  if (!diag.postgresEnvLinked && !diag.supabaseClientLinked) {
    return (
      "No database env vars on this deployment. Link Supabase under Vercel Storage to this project " +
      "(Production), or set DATABASE_URL to your Supabase connection string, then redeploy."
    );
  }

  if (diag.skippedLocalhostDatabaseUrl) {
    return "DATABASE_URL points at localhost on Vercel — delete it or replace with your Supabase URI, then redeploy.";
  }

  return "Postgres env vars are partially set but no usable connection URL was resolved — check POSTGRES_URL or DATABASE_URL, then redeploy.";
}

export type DatabaseUrlDiagnostics = {
  vercel: boolean;
  resolved: boolean;
  host: string | null;
  skippedLocalhostDatabaseUrl: boolean;
  /** Any POSTGRES_* / DATABASE_URL style var present (including non-resolving localhost). */
  postgresEnvLinked: boolean;
  /** Supabase client integration vars (API) — does not imply Postgres is configured for Drizzle. */
  supabaseClientLinked: boolean;
  envPresent: Record<DatabaseUrlEnvKey, boolean>;
  postgresPartsPresent: Record<PostgresPartEnvKey, boolean>;
  supabaseClientPresent: Record<SupabaseClientEnvKey, boolean>;
  hint?: string;
};

export function getDatabaseUrlDiagnostics(): DatabaseUrlDiagnostics {
  const envPresent = Object.fromEntries(
    URL_ENV_KEYS.map((key) => [key, Boolean(readEnv(key))]),
  ) as Record<DatabaseUrlEnvKey, boolean>;

  const postgresPartsPresent = Object.fromEntries(
    POSTGRES_PART_KEYS.map((key) => [key, Boolean(readEnv(key))]),
  ) as Record<PostgresPartEnvKey, boolean>;

  const supabaseClientPresent = Object.fromEntries(
    SUPABASE_CLIENT_KEYS.map((key) => [key, Boolean(readEnv(key))]),
  ) as Record<SupabaseClientEnvKey, boolean>;

  const databaseUrl = readEnv("DATABASE_URL");
  const skippedLocalhostDatabaseUrl = Boolean(
    databaseUrl &&
      shouldSkipLocalhostDatabaseUrl() &&
      isLocalhostDatabaseHost(databaseUrl),
  );

  const postgresEnvLinked =
    URL_ENV_KEYS.some((key) => envPresent[key]) ||
    (postgresPartsPresent.POSTGRES_HOST &&
      postgresPartsPresent.POSTGRES_USER &&
      postgresPartsPresent.POSTGRES_PASSWORD);

  const supabaseClientLinked = hasSupabaseClientEnv();
  const resolved = resolveDatabaseUrl();

  const base: DatabaseUrlDiagnostics = {
    vercel: process.env.VERCEL === "1",
    resolved: Boolean(resolved),
    host: resolved ? (databaseUrlHostname(resolved) ?? null) : null,
    skippedLocalhostDatabaseUrl,
    postgresEnvLinked,
    supabaseClientLinked,
    envPresent,
    postgresPartsPresent,
    supabaseClientPresent,
  };

  const hint = databaseUrlSetupHint(base);
  return hint ? { ...base, hint } : base;
}
