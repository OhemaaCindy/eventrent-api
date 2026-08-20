# 0001 — Backend framework: Node.js + Express + TypeScript over Spring Boot

## Status
Accepted

## Context
This project's underlying goal is to build transferable backend skills across frameworks (Java/Spring Boot, Node/Express). The product itself — a marketplace with quantity-based inventory, concurrency-sensitive booking, marketplace payments, and a deposit/dispute workflow — is non-trivial regardless of framework choice.

The question: build v1 in Spring Boot (the framework we most want to grow in) or Express (closer to existing frontend/JS comfort)?

## Decision
Build v1 in Node.js + Express + TypeScript.

## Rationale
Learning a complex, unfamiliar domain (marketplace payments, escrow-style deposit holds, booking concurrency) and a new framework/language simultaneously compounds unfamiliarity — it becomes hard to tell whether a mistake is a domain-modeling error or a framework misunderstanding. Building in a comfortable language isolates the domain-modeling learning first.

Porting this same, already-proven backend to Spring Boot is the planned next exercise — at that point it becomes a focused framework-translation exercise (a known, good design translated into new syntax/idioms), which directly serves the original "any framework, not stuck" goal.

## Consequences
- v1 does not build direct Spring Boot experience — that is deferred to a follow-up port
- TypeScript is used to keep production-standard type safety, partially closing the gap with Java's static typing
- The ER diagram, API design, and business logic are framework-agnostic by construction, making the later Spring Boot port straightforward