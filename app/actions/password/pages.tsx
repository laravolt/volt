import type { Handle } from 'remix/ui'
import { ErrorMessage, Field, Label } from 'volt-preline/fieldset'
import { Input } from 'volt-preline/input'
import { Strong, Text, TextLink } from 'volt-preline/text'

import { routes } from '../../routes.ts'
import { AuthCard } from '../../ui/auth-card.tsx'
import { type FieldErrors, type FlashMessages, Notice } from '../../ui/form.tsx'
import { AutoFocusError } from '../../ui/public/auto-focus-error.tsx'
import { SubmitButton } from '../../ui/public/submit-button.tsx'

export function ForgotPasswordPage(
  handle: Handle<{
    csrfToken: string
    flash?: FlashMessages
    errors?: FieldErrors
    values?: Record<string, string>
  }>,
) {
  return () => {
    let { csrfToken, flash, errors = {}, values = {} } = handle.props
    let hasErrors = Object.keys(errors).length > 0

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
        {hasErrors && <AutoFocusError />}
        <Text>Enter your email or phone and we’ll send you a link to reset your password.</Text>
        <Notice flash={flash} error={errors._} />
        <Field>
          <Label>
            Email or phone <span className="text-destructive font-bold">*</span>
          </Label>
          <Input
            name="identifier"
            value={values.identifier}
            autocomplete="username"
            required
            invalid={Boolean(errors.identifier)}
          />
          {errors.identifier ? <ErrorMessage>{errors.identifier}</ErrorMessage> : null}
        </Field>
        <SubmitButton
          label="Send reset link"
          pendingText="Mengirim link..."
          color="blue"
          className="w-full mt-2"
        />
      </AuthCard>
    )
  }
}

export function ResetPasswordPage(
  handle: Handle<{ csrfToken: string; token: string; errors?: FieldErrors }>,
) {
  return () => {
    let { csrfToken, token, errors = {} } = handle.props
    let hasErrors = Object.keys(errors).length > 0

    return (
      <AuthCard
        title="Choose a new password"
        action={routes.password.reset.href()}
        csrfToken={csrfToken}
      >
        {hasErrors && <AutoFocusError />}
        <input type="hidden" name="token" value={token} />
        <Notice error={errors._} />
        <Field>
          <Label>
            New password <span className="text-destructive font-bold">*</span>
          </Label>
          <Input
            type="password"
            name="password"
            autocomplete="new-password"
            required
            invalid={Boolean(errors.password)}
          />
          {errors.password ? <ErrorMessage>{errors.password}</ErrorMessage> : null}
        </Field>
        <SubmitButton
          label="Update password"
          pendingText="Memperbarui password..."
          color="blue"
          className="w-full mt-2"
        />
      </AuthCard>
    )
  }
}
