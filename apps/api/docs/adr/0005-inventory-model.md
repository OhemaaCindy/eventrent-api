# 0005 — Quantity-based inventory instead of whole-set-only

## Status
Accepted

## Context
Party/event equipment is commonly rented in bulk (e.g. 50 chairs, 10 tables), not as single indivisible units. Two models were considered: whole-set-only (a listing is one bookable unit regardless of how many physical items it represents) vs quantity-based (renter selects a quantity, system tracks remaining stock per date range).

## Decision
Quantity-based stock per listing.

## Rationale
- Matches real-world usage in this domain — most event rentals are bulk, not single-item
- Whole-set-only would force owners to either under-list (only offering all-or-nothing bundles) or create many duplicate listings to simulate quantity, both poor UX
- Enables partial availability — e.g. 30 of 50 chairs already booked for a date range, 20 remain bookable

## Consequences
- Availability logic is more complex than a simple boolean "is this available" check — requires summing quantities across overlapping bookings and comparing to total stock (see ADR-0002 for the concurrency handling this requires)
- Booking creation must be transactional to prevent overselling under concurrent requests