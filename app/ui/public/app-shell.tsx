/**
 * Application shell (StackedLayout) as a hydrated island so the account Dropdown and the
 * mobile navigation drawer work. Page content is passed as `children`.
 */
import { clientEntry, on, type Handle, type RemixNode } from 'remix/ui'
import { Avatar } from 'velix-preline/avatar'
import {
  Dropdown,
  DropdownButton,
  DropdownDivider,
  DropdownItem,
  DropdownLabel,
  DropdownMenu,
} from 'velix-preline/dropdown'
import { Navbar, NavbarDivider, NavbarItem, NavbarLabel, NavbarSection, NavbarSpacer } from 'velix-preline/navbar'
import { Sidebar, SidebarBody, SidebarFooter, SidebarHeader, SidebarItem, SidebarLabel, SidebarSection } from 'velix-preline/sidebar'
import { StackedLayout } from 'velix-preline/stacked-layout'

import { routes } from '../../routes.ts'
import { ArrowRightStartOnRectangleIcon, ChevronDownIcon, HomeIcon, UserIcon } from './icons.tsx'

export type ShellUser = { name: string | null; email: string; avatar: string | null; is_admin: boolean }

/** Must stay a type alias (implicit index signature) so it satisfies `SerializableProps`. */
export type AppShellProps = {
  user: ShellUser
  csrfToken: string
  currentPath: string
  children?: RemixNode
}

export function toShellUser(user: { name: string | null; email: string; avatar: string | null; is_admin: boolean }): ShellUser {
  return { name: user.name, email: user.email, avatar: user.avatar, is_admin: user.is_admin }
}

const LOGOUT_FORM_ID = 'velix-logout-form'

function initialsOf(name: string | null, email: string) {
  let source = (name && name.trim()) || email
  return source
    .split(/[\s@._-]+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]!.toUpperCase())
    .join('')
}

function submitLogout() {
  let form = document.getElementById(LOGOUT_FORM_ID)
  if (form instanceof HTMLFormElement) form.requestSubmit()
}

export const AppShell = clientEntry<AppShellProps>(import.meta.url, function AppShell(handle: Handle<AppShellProps>) {
  return () => {
    let { user, csrfToken, currentPath, children } = handle.props
    let nav = [
      { href: routes.app.dashboard.href(), label: 'Dashboard', Icon: HomeIcon },
      { href: routes.app.profile.href(), label: 'Profile', Icon: UserIcon },
    ]
    let initials = initialsOf(user.name, user.email)

    return (
      <>
        <form id={LOGOUT_FORM_ID} method="post" action={routes.auth.logout.href()} hidden>
          <input type="hidden" name="_csrf" value={csrfToken} />
        </form>
        <StackedLayout
          navbar={
            <Navbar>
              <NavbarItem href={routes.home.href()} aria-label="Velix home">
                <img src="/favicon.svg" alt="" className="size-6" />
                <NavbarLabel>Velix</NavbarLabel>
              </NavbarItem>
              <NavbarDivider className="max-lg:hidden" />
              <NavbarSection className="max-lg:hidden">
                {nav.map((item) => (
                  <NavbarItem key={item.href} href={item.href} current={currentPath === item.href}>
                    {item.label}
                  </NavbarItem>
                ))}
              </NavbarSection>
              <NavbarSpacer />
              <NavbarSection>
                <Dropdown
                  onSelect={(event) => {
                    if (event.item.name === 'logout') submitLogout()
                  }}
                >
                  <DropdownButton as={NavbarItem} aria-label="Account menu">
                    <Avatar src={user.avatar} initials={user.avatar ? undefined : initials} className="size-8 bg-primary text-primary-foreground" square />
                    <ChevronDownIcon />
                  </DropdownButton>
                  <DropdownMenu className="min-w-64" anchor="bottom end">
                    <DropdownItem href={routes.app.profile.href()}>
                      <UserIcon />
                      <DropdownLabel>My profile</DropdownLabel>
                    </DropdownItem>
                    <DropdownDivider />
                    <DropdownItem name="logout">
                      <ArrowRightStartOnRectangleIcon />
                      <DropdownLabel>Sign out</DropdownLabel>
                    </DropdownItem>
                  </DropdownMenu>
                </Dropdown>
              </NavbarSection>
            </Navbar>
          }
          sidebar={
            <Sidebar>
              <SidebarHeader>
                <SidebarItem href={routes.home.href()}>
                  <img src="/favicon.svg" alt="" className="size-6" />
                  <SidebarLabel>Velix</SidebarLabel>
                </SidebarItem>
              </SidebarHeader>
              <SidebarBody>
                <SidebarSection>
                  {nav.map((item) => (
                    <SidebarItem key={item.href} href={item.href} current={currentPath === item.href}>
                      <item.Icon />
                      <SidebarLabel>{item.label}</SidebarLabel>
                    </SidebarItem>
                  ))}
                </SidebarSection>
              </SidebarBody>
              <SidebarFooter>
                <SidebarSection>
                  <SidebarItem mix={on<HTMLButtonElement, 'click'>('click', submitLogout)}>
                    <ArrowRightStartOnRectangleIcon />
                    <SidebarLabel>Sign out</SidebarLabel>
                  </SidebarItem>
                </SidebarSection>
              </SidebarFooter>
            </Sidebar>
          }
        >
          {children}
        </StackedLayout>
      </>
    )
  }
})
