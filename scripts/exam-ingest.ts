/**
 * Exam directory ingest — extends Goethe HTML + live examfinder JSON when reachable.
 */
import "dotenv/config";
import { inArray } from "drizzle-orm";
import { db, pool } from "../src/db/client";
import { examListing } from "../src/db/schema";
import {
  collectSoonestBookableDate,
  extractExamfinderConfig,
  GOETHE_DEFAULT_USER_AGENT,
} from "../src/lib/goethe-examfinder";

const GOETHE_BERLIN_A1 = "https://www.goethe.de/ins/de/de/prf/ort/ber/gza1.cfm";
const GOETHE_BERLIN_B1 = "https://www.goethe.de/ins/de/de/prf/ort/ber/gzb1.cfm";

/** One fetch per Berlin page; all listing slugs that point at that page are updated together. */
const SOURCES: { slugs: string[]; url: string }[] = [
  { slugs: ["goethe-berlin-a1", "goethe-ber-a1-alt"], url: GOETHE_BERLIN_A1 },
  { slugs: ["goethe-berlin-b1", "goethe-ber-b1-practice"], url: GOETHE_BERLIN_B1 },
];

async function fetchText(url: string) {
  const ua = process.env.GOETHE_INGEST_USER_AGENT ?? GOETHE_DEFAULT_USER_AGENT;
  const res = await fetch(url, {
    headers: { "User-Agent": ua, Accept: "text/html,application/xhtml+xml" },
    signal: AbortSignal.timeout(30_000),
    redirect: "follow",
  });
  return { status: res.status, text: await res.text(), finalUrl: res.url };
}

async function assertPostgresReachable() {
  try {
    await pool.query("select 1");
  } catch (e: unknown) {
    const code = e && typeof e === "object" && "code" in e ? (e as { code?: string }).code : "";
    const msg = [
      "[ingest:exams] Postgres is not reachable — the Goethe URLs may load fine but updates need a running database.",
      code === "ECONNREFUSED"
        ? "  (ECONNREFUSED usually means Postgres is stopped or DATABASE_URL points at the wrong host/port.)"
        : "",
      "  Fix: start Postgres and set DATABASE_URL.",
      "",
      process.env.DATABASE_URL == null
        ? "  Note: DATABASE_URL is unset — using default localhost:5432/keine_burokratie"
        : "",
    ]
      .filter(Boolean)
      .join("\n");
    console.error(msg);
    throw e;
  }
}

async function ingestGoetheGroup(slugs: string[], url: string) {
  const { status, text: html, finalUrl } = await fetchText(url);
  if (status >= 400) {
    console.warn("[ingest:exams]", slugs.join(","), "page status", status);
    await db.update(examListing).set({ active: false }).where(inArray(examListing.slug, slugs));
    return;
  }

  const cfg = extractExamfinderConfig(html);
  const now = new Date();
  let soonestBookableAt: Date | null = null;
  let availableDatesDisplay: string | undefined;

  if (cfg) {
    const { soonest, examCount, apiUnreachable } = await collectSoonestBookableDate(cfg, finalUrl, {
      maxPagesPerLevel: 8,
    });
    soonestBookableAt = soonest;
    if (soonest) {
      availableDatesDisplay = soonest.toLocaleDateString("en-GB", {
        day: "numeric",
        month: "long",
        year: "numeric",
      });
    } else if (apiUnreachable) {
      availableDatesDisplay =
        "Live availability API blocked or offline — open the booking page for current dates.";
    } else if (examCount > 0) {
      availableDatesDisplay =
        "Listed exam dates are visible, but no open booking slot was detected — check the provider.";
    } else {
      availableDatesDisplay = "No upcoming exam rows returned — check the booking page.";
    }
  } else {
    availableDatesDisplay =
      "Could not read examfinder configuration from the page HTML — confirm on the booking page.";
  }

  await db
    .update(examListing)
    .set({
      lastVerified: now,
      sourcePageUrl: finalUrl,
      bookingUrl: url,
      soonestBookableAt,
      ...(availableDatesDisplay ? { availableDatesDisplay } : {}),
      active: true,
    })
    .where(inArray(examListing.slug, slugs));

  console.log(
    "[ingest:exams]",
    slugs.join(","),
    "ok",
    soonestBookableAt ? `(soonest ${soonestBookableAt.toISOString()})` : "",
  );
}

async function main() {
  console.log("[ingest:exams] starting");
  await assertPostgresReachable();
  for (const s of SOURCES) {
    try {
      await ingestGoetheGroup(s.slugs, s.url);
    } catch (e) {
      console.error("[ingest:exams]", s.slugs.join(","), e);
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
