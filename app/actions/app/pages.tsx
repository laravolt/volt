import type { Handle } from 'remix/ui'
import { Button } from 'velix-catalyst/button'
import { Divider } from 'velix-catalyst/divider'
import { Description, ErrorMessage, Field, Fieldset, Label } from 'velix-catalyst/fieldset'
import { Heading, Subheading } from 'velix-catalyst/heading'
import { Input } from 'velix-catalyst/input'
import { Text } from 'velix-catalyst/text'

import { routes } from '../../routes.ts'
import type { AuthUser } from '../../services/auth.service.ts'
import type { PublicUser } from '../../services/user.service.ts'
import { Document } from '../../ui/document.tsx'
import { type FieldErrors, type FlashMessages, Notice } from '../../ui/form.tsx'
import { AppShell, toShellUser } from '../../ui/public/app-shell.tsx'
import { UsersTable } from './public/users-table.tsx'

export function DashboardPage(handle: Handle<{ user: AuthUser; csrfToken: string; flash?: FlashMessages; users?: PublicUser[]; errors?: FieldErrors }>) {
  return () => {
    let { user, csrfToken, flash, users, errors = {} } = handle.props
    return (
      <Document title="Dashboard">
        <AppShell user={toShellUser(user)} csrfToken={csrfToken} currentPath={routes.app.dashboard.href()}>
          <Heading>Welcome, {user.name || user.email}</Heading>
          <Text className="mt-2">You are signed in{user.is_admin ? ' as an administrator' : ''}.</Text>
          <div className="mt-6">
            <Notice flash={flash} error={errors._ ?? errors.ids} />
          </div>

          {users ? (
            <>
              <div className="mt-14 flex items-end justify-between gap-4">
                <Subheading>Users</Subheading>
                <Text className="text-sm/6!">{users.length} total</Text>
              </div>
              <div className="mt-4">
                <UsersTable users={users.map((u) => ({ id: u.id, name: u.name, email: u.email, is_admin: u.is_admin, is_verified: u.is_verified, created_at: u.created_at }))} currentUserId={user.id} action={routes.app.deleteUsers.href()} csrfToken={csrfToken} />
              </div>
            </>
          ) : null}
        </AppShell>
      </Document>
    )
  }
}

export function ProfilePage(handle: Handle<{ user: AuthUser; profile: PublicUser; csrfToken: string; flash?: FlashMessages; profileErrors?: FieldErrors; passwordErrors?: FieldErrors; values?: Record<string, string> }>) {
  return () => {
    let { user, profile, csrfToken, flash, profileErrors = {}, passwordErrors = {}, values = {} } = handle.props
    return (
      <Document title="Profile">
        <AppShell user={toShellUser(user)} csrfToken={csrfToken} currentPath={routes.app.profile.href()}>
          <Heading>Profile</Heading>
          <div className="mt-6">
            <Notice flash={flash} />
          </div>

          <form method="post" action={routes.app.changeProfile.href()} className="mx-auto max-w-4xl">
            <input type="hidden" name="_csrf" value={csrfToken} />
            <Divider className="my-10 mt-6" />
            <Notice error={profileErrors._} />
            <Fieldset>
              <section className="grid gap-x-8 gap-y-6 sm:grid-cols-2">
                <div className="space-y-1">
                  <Subheading>Account details</Subheading>
                  <Text>This will be displayed on your public profile.</Text>
                </div>
                <div className="space-y-6">
                  <Field>
                    <Label>Name</Label>
                    <Input name="name" value={values.name ?? profile.name ?? ''} required invalid={Boolean(profileErrors.name)} />
                    {profileErrors.name ? <ErrorMessage>{profileErrors.name}</ErrorMessage> : null}
                  </Field>
                  <Field>
                    <Label>Email</Label>
                    <Input type="email" name="email" value={values.email ?? profile.email} required invalid={Boolean(profileErrors.email)} />
                    {profileErrors.email ? <ErrorMessage>{profileErrors.email}</ErrorMessage> : null}
                  </Field>
                  <Field>
                    <Label>Phone</Label>
                    <Input type="tel" name="phone" value={values.phone ?? profile.phone ?? ''} placeholder="08xxxxxxxxxx" invalid={Boolean(profileErrors.phone)} />
                    <Description>Indonesian format, optional.</Description>
                    {profileErrors.phone ? <ErrorMessage>{profileErrors.phone}</ErrorMessage> : null}
                  </Field>
                </div>
              </section>
            </Fieldset>
            <Divider className="my-10" soft />
            <div className="flex justify-end gap-4">
              <Button type="reset" plain>
                Reset
              </Button>
              <Button type="submit">Save changes</Button>
            </div>
          </form>

          <form method="post" action={routes.app.changePassword.href()} className="mx-auto max-w-4xl">
            <input type="hidden" name="_csrf" value={csrfToken} />
            <Divider className="my-10" />
            <Notice error={passwordErrors._} />
            <Fieldset>
              <section className="grid gap-x-8 gap-y-6 sm:grid-cols-2">
                <div className="space-y-1">
                  <Subheading>Change password</Subheading>
                  <Text>Use at least 6 characters.</Text>
                </div>
                <div className="space-y-6">
                  <Field>
                    <Label>Current password</Label>
                    <Input type="password" name="current_password" autocomplete="current-password" required invalid={Boolean(passwordErrors.current_password)} />
                    {passwordErrors.current_password ? <ErrorMessage>{passwordErrors.current_password}</ErrorMessage> : null}
                  </Field>
                  <Field>
                    <Label>New password</Label>
                    <Input type="password" name="new_password" autocomplete="new-password" required invalid={Boolean(passwordErrors.new_password)} />
                    {passwordErrors.new_password ? <ErrorMessage>{passwordErrors.new_password}</ErrorMessage> : null}
                  </Field>
                </div>
              </section>
            </Fieldset>
            <Divider className="my-10" soft />
            <div className="flex justify-end">
              <Button type="submit" outline>
                Update password
              </Button>
            </div>
          </form>
        </AppShell>
      </Document>
    )
  }
}
