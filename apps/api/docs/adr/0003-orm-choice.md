# 0003 — ORM: Prisma, with a documented row-locking gap

## Status
Accepted

## Context
Needed a data access layer for a TypeScript backend. Candidates considered: Prisma, Sequelize, raw SQL / query builder (Knex).

## Decision
Use Prisma.

## Rationale
- Generates TypeScript types directly from the schema — many query-shape bugs become compile-time errors instead of runtime failures
- Built-in migration system (`prisma migrate`), avoiding auto-sync/auto-DDL in favor of versioned, reviewable migrations — required by this project's production-standard bar
- Strong developer experience for the majority of standard CRUD access patterns used throughout the app

## Known limitation
Prisma does not have first-class support for `SELECT ... FOR UPDATE`. The one query path that genuinely needs it — the availability-check-and-book transaction — will use either:
- Prisma's `$transaction` API with `Serializable` isolation level, or
- A raw query via `$queryRaw` scoped to just that operation

This is called out explicitly so it is a known, deliberate exception rather than a surprise discovered mid-implementation.

## Consequences
- One code path (booking creation) is more complex / less "pure Prisma" than the rest of the codebase
- Rest of the application benefits from full type safety and migration tooling