# EventRent

A two-sided marketplace for renting party/event equipment (tables, chairs, tents, sound systems, decor). Individuals and businesses list gear; renters browse, book, and pay through the platform with marketplace payments and a deposit/damage workflow.

Built as a portfolio project to practice production-standard backend engineering: proper concurrency handling, marketplace payment flows, and documented architectural decisions — not a CRUD tutorial clone.

## Tech stack
- **Backend:** Node.js, Express, TypeScript
- **Database:** PostgreSQL
- **ORM:** Prisma
- **Payments:** Paystack (see ADR-0015 for why — Stripe Connect was the original plan)
- **Auth:** Google OAuth2, magic link, password (unified identity model)
- **Real-time:** socket.io, for in-app messaging

## Documentation
Full engineering decision trail lives in [`/docs`](./docs):
- [`docs/discovery.md`](./docs/discovery.md) — scope, roles, user journeys, v1/v2 boundaries
- [`docs/architecture.md`](./docs/architecture.md) — layering, API surface, concurrency flow, payments
- [`docs/adr/`](./docs/adr) — Architecture Decision Records for every major technical decision, with context and tradeoffs

## Getting started

1. Start Postgres: `docker compose up -d` (from this directory)
2. Copy `.env` with the required variables — see `lib/env.ts` for the full validated list (`DATABASE_URL`, JWT secrets, Google OAuth credentials, Cloudinary credentials, `PAYSTACK_SECRET_KEY`)
3. Install and run, from the repo root:
   ```bash
   pnpm install
   pnpm --filter @eventrent/api prisma:generate
   pnpm --filter @eventrent/api prisma:migrate
   pnpm dev:api
   ```
   The API starts on `http://localhost:4000`; Swagger docs are served at `/docs`.

## Status
Core marketplace flows (auth, listings, bookings with concurrency-safe booking, deposits/disputes, payments) plus the full v2 set (reviews, messaging, bundled/recurring orders, cancellation policies, event grouping) are built and covered in `docs/architecture.md`. The frontend (`apps/web`) is just getting started.