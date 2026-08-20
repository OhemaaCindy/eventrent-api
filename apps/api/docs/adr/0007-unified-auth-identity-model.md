# 0007 — Unified user + auth_identities model for multi-method login

## Status
Accepted

## Context
The platform supports three login methods: Google OAuth, magic link, and password. A user may want more than one linked to their account over time (e.g. sign up via Google, later add a password). A naive design — one auth method baked directly into the `User` table — breaks as soon as a user wants a second method, or when the same email arrives via two different providers.

## Decision
Separate `User` (canonical identity) from `AuthIdentity` (one row per linked login method: provider, providerUserId, passwordHash where applicable, emailVerified). A user can have multiple `AuthIdentity` rows.

## Rationale
- Avoids account-collision bugs (e.g. matching users by email alone across providers, which can be spoofed or mismatched)
- Supports linking additional auth methods post-signup without a schema change or data migration
- Standard pattern for multi-provider auth in production systems

## Consequences
- Slightly more complex signup/login logic than single-method auth (must check across `AuthIdentity`, not just `User`)
- Magic link tokens are handled as short-lived, single-use tokens that verify identity and then issue a real session — not a session by themselves