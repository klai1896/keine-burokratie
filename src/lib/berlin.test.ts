import { describe, expect, it } from "vitest";
import { DateTime } from "luxon";
import { isBerlinPollWindowActive, nextBerlinWindowStart } from "./berlin";

describe("berlin poll window", () => {
  it("is inactive on Saturday before poll window logic", () => {
    const sat = DateTime.fromISO("2026-06-06T10:00:00", { zone: "Europe/Berlin" });
    expect(isBerlinPollWindowActive(sat)).toBe(false);
  });

  it("is active Mon 10:00", () => {
    const mon = DateTime.fromISO("2026-06-01T10:00:00", { zone: "Europe/Berlin" });
    expect(isBerlinPollWindowActive(mon)).toBe(true);
  });

  it("is inactive Mon 06:30", () => {
    const mon = DateTime.fromISO("2026-06-01T06:30:00", { zone: "Europe/Berlin" });
    expect(isBerlinPollWindowActive(mon)).toBe(false);
  });

  it("next window from Saturday moves to Monday 07:00", () => {
    const sat = DateTime.fromISO("2026-06-06T10:00:00", { zone: "Europe/Berlin" });
    const next = nextBerlinWindowStart(sat);
    expect(next.weekday).toBe(1);
    expect(next.hour).toBe(7);
  });
});
