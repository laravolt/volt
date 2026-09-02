import type { Handle } from 'remix/ui'
import { Button } from 'velix-preline/button'
import { Heading } from 'velix-preline/heading'
import { Navbar, NavbarItem, NavbarLabel, NavbarSection, NavbarSpacer } from 'velix-preline/navbar'
import { Text } from 'velix-preline/text'

import { routes } from '../routes.ts'
import type { AuthUser } from '../services/auth.service.ts'
import { Document } from '../ui/document.tsx'

export function HomePage(handle: Handle<{ user: AuthUser | null; csrfToken: string }>) {
  return () => {
    let { user } = handle.props
    return (
      <Document title="Home">
        <div className="relative isolate flex min-h-svh w-full flex-col bg-background">
          <header className="flex items-center border-b border-navbar-line bg-navbar px-4">
            <div className="min-w-0 flex-1">
              <Navbar>
                <NavbarItem href={routes.home.href()} aria-label="Velix home">
                  <img src="/favicon.svg" alt="" className="size-6" />
                  <NavbarLabel>Velix</NavbarLabel>
                </NavbarItem>
                <NavbarSpacer />
                <NavbarSection>
                  {user ? (
                    <NavbarItem href={routes.app.dashboard.href()}>Dashboard</NavbarItem>
                  ) : (
                    <>
                      <NavbarItem href={routes.auth.loginPage.href()}>Sign in</NavbarItem>
                      <NavbarItem href={routes.auth.registerPage.href()}>Register</NavbarItem>
                    </>
                  )}
                </NavbarSection>
              </Navbar>
            </div>
          </header>
          <main className="flex flex-1 flex-col pb-2 lg:px-2">
            <div className="grow p-6 lg:p-10">
              <div className="mx-auto flex max-w-2xl flex-col items-center gap-6 py-24 text-center">
                <img src="/favicon.svg" alt="" className="size-14" />
                <Heading className="text-4xl/10! sm:text-5xl/12!">Velix</Heading>
                <Text className="text-lg/8!">
                  Full-stack TypeScript on Remix 3 with a strict Handler → Service → Repository → SQLite architecture,
                  DB-backed sessions and CSRF by default.
                </Text>
                <div className="flex gap-3">
                  {user ? (
                    <Button color="blue" href={routes.app.dashboard.href()}>Go to dashboard</Button>
                  ) : (
                    <>
                      <Button color="blue" href={routes.auth.registerPage.href()}>Get started</Button>
                      <Button outline href={routes.auth.loginPage.href()}>
                        Sign in
                      </Button>
                    </>
                  )}
                </div>
              </div>
            </div>
          </main>
        </div>
      </Document>
    )
  }
}
