/** Env vars checked in order; first usable URL wins. */
const ENV_KEYS = [
  "DATABASE_URL",
  "POSTGRES_URL",
  "POSTGRES_PRISMA_URL",
  "POSTGRES_URL_NON_POOLING",
] as const;

export type DatabaseEnvKey = (typeof ENV_KEYS)[number];

export function isLocalhostDatabaseHost(url: string): boolean {
  try {
    const normalized = url.replace(/^postgres:/, "postgresql:");
    const host = new URL(normalized).hostname.toLowerCase();
    return host === "localhost" || host === "127.0.0.1" || host === "::1";
  } catch {
    return /localhost|127\.0\.0\.1/i.test(url);
  }
}

function readEnvUrl(key: DatabaseEnvKey): string | undefined {
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

/**
 * Hosted Postgres URL for runtime and drizzle-kit.
 * Skips localhost `DATABASE_URL` on Vercel so linked `POSTGRES_URL` can be used.
 */
export function resolveDatabaseUrl(): string | undefined {
  const skipLocal = shouldSkipLocalhostDatabaseUrl();

  for (const key of ENV_KEYS) {
    const u = readEnvUrl(key);
    if (!u) continue;
    if (skipLocal && isLocalhostDatabaseHost(u)) continue;
    return u;
  }

  return undefined;
}

export type DatabaseUrlDiagnostics = {
  vercel: boolean;
  resolved: boolean;
  host: string | null;
  /** True when `DATABASE_URL` points at localhost but was ignored on Vercel/production. */
  skippedLocalhostDatabaseUrl: boolean;
  envPresent: Record<DatabaseEnvKey, boolean>;
};

export function getDatabaseUrlDiagnostics(): DatabaseUrlDiagnostics {
  const envPresent = Object.fromEntries(
    ENV_KEYS.map((key) => [key, Boolean(readEnvUrl(key))]),
  ) as Record<DatabaseEnvKey, boolean>;

  const databaseUrl = readEnvUrl("DATABASE_URL");
  const skippedLocalhostDatabaseUrl = Boolean(
    databaseUrl &&
      shouldSkipLocalhostDatabaseUrl() &&
      isLocalhostDatabaseHost(databaseUrl),
  );

  const resolved = resolveDatabaseUrl();

  return {
    vercel: process.env.VERCEL === "1",
    resolved: Boolean(resolved),
    host: resolved ? (databaseUrlHostname(resolved) ?? null) : null,
    skippedLocalhostDatabaseUrl,
    envPresent,
  };
}
