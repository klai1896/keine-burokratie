import "dotenv/config";
import { db } from "../src/db/client";
import { examListing, serviceTarget } from "../src/db/schema";

const BASE = "https://service.berlin.de/dienstleistung/351180";

const targets: { slug: string; labelEn: string; suffix: string }[] = [
  { slug: "vhs-mitte-antonstrasse", labelEn: "VHS Mitte — Antonstraße", suffix: "?antrast=121916" },
  { slug: "vhs-charlottenburg-wilmersdorf", labelEn: "VHS Charlottenburg-Wilmersdorf", suffix: "" },
  { slug: "vhs-friedrichshain-kreuzberg", labelEn: "VHS Friedrichshain-Kreuzberg", suffix: "" },
  { slug: "vhs-lichtenberg", labelEn: "VHS Lichtenberg", suffix: "" },
  { slug: "vhs-marzahn-hellersdorf", labelEn: "VHS Marzahn-Hellersdorf", suffix: "" },
  { slug: "vhs-neukoelln", labelEn: "VHS Neukölln", suffix: "" },
  { slug: "vhs-pankow", labelEn: "VHS Pankow", suffix: "" },
  { slug: "vhs-reinickendorf", labelEn: "VHS Reinickendorf", suffix: "" },
  { slug: "vhs-spandau", labelEn: "VHS Spandau", suffix: "" },
  { slug: "vhs-steglitz-zehlendorf", labelEn: "VHS Steglitz-Zehlendorf", suffix: "" },
  { slug: "vhs-tempelhof-schoeneberg", labelEn: "VHS Tempelhof-Schöneberg", suffix: "" },
  { slug: "vhs-treptow-koepenick", labelEn: "VHS Treptow-Köpenick", suffix: "" },
];

const examRows = [
  {
    slug: "goethe-berlin-a1",
    name: "Goethe-Institut Berlin",
    area: "Mitte",
    examSystem: "goethe" as const,
    levels: ["A1"],
    priceDisplay: "See booking page",
    availableDatesDisplay: "Varies — confirm on provider",
    bookingUrl: "https://www.goethe.de/ins/de/en/prf/ort/ber/gza1.cfm",
    sourcePageUrl: "https://www.goethe.de/ins/de/en/prf/ort/ber/gza1.cfm",
  },
  {
    slug: "goethe-berlin-b1",
    name: "Goethe-Institut Berlin",
    area: "Mitte",
    examSystem: "goethe" as const,
    levels: ["B1"],
    priceDisplay: "See booking page",
    availableDatesDisplay: "Varies — confirm on provider",
    bookingUrl: "https://www.goethe.de/ins/de/en/prf/ort/ber/gzb1.cfm",
    sourcePageUrl: "https://www.goethe.de/ins/de/en/prf/ort/ber/gzb1.cfm",
  },
  {
    slug: "telc-ber-alpha-a1-sample",
    name: "Language school (telc Berlin — illustrative seed)",
    area: "Charlottenburg",
    examSystem: "telc" as const,
    levels: ["A1"],
    priceDisplay: "See institution page",
    availableDatesDisplay: "Use telc finder + provider",
    bookingUrl: "https://www.telc.net/en/language-examinations/find-a-telc-examination-centre/",
    sourcePageUrl: "https://www.telc.net/en/language-examinations/find-a-telc-examination-centre/",
  },
  {
    slug: "telc-ber-beta-b1-sample",
    name: "Exam partner (telc Berlin — illustrative seed)",
    area: "Neukölln",
    examSystem: "telc" as const,
    levels: ["B1"],
    priceDisplay: "See institution page",
    availableDatesDisplay: "Use telc finder + provider",
    bookingUrl: "https://www.telc.net/en/language-examinations/find-a-telc-examination-centre/",
    sourcePageUrl: "https://www.telc.net/en/language-examinations/find-a-telc-examination-centre/",
  },
  {
    slug: "goethe-ber-a1-alt",
    name: "Goethe Berlin — A1 (seed)",
    area: "Charlottenburg",
    examSystem: "goethe" as const,
    levels: ["A1"],
    priceDisplay: "See booking page",
    availableDatesDisplay: "Varies",
    bookingUrl: "https://www.goethe.de/ins/de/en/prf/ort/ber/gza1.cfm",
    sourcePageUrl: "https://www.goethe.de/ins/de/en/prf/ort/ber/gza1.cfm",
  },
  {
    slug: "telc-ber-gamma-a1b1",
    name: "Combined A1/B1 prep centre (seed)",
    area: "Pankow",
    examSystem: "telc" as const,
    levels: ["A1", "B1"],
    priceDisplay: "See institution page",
    availableDatesDisplay: "Varies",
    bookingUrl: "https://www.telc.net/en/language-examinations/find-a-telc-examination-centre/",
    sourcePageUrl: "https://www.telc.net/en/language-examinations/find-a-telc-examination-centre/",
  },
  {
    slug: "goethe-ber-b1-practice",
    name: "Goethe Berlin — B1 overview (seed)",
    area: "Mitte",
    examSystem: "goethe" as const,
    levels: ["B1"],
    priceDisplay: "See booking page",
    availableDatesDisplay: "Varies",
    bookingUrl: "https://www.goethe.de/ins/de/en/m/prf/ort/ber.html",
    sourcePageUrl: "https://www.goethe.de/ins/de/en/m/prf/ort/ber.html",
  },
  {
    slug: "telc-ber-delta-a1",
    name: "telc partner centre (seed)",
    area: "Spandau",
    examSystem: "telc" as const,
    levels: ["A1"],
    priceDisplay: "See institution page",
    availableDatesDisplay: "Varies",
    bookingUrl: "https://www.telc.net/en/language-examinations/find-a-telc-examination-centre/",
    sourcePageUrl: "https://www.telc.net/en/language-examinations/find-a-telc-examination-centre/",
  },
];

async function main() {
  for (const t of targets) {
    const url = `${BASE}${t.suffix}`;
    await db
      .insert(serviceTarget)
      .values({ slug: t.slug, labelEn: t.labelEn, serviceBerlinUrl: url, active: true })
      .onConflictDoUpdate({
        target: serviceTarget.slug,
        set: { labelEn: t.labelEn, serviceBerlinUrl: url, active: true },
      });
  }

  for (const e of examRows) {
    await db
      .insert(examListing)
      .values(e)
      .onConflictDoUpdate({
        target: examListing.slug,
        set: {
          name: e.name,
          area: e.area,
          examSystem: e.examSystem,
          levels: e.levels,
          priceDisplay: e.priceDisplay,
          availableDatesDisplay: e.availableDatesDisplay,
          bookingUrl: e.bookingUrl,
          sourcePageUrl: e.sourcePageUrl,
          lastVerified: new Date(),
          active: true,
        },
      });
  }

  console.log("Seed complete (service targets + exam listings).");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => {
    void import("../src/db/client").then(({ pool }) => pool.end());
  });
