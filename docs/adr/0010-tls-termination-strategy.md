# 0010 — TLS termination happens at the infrastructure layer, not in Express

## Status
Accepted

## Context
The API needs to run over HTTPS in production (required for secure cookies, general transport security) but plain HTTP locally (no practical way to get a browser-trusted certificate for `localhost`, and no real threat model requiring it in local dev).

## Decision
Express itself only ever speaks plain HTTP. HTTPS is provided by the deployment platform's edge/load balancer (TLS termination), which decrypts incoming HTTPS and forwards plain HTTP internally to the app. `NODE_ENV` is used to toggle behavior that depends on the outward-facing protocol (e.g. the refresh token cookie's `secure` flag).

## Rationale
- Standard practice — TLS certificate management (issuance, renewal) is infrastructure's job, not application code's
- Keeps the app's own code identical across environments; only environment-dependent *behavior* (like the cookie flag) changes, not the transport layer itself
- Avoids the need to distribute/trust self-signed certificates for local development, which adds friction without adding real local security

## Consequences
- The app trusts that whatever sits in front of it in production is correctly configured to terminate TLS and only forward requests it received over HTTPS — this is an infrastructure/deployment responsibility, not something the app can verify on its own
- If a future deployment target doesn't provide TLS termination automatically, that becomes an explicit new piece of infrastructure work, not something silently assumed