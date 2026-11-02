# Upgrading the Remix baseline

Notes for apps derived from Volt. Each entry lists what Volt changed and how it was checked.

## rc.4 → 3.1.0 (`remix@3.1.0`)

- **`remix/ui` is now `remix/component`.** Import the runtime from `remix/component` and server rendering from `remix/component/server`, and set `"jsxImportSource": "remix/component"` in `tsconfig.json`. For HMR, `remix/ui-hmr/assets` (`uiHmr()`) becomes `remix/component-hmr/assets` (`componentHmr()`), and `hmr.ts` loads `--import remix/component-hmr/node`. The styled components and UI primitives left the `remix` package; Volt only uses them through `volt-preline`, which imports the primitives from `@remix-run/ui`.
- **volt-preline 0.3.0** (`remix/component`, `@remix-run/ui` 0.13.0, peer `remix ^3.1.0`). `remix.json` adds `@remix-run/component` and `@remix-run/ui` to `assets.allowPackages`: the asset server only serves browser modules from listed packages, and volt-preline's components import both.
- **The page is no longer passed through a client entry.** `AppShell` was a client entry that took the whole page as `children`. Remix serializes JSX in client-entry props by rendering it, and 3.1 also serializes content inside fragments, which 3.0 skipped. That broke the admin dashboard twice. On the server, components inside those props cannot read an ancestor's context, so the users table's `AlertTitle` threw `Cannot read properties of undefined (reading 'titleId')`. In the browser, `on()`/`ref()` mixins cannot be serialized; Remix 3.1 only supports `css()` there, and pages with a toast never finished hydrating. `AppShell` (`app/ui/app-shell.tsx`) is now a server component built from volt-preline's `StackedLayoutRoot` and `StackedLayoutContent`. Only `AppShellChrome` (`app/ui/public/app-shell.tsx`: header, account menu, mobile drawer) is a client entry. Derived apps that copied the old shell should make the same split: keep page content, forms and other islands out of any client entry's props.
- **Agent skill.** `.agents/skills/remix/SKILL.md` is the 3.1 template: it points at the installed version's `node_modules/remix/INDEX.md` and `node_modules/remix/guides/`. The rc.4 `references/` described `remix/ui` and are removed.
- **CI** runs `npm run doctor`, the E2E suite (Chromium) and an image build with a production smoke test on every pull request.

Checks: `npm run typecheck`, `npm run doctor`, `npm test` (server), `npx remix test --type e2e`.

## rc.2 → rc.4 (`remix@3.0.0-rc.4`)

- **Router context types.** Augment the type-only root module: `declare module 'remix' { interface RouterTypes { context: AppContext } }` in `app/router.ts`. Runtime imports stay on `remix/router`, `remix/cookie`, and the other `remix/*` subpaths. Without the augmentation `tsc` reports `services`, `render`, and `session` as missing on the request context.
- **HMR proxy.** `remix/fetch-proxy` (0.9.0) now returns upstream redirects by default. Through `npm run hmr`, `POST /register` answers `303 Location: /home` with the `Set-Cookie` header, so the browser sees the redirect and the session cookie. Do not pass `redirect: 'follow'`.
- **Sessions.** `remix/middleware/session` enforces the cookie `maxAge` before it loads session data. Cookies issued under rc.2 are not accepted (`GET /home` answers `303 /login`), so every signed-in user signs in once after the upgrade.
- **Raw HTML.** `innerHTML` and `srcDoc` in `remix/ui` need `unsafeHTML()` since rc.3. Neither Volt nor `volt-preline` uses them.
- **Cookies.** `Cookie.secure` is `undefined` when unconfigured. Volt sets `secure` explicitly, so nothing changes.
- **E2E teardown.** `test/actions/profile.test.e2e.ts` waits for network idle before the harness closes the database. Under rc.4 the runtime's follow-up GET after the 303 lands after the last assertion, and the late request logged `The database connection is not open`.

Checks: `npm run typecheck`, `npm run doctor`, `npm test` (server), `npx remix test --type e2e`.
