# Frame Navigation, Islands, and Hydration

Volt is built on web-standards Remix 3 (`remix/ui`), where client-side navigation operates via DOM morphing (frame patches) rather than traditional full-page reloads.

## 1. Frame Navigation & Island Lifecycle

1. **Navigation is a DOM patch, not a page reload:**
   When following a same-origin link or submitting a form, Remix UI intercepts the request, fetches the server-rendered HTML via `fetch`, and diffs the incoming DOM against the current page.
2. **Matching islands remain alive:**
   A client-entry island (`clientEntry`) that matches across navigations stays alive and receives new props without remounting. If internal state was only initialized in the component setup, subsequent prop changes will not be reflected.
   - *Rule:* Always synchronize internal state from props (`syncFromProps`) or derive state during render.
3. **Identity-based keying with `data-rmx-key`:**
   Use `data-rmx-key` on major layout containers (`app-shell`, `app-main`, `app-header`) so the DOM patcher matches layout structures by key rather than DOM sibling index, preventing layout jumping or unnecessary island teardown.

## 2. Forms and Submit Lock Release

- `SubmitButton` enters a pending state upon the native `submit` event, locking duplicate clicks and marking the form `aria-busy="true"`.
- Because matching islands do not remount when an error response (e.g. 401 Unauthorized, 422 Unprocessable Entity) is patched into the frame, submit buttons must have a clear unlock path:
  - Watch for error banners using a `MutationObserver` on `[role="alert"]` or `[aria-invalid="true"]`.
  - Listen for form `input` events to release the lock immediately when the user begins editing.

## 3. Flicker-Free Theme Persistence

1. **The Theme Cookie (`volt-theme`):**
   Relying solely on `localStorage` causes theme flickering during frame navigation because server rendering defaults to light mode while the client hydrates dark mode.
2. **AsyncLocalStorage Integration:**
   `app/middleware/theme.ts` reads the `volt-theme` cookie via `AsyncLocalStorage`. The server renders `<html class="dark" data-theme="dark">` immediately in the initial HTML payload.
3. **CSS Color-Scheme:**
   `color-scheme` is controlled via CSS rules (`html { color-scheme: light; } html.dark { color-scheme: dark; }`) rather than inline styles, preventing the DOM patcher from stripping the attribute.
4. **Bootstrapping:**
   `app/actions/public/entry.ts` synchronizes the cookie from `localStorage` on initial page load, and the theme selector updates both `localStorage` and `document.cookie`.

## 4. Deterministic Hydration & E2E Testing

1. **The `<html data-hydrated>` Marker:**
   `app.ready()` in `app/actions/public/entry.ts` stamps `data-hydrated` onto `document.documentElement`. A `MutationObserver` ensures this marker is preserved when frame navigation overwrites `<html>` attributes.
2. **E2E Synchronization:**
   In Playwright tests, waiting for `networkidle` is insufficient because script execution may still be queued under heavy CPU load. Use `waitForHydration(page)` to ensure all island event listeners and mixins are attached before triggering clicks or form submissions.
