import { eq, desc } from "drizzle-orm";
import { NextResponse } from "next/server";
import { db } from "@/db/client";
import { availabilitySnapshot, watch } from "@/db/schema";
import { publicAppUrl } from "@/lib/app-url";
import { hashToken, generateToken } from "@/lib/tokens";

export async function GET(req: Request) {
  const url = new URL(req.url);
  const token = url.searchParams.get("token");
  if (!token) {
    return NextResponse.redirect(new URL("/?error=missing_token", publicAppUrl()));
  }

  const hashed = hashToken(token);
  const rows = await db.select().from(watch).where(eq(watch.confirmTokenHash, hashed)).limit(1);
  const w = rows[0];
  if (!w) {
    return NextResponse.redirect(new URL("/?error=invalid_token", publicAppUrl()));
  }
  if (w.status !== "pending_confirm") {
    return NextResponse.redirect(new URL("/einbuergerungstest?info=already_confirmed", publicAppUrl()));
  }

  const latest = await db
    .select()
    .from(availabilitySnapshot)
    .where(eq(availabilitySnapshot.serviceTargetId, w.serviceTargetId))
    .orderBy(desc(availabilitySnapshot.capturedAt))
    .limit(1);

  const manageToken = generateToken();

  await db
    .update(watch)
    .set({
      status: "active",
      baselineSnapshotId: latest[0]?.id ?? null,
      manageTokenHash: hashToken(manageToken),
    })
    .where(eq(watch.id, w.id));

  const base = publicAppUrl();
  return NextResponse.redirect(
    new URL(
      `/watches/confirmed?watchId=${encodeURIComponent(w.id)}&manageToken=${encodeURIComponent(
        manageToken,
      )}&mode=${encodeURIComponent(w.notificationMode)}`,
      base,
    ),
  );
}
