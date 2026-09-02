/**
 * Auth resolution from the session-cached identity. No users-table query per request
 * (ARCHITECTURE rule 3). Identity is refreshed on login/profile change.
 */
import { Auth, auth, createSessionAuthScheme, requireAuth } from 'remix/middleware/auth'
import type { Middleware } from 'remix/router'
import { redirect } from 'remix/response/redirect'
import { Session } from 'remix/session'

import { routes } from '../routes.ts'
import type { AuthUser } from '../services/auth.service.ts'

export const AUTH_SESSION_KEY = 'auth'

function isAuthUser(value: unknown): value is AuthUser {
  if (typeof value !== 'object' || value === null) return false
  let v = value as Record<string, unknown>
  return typeof v.id === 'string' && typeof v.email === 'string' && typeof v.is_admin === 'boolean'
}

export function loadAuth() {
  return auth({
    schemes: [
      createSessionAuthScheme<AuthUser, unknown>({
        read(session) {
          return session.get(AUTH_SESSION_KEY) ?? null
        },
        verify(value) {
          return isAuthUser(value) ? value : null
        },
        invalidate(session) {
          session.unset(AUTH_SESSION_KEY)
        },
      }),
    ],
  })
}

/** Redirects anonymous users to the login page. */
export function requireUser() {
  return requireAuth<AuthUser>({
    onFailure() {
      return redirect(routes.auth.loginPage.href(), 303)
    },
  })
}

/** Redirects authenticated users away from guest-only pages (login/register). */
export function requireGuest(): Middleware {
  return (context, next) => {
    let state = context.get(Auth)
    if (state?.ok) return redirect(routes.app.dashboard.href(), 303)
    return next()
  }
}

/** Requires an admin identity. Run after requireUser(). */
export function requireAdmin(): Middleware {
  return (context, next) => {
    let state = context.get(Auth)
    if (!state?.ok || !(state.identity as AuthUser).is_admin) {
      return new Response('Forbidden: admin access required', { status: 403 })
    }
    return next()
  }
}

/** Write the identity into the session (after login or profile update). */
export function setSessionUser(session: Session, user: AuthUser) {
  session.set(AUTH_SESSION_KEY, user)
}
