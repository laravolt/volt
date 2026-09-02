import type { Handle } from 'remix/ui'
import { Button } from 'velix-preline/button'
import { ErrorMessage, Field, Label } from 'velix-preline/fieldset'
import { Input } from 'velix-preline/input'
import { Strong, Text, TextLink } from 'velix-preline/text'

import { routes } from '../../routes.ts'
import { AuthCard } from '../../ui/auth-card.tsx'
import { type FieldErrors, type FlashMessages, Notice } from '../../ui/form.tsx'

export function ForgotPasswordPage(handle: Handle<{ csrfToken: string; flash?: FlashMessages; errors?: FieldErrors; values?: Record<string, string> }>) {
  return () => {
    let { csrfToken, flash, errors = {}, values = {} } = handle.props
    return (
      <AuthCard
        title="Reset your password"
        action={routes.password.forgot.href()}
        csrfToken={csrfToken}
        footer={
          <Text>
            Remembered it?{' '}
            <TextLink href={routes.auth.loginPage.href()}>
              <Strong>Back to sign in</Strong>
            </TextLink>
          </Text>
        }
      >
        <Text>Enter your email or phone and we’ll send you a link to reset your password.</Text>
        <Notice flash={flash} error={errors._} />
        <Field>
          <Label>Email or phone</Label>
          <Input name="identifier" value={values.identifier} autocomplete="username" required invalid={Boolean(errors.identifier)} />
          {errors.identifier ? <ErrorMessage>{errors.identifier}</ErrorMessage> : null}
        </Field>
        <Button type="submit" color="blue" className="w-full">
          Send reset link
        </Button>
      </AuthCard>
    )
  }
}

export function ResetPasswordPage(handle: Handle<{ csrfToken: string; token: string; errors?: FieldErrors }>) {
  return () => {
    let { csrfToken, token, errors = {} } = handle.props
    return (
      <AuthCard title="Choose a new password" action={routes.password.reset.href()} csrfToken={csrfToken}>
        <input type="hidden" name="token" value={token} />
        <Notice error={errors._} />
        <Field>
          <Label>New password</Label>
          <Input type="password" name="password" autocomplete="new-password" required invalid={Boolean(errors.password)} />
          {errors.password ? <ErrorMessage>{errors.password}</ErrorMessage> : null}
        </Field>
        <Button type="submit" color="blue" className="w-full">
          Update password
        </Button>
      </AuthCard>
    )
  }
}
