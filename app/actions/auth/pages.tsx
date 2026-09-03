import type { Handle } from 'remix/ui'
import { Button } from 'volt-preline/button'
import { ErrorMessage, Field, Label } from 'volt-preline/fieldset'
import { Input } from 'volt-preline/input'
import { Strong, Text, TextLink } from 'volt-preline/text'

import { routes } from '../../routes.ts'
import { AuthCard } from '../../ui/auth-card.tsx'
import { type FieldErrors, type FlashMessages, Notice } from '../../ui/form.tsx'
import { AutoFocusError } from '../../ui/public/auto-focus-error.tsx'
import { SubmitButton } from '../../ui/public/submit-button.tsx'

export interface AuthPageProps {
  csrfToken: string
  flash?: FlashMessages
  errors?: FieldErrors
  values?: Record<string, string>
  googleEnabled?: boolean
}

export function LoginPage(handle: Handle<AuthPageProps>) {
  return () => {
    let { csrfToken, flash, errors = {}, values = {}, googleEnabled } = handle.props
    let hasErrors = Object.keys(errors).length > 0

    return (
      <AuthCard
        title="Sign in to your account"
        action={routes.auth.login.href()}
        csrfToken={csrfToken}
        footer={
          <Text>
            Don’t have an account?{' '}
            <TextLink href={routes.auth.registerPage.href()}>
              <Strong>Sign up</Strong>
            </TextLink>
          </Text>
        }
      >
        {hasErrors && <AutoFocusError />}
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
        <Field>
          <Label>
            Password <span className="text-destructive font-bold">*</span>
          </Label>
          <Input
            type="password"
            name="password"
            autocomplete="current-password"
            required
            invalid={Boolean(errors.password)}
          />
          {errors.password ? <ErrorMessage>{errors.password}</ErrorMessage> : null}
        </Field>
        <div className="flex items-center justify-end">
          <Text>
            <TextLink href={routes.password.forgotPage.href()}>
              <Strong>Forgot password?</Strong>
            </TextLink>
          </Text>
        </div>
        <SubmitButton
          label="Sign in"
          pendingText="Signing in..."
          color="blue"
          className="w-full mt-2"
        />
        {googleEnabled ? (
          <Button outline href={routes.auth.googleRedirect.href()} className="w-full">
            Continue with Google
          </Button>
        ) : null}
      </AuthCard>
    )
  }
}

export function RegisterPage(handle: Handle<AuthPageProps>) {
  return () => {
    let { csrfToken, flash, errors = {}, values = {} } = handle.props
    let hasErrors = Object.keys(errors).length > 0

    return (
      <AuthCard
        title="Create your account"
        action={routes.auth.register.href()}
        csrfToken={csrfToken}
        footer={
          <Text>
            Already have an account?{' '}
            <TextLink href={routes.auth.loginPage.href()}>
              <Strong>Sign in</Strong>
            </TextLink>
          </Text>
        }
      >
        {hasErrors && <AutoFocusError />}
        <Notice flash={flash} error={errors._} />
        <Field>
          <Label>
            Full name <span className="text-destructive font-bold">*</span>
          </Label>
          <Input
            name="name"
            value={values.name}
            autocomplete="name"
            required
            invalid={Boolean(errors.name)}
          />
          {errors.name ? <ErrorMessage>{errors.name}</ErrorMessage> : null}
        </Field>
        <Field>
          <Label>
            Email <span className="text-destructive font-bold">*</span>
          </Label>
          <Input
            type="email"
            name="email"
            value={values.email}
            autocomplete="email"
            required
            invalid={Boolean(errors.email)}
          />
          {errors.email ? <ErrorMessage>{errors.email}</ErrorMessage> : null}
        </Field>
        <Field>
          <Label>
            Password <span className="text-destructive font-bold">*</span>
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
          label="Create account"
          pendingText="Creating account..."
          color="blue"
          className="w-full mt-2"
        />
      </AuthCard>
    )
  }
}
