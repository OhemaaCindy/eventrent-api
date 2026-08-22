# EventRent

A two-sided marketplace for renting party/event equipment (tables, chairs, tents, sound systems, decor). Individuals and businesses list gear; renters browse, book, and pay through the platform with marketplace payments and a deposit/damage workflow.

Built as a portfolio project to practice production-standard engineering: proper concurrency handling, marketplace payment flows, and documented architectural decisions — not a CRUD tutorial clone.

## Structure

A pnpm workspace with two apps:

- [`apps/api`](./apps/api) — the backend (Node.js, Express, TypeScript, PostgreSQL, Prisma, Paystack). See its own README for setup and `docs/` for the full engineering decision trail (discovery, architecture, ADRs).
- [`apps/web`](./apps/web) — the frontend (React, Vite, TypeScript). Freshly scaffolded — see its README for status.

## Getting started

```bash
pnpm install     # installs the whole workspace
pnpm dev          # runs both apps concurrently (api on :4000, web on :5173)
```

The API needs Postgres running first — see [`apps/api/README.md`](./apps/api/README.md) for the full setup (Docker Compose, `.env`, migrations). Run just one app at a time with `pnpm dev:api` or `pnpm dev:web`.

## Status

Backend: core marketplace flows (auth, listings, concurrency-safe bookings, deposits/disputes, payments) plus the full v2 feature set (reviews, messaging, bundled/recurring orders, cancellation policies, event grouping) are built — see [`apps/api/docs/architecture.md`](./apps/api/docs/architecture.md). Frontend: just getting started, translating designs into real screens one at a time.
