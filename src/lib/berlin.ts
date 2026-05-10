import { DateTime } from "luxon";

const ZONE = "Europe/Berlin";

export function berlinNow(): DateTime {
  return DateTime.now().setZone(ZONE);
}

/** True when Monday–Friday in Berlin and local time ≥ 07:00. */
export function isBerlinPollWindowActive(at: DateTime = berlinNow()): boolean {
  if (at.weekday > 5) return false;
  return at.hour * 60 + at.minute >= 7 * 60;
}

/**
 * If already inside the Mon–Fri ≥07:00 window, returns `from`.
 * Otherwise returns the next weekday 07:00 Berlin (may be later the same calendar day or a future day).
 */
export function nextBerlinWindowStart(from: DateTime = berlinNow()): DateTime {
  if (isBerlinPollWindowActive(from)) return from.setZone(ZONE);

  let t = from.setZone(ZONE);
  for (let k = 0; k < 14; k += 1) {
    if (t.weekday <= 5) {
      const open = t.set({ hour: 7, minute: 0, second: 0, millisecond: 0 });
      if (t < open) return open;
    }
    t = t.plus({ days: 1 }).startOf("day");
  }
  return from;
}
