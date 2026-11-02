/**
 * Application shell, rendered on the server. Only the header and mobile drawer hydrate
 * (`AppShellChrome`, a client entry); the page content stays outside it, so forms, mixins and
 * nested client entries in the page work as on any other server-rendered page. Passing the page
 * through a client entry's `children` instead would serialize it into the island's props, where
 * `on()`/`ref()` mixins cannot survive.
 */
import type { Handle, RemixNode } from 'remix/component'
import { StackedLayoutContent, StackedLayoutRoot } from 'volt-preline/stacked-layout'

import { routes } from '../routes.ts'
import { AppShellChrome, LOGOUT_FORM_ID, type ShellUser } from './public/app-shell.tsx'

export { toShellUser, type ShellUser } from './public/app-shell.tsx'

export type AppShellProps = {
  user: ShellUser
  csrfToken: string
  currentPath: string
  children?: RemixNode
}

export function AppShell(handle: Handle<AppShellProps>) {
  return () => {
    let { user, csrfToken, currentPath, children } = handle.props
    return (
      <div data-rmx-key="app-shell">
        <form id={LOGOUT_FORM_ID} method="post" action={routes.auth.logout.href()} hidden>
          <input type="hidden" name="_csrf" value={csrfToken} />
        </form>
        <StackedLayoutRoot>
          <AppShellChrome user={user} currentPath={currentPath} />
          <StackedLayoutContent>
            <div data-rmx-key="app-main">{children}</div>
          </StackedLayoutContent>
        </StackedLayoutRoot>
      </div>
    )
  }
}
