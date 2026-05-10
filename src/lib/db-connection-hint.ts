/** Turns low-level pg errors into something actionable when DB is wrongly pointed at localhost. */
export function augmentDbConnectionErrorMessage(raw: string): string {
  const t = raw.trim();
  const isLocalRefusal =
    /ECONNREFUSED/i.test(t) && (/\b127\.0\.0\.1:5432\b/.test(t) || /\blocalhost(?::5432)?\b/i.test(t));
  const onVercel = process.env.VERCEL === "1";
  if (!isLocalRefusal && !onVercel) return raw;

  if (isLocalRefusal || (onVercel && /ECONNREFUSED|connect.*refused/i.test(t))) {
    return `${raw}

Production / Vercel: there is no PostgreSQL on the app server’s localhost. Fix it by either: (1) connecting your Vercel Postgres store to the project so POSTGRES_URL (or DATABASE_URL) appears in Environment Variables, or (2) manually setting DATABASE_URL to your hosted connection string for Production — then redeploy.

If you use Vercel Storage but still see localhost, pull latest code: the app now uses POSTGRES_URL when DATABASE_URL is unset.`;
  }

  return raw;
}
