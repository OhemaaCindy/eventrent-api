# 0012 — Security posture assessment (as of auth module completion)

## Status
Accepted (living document — revisit as new modules are added)

## Context
After completing the full authentication module (password, magic link, Google OAuth), it's worth an honest, dated checkpoint of what's actually secured versus what remains open, rather than an implicit assumption that "auth is done" means "the app is secure." This ADR is a snapshot, not a one-time checklist — later modules (listings, bookings, payments) will need their own equivalent review.

## Assessment

### Verified and solid
- Password storage: bcrypt, cost factor 12, never plaintext
- Login enumeration protection: verified byte-identical responses for wrong-password vs nonexistent-account
- Magic link: hashed tokens (never stored raw), single-use enforced and tested, 15-minute expiry
- Google OAuth: `state` parameter CSRF protection, account linking correctly scoped by `providerUserId` rather than email alone (per ADR-0007)
- Token transport: refresh token in httpOnly/sameSite=lax cookie; access token bearer-only, never persisted client-side in localStorage
- CORS: explicit origin allow-list, correctly paired with `credentials: true` (not a wildcard)
- Input validation: zod schemas enforced at every controller boundary
- Rate limiting: applied to all auth endpoints
- Security headers: Helmet (CSP, HSTS, X-Frame-Options, etc.)
- Secrets management: `.env` gitignored, cryptographically random secrets, fail-loud startup validation via zod
- Dependency vulnerabilities: `npm audit` clean at time of writing (0 known vulnerabilities)

### Documented, deliberate limitations (not oversights)
- Refresh token rotation issues new tokens but does not invalidate old ones (ADR-0009) — a stolen token remains valid up to its full 7-day expiry even after rotation
- Email delivery is console-logged only in development, no real provider wired in yet (ADR-0011)

### Not yet addressed (tracked here, not yet fixed)
- **No automated test suite.** All verification so far has been manual (curl/browser), which confirms correctness at time of testing but provides no regression protection against future changes silently breaking security-relevant behavior (e.g. enumeration protection, single-use token enforcement)
- **Rate limiting is per-IP and in-memory** — resets on server restart, does not share state across multiple app instances. Acceptable for a single-instance deployment; would need a shared store (e.g. Redis-backed limiter) for horizontal scaling
- **No account lockout or brute-force anomaly detection** beyond rate limiting
- **`authMiddleware` exists but is not yet applied to any route**, since no protected resources (listings, bookings) exist yet — authorization (not just authentication) is entirely unverified until those modules are built
- **No structured logging or monitoring** — current visibility is limited to raw console output, insufficient for detecting or investigating a real incident

## Consequences
- This document should be revisited (not just appended to) after each major module (listings, bookings, payments) is built, since each introduces its own authorization surface that needs the same honest scrutiny
- "Auth is secure" should not be conflated with "the app is secure" — most of the app's actual attack surface (authorization on business resources) doesn't exist yet to evaluate