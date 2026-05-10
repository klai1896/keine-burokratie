import { eq, inArray } from "drizzle-orm";
import { db } from "@/db/client";
import { browserEventQueue, watch } from "@/db/schema";
import { publicAppUrl } from "@/lib/app-url";
import { hashToken } from "@/lib/tokens";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

type Ctx = { params: Promise<{ id: string }> };

export async function GET(req: Request, ctx: Ctx) {
  const { id } = await ctx.params;
  const url = new URL(req.url);
  const manageToken = url.searchParams.get("manageToken");
  if (!manageToken) {
    return new Response(JSON.stringify({ error: "manageToken required" }), { status: 400 });
  }

  const rows = await db.select().from(watch).where(eq(watch.id, id)).limit(1);
  const w = rows[0];
  if (!w) return new Response(null, { status: 404 });
  if (w.manageTokenHash !== hashToken(manageToken)) {
    return new Response(null, { status: 403 });
  }
  if (
    w.notificationMode !== "browser_session" &&
    w.notificationMode !== "browser_session_and_email"
  ) {
    return new Response(JSON.stringify({ error: "Watch not in browser session mode" }), {
      status: 400,
    });
  }

  const encoder = new TextEncoder();
  const base = publicAppUrl();

  const stream = new ReadableStream({
    async start(controller) {
      const push = (obj: unknown) => {
        controller.enqueue(encoder.encode(`data: ${JSON.stringify(obj)}\n\n`));
      };
      push({ type: "connected", watchId: id });

      const interval = setInterval(async () => {
        try {
          const pending = await db
            .select()
            .from(browserEventQueue)
            .where(eq(browserEventQueue.watchId, id));

          if (pending.length === 0) return;

          const ids = pending.map((p) => p.id);
          await db.delete(browserEventQueue).where(inArray(browserEventQueue.id, ids));

          for (const p of pending) {
            push({
              type: "slot_available",
              watchId: id,
              openUrl: p.openUrl,
              fallbackUrl: `${base}/einbuergerungstest`,
            });
          }
        } catch (e) {
          push({ type: "error", message: e instanceof Error ? e.message : String(e) });
        }
      }, 2000);

      const close = () => {
        clearInterval(interval);
        try {
          controller.close();
        } catch {
          /* ignore */
        }
      };

      req.signal.addEventListener("abort", close);
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache, no-transform",
      Connection: "keep-alive",
    },
  });
}
