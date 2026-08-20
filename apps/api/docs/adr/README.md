# Architecture Decision Records

Each ADR captures one real decision: the context that forced it, what we chose, and the tradeoffs accepted. Format follows the standard Nygard ADR template.

| # | Decision | Status |
|---|---|---|
| [0001](./0001-backend-framework.md) | Node.js + Express + TypeScript over Spring Boot for v1 | Accepted |
| [0002](./0002-database-choice.md) | PostgreSQL over MySQL | Accepted |
| [0003](./0003-orm-choice.md) | Prisma ORM, with a documented gap on row locking | Accepted |
| [0004](./0004-business-verification-gating.md) | Business listings gated behind admin approval | Accepted |
| [0005](./0005-inventory-model.md) | Quantity-based stock instead of whole-set-only | Accepted |
| [0006](./0006-deposit-release-model.md) | Owner-confirms + auto-release-timer for deposits | Accepted |
| [0007](./0007-unified-auth-identity-model.md) | Unified user + auth_identities model for multi-method login | Accepted |
| [0008](./0008-auth-security-posture.md) | Auth security posture: hashing, tokens, rate limiting, enumeration protection | Accepted |
| [0009](./0009-refresh-token-rotation-gap.md) | Refresh token rotation without invalidation (known v1 gap) | Accepted (documented limitation) |