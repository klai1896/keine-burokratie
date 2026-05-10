# PRD: Berlin Relocation & Immigration Companion

**Version:** 0.2 (draft)  
**Author:** Product (PM agent)  
**Last updated:** 2026-05-09  
**Status:** Discovery → MVP definition

---

## Problem statement

People who move to Berlin—and those pursuing **permanent residence** or **German citizenship**—face fragmented official information, rigid appointment systems, and high cognitive load. Requirements differ by nationality, permit type, and pathway; official sites ([Service Berlin](https://service.berlin.de/), [Berlin immigration](https://www.berlin.de/einwanderung/en/), [Willkommenszentrum](https://willkommenszentrum.berlin.de/en/housing/registration-residence)) are authoritative but hard to navigate in one sitting. **High-demand appointments** (e.g. [Einbürgerungstest registration at Berlin VHS locations](https://service.berlin.de/dienstleistung/351180/)) disappear quickly; users resort to manual refresh or unofficial tools.

**Core pain:** Users cannot easily (1) see **what applies to them**, (2) track **documents and steps** in one place, (3) **jump to the right booking links**, and (4) **get notified** when slots open—without constant monitoring.

---

## Goals and non-goals

### Goals

- **Clarity:** Present requirements for three journeys—**(A) Berlin registration after moving**, **(B) permanent residence (settlement permit)**, **(C) German citizenship**—in plain language with explicit linkage to official sources.
- **Actionability:** Per journey, provide **checklists**, **resource links**, and **appointment / detail links** where the process is appointment-driven.
- **Reduce appointment friction (MVP slice):** Support **watching** official booking flows for **open Einbürgerungstest (VHS) registration appointments** in Berlin and **notify** users when a slot matches their **location + day + time-band** preferences (aligned with the official Service Berlin step *“Wunschtage- und Zeiträume auswählen”*).
- **Language exams (MVP slice 2):** For **telc** and **Goethe** (and only institutions verified to offer the exam in Berlin), **surface price, currently bookable dates, and a link into the provider’s booking flow**—with data **ingested from their public web pages** for MVP (see Scope).
- **English-only UI for MVP:** All product copy, labels, and notifications are **English**; official outbound links may remain German.

### Non-goals (initial)

- **Not** a law firm or migration advisory service; **no guaranteed outcomes** or individualized legal advice.
- **Not** guaranteed **auto-booking** of government slots in MVP (legal, ToS, and abuse-risk); default is **notify + deep-link** unless legal/product explicitly approves automation.
- **Not** full coverage of every Berlin authority appointment type on day one beyond the defined MVP use cases.
- **Not** storing highly sensitive documents in MVP unless security review approves (prefer links + local checklist).
- **Not** German (or other) **locales** in MVP—**defer localized UI** to post-MVP.

---

## Scope

### In scope (MVP)

1. **Content modules** (static + lightly structured UI, **EN only**):
   - **Registration (Anmeldung):** e.g. 14-day rule, Bürgeramt vs online paths where eligible, typical documents (ID, [Wohnungsgeberbestätigung](https://willkommenszentrum.berlin.de/en/housing/registration-residence), rental contract), link to booking / [115](https://www.berlin.de/life/telephone-services-and-emergency-services/115/) / official Berlin pages ([Moving to Berlin – registration](https://www.berlin.de/en/life/new-in-berlin/744279-8206946-moving-to-berlin-registration-offices.en.html)).
   - **Permanent residence:** High-level criteria families (e.g. general vs EU Blue Card pathways), link to LEA / Service Berlin services such as [permanent settlement permit (general)](https://service.berlin.de/dienstleistung/121864/en/) and [EU Blue Card settlement](https://service.berlin.de/dienstleistung/326556/standort/121885/en/), note that **process details change** and must stay synced with official Quick-Check / online submission flows ([permanent residence overview](https://www.berlin.de/einwanderung/en/residence/permanent/)).
   - **Citizenship (Einbürgerung):** Residency, language (e.g. B1), livelihood, commitment, criminal record, etc.; central Berlin process via LEA and online application entry points ([Service Berlin citizenship application](https://service.berlin.de/dienstleistung/318998)), cross-link to federal information where useful ([einbuergerung.de questionnaire](https://www.einbuergerung.de/fragebogen.php)).

2. **Checklists:** User can tick items; optional persistence (local storage for MVP; accounts later—see open questions).

3. **Einbürgerungstest appointment assistant (first booking use case):**
   - Deep link to official service: [Einbürgerung – Zum Einbürgerungstest anmelden](https://service.berlin.de/dienstleistung/351180/).
   - Summarize official **fees** (e.g. **€25** per [Service Berlin](https://service.berlin.de/dienstleistung/351180/)), **documents** (valid ID; participant form at VHS), and **flow** (appointment for registration → fee → confirmation; test on a separate day).
   - **Sub-locations:** Model **each VHS / standort** separately (as listed under Service Berlin for [351180](https://service.berlin.de/dienstleistung/351180/)); user **chooses exactly one** (or multiple watches if we allow several active subscriptions—product cap TBD).
   - **Day & time preferences** (mirror official booking UI): user selects which **weekdays** they want (Monday–Saturday, per official options) and whether they need **morning (07:00–13:00)** and/or **afternoon (13:00–19:00)**—same dimensions as the official “Wunschtage” and “Vor-/Nachmittags” step before *“Buchbare Tage anzeigen”*.
   - **Email first:** User enters **email at the start** of the watch setup (before or as first step alongside preferences).
   - **Notification mode (user choice):**
     - **Email:** user receives an email when a matching appointment appears (no need to keep a tab open).
     - **“Keep page open” (active session):** while the product page is open in the browser, also fire **browser notifications** to the **device** (laptop/desktop via Web Notifications API, with permission prompt). Combine with email as **optional** (e.g. user can tick “also email me”).
     - Copy should explain: **email-off-only** works in background; **browser notify** requires the tab open (and system notification permission).
   - **Polling window & frequency:** The system **only checks during Berlin local workdays** (**Monday–Friday**) **from 07:00 onwards**, **every one minute**, until the user stops the watch or a match is found. **No polling outside that window** (weekends and before 07:00 are quiet). *Note: this product target may need reconciliation with Service Berlin rate limits and engineering backoff—see Risks.*

4. **A1 / B1 in Berlin (second use case):**
   - **Source of truth:** Confirm on **telc** and **Goethe** (and each institution’s site) **which Berlin venues** offer **A1** and **B1**; do not list an institution for an exam level unless verified.
   - **MVP data pipeline:** **Ingest from public websites** (scrape or structured fetch): for each row, collect **exam system** (e.g. telc / Goethe), **level(s)**, **price** (as shown), **available / listed exam dates** where exposed, and **URL to start booking**. Example pattern for Goethe A1 in Berlin: land on the official exam page (e.g. [Goethe-Zertifikat A1: Start Deutsch 1 in Berlin](https://www.goethe.de/ins/de/en/prf/ort/ber/gza1.cfm)), then derive the **enrollment / booking entry** users click to pick dates (booking links may include session parameters and **change over time**—show “Book (Goethe)” linking to **resolve** the current enrollment path, not a hard-coded session ID).
   - **Presentation:** Show **price**, **available dates** (as last scraped + **last verified** timestamp), and **link to book** on the provider site.
   - Clear disclaimer: prices and dates **vary**; booking URLs **may expire**; user must confirm on provider site.

### Later (post-MVP)

- Additional appointment types (Bürgeramt, LEA queues, etc.) with **priority by demand and legal risk**.
- Deeper personalization (permit type wizard → tailored checklist).
- Optional document vault (encrypted) with strong security review.
- **German (and other) UI** localization.

---

## Feature requirements

### P0 (MVP)

| ID | Feature | Acceptance criteria |
|----|---------|---------------------|
| P0-1 | **Journey hub** | Three entry points: Registration, Permanent residence, Citizenship; each links to official primary sources. **EN-only** UI. |
| P0-2 | **Requirement pages** | Each journey has problem/context, who it applies to (high level), requirements list, and **“official links”** section. |
| P0-3 | **Checklists** | Each journey has a default checklist; user can check/uncheck; state survives session (minimum: local storage). |
| P0-4 | **Einbürgerungstest explainer** | Content matches official summary: purpose of test, exemptions, fee, documents, sub-locations, link to [351180](https://service.berlin.de/dienstleistung/351180/). |
| P0-5 | **Einbürgerungstest slot watcher** | **(a)** User selects **one sub-location** (per watch) from the modeled VHS list. **(b)** User sets **weekday** and **morning/afternoon** preferences matching the official flow. **(c)** User enters **email** at the beginning of setup. **(d)** User chooses **notification mode**: **email only**, or **keep page open** with **browser (device) notifications** (and optionally email in addition). **(e)** Backend checks **Mon–Fri, from 07:00 Berlin time, every 1 minute** for slots that satisfy the saved preferences; on match, **email** and/or **in-browser path** per selection. **(f)** User can start/stop the watch. |
| P0-6 | **A1/B1 Berlin directory (telc + Goethe)** | ≥8 verified rows where applicable; only include institutions **verified** to offer A1/B1 in Berlin; mix of sources; each row: name, area, levels, exam system, **price** (as scraped), **dates available** (as scraped), **booking link**, **last verified**; ingestion via **website scrape** for MVP with documented refresh job. |
| P0-7 | **Legal / safety chrome** | Footer: not official government site; “verify on Berlin.de”; privacy policy; contact; scraping only where permitted by policy/legal review. |

### P1

| ID | Feature | Acceptance criteria |
|----|---------|---------------------|
| P1-1 | **User accounts** | Save watches and checklists cross-device. |
| P1-2 | **Notification channels** | Extend beyond MVP: optional SMS; refine web push if not fully covered by P0 browser notifications. |
| P1-3 | **Bürgeramt “Anmeldung” appointment** watcher | Same pattern as P0-5; respect rate limits; clear UX if blocked. |
| P1-4 | **Admin / CMS** | Non-engineers can update copy and directory rows with audit log. |

### P2

| ID | Feature | Acceptance criteria |
|----|---------|---------------------|
| P2-1 | **Wizard** | Q&A narrows checklist (nationality, permit family, family size). |
| P2-2 | **Calendar export** | Add booked appointments to `.ics`. |
| P2-3 | **Community / tips** | Moderated notes (spam/legal risk controls). |

---

## Risks

| Risk | Impact | Mitigation |
|------|--------|------------|
| **Terms of use / scraping** on `service.berlin.de` | Service blocked (HTTP 403/418), legal exposure | Prefer official APIs/partnerships if any; legal review; transparent user-agent; fallback UX; **reconcile 1-minute polling** with documented limits—engineering may implement **respectful backoff**, **shared polling across users**, or **slightly longer interval if blocked**. |
| **1-minute polling cadence** | Blocks, IP ban, unfair load vs other tools’ ~3 min guidance | Dedupe requests per **target** server-side; single poller per sub-location; **pause and alert** if HTTP 429/418 |
| **Scraping telc/Goethe** | ToS violation or markup drift | Legal review; cache + stale indicators; tests on fixture HTML |
| **Incorrect or outdated requirements** | User harm (missed deadline, wrong docs) | Timestamp content; link-first; periodic review cadence; prominent disclaimers. |
| **GDPR / notifications** | Compliance failure | Minimize PII; clear consent for emails and browser notifications; data retention limits. |
| **Abuse / fairness** | Watcher concentration worsens slot scarcity | Fair-use per user; no bulk scalping; consider queue caps. |
| **LEA / Berlin process changes** | Broken links or wrong flow | Monitoring script for 404s; owner for quarterly content QA. |

---

## Financial impact

**Costs (rough categories)**

- **Engineering:** MVP web app + notifier worker + notification infra + **scrape jobs** for exam directory.
- **Infrastructure:** Hosting, job queue, email provider fees (low at small scale).
- **Legal:** ToS, privacy, scraping/booking policy review (non-trivial + ongoing for scrapers).
- **Content ops:** Verifying links, exam directory refresh, **sub-location URL mapping** for Service Berlin.

**Revenue (optional, not required for v0.1 PRD)**

- Freemium: free checklists + one active watch; paid tier for multiple watches/channels.
- Donations / sponsorship (transparent).
- **No** predatory upsell of regulated advice.

**Baseline assumption:** MVP is **cost-centre** until retention proves value; ROI framed as user time saved and reduced failed appointments.

---

## Success metrics

| Metric | Definition | Target (MVP pilot) |
|--------|------------|---------------------|
| **Time-to-first-checklist** | Median time from landing to first checklist interaction | < 3 min |
| **Watcher usefulness** | % of watches that receive ≥1 notification within 14 days | Benchmark after 4 weeks |
| **Notification → action** | Click-through on “book now” from notification | ≥ 30% (directional) |
| **Trust** | Qualitative: user understands site is **non-official** | 0 confusion incidents in usability tests |
| **Content accuracy** | Link health checks | < 5% broken primary links per monthly audit |

---

## Open questions

1. **Legal:** Does Berlin / IKT-Basisdienst offer a **supported** channel for availability (API, data partnership) vs HTML polling—and is **1-minute** polling acceptable vs required backoff?
2. **Product ethics:** Is **auto-book** ever in scope, or strictly **notify + human books**?
3. **Multi-watch:** Can one email run **multiple concurrent watches** (different sub-locations) for free or capped?
4. **Identity:** Full accounts in P1 only; MVP relies on **email + tokens**—confirm.
5. ~~**Languages:** EN-only MVP or DE+EN?~~ **Resolved:** **EN-only** for MVP.
6. ~~**Exam directory:** Curate manually vs ingest?~~ **Resolved for MVP:** **Scrape telc/Goethe/institution sites** for price, dates, booking links; **verify** each row against provider.
7. **LEA citizenship online-only** flow since 2024 ([Berlin.de news on LEA](https://www.berlin.de/einwanderung/ueber-uns/aktuelles/artikel.1388213.php))—how much wizard logic do we encode vs deep-link only?
8. **Saturday in official UI:** Service Berlin allows Saturday as a **requested day** for search; our poller runs **weekdays only**—confirm whether **Saturday slots** should still be detected **if** they appear in results while user had Saturday selected (likely **yes** if we fetch weekly and filter; clarify implementation vs “poll only Mon–Fri” meaning “we only run checks on weekdays” but still respect Sat checkbox for matching).

---

## Competitive / landscape notes

- **Official:** Service Berlin, Berlin.de Einwanderung, Willkommenszentrum, BAMF materials (e.g. [Einbürgerung in Deutschland](https://www.bamf.de/EN/Themen/Integration/Einbuergerung/einbuergerung-node.html) — verify current URL in implementation).
- **Community / OSS appointment helpers:** e.g. [burgeramt-appointments](https://github.com/All-About-Berlin/burgeramt-appointments), [berlin-buergeramt-bot](https://github.com/similicious/berlin-buergeramt-bot), Telegram bots—validate feature differentiation (integrated guidance + checklists + Einbürgerungstest focus).
- **Commercial blogs / schools:** Often good SEO for exam dates; our directory should still **prefer scraped primaries** and **last verified** timestamps.

---

## References (non-exhaustive)

- [Einbürgerungstest anmelden – Service Berlin 351180](https://service.berlin.de/dienstleistung/351180/)
- [Einbürgerung beantragen – Service Berlin](https://service.berlin.de/dienstleistung/318998)
- [Permanent settlement permit (general) – Service Berlin](https://service.berlin.de/dienstleistung/121864/en/)
- [Registration – Willkommenszentrum Berlin](https://willkommenszentrum.berlin.de/en/housing/registration-residence)
- [Permanent residence – Berlin.de overview](https://www.berlin.de/einwanderung/en/residence/permanent/)
- [telc examination centre finder](https://www.telc.net/en/language-examinations/find-a-telc-examination-centre/)
- [Goethe-Institut Berlin – exam overview](https://www.goethe.de/ins/de/en/m/prf/ort/ber.html)
- [Goethe-Zertifikat A1 (Start Deutsch 1) – Berlin page (example)](https://www.goethe.de/ins/de/en/prf/ort/ber/gza1.cfm)
