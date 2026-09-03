# Volt Architecture

## Baseline decision
Framework baseline is pinned to **Remix `3.0.0-rc.1`**:  
https://github.com/remix-run/remix/releases/tag/remix%403.0.0-rc.1

This is a hard decision to avoid accidental fallback to Remix stable v2.

---

## 1) System model

```text
Request
  -> Router middleware (static, formData, session, csrf, auth, render)
  -> Handler (Remix 3 controller action in app/actions/*)
  -> Service (app/services/*)
  -> Repository (app/repositories/*)
  -> SQLite (better-sqlite3, db/migrations/*)
```

> Remix 3 has no loaders/actions in the v2 sense. The **Handler layer is the controller action**
> registered via `createController(routes.<area>, { actions })` in `app/actions/<area>/controller.tsx`.
> Services are injected via request context (`context.services`), never imported as singletons.

---

## 2) Layer responsibilities

## Handler layer (`app/actions/*`)
**Does:**
- Parse request input (params/query/form/body)
- Resolve auth/session context
- Call service methods
- Return HTTP responses (`context.render(<Page/>)`, `redirect()`, `Response.json()`)

**Does not:**
- Execute SQL
- Hold core business rules
- Orchestrate persistence directly

## Service layer (`app/services/*`)
**Does:**
- Business rules and use-case orchestration
- Authorization decisions (domain-level)
- Error signaling with typed/domain errors

**Does not:**
- Access raw HTTP primitives as core dependency
- Execute SQL directly
- Render UI

## Repository layer (`app/repositories/*`)
**Does:**
- Own all SQL
- Map DB rows ↔ typed domain objects
- Provide persistence-focused methods

**Does not:**
- Implement business policy
- Handle cookies/session/http response behavior

## Storage layer (`db/migrations/*`, SQLite)
**Does:**
- Schema evolution via migrations
- Constraints and indexing

**Rules:**
- Migration-driven schema changes only
- One migration directory per table/concern: `db/migrations/<YYYYMMDDHHmmss>_<slug>/{up,down}.sql`
- Run with `npm run migrate` (or `remix db migrate`); both share the `volt_migrations` journal

---

## 3) Non-negotiable rules

1. No SQL outside repository layer.  
2. No business logic in handler layer.  
3. Auth middleware/helper should rely on session payload cache when sufficient (no unnecessary per-request `users` table fetch).  
4. All state-changing routes must pass CSRF validation.  
5. Session ID rotates on successful login.
6. Error pages/responses must return HTML (`text/html`) so the custom `resolveFrame` renders the error state into the active frame regardless of HTTP status (401, 422, 429). Non-HTML errors trigger a visible user notice.

---

## 4) Session and auth model

- Session storage is DB-backed (`sessions` table) via `createDbSessionStorage()` in `app/middleware/session.ts`.
- The signed `volt_session` cookie carries only the session id; payload lives in `sessions.data`.
- Auth context (`AuthUser`: id, name, email, avatar, is_admin, is_verified) is cached in the session
  payload under key `auth` and resolved by `remix/middleware/auth` with a session scheme that does
  **no** DB lookup. `sessions.user_id` mirrors it so all sessions of a user can be revoked.
- Login/register/reset call `completeAuth(context)` which rotates the session id and deletes the old row.
- Logout calls `session.destroy()` which deletes the row and clears the cookie.
- Password reset revokes every session of the user.

Constraint alignment:
- No unnecessary sensitive data added to portal/session payload.
- Existing authentication flow is reused and hardened.

---

## 5) CSRF policy

Required for:
- `POST`
- `PUT`
- `PATCH`
- `DELETE`

Implementation: `remix/middleware/csrf` (synchronizer token stored in the session) installed
globally in `app/router.ts` after `session()`.

Flow:
1. `getCsrfToken(context)` creates/reads the token bound to the session.
2. Pages render it as `<input type="hidden" name="_csrf">` (`CsrfField`); JSON clients send `X-Csrf-Token`.
3. Middleware validates token + Origin/Referer before any action runs.
4. Invalid/missing token → `403 { error: { code: "CSRF_INVALID" } }`.

---

## 6) Error handling

Services throw `DomainError` (`app/services/errors.ts`); handlers map them to form errors
(`toFieldErrors`) or JSON, and `domainErrors()` middleware is the last-resort mapper:

- Unauthorized → 401/403
- Validation error → 400/422
- Not found → 404
- Conflict → 409

No raw DB errors should leak directly to end users.

---

## 7) Testing contract

Runner: `remix test` (`remix/test` + `remix/assert`), files in `test/**/*.test.ts`.
`test/helpers.ts` builds an in-memory SQLite DB, runs migrations and creates an isolated router.

Minimum v1 coverage (implemented):
- Repository tests (real SQLite in-memory DB) — `test/repositories`
- Service tests (business logic and auth decisions) — `test/services`
- Route tests via `router.fetch()` (login/logout, session rotation, protected routes, profile/admin
  CRUD, CSRF pass/fail) — `test/actions`
- Browser E2E (Playwright via `remix test --type e2e`) is wired but has no specs yet.

---

## 8) PR acceptance checklist (architecture gate)

A PR is architecture-compliant only if all pass:

- [ ] Remix baseline remains `3.0.0-rc.1` aligned (`package.json` pins the exact version)
- [ ] No SQL outside `app/repositories/*`
- [ ] No business rules in `app/actions/*`
- [ ] Session rotation behavior preserved on login
- [ ] CSRF enforced on state-changing routes
- [ ] Migration added for schema changes
- [ ] Relevant tests included/updated
