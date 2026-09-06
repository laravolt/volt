/**
 * E2E testing helpers for Playwright browser tests on Volt.
 * Supports isolated test SQLite databases, deterministic hydration waiting,
 * and browser-based login/logout routines.
 */
import type { Page } from 'playwright'
import type { Db } from '../app/data/db.ts'
import { createAppRouter } from '../app/router.ts'
import { routes } from '../app/routes.ts'
import { createRepositories, type AppRepositories } from '../app/services/index.ts'
import { MemoryMailer } from '../app/services/mailer.ts'
import { hashPassword } from '../app/services/password.ts'
import { createIsolatedTestDb } from './helpers.ts'

export interface E2EHarness {
  db: Db
  repos: AppRepositories
  mailer: MemoryMailer
  router: ReturnType<typeof createAppRouter>
  cleanup: () => void
}

export async function createE2EHarness(
  prefix: string,
  options?: { rateLimits?: boolean },
): Promise<E2EHarness> {
  let { db, cleanup } = await createIsolatedTestDb(prefix)
  let repos = createRepositories(db)
  let mailer = new MemoryMailer()
  let router = createAppRouter({
    db,
    mailer,
    rateLimits: options?.rateLimits ?? false,
  })
  return { db, repos, mailer, router, cleanup }
}

/**
 * Wait for Remix UI runtime to complete app.ready() and attach data-hydrated to <html>.
 * Eliminates race conditions where button clicks occur before event mixins are wired.
 */
export async function waitForHydration(page: Page) {
  await page.waitForSelector('html[data-hydrated]', { state: 'attached', timeout: 15000 })
}

export async function loginViaBrowser(
  page: Page,
  identifier: string,
  password = 'password123',
) {
  await page.goto(routes.auth.loginPage.href())
  await waitForHydration(page)
  await page.fill('input[name="identifier"]', identifier)
  await page.fill('input[name="password"]', password)
  await page.click('button[type="submit"]')
  await page.waitForURL('**/home')
}

export async function logoutViaBrowser(page: Page) {
  await page.evaluate(() => {
    let form = document.getElementById('volt-logout-form') as HTMLFormElement | null
    form?.requestSubmit()
  })
  await page.waitForURL('**/login')
}

export async function seedE2EUser(
  repos: AppRepositories,
  overrides: {
    email?: string
    name?: string
    password?: string
    is_admin?: number
  } = {},
) {
  let password = overrides.password ?? 'password123'
  let user = repos.users.create({
    id: crypto.randomUUID(),
    email: overrides.email ?? 'user@example.test',
    name: overrides.name ?? 'Test User',
    is_admin: overrides.is_admin ?? 0,
    password: await hashPassword(password),
  })
  return { user, password }
}
