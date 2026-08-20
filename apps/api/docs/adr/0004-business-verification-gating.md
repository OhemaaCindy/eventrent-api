# 0004 — Business listings gated behind admin approval

## Status
Accepted

## Context
Both individuals and businesses can list equipment. Businesses can carry a "verified" badge. The question: does verification gate whether a business's listings go live, or is it just a badge applied after the fact (listings live immediately either way)?

## Decision
Business listings remain unpublished (`PENDING_REVIEW`) until an admin approves the account. Individual listings go live instantly, no gating.

## Rationale
- A "verified" badge that appears on listings which were never actually checked is misleading to renters — it implies a review happened when it didn't
- Businesses typically list at higher volume and carry more platform trust/liability exposure than individuals, justifying the extra friction
- Individuals benefit more from frictionless onboarding (marketplace liquidity depends on low-friction listing), and carry comparatively lower risk per listing
- Precedent: comparable marketplaces (e.g. Airbnb, Turo) apply lighter friction to individual hosts and heavier verification to professional/business accounts

## Consequences
- Business owners have a slower time-to-live (dependent on admin review turnaround) — mitigated by keeping the admin review journey a first-class, bounded flow rather than an open-ended black box
- Requires an admin review UI/flow to exist even in v1 (already in scope regardless, since the badge needs a real check behind it either way)
- Alternative considered and rejected for v1: "badge only, no gating" — simpler to build, but weakens the meaning of the verified badge. Could be revisited if build-time pressure requires cutting scope.