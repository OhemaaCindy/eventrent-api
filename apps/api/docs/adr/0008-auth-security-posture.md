# 0008 — Auth security posture: hashing, tokens, rate limiting, enumeration protection

## Status
Accepted

## Context
Password-based auth is a high-value attack target: credential stuffing, brute force, account enumeration, and token theft are all common, well-understood attack classes. This project's production-standard bar requires deliberately defending against each, not just implementing the "happy path" of signup/login.

## Decision
- **Password hashing:** bcrypt, cost factor 12
- **Login error messages:** identical generic message ("Invalid email or password") regardless of whether the email exists or the password is wrong
- **Rate limiting:** stricter limits applied specifically to `/auth/*` routes than the rest of the API
- **JWT:** short-lived access token (15 min) + httpOnly/secure/sameSite refresh token cookie (7 days), separate signing secrets for each
- **Validation:** all auth request bodies validated with zod before reaching business logic
- **Password policy:** minimum 10 characters, no forced complexity rules (aligned with current NIST 800-63B guidance over legacy complexity-rule conventions)

## Rationale
- bcrypt's cost factor and constant-time comparison are the standard defense against brute force and timing attacks on stored hashes
- Generic login errors are the standard defense against account enumeration — a differentiated error is a well-known information leak
- Refresh tokens in httpOnly cookies are inaccessible to JavaScript, meaning a successful XSS attack cannot exfiltrate them (unlike `localStorage`-stored tokens)
- Separate access/refresh secrets limit blast radius if one is compromised
- Forced password complexity rules (mandatory symbols, etc.) are now understood to push users toward predictable, crackable patterns; length is a stronger predictor of resistance to brute force

## Consequences
- Slightly more setup complexity than a minimal auth implementation (two secrets, rate limiter config, generic error mapping)
- Refresh-token-in-cookie approach requires CORS configured with `credentials: true` and careful `sameSite` tuning, revisited if a separate frontend domain is introduced later