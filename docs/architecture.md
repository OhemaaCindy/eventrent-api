# Architecture

## Layering

src/
├── routes/ # HTTP routing only — no business logic
├── controllers/ # Parse request, call service, shape response
├── services/ # Business logic lives here (booking rules, payment orchestration)
├── repositories/ # Prisma queries only — no business logic
├── middleware/ # Auth, error handling, validation
├── jobs/ # Scheduled tasks (deposit auto-release timer)
├── lib/ # Stripe client, email client, token signing, Prisma client instance
└── types/ # Shared TypeScript types/DTOs

Rule of thumb: **controllers never call Prisma directly, and services never touch `req`/`res`.** This mirrors Spring Boot's `@RestController` → `@Service` → `@Repository` split closely enough that the pattern transfers directly later.

## API surface (v1)

| Method | Route | Auth | Purpose |
|---|---|---|---|
| POST | `/auth/google` | — | Start Google OAuth flow |
| POST | `/auth/magic-link` | — | Request magic link email |
| GET | `/auth/magic-link/verify` | — | Verify token, issue session |
| POST | `/auth/register` | — | Password signup |
| POST | `/auth/login` | — | Password login |
| POST | `/auth/refresh` | — | Refresh access token |
| GET | `/listings` | — | Browse/search/filter listings |
| GET | `/listings/:id` | — | Listing detail |
| POST | `/listings` | Owner | Create listing |
| PATCH | `/listings/:id` | Owner | Update listing |
| GET | `/listings/:id/availability` | — | Check stock for a date range |
| POST | `/bookings` | Renter | Create booking (the concurrency-critical path) |
| GET | `/bookings/:id` | Renter/Owner | Booking detail |
| POST | `/bookings/:id/confirm-return` | Owner | Confirm return condition → releases deposit |
| POST | `/bookings/:id/dispute` | Owner | Open a dispute with evidence |
| POST | `/webhooks/stripe` | Stripe signature | Payment/payout event ingestion |
| POST | `/admin/owners/:id/verify` | Admin | Approve business verification |
| POST | `/admin/disputes/:id/resolve` | Admin | Resolve a dispute |

## Booking creation — the concurrency-critical path

This is the one flow that must be transactional and correctly isolated, per ADR-0002 and ADR-0003.

1. Request arrives: `listingId`, `quantity`, `startDate`, `endDate`
2. Open a Prisma `$transaction` with `Serializable` isolation
3. Inside the transaction:
   - Sum `quantity` across existing `bookings` for this `listingId` where status is `confirmed` and date ranges overlap the requested range
   - Compare against `listing.quantityTotal`
   - If insufficient stock → throw, transaction rolls back, return `409 Conflict`
   - If sufficient → create the `booking` row (`status: PAYMENT_PENDING`)
4. Outside the transaction (after commit): create Stripe `PaymentIntent` for the rental fee, create a separate manual-capture `PaymentIntent` (or equivalent) for the deposit hold
5. Return booking + payment client secret to the frontend to complete payment

If step 4 fails after the transaction commits, the booking exists but is unpaid — handled by the `PAYMENT_PENDING` status and a cleanup job that cancels unpaid bookings after a short window (e.g. 15 minutes), releasing the stock back.

## Payment & webhook flow

- Stripe is the source of truth for payment state — the app never assumes success from the client, only from a verified webhook event
- `/webhooks/stripe` verifies the Stripe signature, then handles:
  - `payment_intent.succeeded` → mark booking `CONFIRMED`, payment `PAID`
  - `payment_intent.payment_failed` → mark booking `PAYMENT_FAILED`, release held stock
  - Deposit-related capture/release events → update `depositHold.status`
- Idempotency: webhook handler checks `stripe_event_id` against a processed-events log before acting, since Stripe can deliver the same event more than once

## Auth flow

- Google OAuth and password login both terminate in the same place: issue a JWT access token (short-lived) + refresh token (httpOnly cookie, longer-lived)
- Magic link: token is a signed, single-use, short-lived value emailed to the user; verifying it issues the same JWT pair as any other method — magic link is a bootstrap into a session, not a session itself
- All three methods write/read from `AuthIdentity`, never directly from a password field on `User` (see ADR-0007)

## Error handling convention

- Centralized error-handling middleware — services throw typed errors (`InsufficientStockError`, `UnauthorizedError`, etc.), middleware maps them to HTTP status codes
- Consistent error response shape: `{ error: { code, message } }`

## Config & environments

- Environment variables via `.env` (local) / platform config (deployed), never hardcoded secrets
- Separate Stripe keys, DB URLs, JWT secrets per environment (dev/staging/prod)