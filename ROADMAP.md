# Volt roadmap

Volt is a web-native application starter for Remix 3 by the Laravolt team. This roadmap orders the
work from where we are (v0.3.0, 2026-09-02) to a public 1.0 that teams can build business systems on.
Dates are targets, not promises; each phase ships behind a tag and a release note.

## Where we are (v0.3.0)

- Remix `3.0.0-rc.1` baseline, Handler → Service → Repository → SQLite, SQL migrations.
- Auth (password, reset, optional Google), DB-backed sessions with rotation, CSRF, rate limits.
- Admin shell, profile, admin user table; `volt-preline` (npm, MIT) as default UI kit,
  `volt-catalyst` (private) as licensed drop-in with the same API.
- 22 app tests, 50 kit tests, CI + npm release workflow for the kit.

## Phase 1 — Volt design system in Figma (Sep 2026)

Goal: a visual identity that is Volt's own, built on the Preline UI Figma community file so the
design tokens map 1:1 to `preline/theme.css` and therefore to `volt-preline`.

1. Duplicate the community file into the Laravolt team as **"Volt Design System"**. Keep the
   component pages we ship (Buttons, Badge/Tags, Input, Links, Lists, Brands & Avatars, Tooltips,
   Icon Collection); park the ones we do not (Datepicker, WYSIWYG, Stepper, Flags) in an "Inbox" page.
2. Define Volt tokens as Figma variables in one collection with **Light** and **Dark** modes:
   `background`, `foreground`, `primary`, `secondary`, `destructive`, `muted`, `card`, `layer`,
   `sidebar`, `navbar`, `dropdown`, `select`, `overlay`, `border`; radius and spacing scales;
   type scale (Inter). Names must equal the `--color-*` names in `preline/theme.css` so export is
   mechanical.
3. Brand: wordmark, mark, primary hue, favicon; one motion rule (durations 100/200/300 ms).
4. Screens (desktop + 390 px mobile, light + dark): sign in, register, forgot/reset password,
   dashboard (empty + populated), users table (selection, confirm delete), profile/settings,
   404/500. Include loading, empty, error and validation states.
5. Component sheet covering the 28 `volt-preline` components with every variant used in the app.
6. Handoff: export variables → `app/styles/theme.css` override in Volt; use the Figma MCP
   (`get_design_context`) to reconcile component classes in `volt-preline`; screenshot diff of the
   six screens against Figma is the acceptance test.

Deliverable: Figma file + `theme.css` PR + release `volt-preline@0.2.0`, `volt@0.4.0`.

## Phase 2 — Foundation hardening (Oct 2026)

- App E2E with Playwright (login/logout, protected routes, CSRF fail, admin delete) in CI for `laravolt/volt`.
- `create-volt` scaffolder (`npm create volt@latest`) with prompts: app name, UI kit (preline/catalyst),
  Google login on/off; generates `.env`, runs migrations.
- Docs site (Getting started, Core concepts, UI components, Forms & validation, Security, Deployment,
  Reference) published from the repo; every component page links to the playground.
- Observability: request logging with ids, error page with reference id, health endpoint.
- Track Remix 3 releases; move to the first stable tag the week it lands and drop rc-specific notes.

Deliverable: `volt@0.5.0`, docs site live, `create-volt@0.1.0`.

## Phase 3 — Platform modules (Nov 2026 – Feb 2027)

Each module follows the same shape: migration, repository, service, controller, UI, tests, docs.

| Order | Module | Scope |
| --- | --- | --- |
| 1 | Roles & permissions | roles table, permission checks in services, `requirePermission()` middleware, admin UI |
| 2 | Tables & listings | server-driven sort/filter/search/pagination helpers, reusable `DataTable` on `volt-preline` |
| 3 | CRUD scaffolding | `volt make:resource <name>` generating the full layered stack + tests |
| 4 | File uploads | `remix/file-storage` (local, S3), image processing, attachment model |
| 5 | Audit trail | who changed what, viewable per record and globally |
| 6 | Notifications & queues | in-app + email notifications, SQLite-backed job queue with retries |
| 7 | Settings & feature flags | app settings table with typed access, admin editor |
| 8 | Workflows | approval flows with states, actions and audit; the Laravolt differentiator |

Deliverable: one minor release per module (`0.6` … `0.13`).

## Phase 4 — 1.0 and ecosystem (Q1 2027)

- Public launch when Remix 3 is stable: hosted demo, announcement post ("Catalyst and Preline on
  Remix UI, no React"), Remix Discord and X.
- `volt-catalyst` distributed to licensed teams via private registry; API parity test suite runs
  against both kits.
- Multi-tenancy and Postgres adapter evaluated for 1.x based on demand (SQLite stays the default).

## Principles

- Web-native first: real forms, native `<dialog>`, cookies, HTTP semantics; JavaScript enhances.
- Strict layering is enforced by tests and review, never bypassed for speed.
- One component API, two skins: Preline (free) and Catalyst (licensed).
- Every feature ships with migration, tests, and a docs page in the same PR.

## Risks

- Remix 3 rc API churn: pin exact versions, upgrade in a dedicated PR with the full test suite.
- Preline theme changes: `theme.css` is vendored at a pinned `preline` version; upgrades are reviewed
  against the Figma tokens.
- Tailwind Plus license: `volt-catalyst` never enters a public repo or registry.
