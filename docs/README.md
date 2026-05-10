# Product and engineering documentation

This folder holds the **source-of-truth narrative** for the Keine Bürokratie MVP: what we are building, why, and how it should behave technically. The app README in the repo root is for **getting the code running**; these files are for **scope, trade-offs, and implementation alignment**.

## Files

| Document | Audience | Purpose |
|----------|-----------|---------|
| [`prd.md`](./prd.md) | Product, design, stakeholders | **Product requirements:** problems, goals, non-goals, MVP scope (journeys, Einbürgerungstest watcher, exam directory), success metrics, risks. Use this to decide **what ships** and what is out of scope. |
| [`rfc.md`](./rfc.md) | Engineers, infra | **Technical RFC:** architecture choices, polling and fairness constraints, privacy posture, scraping/exam ingestion approach, notifications. Use this when evaluating **technical feasibility** and operational limits. |
| [`engineering-spec.md`](./engineering-spec.md) | Engineers | **Engineering specification:** concrete system shape (Next.js, worker, DB tables, APIs, scheduling, error handling patterns). Use this when **implementing or reviewing** backend and data flows. |

## How to use them together

1. **`prd.md`** defines the user-facing journeys and MVP slices.
2. **`rfc.md`** explains how those slices map to services (Service Berlin polling, GDPR, backoff).
3. **`engineering-spec.md`** spells out schemas, endpoints, and worker behaviour so implementation stays consistent.

When the product changes, update the PRD first, then align the RFC and engineering spec so they do not contradict each other.
