# Architecture

## Layering

`apps/api/src/`
```
├── routes/       # HTTP routing only — no business logic
├── controllers/  # Parse request, call service, shape response
├── services/     # Business logic lives here (booking rules, payment orchestration)
├── repositories/ # Prisma queries only — no business logic
├── middleware/   # Auth, error handling, rate limiting, upload validation
├── jobs/         # Scheduled tasks (deposit auto-release timer)
├── lib/          # Paystack client, Cloudinary client, email sender, token signing,
│                 # Prisma client instance, socket.io server
└── types/        # Zod schemas + inferred DTOs
```

Rule of thumb: **controllers never call Prisma directly, and services never touch `req`/`res`.** A handful of pure-read endpoints (e.g. `GET /listings/:id`) skip the service layer and call the repository directly from the controller — acceptable for a single lookup with no business rules attached.

The API lives at `apps/api` in a pnpm workspace alongside `apps/web` (the frontend) — see the repo root `pnpm-workspace.yaml`.

## API surface

Grouped by domain. `auth` means it requires a bearer access token; some additionally require an admin flag on the user (`adminMiddleware`), noted below.

**Auth**
| Method | Route | Purpose |
|---|---|---|
| POST | `/auth/register` | Password signup |
| POST | `/auth/login` | Password login |
| POST | `/auth/refresh` | Exchange refresh cookie for a new access token |
| POST | `/auth/logout` | Clear the refresh cookie |
| POST | `/auth/magic-link` | Request a magic link email |
| GET | `/auth/magic-link/verify` | Verify a magic link token and log in |
| GET | `/auth/google` | Start Google OAuth |
| GET | `/auth/google/callback` | Google OAuth callback |
| GET | `/auth/verify-email` | Verify a password account's email |
| POST | `/auth/verify-email/resend` *(auth)* | Resend the verification email |

**Owners**
| Method | Route | Purpose |
|---|---|---|
| POST | `/owners/me` *(auth)* | Create an owner profile (individual or business) |
| POST | `/owners/me/documents` *(auth)* | Upload business verification documents |

**Listings**
| Method | Route | Purpose |
|---|---|---|
| GET | `/listings` | Browse live listings — filterable by category, location, date-range availability |
| GET | `/listings/:id` | Listing detail |
| GET | `/listings/mine` *(auth)* | Owner's own listings, every status |
| GET | `/listings/:id/reviews` | Reviews + aggregate rating for a listing |
| POST | `/listings` *(auth)* | Create a listing (LIVE or PENDING_REVIEW per ADR-0004, or DRAFT if `saveAsDraft`) |
| POST | `/listings/:id/images` *(auth)* | Upload a listing image (Cloudinary) |
| POST | `/listings/:id/publish` *(auth)* | Publish a draft — re-runs the same verification gate as creation |
| PATCH | `/listings/:id` *(auth)* | Update fields, or pause/resume (LIVE ↔ PAUSED only) |
| DELETE | `/listings/:id` *(auth)* | Delete — blocked if the listing has any booking history |

**Bookings**
| Method | Route | Purpose |
|---|---|---|
| POST | `/bookings` *(auth)* | Create a booking — the concurrency-critical path |
| GET | `/bookings` *(auth)* | List the current user's own bookings |
| POST | `/bookings/:id/return` *(auth)* | Renter confirms return — re-anchors the auto-release timer |
| POST | `/bookings/:id/confirm-return` *(auth)* | Owner confirms undamaged — releases the deposit |
| POST | `/bookings/:id/dispute` *(auth)* | Owner disputes instead — deposit held pending admin review |
| POST | `/bookings/:id/cancel` *(auth)* | Renter cancels — refund depends on the cancellation policy window |
| POST | `/bookings/:id/reviews` *(auth)* | Leave a review (once the deposit is resolved) |
| POST / GET | `/bookings/:id/messages` *(auth)* | Send / list messages on a booking's thread |

**Orders** (bundled & recurring checkout)
| Method | Route | Purpose |
|---|---|---|
| POST | `/orders` *(auth)* | Bundle multiple listings (potentially different owners) into one order, one combined Paystack charge |
| POST | `/orders/recurring` *(auth)* | Book the same listing on a repeating weekly/monthly schedule, paid upfront as one order |
| GET | `/orders/:id` *(auth)* | Order + its bookings |

**Events** (grouping bookings, e.g. "Sarah's Wedding")
| Method | Route | Purpose |
|---|---|---|
| POST | `/events` *(auth)* | Create a named event |
| GET | `/events` / `/events/:id` *(auth)* | List / get an event with its bookings and combined total |
| POST / DELETE | `/events/:id/bookings/:bookingId` *(auth)* | Attach / detach a booking |
| DELETE | `/events/:id` *(auth)* | Delete the event (bookings are unlinked, not deleted) |

**Messages**
| Method | Route | Purpose |
|---|---|---|
| GET | `/messages/inbox` *(auth)* | Active conversations across all the user's bookings |

**Admin** *(auth + admin flag)*
| Method | Route | Purpose |
|---|---|---|
| GET | `/admin/owners/pending` | Business owners awaiting verification, oldest first |
| POST | `/admin/owners/:id/verify` \| `/reject` | Approve (auto-publishes pending listings) or reject |
| POST | `/admin/disputes/:id/resolve` | Refund renter, retain deposit, or split 50/50 |
| GET | `/admin/payouts` | All owner payouts owed |
| POST | `/admin/payouts/:id/mark-paid` | Mark a payout sent (manual — no real transfer happens) |

**Webhooks**
| Method | Route | Purpose |
|---|---|---|
| POST | `/webhooks/paystack` | Paystack event ingestion (signature-verified) |

**Categories**: `GET /categories` — flat list, public.

## Booking creation — the concurrency-critical path

This is the flow that must be transactional and correctly isolated, per ADR-0002, ADR-0003, and ADR-0013.

1. Request arrives: `listingId`, `quantity`, `startDate`, `endDate`.
2. Open a Prisma `$transaction` with `Serializable` isolation.
3. Inside the transaction:
   - Confirm the listing is `LIVE`.
   - Sum `quantity` across existing bookings for this listing where status is `CONFIRMED` or `PAYMENT_PENDING` and the date range overlaps the requested range.
   - Compare against `listing.quantityTotal`; insufficient stock throws, the transaction rolls back, client gets `409`.
   - Otherwise create the `Booking` row (`status: PAYMENT_PENDING`).
4. If Postgres reports a serialization failure (two concurrent requests raced for the same stock), that's caught and surfaced as `409 BOOKING_CONFLICT` — the client is expected to retry, not treated as a bug.
5. Outside the transaction (after commit, deliberately — never hold a DB transaction open across a network call): initialize **one** Paystack transaction covering rental fee + deposit combined, then create the `Payment` and `DepositHold` rows.
6. Return the booking + Paystack `authorization_url` for the client to complete payment.

**Known gap, not yet built**: there's no cleanup job for bookings that stay `PAYMENT_PENDING` indefinitely (e.g. the renter never completes payment). Stock isn't released back automatically for those — worth revisiting if this becomes a real problem.

`orders/*` (bundled and recurring checkout) reuse this exact same per-item logic inside one larger transaction spanning every item in the cart/series, so cross-item stock accounting (including two items in the same cart competing for the same listing) is handled correctly by the same mechanism, not separately re-implemented.

## Payment & webhook flow

Paystack is the payment provider (ADR-0015; Stripe was the original plan per ADR-0014 but was dropped before implementation). Paystack, not the client, is the source of truth for payment state.

- `POST /webhooks/paystack` verifies the request signature (HMAC-SHA512 over the raw body with the Paystack secret key) before touching anything.
- On `charge.success`, the reference is looked up two ways:
  - If it matches an **Order**'s reference (bundled/recurring checkout, one charge shared across multiple bookings): re-verify with Paystack directly (defense in depth — never trust the webhook payload alone), then mark the order `PAID`, every one of its still-active bookings `CONFIRMED` (skipping any the renter already cancelled), and create a `Payout` per booking.
  - Otherwise, the single-booking `Payment` path: same re-verification, then mark that one `Payment` `PAID`, its `Booking` `CONFIRMED`, and create its `Payout`.
- **Idempotency**: no separate processed-events log — the guard is simply "is this `Payment`/`Order` already `PAID`?" If so, the handler returns early. Paystack's documented at-least-once delivery is handled by that check being idempotent by construction.
- `Payout.amount` is the rental fee minus `PLATFORM_COMMISSION_PERCENT`; payouts are a tracked ledger only — admin marks them paid manually, no real bank transfer is triggered by this system.

## Deposit lifecycle

A `DepositHold` is created alongside every booking's payment, `HELD` by default, and resolves one of these ways:

- **Owner confirms return undamaged** (`POST /bookings/:id/confirm-return`) → full refund → `RELEASED`.
- **Renter confirms return** (`POST /bookings/:id/return`) → doesn't release anything itself, but re-anchors `autoReleaseAt` to 48h from that moment (the original estimate, set at booking creation, can be wildly off from when the item actually comes back).
- **Owner disputes instead** (`POST /bookings/:id/dispute`, evidence photos required) → `DISPUTED`, held pending admin review.
- **Admin resolves the dispute** → refund the renter in full (`RELEASED`), retain it (`RETAINED`), or split it 50/50 as a partial Paystack refund (`SPLIT`).
- **Nobody acts in time** → an hourly cron job (`jobs/autoReleaseDeposits.ts`) finds every `HELD` deposit past its `autoReleaseAt` and releases it automatically. Deliberately checked hourly rather than more precisely — this isn't time-critical, and a refund landing up to ~an hour late is fine.

## Cancellation & refunds

Each listing has a `cancellationPolicy` (FLEXIBLE/MODERATE/STRICT = 24h/72h/168h notice). On `POST /bookings/:id/cancel`:
- The **deposit is always refunded in full** if it was still `HELD` — no rental occurred, so there's no damage risk to hold it against.
- The **rental fee** is only refunded if the cancellation happens outside the listing's policy window; otherwise it's forfeited.
- If payment was never actually confirmed (still `PENDING`), nothing is refunded via Paystack — there's nothing to refund — but affected records are still updated (booking → `CANCELLED`, deposit → `RELEASED`, any still-`PENDING` payout deleted).

## Real-time messaging

Booking-scoped chat threads (`Message` model, one row per message, no separate `Conversation` entity — a booking already has exactly two participants: the renter and the listing's owner). Delivery is REST for history (`GET /bookings/:id/messages`, `GET /messages/inbox`) plus a socket.io layer (`lib/socket.ts`) for live push: clients join a `booking:{id}` room after the server verifies they're actually a participant, and every new message — whether sent over REST or the socket — broadcasts from the one place (`messageService.sendMessage`), so delivery is identical regardless of transport.

## Auth flow

- Google OAuth and password login both terminate in the same place: issue a JWT access token (short-lived) + refresh token (httpOnly cookie, longer-lived).
- Magic link: a signed, single-use, short-lived token emailed to the user; verifying it issues the same JWT pair as any other method — magic link bootstraps a session, it isn't one itself.
- All three methods write/read from `AuthIdentity`, never a password field directly on `User` (ADR-0007) — one user can have more than one linked identity.
- Password signups also get an `EmailVerificationToken` (same shape/pattern as magic link tokens) and a verification email; `emailVerified` on the `AuthIdentity` only ever flips via that flow.

## Error handling convention

- One error type, `AppError(statusCode, code, message)`, thrown from services — no per-error-kind class hierarchy.
- Centralized middleware maps `AppError` → its own status code, `ZodError` → `400` with per-field details, `multer.MulterError` → `400` (file too large / wrong field name), and anything else unexpected → `500` (logged server-side, generic message to the client).
- Consistent error response shape: `{ error: { code, message } }`.

## Config & environments

Validated at startup via a Zod schema (`lib/env.ts`) — the process exits immediately with a clear message if anything required is missing, rather than failing confusingly later. Required: `DATABASE_URL`, `JWT_ACCESS_SECRET`/`JWT_REFRESH_SECRET`, Google OAuth credentials, Cloudinary credentials, `PAYSTACK_SECRET_KEY`. `PLATFORM_COMMISSION_PERCENT` defaults to 10; `CORS_ORIGIN`/`FRONTEND_URL` default to the local frontend dev URL.
