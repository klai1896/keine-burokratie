import { eq } from "drizzle-orm";
import { NextResponse } from "next/server";
import { db } from "@/db/client";
import { watch } from "@/db/schema";
import { hashToken } from "@/lib/tokens";

type Ctx = { params: Promise<{ id: string }> };

export async function POST(req: Request, ctx: Ctx) {
  const { id } = await ctx.params;
  const url = new URL(req.url);
  const manageToken = url.searchParams.get("manageToken");
  if (!manageToken) {
    return NextResponse.json({ error: "manageToken required" }, { status: 400 });
  }

  const rows = await db.select().from(watch).where(eq(watch.id, id)).limit(1);
  const w = rows[0];
  if (!w) return NextResponse.json({ error: "Not found" }, { status: 404 });

  if (w.manageTokenHash !== hashToken(manageToken)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  await db.update(watch).set({ status: "cancelled" }).where(eq(watch.id, id));
  return new NextResponse(null, { status: 204 });
}
