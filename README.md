# Keine Bürokratie

Internal codename for the **Berlin relocation & immigration companion** MVP described in [`docs/prd.md`](docs/prd.md), [`docs/rfc.md`](docs/rfc.md), and [`docs/engineering-spec.md`](docs/engineering-spec.md).

**How to read the docs:** start with [`docs/README.md`](docs/README.md), which summarises each file (PRD vs RFC vs engineering spec) and when to consult which.

English-only UI · modular monolith (Next.js + PostgreSQL + poll worker).

## Prerequisites

- Node 20+
- PostgreSQL **listening on the host/port in your `DATABASE_URL`** (often `localhost:5432`)

Docker is optional; [`docker-compose.yml`](docker-compose.yml) is only one way to run Postgres.

### Quick start (Docker Compose)

Requires [Docker Desktop](https://docs.docker.com/desktop/) or another CLI that provides `docker`.

```bash
cp .env.example .env
docker compose up -d
npm install
npm run db:push
npm run db:seed
npm run dev
```

### Quick start without Docker (macOS examples)

Your errors (`docker: command not found`, `ECONNREFUSED` on port 5432) mean **PostgreSQL is not running** locally and/or **`DATABASE_URL` does not match** your actual user, password, and database name.

**Option A — Homebrew**

```bash
brew install postgresql@16
brew services start postgresql@16
# Create DB (superuser here is usually your macOS username unless you configured otherwise)
createdb keine_burokratie
```

Put a matching URL in `.env`, for example if your OS user is `you` with no password on the socket/default:

```env
DATABASE_URL=postgresql://you@localhost:5432/keine_burokratie
```

**Option B — [Postgres.app](https://postgresapp.com/)**

Start the app (server on `localhost:5432`), create a database named `keine_burokratie`, and set `DATABASE_URL` to match the username shown in Postgres.app’s docs.

Then:

```bash
cp .env.example .env   # edit DATABASE_URL inside
npm install
npm run db:push
npm run db:seed
npm run dev
npm run ingest:exams    # optional, after Postgres is up
```

### Troubleshooting `ECONNREFUSED`

| Symptom | Meaning |
|---------|--------|
| `connect ECONNREFUSED … :5432` | No Postgres daemon on that host/port → start Postgres or fix the port in `DATABASE_URL`. |
| `docker: command not found` | Compose path won’t work until you install Docker or use Brew/Postgres.app instead (see above). |
| Seed/ingest fail but `npm run db:push` seemed fine | `.env` may be ignored by some tools; prefix commands with `DATABASE_URL=…` explicitly to match the DB you actually started. |

After `db:seed`, run **`npm run worker`** in another terminal if you want the poll loop; visit **`http://localhost:3000`**.

Using Docker Compose, the URL in `.env.example` (`postgres` / `postgres` / DB `keine_burokratie`) matches [`docker-compose.yml`](docker-compose.yml).

## Scripts

| Script | Purpose |
|--------|---------|
| `npm run dev` | Next.js dev server |
| `npm run build` / `npm start` | Production build & serve |
| `npm run worker` | Mon–Fri ≥07:00 Berlin poll worker + daily PR checklist reminder digests (needs `RESEND_API_KEY` for email) |
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
