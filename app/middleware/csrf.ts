/**
 * CSRF: session-backed synchronizer token for all POST/PUT/PATCH/DELETE routes.
 * Tokens travel in the `_csrf` form field or `X-Csrf-Token` header.
 */
import { csrf as remixCsrf } from 'remix/middleware/csrf'

export { getCsrfToken } from 'remix/middleware/csrf'

export function csrf() {
  return remixCsrf({
    onError(reason) {
      return Response.json(
        { success: false, error: { code: 'CSRF_INVALID', message: `Invalid CSRF token (${reason})` } },
        { status: 403 },
      )
    },
  })
}
