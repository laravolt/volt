# Volt

**A web-native application starter for Remix 3**, by the Laravolt team. Volt builds on the platform
the way Remix 3 intends: `Request`/`Response`, real `<form>`s that post without JavaScript, native
`<dialog>` and popovers, signed cookies, SQL migrations. On top of that it ships what every business
app needs on day one: auth, DB-backed sessions, CSRF, an admin shell, a component kit and a strict
Handler → Service → Repository architecture, so teams ship real systems quickly and consistently.

Baseline: **Remix `3.0.0-rc.1`** (pinned; not Remix v2 / React Router).
UI: **[volt-preline](https://github.com/laravolt/volt-preline)** (Preline UI 5, MIT) by default;
[volt-catalyst](http://100.121.236.127:3000/rama/volt-catalyst) (Tailwind Plus Catalyst) is a
drop-in upgrade for licensed teams.

## Quick start

```sh
bun install
cp .env.example .env         # SESSION_SECRET only required outside development
npm run migrate
npm run dev                  # http://localhost:5555
```

Register at `/register`; promote yourself with
`sqlite3 db/volt.sqlite "update users set is_admin=1 where email='you@example.com'"` and sign in
again to see the admin user table.

## What ships

| Area | Included |
| --- | --- |
| Authentication | Email/phone + password, registration, logout, password reset by email, optional Google login |
| Sessions | DB-backed (`sessions` table), signed cookie carries only the id, rotation on login, revoke-all on password reset |
| Security | CSRF on every `POST/PUT/PATCH/DELETE`, per-route rate limits, secure cookies in production |
| Admin | Dashboard shell (navbar, account menu, mobile drawer), user list with bulk delete + confirmation |
| Profile | Account details + change password forms with field-level validation |
| Data | SQLite via `better-sqlite3`, SQL migrations (`db/migrations`, `remix db` compatible), repositories own all SQL |
| UI | `volt-preline` components: forms, tables, dialogs, dropdowns, listbox/combobox, layouts; dark mode |
| Production | No bundler: on-demand compiled, minified, fingerprinted assets (`BUILD_ID`), gzip, Dockerfile |
| Tests | `remix test`: repositories, services, routes (CSRF pass/fail, session rotation, admin rules) |

## Architecture

```
Request → middleware (static, formData, session, csrf, auth, render)
        → Handler   app/actions/<area>/controller.tsx   (HTTP only)
        → Service   app/services/*                      (business rules, typed errors)
        → Repository app/repositories/*                 (the only SQL)
        → SQLite    db/migrations/*
```

Rules, session/CSRF model and the PR checklist: [ARCHITECTURE.md](./ARCHITECTURE.md).
Conventions for contributors and AI agents: [AGENTS.md](./AGENTS.md).

## UI kit

```tsx
import { Button } from 'volt-preline/button'
import { Field, Label } from 'volt-preline/fieldset'
import { Input } from 'volt-preline/input'
```

- Styling comes from Preline's semantic tokens (`bg-primary`, `bg-card`, `text-muted-foreground`, …);
  override the theme in `app/styles/app.css` after the kit import.
- Dark mode: `installDarkMode()` runs in `app/actions/public/entry.ts` and follows the OS or a
  saved choice (`setTheme('dark')`); it survives Remix frame navigations.
- Interactive components (dropdown, dialog, listbox, drawers) live inside `clientEntry` islands:
  `app/ui/public/app-shell.tsx`, `app/actions/app/public/users-table.tsx`.
- **Switch to Catalyst** (Tailwind Plus license required): add `volt-catalyst` as a dependency,
  replace `volt-preline/` with `volt-catalyst/` in imports and `app/styles/app.css`, and list it
  in `remix.json#assets.allowPackages`. The two packages share the same component API.

## Commands

| Command | Purpose |
| --- | --- |
| `npm run dev` / `npm run hmr` | dev server (Node `--watch`) / with browser+server HMR |
| `npm test` | `remix test` |
| `npm run typecheck` | `tsc --noEmit` |
| `npm run css` / `css:watch` | build `public/app.css` (Tailwind v4) |
| `npm run migrate` / `migrate:down` / `migrate:status` | migrations |
| `npm run routes` / `npm run doctor` | Remix CLI route table / convention check |
| `npm run start` | production (`NODE_ENV=production`, see below) |

## Production

No build step: the asset server compiles browser modules on demand and Node runs the TypeScript
source via `remix/node-tsx`.

```sh
export NODE_ENV=production SESSION_SECRET=$(openssl rand -hex 32) \
       APP_URL=https://app.example.com DATABASE_FILE=/data/volt.sqlite BUILD_ID=$(git rev-parse --short HEAD)
bun install && npm run migrate && npm run start
```

Set `BUILD_ID` per deploy for immutable fingerprinted asset URLs. Put a TLS proxy in front.
Container: `docker build --ssh default --build-arg BUILD_ID=$(git rev-parse --short HEAD) -t volt .`
(the SSH mount is needed while `volt-preline` is consumed from a private git remote).

> **npm note:** on machines with `minimum-release-age` in `~/.npmrc`, `remix@3.0.0-rc.1` may be
> hidden from npm for a week after release; `bun install` is unaffected.

## Roadmap

- Roles & permissions, audit trail, file uploads (S3/local), notifications and queues
- CRUD scaffolding (`volt make:resource`) on top of the layered architecture
- Public `volt-preline` release and a hosted demo

## Origin

Recreated from [`laravolt/laju`](https://github.com/laravolt/laju) on the Remix 3 baseline; planning
intent in [intent.md](./intent.md).
