import { createHash } from "node:crypto";
import { DateTime } from "luxon";

const BERLIN = "Europe/Berlin";

export interface NormalizedSlot {
  id: string;
  start: string;
  label?: string;
}

export interface AvailabilityPayload {
  version: 1;
  slots: NormalizedSlot[];
  sourceFingerprint?: string;
}

export function canonicalSlotKey(s: NormalizedSlot): string {
  return `${s.start}\0${s.id}`;
}

/** SHA-256 of canonical sorted slot list per engineering-spec §3.5 */
export function contentHashFromSlots(slots: NormalizedSlot[]): string {
  const sorted = [...slots].sort((a, b) => {
    const c = a.start.localeCompare(b.start);
    return c !== 0 ? c : a.id.localeCompare(b.id);
  });
  const body = JSON.stringify(sorted.map((s) => ({ id: s.id, start: s.start })));
  return createHash("sha256").update(body).digest("hex");
}

export interface WatchMatchParams {
  allowedWeekdays: number[];
  /** Luxon weekday: 1 = Monday … 7 = Sunday. PRD uses Mon–Sat only. */
  allowMorning: boolean;
  allowAfternoon: boolean;
}

/**
 * Matching rule per spec: weekday ∈ allowedWeekdays (ISO Mon=1 … Sat=6),
 * time in morning (07:00–13:00) or afternoon [13:00–19:00).
 */
export function slotMatchesWatch(slot: NormalizedSlot, w: WatchMatchParams): boolean {
  const dt = DateTime.fromISO(slot.start, { setZone: true }).setZone(BERLIN);
  if (!dt.isValid) return false;

  const wd = dt.weekday;
  if (!w.allowedWeekdays.includes(wd)) return false;
  if (wd === 7) return false;

  const mins = dt.hour * 60 + dt.minute;
  const morning = mins >= 7 * 60 && mins < 13 * 60;
  const afternoon = mins >= 13 * 60 && mins < 19 * 60;

  let bandOk = false;
  if (w.allowMorning && morning) bandOk = true;
  if (w.allowAfternoon && afternoon) bandOk = true;
  return bandOk;
}

export function newSlotsSince(
  previous: NormalizedSlot[] | null,
  current: NormalizedSlot[],
): NormalizedSlot[] {
  const prev = new Set((previous ?? []).map(canonicalSlotKey));
  return current.filter((s) => !prev.has(canonicalSlotKey(s)));
}
