import { createHash, randomBytes } from "node:crypto";

function secret(): string {
  return process.env.APP_SECRET ?? "dev-only-change-me";
}

export function hashToken(raw: string): string {
  return createHash("sha256").update(secret()).update(":").update(raw).digest("hex");
}

export function generateToken(bytes = 24): string {
  return randomBytes(bytes).toString("base64url");
}
