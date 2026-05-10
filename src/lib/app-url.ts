export function publicAppUrl(): string {
  const u = process.env.NEXT_PUBLIC_APP_URL ?? process.env.VERCEL_URL;
  if (!u) return "http://localhost:3000";
  if (u.startsWith("http")) return u.replace(/\/$/, "");
  return `https://${u}`.replace(/\/$/, "");
}
