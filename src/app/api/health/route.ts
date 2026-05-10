import { eq, sql } from "drizzle-orm";
import { db } from "@/db/client";
import { workerHeartbeat } from "@/db/schema";
import { isBerlinPollWindowActive, berlinNow } from "@/lib/berlin";

export const runtime = "nodejs";

export async function GET() {
  let ok = true;
  let dbState: string = "up";

  try {
    await db.execute(sql`select 1`);
    const hb = await db
      .select()
      .from(workerHeartbeat)
      .where(eq(workerHeartbeat.id, 1))
      .limit(1);
    const last = hb[0]?.lastRunAt?.toISOString() ?? null;
    const pollWindowActive = isBerlinPollWindowActive(berlinNow());

    return Response.json({
      ok,
      db: dbState,
      workerLastRun: last,
      pollWindowActive,
    });
  } catch {
    ok = false;
    dbState = "down";
    return Response.json(
      {
        ok,
        db: dbState,
        workerLastRun: null,
        pollWindowActive: isBerlinPollWindowActive(berlinNow()),
      },
      { status: 503 },
    );
  }
}
