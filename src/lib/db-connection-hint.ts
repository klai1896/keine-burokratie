import { databaseUrlSetupHint, getDatabaseUrlDiagnostics } from "@/lib/database-url";

/** Turns low-level pg errors into something actionable when DB is wrongly pointed at localhost. */
export function augmentDbConnectionErrorMessage(raw: string): string {
  const t = raw.trim();
  const isLocalRefusal =
    /ECONNREFUSED/i.test(t) && (/\b127\.0\.0\.1:5432\b/.test(t) || /\blocalhost(?::5432)?\b/i.test(t));
  const onVercel = process.env.VERCEL === "1";
  if (!isLocalRefusal && !onVercel) return raw;

  if (isLocalRefusal || (onVercel && /ECONNREFUSED|connect.*refused/i.test(t))) {
    const diag = getDatabaseUrlDiagnostics();
    const hint = databaseUrlSetupHint(diag);
    const extra = hint ? `\n\n${hint}` : "";

    return `${raw}

Production / Vercel: this app needs a Postgres connection string (DATABASE_URL or POSTGRES_URL from Supabase Storage), not Supabase API keys alone.${extra}`;
  }

  return raw;
}
