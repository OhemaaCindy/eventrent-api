# 0009 — Refresh token rotation without invalidation (known v1 gap)

## Status
Accepted (with documented limitation)

## Context
`/auth/refresh` issues a new refresh token on every use, which is good practice ("rotation-in-spirit" — an attacker sniffing one request's cookie doesn't get a token that's still being actively used by the legitimate client going forward). However, JWTs are stateless by design: a signed token remains valid until its own expiry, regardless of whether a newer token has since been issued for the same user.

This means: **a stolen refresh token remains fully valid for up to 7 days**, even after the legitimate user's client has since rotated to a newer token. There is currently no mechanism to detect or block reuse of an old, superseded token.

## Decision
Ship v1 with issuance-only rotation (new token every refresh), explicitly without reuse detection or server-side invalidation. Document the gap here rather than silently accept it or overstate the protection it provides.

## Rationale
- True invalidation requires a server-side token store (e.g. a `RefreshToken` table tracking issued token IDs, used/superseded status, and revocation), which is a real, scoped piece of work — not a quick addition
- v1's priority is a working, honestly-scoped auth system over an incomplete attempt at full token-family reuse detection
- The httpOnly cookie storage (ADR-0008) already meaningfully reduces the most common theft vector (XSS exfiltration); this gap specifically concerns theft via other means (e.g. a compromised network, physical device access, server log leakage)

## Consequences
- **Known limitation:** a stolen refresh token is valid for its full remaining lifetime (up to 7 days), even after rotation
- **v2 fix (tracked):** introduce a `RefreshToken` table storing token ID, userId, issuedAt, supersededAt/revokedAt. On each refresh: verify the token ID hasn't been superseded or revoked; if it has, treat as a reuse-attack signal and revoke the entire token family (force re-login) rather than just rejecting the one request
- Until that's built, this should not be described as "full rotation" in any documentation or portfolio explanation — it is issuance rotation only