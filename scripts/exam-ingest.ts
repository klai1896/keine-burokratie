/**
 * Exam directory ingest (T10) — scheduled job stub.
 * Extend with HTML parsers + robots.txt review before increasing scrape frequency.
 */
import "dotenv/config";
import { eq } from "drizzle-orm";
import { db, pool } from "../src/db/client";
import { examListing } from "../src/db/schema";

const SOURCES: { slug: string; url: string }[] = [
  {
    slug: "goethe-berlin-a1",
    url: "https://www.goethe.de/ins/de/en/prf/ort/ber/gza1.cfm",
  },
  {
    slug: "goethe-berlin-b1",
    url: "https://www.goethe.de/ins/de/en/prf/ort/ber/gzb1.cfm",
  },
];

async function fetchHead(url: string) {
  const ua =
    process.env.BERLIN_USER_AGENT ??
    "KeineBurokratie/1.0 (+https://github.com/keine-burokratie/about-bot)";
  const res = await fetch(url, {
    headers: { "User-Agent": ua, Accept: "text/html" },
    signal: AbortSignal.timeout(30_000),
  });
  return { status: res.status, url: res.url };
}

async function main() {
  console.log("[ingest:exams] starting");
  for (const s of SOURCES) {
    try {
      const { status, url } = await fetchHead(s.url);
      if (status >= 400) {
        console.warn("[ingest:exams]", s.slug, "status", status);
        await db
          .update(examListing)
          .set({ active: false })
          .where(eq(examListing.slug, s.slug));
        continue;
      }
      await db
        .update(examListing)
        .set({
          lastVerified: new Date(),
          sourcePageUrl: url,
          active: true,
        })
        .where(eq(examListing.slug, s.slug));
      console.log("[ingest:exams]", s.slug, "ok");
    } catch (e) {
      console.error("[ingest:exams]", s.slug, e);
    }
  }
  console.log("[ingest:exams] done");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => {
    void pool.end();
  });
