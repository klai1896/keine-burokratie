# UI & experience implementation summary — Keine Bürokratie

**Purpose:** Hand this document to a designer or another AI to describe **how the product is built today** (layout, colours, typography patterns, key flows). It is **not** a spec for how the UI *should* look—only a factual snapshot of the current implementation.

**Codebase:** Next.js 16 (App Router), React 19, **Tailwind CSS v4** (`@import "tailwindcss"` in `src/app/globals.css`). No separate component library (no shadcn/Chakra). **English-only** UI copy.

---

## 1. Overall page shell

| Element | Implementation |
|--------|----------------|
| Document language | `lang="en"` on `<html>` (`src/app/layout.tsx`). |
| Root layout | Vertical flex column: header → **main** (grows) → footer. `<html>` has `h-full`; `<body>` has `min-h-full flex flex-col`. |
| `<body>` surfaces | Light: `bg-zinc-50 text-zinc-950`. Dark: `dark:bg-zinc-950 dark:text-zinc-50`. Uses **Tailwind `dark:` variants** tied to **prefers-color-scheme** (no manual theme toggle). |
| Main column | `mx-auto max-w-3xl w-full px-4 py-10 flex flex-col flex-1` — content is **narrow** (~768px max), centred, vertical rhythm only via component spacing. |
| Antialiasing | `antialiased` on `<html>`. |

**Implication:** The experience is a **single-column reading layout** with no sidebar, no app chrome beyond the top nav, and no max-width variants per route.

---

## 2. Typography & fonts

| Piece | Details |
|-------|---------|
| Loaded fonts (Next.js) | **Geist Sans** and **Geist Mono** from `next/font/google`, applied as CSS variables on `<html>`: `--font-geist-sans`, `--font-geist-mono` (`src/app/layout.tsx`). |
| Tailwind theme hook | `globals.css` defines `@theme inline` with `--font-sans: var(--font-geist-sans)` and `--font-mono: var(--font-geist-mono)`. |
| `globals.css` body rule | `body { font-family: Arial, Helvetica, sans-serif; }` is still present **alongside** Geist variables — depending on cascade and Tailwind preflight, **actual rendered body font may be Arial or Geist**; worth verifying in browser. |

**Hierarchy (typical page patterns)**

- **Eyebrow / label:** `text-sm font-semibold uppercase tracking-wide text-zinc-600 dark:text-zinc-400` (home hero only).
- **Page H1:** `text-3xl font-semibold` (most articles) or `text-4xl font-semibold tracking-tight` (home).
- **Lead paragraph:** `text-lg text-zinc-700 dark:text-zinc-300` (home).
- **Section H2:** `text-xl font-semibold` (some pages) or `text-lg font-semibold` (cards, panels).
- **Body:** `text-sm` or default with `text-zinc-700 dark:text-zinc-300` for secondary paragraphs.
- **Muted / legal:** `text-sm text-zinc-600 dark:text-zinc-400` or `text-xs text-zinc-500`.
- **Strong emphasis:** `<strong>` in copy; occasional `font-medium` on labels.

No custom type scale file—everything is **inline Tailwind classes**.

---

## 3. Colour system (as implemented)

The UI is almost entirely **neutral “zinc”** with **emerald** for “go to official / primary outbound” affordances and **red / emerald** for feedback.

### 3.1 Neutrals (Tailwind `zinc`)

- **Page background:** `zinc-50` (light) / `zinc-950` (dark body).
- **Surfaces / cards:** `bg-white` with `border-zinc-200` (light); `dark:bg-zinc-900` or `dark:bg-zinc-950` with `dark:border-zinc-800`.
- **Text:** Primary `zinc-950` / `zinc-50`; secondary `zinc-700` / `zinc-300`; tertiary `zinc-600` / `zinc-400`.
- **Borders / dividers:** `border-zinc-200`, `border-zinc-100`, `dark:border-zinc-800`, `dark:border-zinc-900`.
- **Subtle panels:** `bg-zinc-50/70`, `dark:bg-zinc-950/40`.

### 3.2 Accent — emerald

Used for **positive / official-link emphasis** (not a full brand system):

- Home “MVP tools” callout: `border-emerald-200 bg-emerald-50 text-emerald-950` + `dark:border-emerald-900 dark:bg-emerald-950/40 dark:text-emerald-50`.
- Outbound links in pathway lists and campus cards: `text-emerald-800 underline` + `dark:text-emerald-300` (sometimes with `decoration-*` opacity).

### 3.3 Semantic feedback

- **Errors:** `text-red-700 dark:text-red-300`.
- **Success:** `text-emerald-800 dark:text-emerald-300` (e.g. watch confirmation message in `WatchWizard`).

### 3.4 CSS variables in `:root`

`globals.css` defines `--background` / `--foreground` (`#ffffff` / `#171717` light; dark mode media query flips to near-black / light gray). **These are wired into Tailwind `@theme`** as `--color-background` / `--color-foreground`, but **`layout.tsx` does not rely on them for the main shell** — the shell uses explicit `bg-zinc-*` classes. Potential **duplication or drift** between variables and Tailwind neutrals.

---

## 4. Header & footer

### Header (`SiteHeader.tsx`)

- Sticky-ish bar aesthetic: `border-b border-zinc-200 bg-white/80 backdrop-blur` (`dark:border-zinc-800 dark:bg-zinc-950/80`).
- Inner: `max-w-3xl mx-auto px-4 py-4`, flex row, space-between.
- Logo/title: `text-lg font-semibold tracking-tight` → `/`.
- Nav: `flex flex-wrap gap-3 text-sm text-zinc-700 dark:text-zinc-200`, links **`hover:underline` only** (no active route styling).

Links: Registration, Permanent residence, Citizenship, **Test slots** (`/einbuergerungstest`), **A1 / B1** (`/exams`).

### Footer (`SiteFooter.tsx`)

- `mt-auto border-t border-zinc-200 bg-zinc-50 py-10 text-sm text-zinc-700` (+ dark equivalents).
- Disclaimers (non-government, verify on Berlin.de / Service Berlin); links to `/privacy`, `/imprint`.
- Links: default `underline`.

---

## 5. Navigation & information architecture (routes)

| Route | Role |
|-------|------|
| `/` | Journey hub: three **equal cards** to Registration, Permanent residence, Citizenship; green “MVP tools” list. |
| `/registration` | Long-form article + bullet official links + `Checklist`. |
| `/permanent-residence` | **Client journey:** pathway `<select>` → conditional official links + `Checklist` → horizontal rule → embedded `EinbuergerungstestPanel` (test booking + watch). |
| `/citizenship` | Article + checklist + embedded `EinbuergerungstestPanel`. |
| `/einbuergerungstest` | Standalone intro + full `EinbuergerungstestPanel`. |
| `/exams` | Intro + `ExamDirectoryClient` (filters + table). |
| `/privacy`, `/imprint` | Legal/static (not detailed here). |
| `/watches/confirmed` | Post-email-confirm page (minimal). |

**UX pattern:** Mostly **article + sections**; **no stepper/progress UI**, no breadcrumbs except text links “← Journey hub” at bottom of many pages.

---

## 6. Recurring layout & component patterns

### 6.1 “Card grid” (home journey cards)

- `grid gap-4 sm:grid-cols-3`
- Card: entire `<Link>` is the hit target — `rounded-lg border border-zinc-200 bg-white p-5 shadow-sm` + hover `hover:border-zinc-400` (dark: `dark:border-zinc-800 dark:bg-zinc-900 dark:hover:border-zinc-600`).

### 6.2 Article pages (registration, etc.)

- Outer `article className="space-y-6"` or `space-y-8`.
- Lists: `list-disc … pl-5 text-zinc-700 dark:text-zinc-300`.
- Inline links: `underline` on `<a>` (often no distinct colour vs body—emerald reserved for some panels).

### 6.3 Bordered panels / forms

Common recipe:

- Container: `rounded-lg border border-zinc-200 … p-4` + `dark:border-zinc-800 dark:bg-zinc-900` (sometimes `bg-white`).
- Inputs: `w-full rounded border border-zinc-300 px-3 py-2 text-sm` + dark border/background variants.
- Primary button (watch form): `rounded bg-zinc-900 px-4 py-2 text-sm font-medium text-white` + `dark:bg-zinc-100 dark:text-zinc-950`, `disabled:opacity-60`.

### 6.4 `Checklist` component

- Section: `mt-8 rounded-lg border … bg-white p-4` (dark variants).
- Title: `text-base font-semibold`.
- Rows: checkbox (unstyled sizing `mt-1`) + `text-sm leading-relaxed`.
- Footer note: `text-xs text-zinc-500`.
- State: **`localStorage` per `storageKey`**, restored on mount.

### 6.5 `EinbuergerungstestPanel`

- Vertical `space-y-8` stacking: optional intro blocks → **campus section** → **watch section**.
- Campus section: `rounded-lg border … bg-zinc-50/70 p-4` (dark tinted).
- **Campus picker:** responsive `grid gap-3 sm:grid-cols-2`; each cell is a **full-width `<button>`** (card) with nested `<a>` for “Open booking on Service Berlin →” (`stopPropagation` on link click).
- **Selected card:** thick ring: `border-zinc-900 ring-2 ring-zinc-900` (dark: light border/ring).
- **Unselected:** `border-zinc-200 bg-white hover:border-zinc-400` (dark variants).
- **Outbound link styling on cards:** emerald + underline (`text-emerald-800` / `dark:text-emerald-300`).

### 6.6 `WatchWizard` (slot notifier form)

- Form panel: bordered white/zinc card, dense vertical `space-y-6`.
- Fields: labelled blocks (`block text-sm` + `font-medium` label).
- Checkbox/radio grids for weekdays, time bands, notification mode.
- Legal consent checkboxes full-width.

### 6.7 `ExamDirectoryClient`

- Filter chips: row of `<button>`s — inactive = bordered; active = inverted **zinc fill** (`bg-zinc-900 text-white` / dark inverse).
- Table: `overflow-x-auto rounded-lg border`, header `bg-zinc-50 text-xs uppercase text-zinc-600` (dark: `dark:bg-zinc-900`).
- Rows: zebra `odd:bg-white even:bg-zinc-50` (+ dark zebra).

---

## 7. Interaction & accessibility (current state)

- **Focus:** Campus cards use `focus-visible:ring-2 focus-visible:ring-zinc-400`; other controls mostly browser default.
- **No:** skip link, landmarks beyond implicit `<main>`, route-announcing changes for SPA sections, toast system, modal drawer, skeleton loaders (mostly text “Loading…”).
- **Dark mode:** System only; footer background in dark is `dark:bg-zinc-950` while body is also `zinc-950` — subtle contrast distinctions rely on borders.

---

## 8. Content & tone

- Plain **English**; frequent **disclaimers** (non-official, verify on government sites).
- **No illustrations**, **no icon set** (except default Next/favicon in app); **no photography**.
- Long **external links** inline in prose and lists.

---

## 9. What is *not* defined (design gaps)

- No **design tokens file** or Figma alignment documented in repo.
- No **consistent button variants** beyond ad-hoc classes (primary = zinc inversion; chips = bordered vs filled).
- No **spacing scale abstraction** — arbitrary `space-y-*`, `p-*`, `gap-*`.
- **Possible font stack conflict** (`Arial` vs Geist)—needs resolution if visual consistency matters.
- **CSS variables for background** on `:root` vs Tailwind zinc on body—two parallel “sources of truth”.
- No responsive typography scale (clamp / fluid type).
- Header nav has **no mobile menu** — links wrap (`flex-wrap`) on small screens.

---

## 10. File map (for implementers cross-referencing code)

| Area | Primary files |
|------|----------------|
| Shell, fonts | `src/app/layout.tsx`, `src/app/globals.css` |
| Home | `src/app/page.tsx` |
| Journey pages | `src/app/registration/page.tsx`, `src/app/citizenship/page.tsx`, `src/app/permanent-residence/page.tsx`, `src/components/PermanentResidenceJourney.tsx` |
| Einbürgerungstest | `src/app/einbuergerungstest/page.tsx`, `src/components/EinbuergerungstestPanel.tsx`, `src/components/WatchWizard.tsx` |
| Exams | `src/app/exams/page.tsx`, `src/components/ExamDirectoryClient.tsx` |
| Shared UI | `src/components/SiteHeader.tsx`, `src/components/SiteFooter.tsx`, `src/components/Checklist.tsx` |
| Pathway copy (PR page) | `src/lib/permanent-residence-pathways.ts` |

---

*Generated as a factual inventory of the implementation as of the date this file was added; update it when UI architecture changes materially.*
