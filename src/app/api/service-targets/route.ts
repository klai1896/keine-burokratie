import { asc, eq } from "drizzle-orm";
import { db } from "@/db/client";
import { serviceTarget } from "@/db/schema";

export const runtime = "nodejs";

export async function GET() {
  const rows = await db
    .select({
      id: serviceTarget.id,
      labelEn: serviceTarget.labelEn,
      officialUrl: serviceTarget.serviceBerlinUrl,
      slug: serviceTarget.slug,
    })
    .from(serviceTarget)
    .where(eq(serviceTarget.active, true))
    .orderBy(asc(serviceTarget.labelEn));

  return Response.json({ targets: rows });
}
