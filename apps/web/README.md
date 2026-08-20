# EventRent — Web

The frontend for EventRent, a two-sided marketplace for renting party/event equipment. Talks to the API in [`apps/api`](../api) over REST and WebSocket.

## Tech stack

- **React 19 + TypeScript**, built with **Vite**
- Talks to the API via REST (JWT access token in the `Authorization` header, refresh token in an httpOnly cookie) and **socket.io** for real-time messaging


## Getting started

The API (`apps/api`) needs to be running first — see its README for setup (Postgres via Docker, `.env`, migrations). Its default `CORS_ORIGIN`/`FRONTEND_URL` already point at this app's dev port (`5173`), so no config changes are needed on that side for local development.

From the repo root (this is a pnpm workspace):

```bash
pnpm install          # installs the whole workspace, including this app
pnpm dev:web           # starts this app's dev server
```

Or from within `apps/web` directly:

```bash
pnpm dev               # vite dev server, http://localhost:5173
pnpm build              # type-check + production build
pnpm preview            # preview the production build locally
```

## Structure

Currently just the default Vite scaffold (`src/App.tsx`, `src/main.tsx`). Real structure — routing, API client, component organization — gets established as the first real screens land.
