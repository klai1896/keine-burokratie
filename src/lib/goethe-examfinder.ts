/**
 * Parse Goethe institute exam pages + call the same JSON API their jQuery code uses
 * (see inline `getData_*` in Prüfungsfinder HTML).
 */

export type CourseLevelMeta = {
  CATEGORY_ID: string;
  TYPE: string;
  TEXT?: string;
  SHORTCUT?: string;
};

export type ExamfinderPageConfig = {
  apiPath: string;
  langId: number;
  countryIsoCode: string;
  locationName: string;
  countPerPage: string;
  langIsoCodes: string;
  timezone: string | number;
  isODP: number;
  sortField: string;
  dataMode: number;
  courseLevelData: Record<string, CourseLevelMeta>;
};

export type GoetheApiExam = Record<string, unknown>;

export type GoetheApiResponse = {
  SUCCESS?: boolean;
  DATA?: GoetheApiExam[];
  PAGINATION?: {
    COUNT: number;
    PAGELIST?: Array<{ START: number; PAGENUM?: number }>;
    FIRST?: { START: number };
    LAST?: { START: number };
  };
};

const DE_MONTHS: Record<string, number> = {
  januar: 0,
  februar: 1,
  märz: 2,
  marz: 2,
  april: 3,
  mai: 4,
  juni: 5,
  juli: 6,
  august: 7,
  september: 8,
  oktober: 9,
  november: 10,
  dezember: 11,
};

function trimStr(v: unknown): string {
  return typeof v === "string" ? v.trim() : "";
}

/** API often sends HTML snippets in `availabilityText` (e.g. `>> BUCHEN`, `AUSGEBUCHT`). */
export function stripGoetheHtml(s: string): string {
  return s.replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim();
}

const NOT_BOOKABLE_TEXT =
  /\b(ausgebucht|nicht[\s\-]*buchbar|buchungsfrist\s+abgelaufen|buchunsgfrist\s+abgelaufen|anmeldefrist\s+abgelaufen)\b/i;

const BOOKABLE_TEXT = /\b(buchen|termin\s*wählen|anmelden)\b|\bbuchungsstart\b/i;

/**
 * Mirrors the German UI: grey “AUSGEBUCHT” / deadline expired rows are skipped; green “>> BUCHEN” counts.
 * `buttonDisabled` is still the authoritative latch when Goethe sends it.
 */
export function isGoetheExamBookable(exam: GoetheApiExam): boolean {
  const raw = exam.buttonDisabled;
  if (raw === true) return false;
  const bd = trimStr(raw).toLowerCase();
  if (bd.includes("disabled")) return false;

  const plain = stripGoetheHtml(trimStr(exam.availabilityText)).toLowerCase();

  // Strong negatives from screenshot / common Goethe strings
  if (NOT_BOOKABLE_TEXT.test(plain)) return false;

  // Explicit positives (shown on green booking button)
  if (BOOKABLE_TEXT.test(plain)) return true;

  // Some flows use only “Weiter”; keep only if nothing suggests sold out and button stays enabled
  if (plain.includes("weiter")) {
    return !NOT_BOOKABLE_TEXT.test(plain);
  }

  // No label but still interactive — safer to treat non-disabled as bookable (older API payloads)
  if (!plain && !bd) return true;

  return false;
}

/** Parse ISO / numeric timestamps or German `eventTimeSpan` (DD.MM.YYYY or “9. Juni 2026”, possibly wrapped in HTML). */
export function goetheExamStartInstant(exam: GoetheApiExam): Date | null {
  const sd = exam.startDate;
  if (typeof sd === "number" && Number.isFinite(sd)) return new Date(sd);
  if (typeof sd === "string" && sd.length > 4) {
    const d = new Date(sd);
    if (!Number.isNaN(d.getTime())) return d;
  }
  const spanRaw = trimStr(exam.eventTimeSpan);
  if (!spanRaw) return null;
  const span = stripGoetheHtml(spanRaw);
  const head = span.split(/\s*[–-]\s*/)[0]?.trim() ?? span;
  // Prefer numeric German dates as shown on site: 09.06.2026
  const numeric = head.match(/^(\d{1,2})\.(\d{1,2})\.(\d{4})/);
  if (numeric) {
    const d = new Date(Number(numeric[3]), Number(numeric[2]) - 1, Number(numeric[1]));
    return Number.isNaN(d.getTime()) ? null : d;
  }
  const m = head.match(/^(\d{1,2})\.\s*([^.]+?)\s*(\d{4})/i);
  if (!m) return null;
  const day = Number(m[1]);
  const year = Number(m[3]);
  const monthName = m[2].toLowerCase().replace(/\./g, "");
  const month = DE_MONTHS[monthName];
  if (month == null || Number.isNaN(day) || Number.isNaN(year)) return null;
  return new Date(year, month, day);
}

export function extractExamfinderConfig(html: string): ExamfinderPageConfig | null {
  const idx = html.indexOf("var examfinderDataCF_");
  if (idx === -1) return null;
  const start = html.indexOf("{", idx);
  if (start === -1) return null;
  let depth = 0;
  for (let i = start; i < html.length; i++) {
    const c = html[i];
    if (c === "{") depth++;
    else if (c === "}") {
      depth--;
      if (depth === 0) {
        try {
          const raw = JSON.parse(html.slice(start, i + 1)) as Record<string, unknown>;
          const apiPath = trimStr(raw.apiPath);
          if (!apiPath.startsWith("/")) return null;
          const courseLevelData = raw.courseLevelData;
          if (!courseLevelData || typeof courseLevelData !== "object") return null;
          const levels: Record<string, CourseLevelMeta> = {};
          for (const [k, v] of Object.entries(courseLevelData as Record<string, unknown>)) {
            if (!v || typeof v !== "object") continue;
            const o = v as Record<string, unknown>;
            const CATEGORY_ID = trimStr(o.CATEGORY_ID);
            const TYPE = trimStr(o.TYPE);
            if (!CATEGORY_ID || !TYPE) continue;
            levels[k] = {
              CATEGORY_ID,
              TYPE,
              TEXT: trimStr(o.TEXT) || undefined,
              SHORTCUT: trimStr(o.SHORTCUT) || undefined,
            };
          }
          if (Object.keys(levels).length === 0) return null;
          return {
            apiPath,
            langId: Number(raw.langId ?? 2),
            countryIsoCode: trimStr(raw.countryIsoCode) || "de",
            locationName: trimStr(raw.locationName),
            countPerPage: trimStr(raw.countPerPage) || "50",
            langIsoCodes: trimStr(raw.langIsoCodes) || "de",
            timezone: typeof raw.timezone === "number" ? raw.timezone : trimStr(raw.timezone) || "27",
            isODP: Number(raw.isODP ?? 0),
            sortField: trimStr(raw.sortField) || "startDate",
            dataMode: Number(raw.dataMode ?? 0),
            courseLevelData: levels,
          };
        } catch {
          return null;
        }
      }
    }
  }
  return null;
}

/** Goethe’s JSON endpoint often returns 403 for non-browser user agents. */
export const GOETHE_DEFAULT_USER_AGENT =
  "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36";

function buildQuery(cfg: ExamfinderPageConfig, level: CourseLevelMeta, start: number, pageSize: number) {
  const p = new URLSearchParams();
  p.set("category", level.CATEGORY_ID);
  p.set("type", level.TYPE);
  p.set("countryIsoCode", cfg.countryIsoCode);
  p.set("locationName", cfg.locationName);
  p.set("count", String(pageSize));
  p.set("start", String(start));
  p.set("langId", String(cfg.langId));
  p.set("timezone", String(cfg.timezone));
  p.set("isODP", String(cfg.isODP));
  p.set("sortField", cfg.sortField);
  p.set("sortOrder", "ASC");
  p.set("dataMode", String(cfg.dataMode));
  p.set("langIsoCodes", cfg.langIsoCodes);
  return p;
}

export async function fetchGoetheExamJson(
  cfg: ExamfinderPageConfig,
  level: CourseLevelMeta,
  pageStart: number,
  pageUrl: string,
  options?: { userAgent?: string; pageSize?: number; signal?: AbortSignal },
): Promise<GoetheApiResponse | null> {
  const base = "https://www.goethe.de";
  const url = new URL(cfg.apiPath, base);
  url.search = buildQuery(cfg, level, pageStart, options?.pageSize ?? 100).toString();
  const ua = options?.userAgent ?? process.env.GOETHE_INGEST_USER_AGENT ?? GOETHE_DEFAULT_USER_AGENT;
  const res = await fetch(url, {
    headers: {
      Accept: "application/json, text/javascript, */*;q=0.01",
      "User-Agent": ua,
      Referer: pageUrl,
      Origin: "https://www.goethe.de",
      "X-Requested-With": "XMLHttpRequest",
    },
    signal: options?.signal ?? AbortSignal.timeout(30_000),
  });
  if (!res.ok) return null;
  try {
    return (await res.json()) as GoetheApiResponse;
  } catch {
    return null;
  }
}

export async function collectSoonestBookableDate(
  cfg: ExamfinderPageConfig,
  pageUrl: string,
  options?: { userAgent?: string; maxPagesPerLevel?: number },
): Promise<{ soonest: Date | null; examCount: number; apiUnreachable: boolean }> {
  let soonest: Date | null = null;
  let examCount = 0;
  let apiUnreachable = false;
  const maxPages = options?.maxPagesPerLevel ?? 8;
  const levels = Object.values(cfg.courseLevelData);

  for (const level of levels) {
    let start = 1;
    for (let page = 0; page < maxPages; page++) {
      const json = await fetchGoetheExamJson(cfg, level, start, pageUrl, {
        userAgent: options?.userAgent,
      });
      if (!json) {
        apiUnreachable = true;
        break;
      }
      if (!json.SUCCESS || !Array.isArray(json.DATA)) {
        apiUnreachable = true;
        break;
      }
      if (json.DATA.length === 0) break;
      examCount += json.DATA.length;
      for (const exam of json.DATA) {
        if (!isGoetheExamBookable(exam)) continue;
        const d = goetheExamStartInstant(exam);
        if (!d) continue;
        if (!soonest || d.getTime() < soonest.getTime()) soonest = d;
      }

      const pag = json.PAGINATION;
      if (!pag || pag.COUNT <= 1) break;
      const nextStart = pag.PAGELIST?.find((row) => row.START > start)?.START;
      if (nextStart == null || nextStart === start) break;
      start = nextStart;
    }
  }

  return { soonest, examCount, apiUnreachable };
}
