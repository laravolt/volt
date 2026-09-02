/**
 * Password reset handlers.
 */
import { createController } from 'remix/router'
import { completeAuth } from 'remix/auth'
import * as f from 'remix/data-schema/form-data'
import { redirect } from 'remix/response/redirect'

import { setSessionUser } from '../../middleware/auth.ts'
import { getCsrfToken } from '../../middleware/csrf.ts'
import { rateLimit } from '../../middleware/rate-limit.ts'
import { routes } from '../../routes.ts'
import { DomainError } from '../../services/errors.ts'
import { formValues, parseForm, readFlash, str, toFieldErrors } from '../shared.ts'
import { ForgotPasswordPage, ResetPasswordPage } from './pages.tsx'

const forgotSchema = f.object({
  identifier: f.field(str.required('Email or phone is required')),
})

const resetSchema = f.object({
  token: f.field(str.required('Invalid token')),
  password: f.field(str.min(6, 'Password must be at least 6 characters')),
})

export default function passwordController(rateLimits: boolean) {
  let forgotLimit = rateLimits
    ? [rateLimit({ name: 'forgot-password', windowMs: 60 * 60 * 1000, max: 5 })]
    : []

  return createController(routes.password, {
    actions: {
      forgotPage(context) {
        return context.render(<ForgotPasswordPage csrfToken={getCsrfToken(context)} flash={readFlash(context.session)} />)
      },

      forgot: {
        middleware: forgotLimit,
        async handler(context) {
          let formData = context.get(FormData)
          let parsed = parseForm(forgotSchema, formData)
          if (!parsed.ok) {
            return context.render(
              <ForgotPasswordPage csrfToken={getCsrfToken(context)} errors={parsed.errors} values={formValues(formData, ['identifier'])} />,
              { status: 422 },
            )
          }
          await context.services.auth.requestPasswordReset(parsed.value.identifier)
          // Same message whether or not the account exists (no enumeration).
          context.session.flash('success', 'If that account exists, a reset link has been sent.')
          return redirect(routes.password.forgotPage.href(), 303)
        },
      },

      resetPage(context) {
        let token = context.params.token
        try {
          context.services.auth.validateResetToken(token)
        } catch (error) {
          if (error instanceof DomainError) return new Response(error.message, { status: 404 })
          throw error
        }
        return context.render(<ResetPasswordPage csrfToken={getCsrfToken(context)} token={token} />)
      },

      async reset(context) {
        let formData = context.get(FormData)
        let csrfToken = getCsrfToken(context)
        let token = String(formData.get('token') ?? '')
        let parsed = parseForm(resetSchema, formData)
        if (!parsed.ok) {
          return context.render(<ResetPasswordPage csrfToken={csrfToken} token={token} errors={parsed.errors} />, { status: 422 })
        }
        try {
          let user = await context.services.auth.resetPassword(parsed.value.token, parsed.value.password)
          let session = completeAuth(context)
          setSessionUser(session, user)
          return redirect(routes.app.dashboard.href(), 303)
        } catch (error) {
          if (error instanceof DomainError && error.kind === 'not_found') {
            return new Response(error.message, { status: 404 })
          }
          return context.render(<ResetPasswordPage csrfToken={csrfToken} token={token} errors={toFieldErrors(error)} />, { status: 422 })
        }
      },
    },
  })
}
