# RFC: Berlin Relocation & Immigration Companion — Technical Foundation

**Status:** Proposed  
**Author:** Architect  
**PRD basis:** `docs/prd.md` **v0.2**  
**Date:** 2026-05-09  
**Revision:** Aligns with PRD v0.2 (sub-location + preference filters, time-window polling, notification modes, EN-only UI, scraped exam directory).

---

## 1. Summary

Build a **web application** ( **English UI only** for MVP) that delivers three **information journeys** (registration, permanent residence, citizenship) with **checklists** and official links, an **Einbürgerungstest slot watcher** for Service Berlin [351180](https://service.berlin.de/dienstleistung/351180/), and an **A1/B1 Berlin exam directory** sourced primarily from **telc** and **Goethe** public pages via **scrape / structured fetch**.

The **watcher** models **each VHS sub-location** separately. Users set **email**, **weekday** preferences (Monday–Saturday, mirroring *“Wunschtage”*), and **time band** preferences (**07:00–13:00** morning / **13:00–19:00** afternoon, mirroring *“Vor-/Nachmittags”*). The backend evaluates **normalized availability** against those preferences and notifies via **email** and/or **in-browser Web Notifications** (when the user keeps the product tab open and opts in). Polling runs **only on Berlin workdays (Monday–Friday), from 07:00 local time onward, targeting a one-minute cadence**—subject to **deduplication, legal review, and backoff** if the upstream service blocks high-frequency access.

The architecture keeps **user-facing content** (MDX, EN copy) separate from a **thin API** for watches, a **real-time channel** for open sessions, a **background poller**, and **scheduled jobs** for exam-directory ingestion.

---

## 2. Problem & constraints (from PRD v0.2)

- **Trust:** Not an official government site; deep links only; clear disclaimers.
- **Legal / operational:** `service.berlin.de` may block high-frequency or automated access (403/418). **No auto-booking** in MVP.
- **Polling tension:** Product asks for **every minute** on active **Mon–Fri** windows; community tools often use **~3 minutes**. Engineering **must** implement **singleton polling per target**, **shared snapshots**, and **adaptive backoff**; product/legal may adjust effective interval if blocked.
- **Privacy (GDPR):** Minimize PII; explicit consent for **email** and **browser notifications**; retention limits.
- **Fairness:** Avoid duplicated load; cap watches per identity where needed.
- **Exam providers:** Scraping **telc / Goethe** pages requires **ToS review**, tolerant parsers, and **non-stable booking URLs** (session parameters)—prefer stable **landing URLs** and resolve enrollment links at scrape time.
- **Locale:** MVP **English-only** UI; outbound government links may remain German.

---

## 3. Decision: Application shape — **modular monolith (single deployable)**

### Options considered

| Option | Pros | Cons |
|--------|------|------|
| **A. Modular monolith** (web + API routes + worker package) | Simple deploy, shared types, fast MVP | Worker scaling tied to web until split |
| **B. Split frontend + Python worker + separate API** | Worker isolation | More ops, duplicate contracts |
| **C. Serverless-only** (Lambda + cron) | Pay per tick | Cold starts, harder long-poll / WebSocket |

### Decision

**Adopt Option A** for MVP: **TypeScript** (**Next.js** App Router for UI + route handlers, **`worker`** process for polling and scrape jobs). Add a **lightweight real-time layer** in-process or via managed **SSE** (same origin) for “page open” notification mode—or **short polling** from browser to our API as a simpler MVP fallback (see §6).

---

## 4. Decision: Availability detection — **normalized slots + preference filter**

### Normalization

Implement `AppointmentSource` for Einbürgerungstest:

- `fetchRaw(targetRef, context) → RawPayload` — may need to **replay official UI steps** (days + time bands) if the upstream API requires posted form parameters matching user preferences ( **discover in implementation** ).
- `normalize(raw) → AvailabilitySnapshot` — list of **candidate slots**, each with **start** in **Europe/Berlin**, stable **id** if exposed.
- **Stable hash** over sorted slots for **change detection**.

### Preference matching

Each **watch** stores:

- `serviceTargetId` (one **sub-location** / standort per watch)
- `allowedWeekdays`: subset of **Mon–Sat** (bitmask or set), aligned with PRD
- `allowMorning`, `allowAfternoon` (maps to 07:00–13:00 / 13:00–19:00 local)

**Match rule:** a slot **matches** if its local weekday ∈ `allowedWeekdays` and its start time falls in a selected band (**inclusive bounds per product**).

**Saturday nuance:** UI allows **Saturday** as a requested day; poller runs **Mon–Fri only**. Fetches during the week may still return **Saturday** appointment dates—matching should **include** those slots if the user selected Saturday. (See PRD open question if upstream only exposes Saturday after Friday’s run; mitigate by **not** dropping Saturday slots in the normalized model.)

### Sub-locations

**One `service_target` row per VHS standort** under [351180](https://service.berlin.de/dienstleistung/351180/). **One watch = one sub-location.** Multiple concurrent watches per email are **allowed unless product caps** (TBD).

---

## 5. Decision: Polling policy — **active window + target cadence + dedupe**

| Rule | Detail |
|------|--------|
| **Active window** | **Monday–Friday**, **Europe/Berlin**, **from 07:00** to end of day (exact end TBD with product; e.g. 23:59 or 19:00—PRD emphasizes **from 7am onwards**). **No polling** Saturday/Sunday or **before 07:00** local. |
| **Target cadence** | **60 seconds** between poll **attempts per `service_target`** while inside the window—**product intent**; **must** yield to **backoff** on errors or legal guidance. |
| **Singleton fetch** | All watches sharing a `service_target` share **one** scheduled poll and **one** latest `availability_snapshot` (same as v0.1). |
| **Jitter** | Small random delay (e.g. 0–15s) per tick to avoid aligned bursts. |
| **Backoff** | On 429/418/503 or parse failure: exponential backoff; **alert** if degraded beyond SLA. |
| **Off-window behavior** | Worker sleeps; **no** upstream calls. |

---

## 6. Decision: Notifications — **email + optional in-tab Web Notifications**

PRD requires **email at the start of setup** and a **mode**:

1. **Email only** — user can close the tab; server sends **transactional email** on match (after confirmation if we keep double opt-in).
2. **Keep page open** — **Web Notifications API** (with permission) on the **laptop/desktop** while the session is active; optionally **also email**.

### Architecture options for (2)

| Option | Mechanism | Tradeoff |
|--------|-----------|----------|
| **A. SSE / WebSocket** | Server pushes to open clients when watch fires | Best UX; need connection map |
| **B. Short polling** | Browser calls `GET /api/watches/:id/events` every 10–20s | Simpler MVP; slightly delayed |
| **C. Supabase / Pusher** | Managed pub/sub | Extra vendor |

**Default recommendation for MVP:** **SSE** or **WebSocket** from the Next.js process (or **B** if ops want zero persistent connections). Email path **always** uses the same match event.

**Double opt-in** for email remains **recommended** for spam/GDPR; browser notification permission is **separate** and **only** when user selects “page open” mode.

---

## 7. Decision: Content & exam directory — **EN MDX + scraped artifacts**

- **Journeys / checklists:** **MDX** or Markdown, **English** only for MVP.
- **Exam directory (telc + Goethe):** **Not** hand-maintained JSON alone—run a **scheduled ingest** (worker or cron) that:
  - Visits **verified** provider and **institution** pages (e.g. [Goethe A1 Berlin](https://www.goethe.de/ins/de/en/prf/ort/ber/gza1.cfm)),
  - Extracts **price**, **listed dates** where present, and **best-effort booking / enrollment URL** (session links stored with **`capturedAt`**; UI offers “Book” to **current** resolved URL),
  - Persists rows with **`lastVerified`** for stale UX.
- **telc** flows through its centre finder and partner sites as needed; same pipeline pattern.

---

## 8. Data stores

| Store | Role |
|-------|------|
| **PostgreSQL** | Watches (inc. preferences + **notification mode**), confirmation state, snapshots, notification log, **exam directory rows** (scraped) |
| **Redis** (optional) | Pub/sub for real-time fan-out if not using in-memory map |

**MVP simplification:** Single worker + Postgres; optional in-memory SSE fan-out for one instance.

---

## 9. Security & compliance (headlines)

- **Secrets:** env-only; rotate mail and scrape credentials if any.
- **Rate limiting** on `POST /api/watches` per IP + per email hash.
- **PII:** email hashing for lookup where practical; plaintext mail sending as required by provider.
- **Browser notifications:** document in privacy policy; no sensitive permit data in notification body—**generic “slot available—open app”** + link.
- **User-Agent** for Berlin and provider fetches: identifiable bot string + **contact URL**; **robots.txt** compliance after legal review.

---

## 10. Out of scope for this RFC

- Auto-booking, CAPTCHA solving, headless browsers as **default**.
- Mobile native apps.
- **German UI** (post-MVP).
- Official Berlin API partnership (follow-up with IKT).

---

## 11. Resolution of PRD questions (defaults for MVP build, v0.2)

| # | Topic | Proposed default |
|---|--------|------------------|
| 1 | Official API vs poll | **Poll** until partnership exists; abstract `AppointmentSource` |
| 2 | Auto-book | **No** |
| 3 | Sub-locations | **One `service_target` per standort**; **one per watch** |
| 3b | Wunschtage / time bands | **Store and match** weekdays + morning/afternoon per §4 |
| 4 | Identity | **Email-first + manage/cancel tokens**; no full account |
| 5 | Languages | **English-only** UI for MVP |
| 6 | Exam directory | **Scrape + scheduled ingest** for telc/Goethe-backed rows; verify each institution/level |
| 7 | LEA citizenship | **Deep links + short summary** |
| 8 | Mon–Fri poller vs Saturday preference | **Normalize slots** with full calendar; **match** Saturday slots when user selected Saturday even though **fetch** runs Mon–Fri |

---

## 12. References

- PRD: `docs/prd.md` (v0.2)
- Service Berlin Einbürgerungstest: https://service.berlin.de/dienstleistung/351180/
- Example Goethe Berlin A1 page: https://www.goethe.de/ins/de/en/prf/ort/ber/gza1.cfm
