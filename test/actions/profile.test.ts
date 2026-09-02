import * as assert from 'remix/assert'
import { afterEach, beforeEach, describe, it } from 'remix/test'

import { routes } from '../../app/routes.ts'
import { createTestApp, csrfFor, form, login, seedUser, type TestApp } from '../helpers.ts'

describe('profile and admin routes', () => {
  let app: TestApp
  beforeEach(async () => {
    app = await createTestApp()
  })
  afterEach(() => app.close())

  it('updates profile and refreshes the cached identity', async () => {
    let { user, password } = await seedUser(app)
    let { cookie } = await login(app, user.email, password)
    let csrf = await csrfFor(app, cookie)
    let response = await app.fetch(routes.app.changeProfile.href(), {
      method: 'POST',
      cookie,
      body: form({ _csrf: csrf, name: 'Alicia', email: user.email, phone: '' }),
    })
    assert.equal(response.status, 303)
    let dashboard = await app.fetch(routes.app.dashboard.href(), { cookie })
    assert.match(await dashboard.text(), /Welcome, Alicia/)
    assert.equal(app.repos.users.findById(user.id)?.name, 'Alicia')
  })

  it('rejects an email already used by another account', async () => {
    let { user, password } = await seedUser(app)
    await seedUser(app, { email: 'taken@x.com' })
    let { cookie } = await login(app, user.email, password)
    let response = await app.fetch(routes.app.changeProfile.href(), {
      method: 'POST',
      cookie,
      body: form({ _csrf: await csrfFor(app, cookie), name: 'A', email: 'taken@x.com', phone: '' }),
    })
    assert.equal(response.status, 409)
  })

  it('changes password only with the correct current password', async () => {
    let { user, password } = await seedUser(app)
    let { cookie } = await login(app, user.email, password)
    let wrong = await app.fetch(routes.app.changePassword.href(), {
      method: 'POST',
      cookie,
      body: form({ _csrf: await csrfFor(app, cookie), current_password: 'bad', new_password: 'newpass1' }),
    })
    assert.equal(wrong.status, 422)
    let ok = await app.fetch(routes.app.changePassword.href(), {
      method: 'POST',
      cookie,
      body: form({ _csrf: await csrfFor(app, cookie), current_password: password, new_password: 'newpass1' }),
    })
    assert.equal(ok.status, 303)
    assert.equal((await login(app, user.email, 'newpass1')).response.status, 303)
  })

  it('lets admins delete users via method override, forbids members', async () => {
    let { user: admin, password } = await seedUser(app, { email: 'admin@x.com', is_admin: 1 })
    let { user: member } = await seedUser(app, { email: 'm@x.com' })
    let { cookie } = await login(app, admin.email, password)

    let dashboard = await app.fetch(routes.app.dashboard.href(), { cookie })
    assert.match(await dashboard.text(), /m@x\.com/)

    let response = await app.fetch(routes.app.deleteUsers.href(), {
      method: 'POST',
      cookie,
      body: form({ _csrf: await csrfFor(app, cookie), _method: 'DELETE', ids: [member.id] }),
    })
    assert.equal(response.status, 303)
    assert.equal(app.repos.users.findById(member.id), undefined)

    let { user: m2, password: p2 } = await seedUser(app, { email: 'm2@x.com' })
    let memberSession = await login(app, m2.email, p2)
    let forbidden = await app.fetch(routes.app.deleteUsers.href(), {
      method: 'DELETE',
      cookie: memberSession.cookie,
      headers: { 'X-Csrf-Token': await csrfFor(app, memberSession.cookie), Accept: 'application/json' },
      body: form({ ids: [admin.id] }),
    })
    assert.equal(forbidden.status, 403)
  })
})
