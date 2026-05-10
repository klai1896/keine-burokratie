import { asc, eq } from "drizzle-orm";
import { db } from "@/db/client";
import { examListing } from "@/db/schema";
import { augmentDbConnectionErrorMessage } from "@/lib/db-connection-hint";

export const runtime = "nodejs";

const baseColumns = {
  id: examListing.id,
  slug: examListing.slug,
  name: examListing.name,
  area: examListing.area,
  examSystem: examListing.examSystem,
  levels: examListing.levels,
  priceDisplay: examListing.priceDisplay,
  availableDatesDisplay: examListing.availableDatesDisplay,
  bookingUrl: examListing.bookingUrl,
  sourcePageUrl: examListing.sourcePageUrl,
  lastVerified: examListing.lastVerified,
} as const;

function isMissingSoonestColumnError(e: unknown): boolean {
  const text = [
    e instanceof Error ? e.message : "",
    e instanceof Error && e.cause instanceof Error ? e.cause.message : "",
    typeof e === "object" && e && "cause" in e && (e as { cause?: { message?: string } }).cause?.message,
  ]
    .filter(Boolean)
    .join(" ");
  return text.includes("soonest_bookable_at") && text.toLowerCase().includes("does not exist");
}

export async function GET() {
  try {
    let rows: {
      id: string;
      slug: string;
      name: string;
      area: string;
      examSystem: "telc" | "goethe" | "other";
      levels: string[];
      priceDisplay: string;
      availableDatesDisplay: string | null;
      soonestBookableAt: Date | null;
      bookingUrl: string;
      sourcePageUrl: string;
      lastVerified: Date;
    }[];

    try {
      rows = await db
        .select({
          ...baseColumns,
          soonestBookableAt: examListing.soonestBookableAt,
        })
        .from(examListing)
        .where(eq(examListing.active, true))
        .orderBy(asc(examListing.name));
    } catch (e) {
      if (!isMissingSoonestColumnError(e)) throw e;
      const legacy = await db
        .select(baseColumns)
        .from(examListing)
        .where(eq(examListing.active, true))
        .orderBy(asc(examListing.name));
      rows = legacy.map((r) => ({ ...r, soonestBookableAt: null }));
    }

    return Response.json({ exams: rows });
  } catch (e) {
    console.error("[exam-directory]", e);
    const nested =
      e instanceof Error && e.cause instanceof Error
        ? `${e.message} | ${e.cause.message}`
        : e instanceof Error
          ? e.message
          : "Database error";
    const message = augmentDbConnectionErrorMessage(nested);
    return Response.json(
      { exams: [], error: message },
      { status: 500, headers: { "Content-Type": "application/json" } },
    );
  }
}
