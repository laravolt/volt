/**
 * Test harness: in-memory SQLite + migrations + app router with rate limits disabled.
 */
import { openDatabase, type Db } from '../app/data/db.ts'
import { migrate } from '../app/data/migrate.ts'
import { createAppRouter } from '../app/router.ts'
import { createRepositories, type AppRepositories } from '../app/services/index.ts'
import { MemoryMailer } from '../app/services/mailer.ts'
import { hashPassword } from '../app/services/password.ts'
import { routes } from '../app/routes.ts'
import { SESSION_COOKIE } from '../app/middleware/session.ts'

export const BASE = 'http://localhost'

export async function createTestDb(): Promise<Db> {
  let db = openDatabase(':memory:')
  await migrate(db, 'up')
  return db
}

export interface TestApp {
  db: Db
  repos: AppRepositories
  mailer: MemoryMailer
  router: ReturnType<typeof createAppRouter>
  fetch(path: string, init?: RequestInit & { cookie?: string }): Promise<Response>
  close(): void
}

export async function createTestApp(): Promise<TestApp> {
  let db = await createTestDb()
  let mailer = new MemoryMailer()
  let router = createAppRouter({ db, mailer, rateLimits: false })
  return {
    db,
    repos: createRepositories(db),
    mailer,
    router,
    fetch(path, init = {}) {
      let headers = new Headers(init.headers)
      if (init.cookie) headers.set('Cookie', init.cookie)
      return router.fetch(new Request(BASE + path, { ...init, headers }))
    },
    close() {
      db.close()
    },
  }
}

/** Extract the session cookie pair (`name=value`) from a response. */
export function sessionCookie(response: Response): string | null {
  for (let value of response.headers.getSetCookie()) {
    if (value.startsWith(SESSION_COOKIE + '=')) return value.split(';')[0]!
  }
  return null
}

export function form(fields: Record<string, string | string[]>): FormData {
  let fd = new FormData()
  for (let [k, v] of Object.entries(fields)) {
    for (let item of Array.isArray(v) ? v : [v]) fd.append(k, item)
  }
  return fd
}

export async function seedUser(
  app: TestApp,
  overrides: Partial<{ id: string; email: string; password: string; name: string; is_admin: number }> = {},
) {
  let password = overrides.password ?? 'secret123'
  let user = app.repos.users.create({
    id: overrides.id ?? crypto.randomUUID(),
    email: overrides.email ?? 'alice@example.com',
    name: overrides.name ?? 'Alice',
    is_admin: overrides.is_admin ?? 0,
    password: await hashPassword(password),
  })
  return { user, password }
}

/** GET a page to obtain a session cookie and its CSRF token. */
export async function startSession(app: TestApp, path = routes.auth.loginPage.href()) {
  let response = await app.fetch(path)
  let cookie = sessionCookie(response)
  if (!cookie) throw new Error('No session cookie issued')
  let html = await response.text()
  let match = html.match(/name="_csrf" value="([0-9a-f]+)"/)
  if (!match) throw new Error('No CSRF token in page')
  return { cookie, csrf: match[1]! }
}

/** Full login flow; returns the rotated session cookie. */
export async function login(app: TestApp, identifier: string, password: string) {
  let { cookie, csrf } = await startSession(app)
  let response = await app.fetch(routes.auth.login.href(), {
    method: 'POST',
    cookie,
    body: form({ _csrf: csrf, identifier, password }),
  })
  return { response, cookie: sessionCookie(response) ?? cookie, previousCookie: cookie }
}

/** Get a fresh CSRF token for an existing session (from any page rendering a form). */
export async function csrfFor(app: TestApp, cookie: string, path = routes.app.profile.href()) {
  let response = await app.fetch(path, { cookie })
  let html = await response.text()
  let match = html.match(/name="_csrf" value="([0-9a-f]+)"/)
  if (!match) throw new Error(`No CSRF token on ${path} (status ${response.status})`)
  return match[1]!
}
