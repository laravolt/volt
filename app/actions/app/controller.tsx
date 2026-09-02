/**
 * Authenticated area: dashboard, profile, password change, admin user deletion.
 */
import { createController } from 'remix/router'
import { Auth } from 'remix/middleware/auth'
import * as s from 'remix/data-schema'
import * as f from 'remix/data-schema/form-data'
import { redirect } from 'remix/response/redirect'

import { requireAdmin, requireUser, setSessionUser } from '../../middleware/auth.ts'
import { getCsrfToken } from '../../middleware/csrf.ts'
import { routes } from '../../routes.ts'
import type { AuthUser } from '../../services/auth.service.ts'
import { DomainError, statusForError } from '../../services/errors.ts'
import { formValues, parseForm, readFlash, str, toFieldErrors, wantsJson } from '../shared.ts'
import { DashboardPage, ProfilePage } from './pages.tsx'

const PHONE = /^(\+62|62|0)[0-9]{9,12}$/

const profileSchema = f.object({
  name: f.field(str.required('Name is required')),
  email: f.field(str.email('Invalid email')),
  phone: f.field(
    s.defaulted(s.string(), '').refine((v) => v === '' || PHONE.test(v), 'Invalid phone number format'),
  ),
})

const passwordSchema = f.object({
  current_password: f.field(str.required('Current password is required')),
  new_password: f.field(str.min(6, 'New password must be at least 6 characters')),
})

const deleteUsersSchema = f.object({
  ids: f.fields(s.array(s.string().refine((v) => /^[0-9a-f-]{36}$/i.test(v), 'Invalid user id'))),
})

function identity(context: { get(key: typeof Auth): unknown }): AuthUser {
  let auth = context.get(Auth) as { ok: boolean; identity: AuthUser }
  return auth.identity
}

export default createController(routes.app, {
  middleware: [requireUser()],
  actions: {
    dashboard(context) {
      let user = identity(context)
      let users = user.is_admin ? context.services.user.listUsers(user) : undefined
      return context.render(
        <DashboardPage user={user} users={users} csrfToken={getCsrfToken(context)} flash={readFlash(context.session)} />,
      )
    },

    profile(context) {
      let user = identity(context)
      let profile = context.services.user.getProfile(user.id)
      return context.render(
        <ProfilePage user={user} profile={profile} csrfToken={getCsrfToken(context)} flash={readFlash(context.session)} />,
      )
    },

    changeProfile(context) {
      let user = identity(context)
      let formData = context.get(FormData)
      let csrfToken = getCsrfToken(context)
      let values = formValues(formData, ['name', 'email', 'phone'])
      let profile = context.services.user.getProfile(user.id)
      let parsed = parseForm(profileSchema, formData)
      if (!parsed.ok) {
        return context.render(<ProfilePage user={user} profile={profile} csrfToken={csrfToken} profileErrors={parsed.errors} values={values} />, { status: 422 })
      }
      try {
        let updated = context.services.user.updateProfile(user.id, {
          name: parsed.value.name,
          email: parsed.value.email,
          phone: parsed.value.phone || null,
        })
        setSessionUser(context.session, updated) // refresh cached identity
        context.session.flash('success', 'Profile updated')
        return redirect(routes.app.profile.href(), 303)
      } catch (error) {
        return context.render(<ProfilePage user={user} profile={profile} csrfToken={csrfToken} profileErrors={toFieldErrors(error)} values={values} />, { status: 409 })
      }
    },

    async changePassword(context) {
      let user = identity(context)
      let formData = context.get(FormData)
      let csrfToken = getCsrfToken(context)
      let profile = context.services.user.getProfile(user.id)
      let parsed = parseForm(passwordSchema, formData)
      if (!parsed.ok) {
        return context.render(<ProfilePage user={user} profile={profile} csrfToken={csrfToken} passwordErrors={parsed.errors} />, { status: 422 })
      }
      try {
        await context.services.auth.changePassword(user.id, parsed.value.current_password, parsed.value.new_password)
        context.session.flash('success', 'Password changed')
        return redirect(routes.app.profile.href(), 303)
      } catch (error) {
        return context.render(<ProfilePage user={user} profile={profile} csrfToken={csrfToken} passwordErrors={toFieldErrors(error)} />, { status: 422 })
      }
    },

    deleteUsers: {
      middleware: [requireAdmin()],
      handler(context) {
        let user = identity(context)
        let parsed = parseForm(deleteUsersSchema, context.get(FormData))
        if (!parsed.ok) {
          if (wantsJson(context)) return Response.json({ success: false, errors: parsed.errors }, { status: 422 })
          context.session.flash('error', parsed.errors.ids ?? 'Select at least one user')
          return redirect(routes.app.dashboard.href(), 303)
        }
        try {
          let deleted = context.services.user.deleteUsers(user, parsed.value.ids)
          if (wantsJson(context)) return Response.json({ success: true, deleted })
          context.session.flash('success', `Deleted ${deleted} user(s)`)
          return redirect(routes.app.dashboard.href(), 303)
        } catch (error) {
          if (error instanceof DomainError) {
            if (wantsJson(context)) return Response.json({ success: false, error: error.message }, { status: statusForError(error) })
            context.session.flash('error', error.message)
            return redirect(routes.app.dashboard.href(), 303)
          }
          throw error
        }
      },
    },
  },
})
