# Velix

High-performance full-stack TypeScript framework, recreated from [`laravolt/laju`](https://github.com/laravolt/laju) with a stricter architecture model.

## Baseline (must follow)
Velix is pinned to **Remix `3.0.0-rc.1`** (exact version in `package.json`):
https://github.com/remix-run/remix/releases/tag/remix%403.0.0-rc.1

Remix 3 is the web-standards rewrite (`remix/router`, `remix/ui`, `remix/session`, …). It is **not**
Remix v2 / React Router; there are no loaders/actions or React. See [ARCHITECTURE.md](./ARCHITECTURE.md).

## Quick start

```sh
bun install            # or: npm install --before="$(date -u +%Y-%m-%dT%H:%M:%SZ)" (see note below)
cp .env.example .env   # set SESSION_SECRET for anything but local dev
npm run migrate        # applies db/migrations/* to ./db/velix.sqlite
npm run dev            # http://localhost:5555 (Tailwind is built by `predev`)
```

Other commands:

| Command | Purpose |
| --- | --- |
| `npm test` | `remix test` — repository, service and route tests (in-memory SQLite) |
| `npm run typecheck` | `tsc --noEmit` |
| `npm run css:watch` | rebuild `public/app.css` on change (run alongside `dev`) |
| `npm run hmr` | dev server with browser + server HMR |
| `npm run migrate:down` / `migrate:status` | rollback one step / show journal |
| `npm run routes` / `npm run doctor` | Remix CLI route table / convention check |

> **npm note:** `~/.npmrc` on this machine sets `minimum-release-age=10080`, which hides packages
> published in the last 7 days (including `remix@3.0.0-rc.1`). `bun install` is unaffected.

## Production

There is no bundling step. Remix 3's asset server compiles browser modules on demand (minified in
production) and Node runs the TypeScript source through `remix/node-tsx`.

```sh
export NODE_ENV=production SESSION_SECRET=$(openssl rand -hex 32) \
       APP_URL=https://app.example.com DATABASE_FILE=/data/velix.sqlite BUILD_ID=$(git rev-parse --short HEAD)
bun install            # or npm ci on a machine without the release-age gate
npm run migrate        # apply db/migrations
npm run start          # prestart builds public/app.css, then listens on $PORT (default 5555)
```

- `BUILD_ID` (any string that changes per deploy) turns on fingerprinted asset URLs served with
  `Cache-Control: immutable`; without it assets use stable URLs + ETag revalidation.
- `compression()` middleware is on by default; put a TLS-terminating proxy in front (Caddy/nginx).
- SQLite lives at `DATABASE_FILE`; back it up with `sqlite3 velix.sqlite ".backup out.sqlite"`.
- Container: `docker build --secret id=gitcredentials,src=$HOME/.git-credentials --build-arg BUILD_ID=$(git rev-parse --short HEAD) -t velix .`
  then `docker run -p 5555:5555 -v velix-data:/data -e SESSION_SECRET=... -e APP_URL=... velix`.
  The secret is needed because `velix-catalyst` is a private git dependency.

## Project layout

```
app/
  routes.ts                 typed route contract (server + browser hrefs)
  router.ts                 createAppRouter(): middleware stack + controller mapping
  app.ts                    production/dev instance (opens the SQLite file)
  actions/<area>/controller.tsx   Handler layer (Remix 3 controllers), route-local pages
  services/                 business logic (AuthService, UserService, mailer, errors)
  repositories/             the ONLY place with SQL (better-sqlite3)
  data/                     db connection + migration runner
  middleware/               session (DB-backed), auth, csrf, rate-limit, services, errors
  ui/                       shared Document/Layout/form primitives (Tailwind)
  styles/app.css            Tailwind v4 source -> public/app.css
db/migrations/              SQL migrations (<timestamp>_<slug>/up.sql, down.sql)
test/                       remix test suites + helpers
```

## Features (v1)
- Email/phone + password login, registration, logout (session id rotation on login)
- Password reset by email (Resend when `RESEND_API_KEY` is set, console otherwise)
- Optional Google login (`GOOGLE_CLIENT_ID`/`SECRET`) via `remix/auth`
- Profile update, password change; admin user list + bulk delete
- DB-backed sessions, CSRF on every POST/PUT/PATCH/DELETE, per-route rate limits
- Tailwind CSS v4 pipeline; UI components from the private `velix-catalyst` package (Catalyst UI Kit on Remix UI)

## UI kit (private)
`velix-catalyst` = Tailwind Plus **Catalyst** ported to Remix 3 UI, hosted privately at
`http://100.121.236.127:3000/rama/velix-catalyst` (Tailwind Plus license: never publish it).
It is a git dependency in `package.json`; `remix.json#assets.allowPackages` and `app/styles/app.css`
already reference it. Import e.g. `import { Button } from 'velix-catalyst/button'`.
See the login page (`app/actions/auth/pages.tsx`) for a full example.

## Architecture contract
Strict layering: **Handler → Service → Repository → SQLite**. Full rules, session/CSRF model and PR
checklist in [ARCHITECTURE.md](./ARCHITECTURE.md). Agent guidance in [AGENTS.md](./AGENTS.md).

## v1 non-goals
- Multi-DB abstraction, distributed session backends, plugin marketplace, non-Node runtimes

## Status
Scaffolded and passing tests (22). Planning intent: [intent.md](./intent.md).
