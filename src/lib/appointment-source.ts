import type { NormalizedSlot, AvailabilityPayload } from "./slots";
import { contentHashFromSlots } from "./slots";

export type FetchContext = Record<string, unknown>;

/**
 * AppointmentSource abstraction (RFC §4). MVP uses permissive fetch: one snapshot per target,
 * filter per watch via `slotMatchesWatch`. Upstream Berlin HTML/POST wiring is stubbed —
 * integrate Service Berlin booking flow parameters here when legal/technical review clears.
 */
export async function fetchRawForTarget(targetUrl: string): Promise<{
  status: number;
  body?: string;
  error?: string;
}> {
  if (process.env.BERLIN_FETCH_MOCK === "1") {
    return {
      status: 200,
      body: JSON.stringify({
        slots: [] as NormalizedSlot[],
      }),
    };
  }
  try {
    const ua =
      process.env.BERLIN_USER_AGENT ??
      "KeineBurokratie/1.0 (+https://github.com/keine-burokratie/about-bot)";
    const res = await fetch(targetUrl, {
      method: "GET",
      headers: { "User-Agent": ua, Accept: "text/html,application/json" },
      signal: AbortSignal.timeout(30_000),
    });
    const text = await res.text();
    return { status: res.status, body: text.slice(0, 500_000) };
  } catch (e) {
    return {
      status: 0,
      error: e instanceof Error ? e.message : String(e),
    };
  }
}

/** Parses Berlin response — MVP placeholder returns empty slots; tests use injected payloads. */
export function normalizeBerlinPayload(
  raw: { status: number; body?: string; error?: string },
): AvailabilityPayload {
  if (raw.error || raw.status >= 400) {
    return { version: 1, slots: [], sourceFingerprint: `err:${raw.status}:${raw.error ?? ""}` };
  }
  if (!raw.body) return { version: 1, slots: [] };

  try {
    const j = JSON.parse(raw.body) as { slots?: NormalizedSlot[] };
    const slots = Array.isArray(j.slots) ? j.slots.filter((s) => s?.id && s?.start) : [];
    return { version: 1, slots };
  } catch {
    return {
      version: 1,
      slots: [],
      sourceFingerprint: "html-or-unknown",
    };
  }
}

export function snapshotFromFetch(raw: {
  status: number;
  body?: string;
  error?: string;
}): { payload: AvailabilityPayload; contentHash: string } {
  const payload = normalizeBerlinPayload(raw);
  const contentHash = contentHashFromSlots(payload.slots);
  return { payload, contentHash };
}
