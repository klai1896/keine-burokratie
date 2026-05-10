import { createHash } from "node:crypto";

function pepper(): string {
  return process.env.APP_SECRET ?? "dev-only-change-me";
}

export function normalizeEmail(email: string): string {
  return email.trim().toLowerCase();
}

export function hashEmailForDedupe(email: string): string {
  return createHash("sha256").update(pepper()).update(":").update(normalizeEmail(email)).digest("hex");
}
