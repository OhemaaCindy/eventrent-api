# 0013 — Serialization conflict detection: Prisma 7's actual error shape differs from documented P2034

## Status
Accepted

## Context
ADR-0002 and ADR-0003 anticipated needing to catch Postgres serialization failures (SQLSTATE 40001) under concurrent booking load, assumed to surface as Prisma's documented `PrismaClientKnownRequestError` with code `P2034`. Live testing (deliberately triggering two simultaneous booking requests against a single-unit listing) revealed this assumption was wrong for this project's actual stack.

## Decision
Detect serialization conflicts by checking for `DriverAdapterError` with `cause.originalCode === "40001"` or `cause.kind === "TransactionWriteConflict"`, not `P2034`.

## Rationale
Prisma 7's driver-adapter architecture (using `@prisma/adapter-pg` directly, per ADR-0003) surfaces the underlying Postgres error differently than Prisma's client-engine error codes in earlier versions. The actual error observed in testing:
```
DriverAdapterError: TransactionWriteConflict
cause: { originalCode: '40001', originalMessage: 'could not serialize access...', kind: 'TransactionWriteConflict' }
```
This was only discovered by actually triggering the race condition in a live test — the mismatch between documented/assumed behavior and actual behavior would not have been caught by code review or type-checking alone, since both error shapes are structurally valid TypeScript.

## Consequences
- Confirms the value of the actual concurrent-request test performed (two parallel curl requests against a single-stock listing) over relying on documentation/assumption alone
- Serves as a concrete example of a broader pattern hit repeatedly while building on Prisma 7 + Zod 4 + TypeScript 7 (config relocations, module resolution changes) — current major versions frequently diverge from widely-available tutorial/documentation knowledge, and behavior should be verified empirically where it matters
- If Prisma changes this error shape again in a future version, this detection will need re-verification the same way — it is not guaranteed stable across major versions