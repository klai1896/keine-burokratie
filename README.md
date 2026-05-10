# Keine Bürokratie

Internal codename for the **Berlin relocation & immigration companion** MVP described in [`docs/prd.md`](docs/prd.md), [`docs/rfc.md`](docs/rfc.md), and [`docs/engineering-spec.md`](docs/engineering-spec.md) (copied from the `product-team-agents` documentation set).

English-only UI · modular monolith (Next.js + PostgreSQL + poll worker).

## Prerequisites

- Node 20+
- Postgres 16+ (Docker Compose file included)

## Quick start

```bash
cp .env.example .env
docker compose up -d   # if Docker is available
npm install
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/keine_burokratie npm run db:push
npm run db:seed
npm run dev
```

In another terminal (after the schema exists):

```bash
npm run worker
```

Visit `http://localhost:3000`.

## Scripts

| Script | Purpose |
|--------|---------|
| `npm run dev` | Next.js dev server |
| `npm run build` / `npm start` | Production build & serve |
| `npm run worker` | Mon–Fri ≥07:00 Berlin poll worker (singleton per `service_target`) |
| `npm run db:push` | Push Drizzle schema to Postgres |
| `npm run db:seed` | Seed ≥12 Einbürgerungstest `service_target` rows + ≥8 `exam_listing` rows |
| `npm run ingest:exams` | Stub ingest that pings Goethe URLs and bumps `last_verified` |
| `npm run test` | Vitest suite (matching + timezone helpers) |
| `npm run lint` | ESLint |

## Notes

- **Service Berlin scraping / HTML parsers** are intentionally stubbed; wire real `AppointmentSource` logic plus legal review before production polling.
- **Email**: without `RESEND_API_KEY`, API routes log confirmations/matches to stdout.
- **Mocks**: `BERLIN_FETCH_MOCK=1` returns synthetic JSON payloads so upstream sites are untouched.

## Repo layout

- `src/app` — App Router UI + REST/SSE endpoints
- `src/db` — Drizzle schema
- `src/worker` — polling loop (`runTick`, `runWorkerLoop`)
- `drizzle/` — Generated SQL migrations
- `scripts/` — seed + ingest jobs
