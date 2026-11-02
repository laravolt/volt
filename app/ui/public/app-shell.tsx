/**
 * The interactive part of the application shell: header navbar (account Dropdown) and the mobile
 * navigation drawer, as one island. The page content is rendered by the server-side `AppShell`
 * (`app/ui/app-shell.tsx`) outside this island, so its own islands and mixins hydrate normally.
 */
import { clientEntry, on, type Handle } from 'remix/component'
import { Avatar } from 'volt-preline/avatar'
import {
  Dropdown,
  DropdownButton,
  DropdownDivider,
  DropdownItem,
  DropdownLabel,
  DropdownMenu,
} from 'volt-preline/dropdown'
import { Navbar, NavbarDivider, NavbarItem, NavbarLabel, NavbarSection, NavbarSpacer } from 'volt-preline/navbar'
import { Sidebar, SidebarBody, SidebarFooter, SidebarHeader, SidebarItem, SidebarLabel, SidebarSection } from 'volt-preline/sidebar'
import { StackedLayoutChrome } from 'volt-preline/stacked-layout'

import { routes } from '../../routes.ts'
import { ArrowRightStartOnRectangleIcon, ChevronDownIcon, HomeIcon, UserIcon } from './icons.tsx'

export type ShellUser = { name: string | null; email: string; avatar: string | null; is_admin: boolean }

/** Must stay a type alias (implicit index signature) so it satisfies `SerializableProps`. */
export type AppShellChromeProps = {
  user: ShellUser
  currentPath: string
}

export function toShellUser(user: { name: string | null; email: string; avatar: string | null; is_admin: boolean }): ShellUser {
  return { name: user.name, email: user.email, avatar: user.avatar, is_admin: user.is_admin }
}

/** The hidden logout form rendered by `AppShell`; the island submits it. */
export const LOGOUT_FORM_ID = 'volt-logout-form'

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

export const AppShellChrome = clientEntry<AppShellChromeProps>(
  import.meta.url,
  function AppShellChrome(handle: Handle<AppShellChromeProps>) {
    return () => {
      let { user, currentPath } = handle.props
      let nav = [
        { href: routes.app.dashboard.href(), label: 'Dashboard', Icon: HomeIcon },
        { href: routes.app.profile.href(), label: 'Profile', Icon: UserIcon },
      ]
      let initials = initialsOf(user.name, user.email)

      return (
        <StackedLayoutChrome
          navbar={
            <Navbar data-rmx-key="app-header">
              <NavbarItem href={routes.home.href()} aria-label="Volt home">
                <img src="/favicon.svg" alt="" className="size-6" />
                <NavbarLabel>Volt</NavbarLabel>
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
                  <SidebarLabel>Volt</SidebarLabel>
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
        />
      )
    }
  },
)
