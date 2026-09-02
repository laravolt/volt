/**
 * Auth handlers: login, register, logout, Google OAuth.
 */
import { createController } from 'remix/router'
import { completeAuth, createGoogleAuthProvider, finishExternalAuth, startExternalAuth } from 'remix/auth'
import * as f from 'remix/data-schema/form-data'
import { redirect } from 'remix/response/redirect'
import { Session } from 'remix/session'

import { config } from '../../config.ts'
import { requireGuest, setSessionUser } from '../../middleware/auth.ts'
import { getCsrfToken } from '../../middleware/csrf.ts'
import { rateLimit } from '../../middleware/rate-limit.ts'
import { routes } from '../../routes.ts'
import { formValues, parseForm, readFlash, str, toFieldErrors } from '../shared.ts'
import { LoginPage, RegisterPage } from './pages.tsx'

const loginSchema = f.object({
  identifier: f.field(str.required('Email or phone is required')),
  password: f.field(str.required('Password is required')),
})

const registerSchema = f.object({
  name: f.field(str.required('Name is required')),
  email: f.field(str.email('Invalid email')),
  password: f.field(str.min(6, 'Password must be at least 6 characters')),
})

const googleEnabled = Boolean(config.google.clientId && config.google.clientSecret)
const googleProvider = googleEnabled
  ? createGoogleAuthProvider({
      clientId: config.google.clientId,
      clientSecret: config.google.clientSecret,
      redirectUri: new URL(routes.auth.googleCallback.href(), config.appUrl),
    })
  : null

const WINDOW = 15 * 60 * 1000

export default function authController(rateLimits: boolean) {
  let loginLimit = rateLimits ? [rateLimit({ name: 'login', windowMs: WINDOW, max: 10 })] : []
  let registerLimit = rateLimits ? [rateLimit({ name: 'register', windowMs: WINDOW, max: 5 })] : []

  return createController(routes.auth, {
    actions: {
      loginPage: {
        middleware: [requireGuest()],
        handler(context) {
          return context.render(
            <LoginPage csrfToken={getCsrfToken(context)} flash={readFlash(context.session)} googleEnabled={googleEnabled} />,
          )
        },
      },

      login: {
        middleware: [requireGuest(), ...loginLimit],
        async handler(context) {
          let formData = context.get(FormData)
          let csrfToken = getCsrfToken(context)
          let values = formValues(formData, ['identifier'])
          let parsed = parseForm(loginSchema, formData)
          if (!parsed.ok) {
            return context.render(<LoginPage csrfToken={csrfToken} errors={parsed.errors} values={values} googleEnabled={googleEnabled} />, { status: 422 })
          }
          try {
            let user = await context.services.auth.login(parsed.value)
            let session = completeAuth(context) // rotates session id
            setSessionUser(session, user)
            return redirect(routes.app.dashboard.href(), 303)
          } catch (error) {
            return context.render(
              <LoginPage csrfToken={csrfToken} errors={toFieldErrors(error)} values={values} googleEnabled={googleEnabled} />,
              { status: 401 },
            )
          }
        },
      },

      registerPage: {
        middleware: [requireGuest()],
        handler(context) {
          return context.render(<RegisterPage csrfToken={getCsrfToken(context)} flash={readFlash(context.session)} />)
        },
      },

      register: {
        middleware: [requireGuest(), ...registerLimit],
        async handler(context) {
          let formData = context.get(FormData)
          let csrfToken = getCsrfToken(context)
          let values = formValues(formData, ['name', 'email'])
          let parsed = parseForm(registerSchema, formData)
          if (!parsed.ok) {
            return context.render(<RegisterPage csrfToken={csrfToken} errors={parsed.errors} values={values} />, { status: 422 })
          }
          try {
            let user = await context.services.auth.register(parsed.value)
            let session = completeAuth(context)
            setSessionUser(session, user)
            return redirect(routes.app.dashboard.href(), 303)
          } catch (error) {
            return context.render(<RegisterPage csrfToken={csrfToken} errors={toFieldErrors(error)} values={values} />, { status: 409 })
          }
        },
      },

      logout(context) {
        let session = context.get(Session)
        session.destroy()
        return redirect(routes.auth.loginPage.href(), 303)
      },

      async googleRedirect(context) {
        if (!googleProvider) return new Response('Google login is not configured', { status: 404 })
        return startExternalAuth(googleProvider, context)
      },

      async googleCallback(context) {
        if (!googleProvider) return new Response('Google login is not configured', { status: 404 })
        let { result } = await finishExternalAuth(googleProvider, context)
        if (!result.profile.email) {
          context.session.flash('error', 'Google account has no email address')
          return redirect(routes.auth.loginPage.href(), 303)
        }
        let user = await context.services.auth.loginExternal({
          email: result.profile.email,
          name: result.profile.name ?? null,
          avatar: result.profile.picture ?? null,
          emailVerified: result.profile.email_verified ?? false,
        })
        let session = completeAuth(context)
        setSessionUser(session, user)
        return redirect(routes.app.dashboard.href(), 303)
      },
    },
  })
}
