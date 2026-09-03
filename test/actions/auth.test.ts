import * as assert from 'remix/assert'
import { afterEach, beforeEach, describe, it } from 'remix/test'

import { resetRateLimits } from '../../app/middleware/rate-limit.ts'
import { createAppRouter } from '../../app/router.ts'
import { routes } from '../../app/routes.ts'
import { createRepositories } from '../../app/services/index.ts'
import { MemoryMailer } from '../../app/services/mailer.ts'
import { BASE, createTestApp, createTestDb, csrfFor, form, login, seedUser, sessionCookie, startSession, type TestApp } from '../helpers.ts'

describe('auth routes', () => {
  let app: TestApp
  beforeEach(async () => {
    app = await createTestApp()
  })
  afterEach(() => app.close())

  it('renders home and login pages', async () => {
    let home = await app.fetch(routes.home.href())
    assert.equal(home.status, 200)
    assert.match(await home.text(), /Volt/)
    let loginPage = await app.fetch(routes.auth.loginPage.href())
    assert.equal(loginPage.status, 200)
    assert.match(await loginPage.text(), /name="_csrf"/)
  })

  it('redirects anonymous users away from protected routes', async () => {
    let response = await app.fetch(routes.app.dashboard.href())
    assert.equal(response.status, 303)
    assert.equal(response.headers.get('Location'), routes.auth.loginPage.href())
  })

  it('rejects state-changing requests without a CSRF token', async () => {
    let { cookie } = await startSession(app)
    let response = await app.fetch(routes.auth.login.href(), {
      method: 'POST',
      cookie,
      body: form({ identifier: 'a@x.com', password: 'x' }),
    })
    assert.equal(response.status, 403)
    let json = (await response.json()) as { error: { code: string } }
    assert.equal(json.error.code, 'CSRF_INVALID')
  })

  it('rejects a CSRF token from a different session', async () => {
    let { csrf } = await startSession(app)
    let other = await startSession(app)
    let response = await app.fetch(routes.auth.login.href(), {
      method: 'POST',
      cookie: other.cookie,
      body: form({ _csrf: csrf, identifier: 'a@x.com', password: 'x' }),
    })
    assert.equal(response.status, 403)
  })

  it('logs in with a rotated session id, then logs out', async () => {
    let { user, password } = await seedUser(app)
    let { response, cookie, previousCookie } = await login(app, user.email, password)
    assert.equal(response.status, 303)
    assert.equal(response.headers.get('Location'), routes.app.dashboard.href())
    assert.notEqual(cookie, previousCookie, 'session id must rotate on login')

    // Old session id must be gone from the store; new one is bound to the user.
    let oldId = decodeURIComponent(previousCookie.split('=')[1]!)
    let newId = decodeURIComponent(cookie.split('=')[1]!)
    assert.equal(app.repos.sessions.countByUserId(user.id), 1)
    assert.notEqual(oldId, newId)

    let dashboard = await app.fetch(routes.app.dashboard.href(), { cookie })
    assert.equal(dashboard.status, 200)
    assert.match(await dashboard.text(), /Welcome, Alice/)

    let csrf = await csrfFor(app, cookie)
    let logout = await app.fetch(routes.auth.logout.href(), { method: 'POST', cookie, body: form({ _csrf: csrf }) })
    assert.equal(logout.status, 303)
    assert.equal(app.repos.sessions.countByUserId(user.id), 0)

    let after = await app.fetch(routes.app.dashboard.href(), { cookie })
    assert.equal(after.status, 303)
  })

  it('rejects bad credentials and validation errors', async () => {
    let { user } = await seedUser(app)
    let bad = await login(app, user.email, 'nope')
    assert.equal(bad.response.status, 401)
    assert.match(await bad.response.text(), /Incorrect password/)

    let { cookie, csrf } = await startSession(app)
    let empty = await app.fetch(routes.auth.login.href(), {
      method: 'POST',
      cookie,
      body: form({ _csrf: csrf, identifier: '', password: '' }),
    })
    assert.equal(empty.status, 422)
  })

  it('registers a new account and signs in', async () => {
    let { cookie, csrf } = await startSession(app, routes.auth.registerPage.href())
    let response = await app.fetch(routes.auth.register.href(), {
      method: 'POST',
      cookie,
      body: form({ _csrf: csrf, name: 'New', email: 'new@x.com', password: 'secret1' }),
    })
    assert.equal(response.status, 303)
    let newCookie = sessionCookie(response)!
    let dashboard = await app.fetch(routes.app.dashboard.href(), { cookie: newCookie })
    assert.equal(dashboard.status, 200)

    let dup = await app.fetch(routes.auth.register.href(), {
      method: 'POST',
      cookie: (await startSession(app)).cookie,
      body: form({ _csrf: (await startSession(app)).csrf, name: 'New', email: 'new@x.com', password: 'secret1' }),
    })
    assert.equal(dup.status, 403) // csrf from a different session
  })

  it('sends a password reset link and accepts the new password', async () => {
    let { user } = await seedUser(app)
    let { cookie, csrf } = await startSession(app, routes.password.forgotPage.href())
    let response = await app.fetch(routes.password.forgot.href(), {
      method: 'POST',
      cookie,
      body: form({ _csrf: csrf, identifier: user.email }),
    })
    assert.equal(response.status, 303)
    assert.equal(app.mailer.sent.length, 1)
    let token = app.mailer.sent[0]!.text.match(/reset-password\/([0-9a-f-]+)/)![1]!

    let page = await app.fetch(routes.password.resetPage.href({ token }), { cookie })
    assert.equal(page.status, 200)
    let csrf2 = await csrfFor(app, cookie, routes.password.resetPage.href({ token }))
    let reset = await app.fetch(routes.password.reset.href(), {
      method: 'POST',
      cookie,
      body: form({ _csrf: csrf2, token, password: 'brandnew1' }),
    })
    assert.equal(reset.status, 303)

    let missing = await app.fetch(routes.password.resetPage.href({ token: 'nope' }))
    assert.equal(missing.status, 404)
    assert.equal((await login(app, user.email, 'brandnew1')).response.status, 303)
  })

  it('renders HTML page when rate limited (429)', async () => {
    let db = await createTestDb()
    let mailer = new MemoryMailer()
    let router = createAppRouter({ db, mailer, rateLimits: true })
    resetRateLimits()

    let testApp: TestApp = {
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

    try {
      let { cookie, csrf } = await startSession(testApp)
      let lastResponse: Response | undefined

      // Login limit is 10
      for (let i = 0; i < 11; i++) {
        lastResponse = await testApp.fetch(routes.auth.login.href(), {
          method: 'POST',
          cookie,
          headers: { 'X-Real-IP': '10.0.0.1' },
          body: form({ _csrf: csrf, identifier: 'wrong@test.com', password: 'wrong' }),
        })
      }

      assert.equal(lastResponse?.status, 429)
      assert.ok(lastResponse?.headers.get('content-type')?.includes('text/html'))
      assert.ok(lastResponse?.headers.has('Retry-After'))
      let html = await lastResponse?.text()
      assert.match(html, /Terlalu banyak percobaan/)
    } finally {
      testApp.close()
      resetRateLimits()
    }
  })
})
