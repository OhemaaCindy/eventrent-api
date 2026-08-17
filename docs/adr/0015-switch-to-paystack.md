# 0015 — Switch payment provider from Stripe to Paystack

## Status
Accepted — supersedes the Stripe-specific portions of ADR-0002 and all of ADR-0014

## Context
Stripe does not support direct merchant accounts for Ghana-registered individuals/businesses — it is only reachable there via Paystack (a separate platform Stripe acquired, with its own dashboard, API, and onboarding) or by incorporating a legally separate US/UK entity, which is disproportionate overhead for this project. Since the developer building and operating this project is Ghana-based, Stripe cannot realistically be used even in a "just for testing" capacity that reflects how the project would actually be operated.

## Decision
Use Paystack directly as the payment provider, in place of Stripe.

## Rationale
- Paystack natively supports Ghana (and other West/East African markets), matching the developer's actual operating context — this is a genuine regional fit, not a workaround
- Avoids the disproportionate overhead of incorporating a foreign entity solely to access Stripe
- Paystack's API follows broadly similar concepts to Stripe's (initialize a transaction, verify it, webhook-driven confirmation), so the architectural shape of the payment flow (documented in `docs/architecture.md`) is not fundamentally disrupted — this is a provider swap, not a redesign

## Consequences
- ADR-0014 (Stripe Connect deferred) is superseded in full — Paystack has its own equivalent multi-party/split-payment mechanism, which will need its own scoping decision once payouts are addressed
- Any Stripe-specific language in `docs/discovery.md` and `docs/architecture.md` (e.g. "Stripe Connect", "PaymentIntent") should be read as historical/superseded; this ADR is the source of truth going forward
- The `stripe` npm package and any Stripe-specific code written prior to this ADR will be removed in favor of Paystack's API
- Deposit-hold mechanics (ADR-0006) need re-verification against Paystack's actual capabilities — Paystack's authorization/hold model is not guaranteed to be identical to Stripe's manual-capture PaymentIntents, and this will be confirmed before implementation rather than assumed