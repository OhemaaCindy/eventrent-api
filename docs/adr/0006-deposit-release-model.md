# 0006 — Deposit release: owner confirmation + auto-release timer

## Status
Accepted

## Context
Deposits are held separately from the rental payment (see discovery doc) and must be released back to the renter, or escalated to a dispute, after the rental period ends. Two models were considered: two-sided confirmation (both renter and owner must confirm return condition, mismatch triggers dispute) vs single-sided (owner confirms; a timeout auto-releases if the owner does nothing).

## Decision
Owner confirms return condition. If no action within 48–72 hours, the deposit auto-releases to the renter. Owner can instead open a dispute with evidence, which routes to admin resolution.

## Rationale
- Two-sided confirmation requires designing a timeout/default for both parties potentially going silent — meaningfully more state-machine complexity for v1
- Single-sided + auto-release is simpler, still realistic, and mirrors patterns used by comparable platforms (e.g. Turo, Fat Llama)
- Produces a clean three-state outcome: `HELD → RELEASED` (explicit or timeout), or `HELD → DISPUTED` (admin resolves)

## Consequences
- Renter has no proactive way to flag "I returned it but haven't heard back" in v1 — reasonable UX gap, tracked as a v2 candidate (renter-side confirmation, listed in discovery doc's out-of-scope section)
- Relies on a scheduled job / timer mechanism (`autoReleaseAt` field on `DepositHold`) to enforce the auto-release window