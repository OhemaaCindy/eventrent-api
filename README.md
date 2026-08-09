# EventRent

A two-sided marketplace for renting party/event equipment (tables, chairs, tents, sound systems, decor). Individuals and businesses list gear; renters browse, book, and pay through the platform with marketplace payments and a deposit/damage workflow.

Built as a portfolio project to practice production-standard backend engineering: proper concurrency handling, marketplace payment flows, and documented architectural decisions — not a CRUD tutorial clone.

## Tech stack
- **Backend:** Node.js, Express, TypeScript
- **Database:** PostgreSQL
- **ORM:** Prisma
- **Payments:** Stripe Connect
- **Auth:** Google OAuth2, magic link, password (unified identity model)

## Documentation
Full engineering decision trail lives in [`/docs`](./docs):
- [`docs/discovery.md`](./docs/discovery.md) — scope, roles, user journeys, v1/v2 boundaries
- [`docs/architecture.md`](./docs/architecture.md) — layering, API surface, concurrency flow, payments
- [`docs/adr/`](./docs/adr) — Architecture Decision Records for every major technical decision, with context and tradeoffs

## Getting started
_(To be filled in once the project is scaffolded — install steps, env vars, local run instructions.)_

## Status
🚧 In development — schema and migrations complete, building core services.