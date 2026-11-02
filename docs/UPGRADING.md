# Upgrading the Remix baseline

Notes for apps derived from Volt. Each entry lists what Volt changed and how it was checked.

## rc.4 → 3.1.0 (`remix@3.1.0`)

- **`remix/ui` is now `remix/component`.** Import the runtime from `remix/component` and server rendering from `remix/component/server`, and set `"jsxImportSource": "remix/component"` in `tsconfig.json`. For HMR, `remix/ui-hmr/assets` (`uiHmr()`) becomes `remix/component-hmr/assets` (`componentHmr()`), and `hmr.ts` loads `--import remix/component-hmr/node`. The styled components and UI primitives left the `remix` package; Volt only uses them through `volt-preline`, which imports the primitives from `@remix-run/ui`.
- **volt-preline 0.3.0** (`remix/component`, `@remix-run/ui` 0.13.0, peer `remix ^3.1.0`). `remix.json` adds `@remix-run/component` and `@remix-run/ui` to `assets.allowPackages`: the asset server only serves browser modules from listed packages, and volt-preline's components import both.
- **Patched `@remix-run/component` 1.1.0** (`patches/`, applied by `bun install`). When a client entry's props hold JSX, as `AppShell`'s `children` holds the page, the server serializes them by rendering each component inside. 3.1 also serializes content inside fragments, which 3.0 skipped. During that pass a component was not registered as the parent of what it renders, so a component that reads an ancestor's context (`handle.context.get`) got `undefined`. Rendering the dashboard for an admin threw `Cannot read properties of undefined (reading 'titleId')` from the users table's `AlertTitle`. The patch sets the parent during serialization, as normal server rendering does. When a Remix release fixes this, remove `patchedDependencies` from `package.json` and the patch file, then run the tests: the admin dashboard test in `test/actions/profile.test.ts` fails without the fix.
- **Agent skill.** `.agents/skills/remix/SKILL.md` is the 3.1 template: it points at the installed version's `node_modules/remix/INDEX.md` and `node_modules/remix/guides/`. The rc.4 `references/` described `remix/ui` and are removed.
- **CI** runs `npm run doctor` and the E2E suite (Chromium) on every pull request.

Checks: `npm run typecheck`, `npm run doctor`, `npm test` (server), `npx remix test --type e2e`.

## rc.2 → rc.4 (`remix@3.0.0-rc.4`)

- **Router context types.** Augment the type-only root module: `declare module 'remix' { interface RouterTypes { context: AppContext } }` in `app/router.ts`. Runtime imports stay on `remix/router`, `remix/cookie`, and the other `remix/*` subpaths. Without the augmentation `tsc` reports `services`, `render`, and `session` as missing on the request context.
- **HMR proxy.** `remix/fetch-proxy` (0.9.0) now returns upstream redirects by default. Through `npm run hmr`, `POST /register` answers `303 Location: /home` with the `Set-Cookie` header, so the browser sees the redirect and the session cookie. Do not pass `redirect: 'follow'`.
- **Sessions.** `remix/middleware/session` enforces the cookie `maxAge` before it loads session data. Cookies issued under rc.2 are not accepted (`GET /home` answers `303 /login`), so every signed-in user signs in once after the upgrade.
- **Raw HTML.** `innerHTML` and `srcDoc` in `remix/ui` need `unsafeHTML()` since rc.3. Neither Volt nor `volt-preline` uses them.
- **Cookies.** `Cookie.secure` is `undefined` when unconfigured. Volt sets `secure` explicitly, so nothing changes.
- **E2E teardown.** `test/actions/profile.test.e2e.ts` waits for network idle before the harness closes the database. Under rc.4 the runtime's follow-up GET after the 303 lands after the last assertion, and the late request logged `The database connection is not open`.

Checks: `npm run typecheck`, `npm run doctor`, `npm test` (server), `npx remix test --type e2e`.
