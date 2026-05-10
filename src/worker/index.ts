import "dotenv/config";
import { and, desc, eq, sql } from "drizzle-orm";
import { db, pool } from "../db/client";
import {
  availabilitySnapshot,
  browserEventQueue,
  notificationLog,
  serviceTarget,
  serviceTargetPollState,
  watch,
  watchLocation,
  workerHeartbeat,
} from "../db/schema";
import { isBerlinPollWindowActive, nextBerlinWindowStart, berlinNow } from "../lib/berlin";
import { fetchRawForTarget, snapshotFromFetch } from "../lib/appointment-source";
import type { AvailabilityPayload, NormalizedSlot } from "../lib/slots";
import { newSlotsSince, slotMatchesWatch, canonicalSlotKey } from "../lib/slots";
import { sendTransactionalEmail } from "../lib/mail";
import { publicAppUrl } from "../lib/app-url";
import { deliverPrReminderDigest } from "../lib/pr-checklist-reminders";

const MIN_POLL_SEC = Number(process.env.MIN_POLL_INTERVAL_SEC ?? 60);
const JITTER_MAX_MS = 15_000;
const THROTTLE_MS = 6 * 60 * 60 * 1000;

function jitterMs(): number {
  return Math.floor(Math.random() * JITTER_MAX_MS);
}

function payloadFromRow(row: { normalizedJson: unknown }): AvailabilityPayload {
  const j = row.normalizedJson as AvailabilityPayload;
  if (!j || j.version !== 1 || !Array.isArray(j.slots)) return { version: 1, slots: [] };
  return j;
}

async function ensureHeartbeatRow() {
  await db.execute(sql`
    insert into worker_heartbeat (id, last_run_at) values (1, now())
    on conflict (id) do nothing
  `);
}

async function touchHeartbeat() {
  await ensureHeartbeatRow();
  await db
    .update(workerHeartbeat)
    .set({ lastRunAt: new Date() })
    .where(eq(workerHeartbeat.id, 1));
}

async function ensurePollStateRows() {
  const targets = await db.select().from(serviceTarget).where(eq(serviceTarget.active, true));
  const now = berlinNow();
  const next = nextBerlinWindowStart(now).toJSDate();
  for (const t of targets) {
    await db
      .insert(serviceTargetPollState)
      .values({
        serviceTargetId: t.id,
        nextPollAt: next,
        backoffSec: MIN_POLL_SEC,
      })
      .onConflictDoNothing();
  }
}

async function latestSnapshot(targetId: string) {
  const rows = await db
    .select()
    .from(availabilitySnapshot)
    .where(eq(availabilitySnapshot.serviceTargetId, targetId))
    .orderBy(desc(availabilitySnapshot.capturedAt))
    .limit(1);
  return rows[0] ?? null;
}

async function loadSlotsForSnapshot(snapshotId: string | null): Promise<NormalizedSlot[]> {
  if (!snapshotId) return [];
  const rows = await db
    .select()
    .from(availabilitySnapshot)
    .where(eq(availabilitySnapshot.id, snapshotId))
    .limit(1);
  const row = rows[0];
  return row ? payloadFromRow(row).slots : [];
}

async function processTarget(targetId: string, targetUrl: string) {
  const nowBerlin = berlinNow();

  if (!isBerlinPollWindowActive(nowBerlin)) {
    const nextOpen = nextBerlinWindowStart(nowBerlin).toJSDate();
    await db
      .update(serviceTargetPollState)
      .set({ nextPollAt: nextOpen })
      .where(eq(serviceTargetPollState.serviceTargetId, targetId));
    return;
  }

  const stateRows = await db
    .select()
    .from(serviceTargetPollState)
    .where(eq(serviceTargetPollState.serviceTargetId, targetId))
    .limit(1);
  const st = stateRows[0];
  if (!st) return;

  if (st.nextPollAt.getTime() > Date.now()) return;

  const raw = await fetchRawForTarget(targetUrl);
  const { payload, contentHash } = snapshotFromFetch(raw);

  let backoffSec = MIN_POLL_SEC;
  if (raw.status === 429 || raw.status === 418 || raw.status === 503) {
    backoffSec = Math.min(3600, st.backoffSec * 2);
  } else if (raw.status >= 400) {
    backoffSec = Math.min(1800, Math.max(st.backoffSec, MIN_POLL_SEC * 2));
  } else {
    backoffSec = MIN_POLL_SEC;
  }

  const prev = await latestSnapshot(targetId);

  if (prev && prev.contentHash === contentHash) {
    const nextPoll = new Date(Date.now() + backoffSec * 1000 + jitterMs());
    await db
      .update(serviceTargetPollState)
      .set({ nextPollAt: nextPoll, backoffSec, lastError: raw.error ?? null })
      .where(eq(serviceTargetPollState.serviceTargetId, targetId));
    return;
  }

  const insertedRows = await db
    .insert(availabilitySnapshot)
    .values({
      serviceTargetId: targetId,
      contentHash,
      normalizedJson: payload,
      rawHttpStatus: raw.status || null,
      fetchError: raw.error ?? null,
    })
    .returning({ id: availabilitySnapshot.id });

  const inserted = insertedRows[0];
  if (!inserted) return;

  const previousSlots = prev ? payloadFromRow(prev).slots : [];
  const currentSlots = payload.slots;
  const fresh = newSlotsSince(previousSlots, currentSlots);

  const watcherRows = await db
    .select({ w: watch, wl: watchLocation })
    .from(watchLocation)
    .innerJoin(watch, eq(watchLocation.watchId, watch.id))
    .where(and(eq(watchLocation.serviceTargetId, targetId), eq(watch.status, "active")));

  const base = publicAppUrl();

  for (const { w, wl } of watcherRows) {
    if (!wl.baselineSnapshotId) {
      await db
        .update(watchLocation)
        .set({ baselineSnapshotId: inserted.id })
        .where(and(eq(watchLocation.watchId, w.id), eq(watchLocation.serviceTargetId, targetId)));
      continue;
    }

    const baselineSlots = await loadSlotsForSnapshot(wl.baselineSnapshotId);
    const baselineKeys = new Set(baselineSlots.map(canonicalSlotKey));

    const matched = fresh.filter(
      (s) =>
        slotMatchesWatch(s, {
          allowedWeekdays: w.allowedWeekdays,
          allowMorning: w.allowMorning,
          allowAfternoon: w.allowAfternoon,
        }) && !baselineKeys.has(canonicalSlotKey(s)),
    );

    if (matched.length === 0) continue;

    const openUrl = `${base}/einbuergerungstest?info=slot_available`;

    const last = w.lastNotifiedAt?.getTime() ?? 0;
    if (Date.now() - last < THROTTLE_MS) continue;

    if (w.notificationMode === "email_only" || w.notificationMode === "browser_session_and_email") {
      const r = await sendTransactionalEmail({
        to: w.email,
        subject: "Einbürgerungstest: possible slot matching your preferences",
        html: `<p>A change in availability was detected that may include a slot that matches your saved preferences.</p><p>This is not a guarantee. <a href="https://service.berlin.de/dienstleistung/351180/">Open Service Berlin</a> to verify and book.</p><p><a href="${openUrl}">Open Keine Bürokratie</a></p>`,
        text: `Possible slot: verify on Service Berlin. ${openUrl}`,
      });
      await db.insert(notificationLog).values({
        watchId: w.id,
        snapshotId: inserted.id,
        channel: "email",
        providerMessageId: r.id,
      });
    }

    if (
      w.notificationMode === "browser_session" ||
      w.notificationMode === "browser_session_and_email"
    ) {
      await db.insert(browserEventQueue).values({
        watchId: w.id,
        openUrl,
      });
      await db.insert(notificationLog).values({
        watchId: w.id,
        snapshotId: inserted.id,
        channel: "browser_push",
      });
    }

    await db.update(watch).set({ lastNotifiedAt: new Date() }).where(eq(watch.id, w.id));
  }

  const nextPoll = new Date(Date.now() + backoffSec * 1000 + jitterMs());
  await db
    .update(serviceTargetPollState)
    .set({ nextPollAt: nextPoll, backoffSec, lastError: raw.error ?? null })
    .where(eq(serviceTargetPollState.serviceTargetId, targetId));
}

/** One worker iteration (used by cron or tests). */
export async function runTick() {
  await ensureHeartbeatRow();
  await ensurePollStateRows();
  await touchHeartbeat();

  const targets = await db.select().from(serviceTarget).where(eq(serviceTarget.active, true));
  for (const t of targets) {
    await processTarget(t.id, t.serviceBerlinUrl);
  }

  try {
    await deliverPrReminderDigest();
  } catch (e) {
    console.warn("[worker] PR reminder digest error", e);
  }
}

export async function runWorkerLoop() {
  console.log("[worker] starting, MIN_POLL_INTERVAL_SEC=", MIN_POLL_SEC);
  for (;;) {
    try {
      await runTick();
    } catch (e) {
      console.error("[worker] tick error", e);
    }
    await new Promise((r) => setTimeout(r, 25_000));
  }
}

export async function shutdownPool() {
  await pool.end();
}
