import "dotenv/config";
import { defineConfig } from "drizzle-kit";

function dbCredentialsUrl(): string {
  const u =
    process.env.DATABASE_URL?.trim() ||
    process.env.POSTGRES_URL?.trim() ||
    process.env.POSTGRES_PRISMA_URL?.trim();
  return u || "postgresql://localhost:5432/keine_burokratie";
}

export default defineConfig({
  schema: "./src/db/schema.ts",
  out: "./drizzle",
  dialect: "postgresql",
  dbCredentials: {
    url: dbCredentialsUrl(),
  },
});
