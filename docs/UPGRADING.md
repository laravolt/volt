# Upgrading the Remix baseline

Notes for apps derived from Volt. Each entry lists what Volt changed and how it was checked.

## rc.2 → rc.4 (`remix@3.0.0-rc.4`)

- **Router context types.** Augment the type-only root module: `declare module 'remix' { interface RouterTypes { context: AppContext } }` in `app/router.ts`. Runtime imports stay on `remix/router`, `remix/cookie`, and the other `remix/*` subpaths. Without the augmentation `tsc` reports `services`, `render`, and `session` as missing on the request context.
- **HMR proxy.** `remix/fetch-proxy` (0.9.0) now returns upstream redirects by default. Through `npm run hmr`, `POST /register` answers `303 Location: /home` with the `Set-Cookie` header, so the browser sees the redirect and the session cookie. Do not pass `redirect: 'follow'`.
- **Sessions.** `remix/middleware/session` enforces the cookie `maxAge` before it loads session data. Cookies issued under rc.2 are not accepted (`GET /home` answers `303 /login`), so every signed-in user signs in once after the upgrade.
- **Raw HTML.** `innerHTML` and `srcDoc` in `remix/ui` need `unsafeHTML()` since rc.3. Neither Volt nor `volt-preline` uses them.
- **Cookies.** `Cookie.secure` is `undefined` when unconfigured. Volt sets `secure` explicitly, so nothing changes.
- **E2E teardown.** `test/actions/profile.test.e2e.ts` waits for network idle before the harness closes the database. Under rc.4 the runtime's follow-up GET after the 303 lands after the last assertion, and the late request logged `The database connection is not open`.

Checks: `npm run typecheck`, `npm run doctor`, `npm test` (server), `npx remix test --type e2e`.
