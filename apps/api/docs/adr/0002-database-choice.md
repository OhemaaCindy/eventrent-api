# 0002 — Database: PostgreSQL over MySQL

## Status
Accepted

## Context
The booking system has a hard concurrency requirement: two renters must not be able to book the last unit of stock for overlapping dates at the same time (double-booking). Availability is computed at booking time by summing quantities across overlapping bookings, not stored as a separate calendar table.

## Decision
Use PostgreSQL.

## Rationale
- Row-level locking (`SELECT ... FOR UPDATE`) and `SERIALIZABLE` transaction isolation give predictable, well-documented tools for solving the double-booking race condition
- Native `daterange` type with overlap operators (`&&`) maps closely to the "does this date range overlap an existing booking" check central to the booking flow
- `UUID` and `JSONB` support useful for primary keys and semi-structured data (e.g. dispute evidence metadata)
- De facto standard pairing with Node.js in production — knowledge transfers directly

## Consequences
- Slightly more Postgres-specific SQL (range types, `FOR UPDATE`) than a purely ORM-abstracted approach would use — accepted as a deliberate tradeoff, tracked in ADR-0003
- Team/future-self needs basic familiarity with Postgres-specific features rather than staying 100% ORM-agnostic