# Velix — Agent Guide

Remix **3.0.0-rc.1** (web-standards Remix, not v2) + better-sqlite3 + Tailwind v4 + velix-preline.

## Commands
```sh
npm run dev | npm test | npm run typecheck | npm run migrate | npm run routes | npm run doctor
```
Install with `bun install` (npm on this machine blocks packages younger than 7 days).

## Non-negotiable rules (see ARCHITECTURE.md)
1. **Handler → Service → Repository → DB.** No layer may be skipped.
2. SQL only in `app/repositories/*`. Services never touch `Db`; handlers never touch repositories.
3. Auth identity comes from the session payload (`context.get(Auth)`), never a per-request users query.
4. Every state-changing route goes through the global `csrf()`; pages render `<CsrfField>`.
5. Session id rotates on login (`completeAuth(context)` then `setSessionUser`).
6. Schema changes are SQL migrations in `db/migrations/<ts>_<slug>/`; never edit applied ones.

## Where things go
- New URL → `app/routes.ts` first, then the owning `app/actions/<area>/controller.tsx`.
- Route-local page components live next to the controller (`pages.tsx`); shared UI in `app/ui/`.
- Services are reached via `context.services.<name>`; new services register in `app/services/index.ts`.
- Validation: `remix/data-schema` + `remix/data-schema/form-data`; helpers in `app/actions/shared.ts` (`str.required`, `parseForm`).
- Errors: services throw `DomainError`; handlers map with `toFieldErrors` or return JSON.
- Tests: `test/**/*.test.ts` using `test/helpers.ts` (`createTestApp`, `login`, `csrfFor`).

## UI components
- All pages use `velix-preline/*` (Preline UI tokens on Remix UI; git dep pinned by commit, MIT).
  `velix-catalyst/*` has the identical API for licensed teams. Props accept `className`; form
  controls read ids from `<Field>` context. Style with semantic tokens (`bg-card`, `text-muted-foreground`), not raw palette classes.
- Interactive Catalyst parts only hydrate inside a `clientEntry` island under a `public/` dir:
  `app/ui/public/app-shell.tsx` (StackedLayout + Navbar + account Dropdown + mobile drawer) and
  `app/actions/app/public/users-table.tsx` (Table + Checkbox + Alert confirm). Island props must be
  plain serializable objects typed with `type` aliases (interfaces fail `SerializableProps`).
- Auth pages share `app/ui/auth-card.tsx`; `app/ui/form.tsx` only holds `CsrfField`/`Notice`/types.
- Never pass `checked/value/open={undefined}` explicitly to host elements (rc.1 resets the DOM prop).
- After changing UI classes run `npm run css` (or keep `css:watch` running).

## Remix 3 reference
`.agents/skills/remix/SKILL.md` and `references/*.md` (shipped by `remix new`). Package READMEs:
`node_modules/@remix-run/<pkg>/README.md`.

## Gotchas
- JSX attributes are `className`/`htmlFor` (`jsxImportSource: remix/ui`). Components are
  `function X(handle: Handle<Props>) { return () => <.../> }`.
- `data-schema` checks take no message argument; use `.refine(pred, message)` (see `str` helpers).
- `app/router.ts` must stay side-effect free (tests import it); the real DB opens in `app/app.ts`.
- Tailwind output `public/app.css` is gitignored; `predev`/`prestart` rebuild it.
