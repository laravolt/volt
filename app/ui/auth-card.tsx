/** Catalyst-style auth page: centered card with logo, heading and a form. */
import type { Handle, RemixNode } from 'remix/ui'
import { AuthLayout } from 'velix-catalyst/auth-layout'
import { Heading } from 'velix-catalyst/heading'

import { routes } from '../routes.ts'
import { Document } from './document.tsx'
import { CsrfField } from './form.tsx'

export interface AuthCardProps {
  title: string
  action: string
  csrfToken: string
  children?: RemixNode
  footer?: RemixNode
}

export function AuthCard(handle: Handle<AuthCardProps>) {
  return () => {
    let { title, action, csrfToken, children, footer } = handle.props
    return (
      <Document title={title}>
        <AuthLayout>
          <form method="post" action={action} className="grid w-full max-w-sm grid-cols-1 gap-8">
            <CsrfField token={csrfToken} />
            <a href={routes.home.href()} className="w-fit">
              <img src="/favicon.svg" alt="Velix" className="size-10" />
            </a>
            <Heading>{title}</Heading>
            {children}
            {footer}
          </form>
        </AuthLayout>
      </Document>
    )
  }
}
