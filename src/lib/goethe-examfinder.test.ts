import { describe, expect, it } from "vitest";
import {
  extractExamfinderConfig,
  goetheExamStartInstant,
  isGoetheExamBookable,
} from "@/lib/goethe-examfinder";

describe("goethe-examfinder", () => {
  it("marks rows with disabled buttons as not bookable", () => {
    expect(isGoetheExamBookable({ buttonDisabled: "disabled" })).toBe(false);
    expect(isGoetheExamBookable({ buttonDisabled: 'disabled="disabled"' })).toBe(false);
    expect(isGoetheExamBookable({ buttonDisabled: "", availabilityText: ">> BUCHEN" })).toBe(true);
    expect(isGoetheExamBookable({ availabilityText: "AUSGEBUCHT" })).toBe(false);
    expect(isGoetheExamBookable({ availabilityText: "<span>BUCHUNGSFRIST ABGELAUFEN</span>" })).toBe(false);
    expect(isGoetheExamBookable({ availabilityText: "some >> BUCHEN link" })).toBe(true);
    expect(isGoetheExamBookable({ buttonDisabled: "" })).toBe(true);
    expect(isGoetheExamBookable({})).toBe(true);
  });

  it("parses DD.MM.YYYY wrapped in markup", () => {
    const d = goetheExamStartInstant({ eventTimeSpan: "<strong>23.06.2026</strong>" });
    expect(d?.getFullYear()).toBe(2026);
    expect(d?.getMonth()).toBe(5);
    expect(d?.getDate()).toBe(23);
  });

  it("parses German date span and ranges", () => {
    const one = goetheExamStartInstant({ eventTimeSpan: "10. Mai 2026" });
    expect(one?.getFullYear()).toBe(2026);
    expect(one?.getMonth()).toBe(4);
    expect(one?.getDate()).toBe(10);

    const range = goetheExamStartInstant({ eventTimeSpan: "23. Juni 2026 – 24. Juni 2026" });
    expect(range?.getMonth()).toBe(5);
    expect(range?.getDate()).toBe(23);
  });

  it("prefers ISO startDate when present", () => {
    const d = goetheExamStartInstant({ startDate: "2026-06-23T10:00:00.000Z", eventTimeSpan: "ignored" });
    expect(d?.toISOString()).toBe("2026-06-23T10:00:00.000Z");
  });

  it("extracts embedded examfinder config", () => {
    const html = `
      <script>
      var examfinderDataCF_1 = {"sortField":"startDate","langIsoCodes":"de","dataMode":0,"langId":2,"countryIsoCode":"de","locationName":"","countPerPage":"5","uid":1,"timezone":"27","pageId":"660688","requestPath":"/ins/de/de/prf/ort/ber/gzb1.cfm","activeLevel":"5","isMobile":false,"apiPath":"/rest/examfinder/exams/institute/O%2010000026","isODP":0,"limitedAccess":0,"courseLevelData":{"5":{"CATEGORY_ID":"E006","TEXT":"Erwachsene","TYPE":"ER","SHORTCUT":"B1"}}};
      var courselevels_1 = examfinderDataCF_1.courseLevelData;
      </script>
    `;
    const cfg = extractExamfinderConfig(html);
    expect(cfg?.apiPath).toBe("/rest/examfinder/exams/institute/O%2010000026");
    expect(cfg?.courseLevelData["5"]?.CATEGORY_ID).toBe("E006");
  });
});
