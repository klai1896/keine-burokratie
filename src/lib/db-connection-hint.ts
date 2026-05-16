import { getDatabaseUrlDiagnostics } from "@/lib/database-url";

/** Turns low-level pg errors into something actionable when DB is wrongly pointed at localhost. */
export function augmentDbConnectionErrorMessage(raw: string): string {
  const t = raw.trim();
  const isLocalRefusal =
    /ECONNREFUSED/i.test(t) && (/\b127\.0\.0\.1:5432\b/.test(t) || /\blocalhost(?::5432)?\b/i.test(t));
  const onVercel = process.env.VERCEL === "1";
  if (!isLocalRefusal && !onVercel) return raw;

  if (isLocalRefusal || (onVercel && /ECONNREFUSED|connect.*refused/i.test(t))) {
    const diag = getDatabaseUrlDiagnostics();
    const skipped = diag.skippedLocalhostDatabaseUrl
      ? "\n\nYou have DATABASE_URL set to localhost on Vercel — delete that variable (or replace it with your hosted URL). The app will then use POSTGRES_URL from Vercel Postgres if the store is linked to this project."
      : !diag.envPresent.POSTGRES_URL && !diag.envPresent.DATABASE_URL
        ? "\n\nNo DATABASE_URL or POSTGRES_URL is available in this deployment. In Vercel: Storage → your Postgres → Connect to Project (Production), or add DATABASE_URL manually, then redeploy."
        : "";

    return `${raw}

Production / Vercel: there is no PostgreSQL on the app server’s localhost. Connect Vercel Postgres to this project (so POSTGRES_URL appears under Environment Variables) or set DATABASE_URL to your hosted connection string — not localhost — for Production, then redeploy.${skipped}`;
  }

  return raw;
}
