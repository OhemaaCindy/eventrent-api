# 0016 — Deposit handling: charge-and-refund instead of authorize-and-capture (Paystack GHS constraint)

## Status
Accepted — refines ADR-0006 and ADR-0015

## Context
ADR-0006 assumed a "hold now, capture or release later" deposit mechanic, and ADR-0015's initial research suggested Paystack's Preauthorization API would provide this natively, including built-in auto-expiry. Direct verification against Paystack's API documentation revealed the Preauthorization API is restricted to South African merchants transacting in ZAR only — it is not available for GHS (Ghana Cedis), which is this project's actual operating currency.

## Decision
Deposits are charged as a real transaction at booking time (via the standard Initialize/Verify Transaction flow, same mechanism as the rental fee), tracked as a separate `Payment`-equivalent record from the rental charge. Release is implemented via Paystack's Refund API (full refund) rather than a true unauthorize/release. A dispute withholds the refund instead of "capturing" a hold.

## Rationale
- Paystack's Initialize/Verify Transaction and Refund endpoints work for GHS, unlike Preauthorization
- This is a legitimate, commonly-used real-world pattern for deposit handling, not a hack — many platforms charge and conditionally refund rather than true-hold, particularly outside markets where card networks make authorize-only holds easy
- Caught via direct API documentation verification before implementation, avoiding wasted work building against an unavailable feature — consistent with this project's practice of verifying third-party API behavior rather than assuming it

## Consequences
- Real money moves twice for a deposit with no dispute (charge, then refund) rather than never moving at all (as a true hold would allow) — acceptable for v1, worth noting as a UX/cost difference from the original design
- The `autoReleaseAt` timer's job changes slightly: instead of relying on Paystack's built-in `expire_after_days`/`expire_action` (ZAR-only), our own scheduled job must trigger the refund call directly when the window elapses — the auto-release mechanism from ADR-0006 is still needed and now does more of the actual work, not less
- If this project ever expands to a market where Paystack's true preauthorization is available (South Africa, ZAR), that market could use the more elegant hold-based flow as a variant — not pursued now