# Discovery & Scope (v1)

## Product
A two-sided marketplace for renting party/event equipment (tables, chairs, tents, sound systems, decor, etc.). Owners (individuals or businesses) list gear; renters browse, book, and pay through the platform.

## Roles
- **Renter** — browses, books, pays, picks up/receives, returns items
- **Owner (Individual)** — lists items, sets pricing/quantity/fulfillment, goes live instantly
- **Owner (Business)** — same as individual, but requires admin verification before listings go live; gets a verified badge
- **Admin** — approves business verification, resolves damage disputes, oversees payouts

## Core Scope Decisions
| Area | Decision | Rationale |
|---|---|---|
| Inventory | Quantity-based stock per listing (e.g. 50 chairs), decremented per date range | Party equipment is typically rented in bulk; whole-set-only would misrepresent real usage |
| Fulfillment | Owner chooses pickup, delivery, or both — per listing | Flexibility without forcing logistics the owner can't support |
| Booking | Instant-book always (auto-confirmed if stock available for the date range) | Removes owner-approval latency from the critical path; simpler v1 state machine |
| Payments | Marketplace flow — platform charges renter, holds funds, pays out owner minus commission (Stripe Connect) | Standard two-sided marketplace payment pattern |
| Deposits | Separate hold from rental fee. Owner confirms return condition → release. No action within timeout (48–72h) → auto-release. Owner can dispute with evidence → admin resolves. | See ADR-0006 |
| Business verification | Gates listing visibility — business listings stay unpublished until admin approves | See ADR-0004 |
| Auth | Google OAuth, magic link, and password — unified identity model (one user, multiple linked auth methods) | See ADR-0007 |

## Out of Scope for v1 (parking lot for v2)
- Reviews/ratings
- In-app messaging/chat between renter and owner
- Cancellation policy tiers
- Multi-item cart / bundled checkout across multiple owners
- Renter-side return confirmation (two-sided confirmation)
- Recurring/subscription rentals
- **Event grouping** — bookings currently belong to individual listings, not a parent "Event" object (e.g. grouping all rentals for one wedding under a single event). Noted as a real future direction, not built in v1.

## User Journeys

### A — Owner lists an item
1. Sign up/log in (Google / magic link / password)
2. If business: submit verification info → pending admin review
3. Create listing: title, category, photos, quantity, price/day, deposit amount, fulfillment option(s), location
4. Individual listings go live instantly; business listings go live after admin approval

### B — Renter books an item
1. Browse/search/filter by category, date range, location
2. Select item, choose quantity + date range → system checks live availability
3. Instant-book: pay rental fee + deposit hold → booking confirmed, stock decremented for those dates
4. Pickup or delivery per listing config
5. Renter returns item
6. Owner confirms condition (or 48–72h timer auto-releases deposit)
7. If damaged: owner opens dispute with evidence → admin resolves → deposit split/refunded

### C — Admin
1. Review/approve business verification requests
2. Review and resolve disputes
3. Oversee payout issues/exceptions

## Next Steps
1. ✅ ER diagram
2. ✅ Stack decision — see `/docs/adr`
3. ✅ Architecture sketch — see `docs/architecture.md`
4. ✅ Prisma schema + initial migration
5. Build core services (auth, listings, bookings, payments)