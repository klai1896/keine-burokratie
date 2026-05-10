import { describe, expect, it } from "vitest";
import { contentHashFromSlots, newSlotsSince, slotMatchesWatch } from "./slots";

describe("slotMatchesWatch", () => {
  it("matches weekday + morning window", () => {
    const slot = { id: "a", start: "2026-06-01T09:00:00+02:00" };
    expect(
      slotMatchesWatch(slot, {
        allowedWeekdays: [1],
        allowMorning: true,
        allowAfternoon: false,
      }),
    ).toBe(true);
  });

  it("respects afternoon window", () => {
    const slot = { id: "a", start: "2026-06-01T14:00:00+02:00" };
    expect(
      slotMatchesWatch(slot, {
        allowedWeekdays: [1],
        allowMorning: false,
        allowAfternoon: true,
      }),
    ).toBe(true);
  });

  it("supports Saturday selections when weekday matches", () => {
    const slot = { id: "a", start: "2026-06-06T10:15:00+02:00" }; // Saturday default for 2026-06-06
    expect(
      slotMatchesWatch(slot, {
        allowedWeekdays: [6],
        allowMorning: true,
        allowAfternoon: false,
      }),
    ).toBe(true);
  });
});

describe("snapshots", () => {
  it("computes deterministic hash ordering", () => {
    const a = contentHashFromSlots([
      { id: "z", start: "2026-06-02T09:00:00+02:00" },
      { id: "a", start: "2026-06-01T09:00:00+02:00" },
    ]);
    const b = contentHashFromSlots([
      { id: "a", start: "2026-06-01T09:00:00+02:00" },
      { id: "z", start: "2026-06-02T09:00:00+02:00" },
    ]);
    expect(a).toEqual(b);
  });

  it("diffs snapshots", () => {
    const prev = [{ id: "1", start: "2026-06-01T09:00:00+02:00" }];
    const next = [...prev, { id: "2", start: "2026-06-02T10:00:00+02:00" }];
    const diff = newSlotsSince(prev, next);
    expect(diff).toHaveLength(1);
    expect(diff[0].id).toBe("2");
  });
});
