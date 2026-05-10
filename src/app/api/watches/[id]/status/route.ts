import { eq, desc } from "drizzle-orm";
import { db } from "@/db/client";
import { browserEventQueue, watch } from "@/db/schema";
import { hashToken } from "@/lib/tokens";

export const runtime = "nodejs";

type Ctx = { params: Promise<{ id: string }> };

export async function GET(req: Request, ctx: Ctx) {
  const { id } = await ctx.params;
  const url = new URL(req.url);
  const manageToken = url.searchParams.get("manageToken");
  if (!manageToken) return Response.json({ error: "manageToken required" }, { status: 400 });

  const rows = await db.select().from(watch).where(eq(watch.id, id)).limit(1);
  const w = rows[0];
  if (!w) return Response.json({ error: "Not found" }, { status: 404 });
  if (w.manageTokenHash !== hashToken(manageToken)) return Response.json({ error: "Forbidden" }, { status: 403 });

  const pending = await db
    .select()
    .from(browserEventQueue)
    .where(eq(browserEventQueue.watchId, id))
    .orderBy(desc(browserEventQueue.createdAt))
    .limit(10);

  return Response.json({
    watchId: id,
    status: w.status,
    notificationMode: w.notificationMode,
    pendingBrowserEvents: pending.length,
    hint:
      "For browser-session mode, subscribe to `/api/watches/:id/stream?manageToken=…` or poll this endpoint.",
  });
}
