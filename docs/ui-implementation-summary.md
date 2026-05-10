# UI & experience implementation summary — Keine Bürokratie

**Purpose:** Hand this document to a designer or another AI to describe **how the product is built today** (layout, colours, typography patterns, key flows). It is **not** a spec for how the UI *should* look—only a factual snapshot of the current implementation.

**Codebase:** Next.js 16 (App Router), React 19, **Tailwind CSS v4** (`@import "tailwindcss"` in `src/app/globals.css`). **English-only** UI copy. No Radix/shadcn dependency—layout is custom flex + client drawer.

---

## 1. Overall page shell

| Element | Implementation |
|--------|----------------|
| Document language | `lang="en"` on `<html>` (`src/app/layout.tsx`). |
| App chrome | **`AppShellLayout`** (`src/components/AppShellLayout.tsx`): **desktop sidebar** (`md+`) + **main column** with **`bg-gradient-hero`**, sticky **subheader** (mobile menu trigger, tagline, Service Berlin pill). |
| Mobile nav | **`SidebarNav`** / **`MobileSidebarDrawer`** (`src/components/SidebarNav.tsx`): hamburger opens full-height sheet with the same links as the desktop rail. |
| Main content | Centered **`max-w-3xl`** column with horizontal padding inside the gradient column; **footer** anchored to bottom of that column. |
| Dark mode | **System** via `@media (prefers-color-scheme: dark)` overrides on `:root` in `globals.css` (OKLCH tokens). No manual light/dark toggle. |
| Antialiasing | `antialiased` on `<html>`. |

**Implication:** Two-column “product” feel on desktop (nav + content); single column with overlay nav on small screens.

---

## 2. Typography & fonts

| Piece | Details |
|-------|---------|
| Body / UI | **Plus Jakarta Sans** via `next/font/google`, CSS variable `--font-app-sans`, wired in `@theme` as `--font-sans` with fallback. |
| Display / headings | **Fraunces** via `next/font/google`, variable `--font-app-display`, `@theme` `--font-display`; `globals.css` `@layer base` applies `font-display` to `h1–h3` and `.font-display`. |

**Common text classes**

- **Primary text:** `text-foreground`
- **Secondary / supporting:** `text-muted-foreground`
- **Taglines on journey pages:** `text-lg text-primary` (coral primary)

---

## 3. Colour & token system (`src/app/globals.css`)

Design tokens are **OKLCH CSS variables** on `:root`, remapped into Tailwind via `@theme inline` (`--color-background`, `--color-primary`, `--color-sidebar-*`, `--color-mint`, `--color-lavender`, …).

| Role | Token / notes |
|------|----------------|
| **Background / ink** | `background`, `foreground` — warm off-white + deep violet ink (light); dark theme shifts to deep purple shell. |
| **Primary accent** | **Coral** `primary` / `primary-foreground` — buttons, links, active sidebar pill. |
| **Secondary** | **Mint** tint `secondary` — e.g. Service Berlin chip in header. |
| **Surfaces** | `card`, `muted`, `border`, `input`, `ring`; cards often `bg-card/80` + `border-border` + `shadow-soft`. |
| **Playful accents** | `mint`, `lavender`, `sand`, `sun` — journey cards use **border accents** (`border-primary/35`, `border-mint/40`, `border-lavender/40`) and `bg-gradient-card`. |
| **Sidebar chrome** | `sidebar`, `sidebar-primary`, `sidebar-accent`, etc. |
| **Feedback** | `destructive`; success line in watcher uses **`text-mint-foreground`**. |

**Gradient utilities**

- **`bg-gradient-hero`** — main content column backdrop (multi radial + linear).
- **`bg-gradient-card`** — soft card wash.
- **`shadow-soft`**, **`shadow-pop`** — elevation tokens.

---

## 4. Header, sidebar & footer

### Desktop sidebar

- Width `w-64`, `bg-sidebar`, `border-sidebar-border`.
- Brand block: **Fraunces** title “Keine Bürokratie”, eyebrow “English UI · non-official helper”.
- **Journeys** + **MVP tools** sections; items from **`src/lib/journeys.ts`** (`journeyPath` maps `residence` → `/permanent-residence`).
- Active route: **`bg-sidebar-primary text-sidebar-primary-foreground shadow-soft`**.

### Sticky subheader (main column)

- `h-14`, `border-border/50`, `bg-background/60`, `backdrop-blur-md`.
- **Service Berlin ↗** pill: `bg-secondary text-secondary-foreground rounded-full`.

### Footer (`SiteFooter.tsx`)

- `border-border`, `bg-background/80`, `text-muted-foreground`; primary-style underlines on links.

---

## 5. Navigation & routes

| Route | Role |
|-------|------|
| `/` | Journey hub driven by **`journeys`** — three cards (emoji, title, tagline, intro, timeline) + MVP tools panel. |
| `/registration` | Content from **`getJourney("registration")`** — documents list, official links, checklist from **steps**. |
| `/permanent-residence` | **`PermanentResidenceJourney`** — pathway select + **`permanent-residence-pathways`** + **`EinbuergerungstestPanel`**; intro blends **`getJourney("residence")`**. |
| `/citizenship` | **`getJourney("citizenship")`** + **`EinbuergerungstestPanel`**. |
| `/einbuergerungstest` | Intro + panel. |
| `/exams` | **`ExamDirectoryClient`**. |
| `/privacy`, `/imprint` | Legal stubs, semantic typography. |
| `/watches/confirmed` | Watch SSE / permission UI. |

---

## 6. Recurring patterns

### Home journey cards

- `rounded-xl border bg-gradient-card shadow-soft`; accent-specific **`border-*` / hover shadow** (`shadow-pop` for coral).

### Panels & forms

- **Rounded-xl**, **`border-border`**, **`bg-card/***`**, **`shadow-soft`**; inputs use **`border-input bg-background`**; primary actions **`bg-primary text-primary-foreground`**.

### `Checklist`

- **`bg-gradient-card`**, **`text-muted-foreground`** rows.

### `EinbuergerungstestPanel`

- Campus cards: selected state **`ring-primary/35`**; outbound links **`text-primary`**.

### `ExamDirectoryClient`

- Pills: active **`bg-primary`**, inactive **`border-border bg-card/70`**; table uses **`muted` / `card`** stripes.

---

## 7. Content source of truth

- **`src/lib/journeys.ts`** — shared titles, taglines, intros, document bullets, official links, step copy, emoji, accent labels for the three flagship journeys.

---

## 8. File map

| Area | Files |
|------|--------|
| Tokens & base styles | `src/app/globals.css` |
| Fonts & root | `src/app/layout.tsx` |
| Shell | `src/components/AppShellLayout.tsx`, `src/components/SidebarNav.tsx` |
| Journey data | `src/lib/journeys.ts`, `src/lib/permanent-residence-pathways.ts` |
| Home | `src/app/page.tsx` |
| Footer | `src/components/SiteFooter.tsx` |

---

*Update this file when the shell or token system changes materially.*
