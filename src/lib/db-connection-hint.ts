/** Turns low-level pg errors into something actionable when DB is wrongly pointed at localhost. */
export function augmentDbConnectionErrorMessage(raw: string): string {
  const t = raw.trim();
  const isLocalRefusal =
    /ECONNREFUSED/i.test(t) && (/\b127\.0\.0\.1:5432\b/.test(t) || /\blocalhost(?::5432)?\b/i.test(t));
  const onVercel = process.env.VERCEL === "1";
  if (!isLocalRefusal && !onVercel) return raw;

  if (isLocalRefusal || (onVercel && /ECONNREFUSED|connect.*refused/i.test(t))) {
    return `${raw}

Production / Vercel: there is no PostgreSQL on the app server’s localhost. In the Vercel dashboard open your project → Settings → Environment Variables, set DATABASE_URL to a hosted Postgres URL (Neon, Supabase, Vercel Postgres, etc.) for Production — and Preview if you preview with the DB — then redeploy.

Local dev DATABASE_URL copied into Vercel will not work unless it tunnels to your machine (not recommended). Leave DATABASE_URL unset in Vercel if you intentionally avoid DB routes (broken until you add a real URL).`;
  }

  return raw;
}
