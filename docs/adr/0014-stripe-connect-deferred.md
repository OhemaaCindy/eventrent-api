# 0014 — Stripe payments: renter-side charging built now, Connect payouts deferred

## Status
Accepted

## Context
The discovery doc specifies a full marketplace payment flow: platform charges the renter, holds funds, and pays out the owner minus commission via Stripe Connect. The renter-charging half is fully achievable via API alone. The owner-payout half requires each owner to complete Stripe Connect's own onboarding (identity verification, bank account linking), which is a hosted, redirect-based flow — it fundamentally requires a frontend to send owners through, which doesn't exist yet in this project.

## Decision
Build and fully test: PaymentIntent creation for the rental fee, a separate manual-capture PaymentIntent for the deposit hold, and webhook-driven status updates (booking CONFIRMED on payment success). Defer actual Stripe Connect account creation, onboarding links, and destination charges/transfers to owners.

## Rationale
- The renter-charging flow is complete, real, and testable end-to-end without any missing dependency
- Owner payout via Connect cannot be meaningfully built or tested without a frontend to host the onboarding redirect — attempting it now would produce an untestable stub, not a real feature
- Consistent with this project's practice of scoping honestly (see ADR-0011 on email) rather than building partial features that appear complete but aren't

## Consequences
- `Payout` model exists in the schema but is not populated by this phase of work
- Owners currently have no way to actually receive money for confirmed bookings — this is a real, known gap, not hidden
- v2/next-phase work (once a frontend exists): Stripe Connect Express account creation per owner, onboarding link generation, `account.updated` webhook handling to track verification status, and destination charges or transfers on booking confirmation