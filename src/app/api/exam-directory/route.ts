import { asc, eq } from "drizzle-orm";
import { db } from "@/db/client";
import { examListing } from "@/db/schema";

export const runtime = "nodejs";

export async function GET() {
  const rows = await db
    .select({
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
    })
    .from(examListing)
    .where(eq(examListing.active, true))
    .orderBy(asc(examListing.name));

  return Response.json({ exams: rows });
}
