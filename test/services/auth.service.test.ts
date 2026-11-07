import * as assert from 'remix/assert'
import { afterEach, beforeEach, describe, it } from 'remix/test'

import type { Db } from '../../app/data/db.ts'
import { AuthService } from '../../app/services/auth.service.ts'
import { DomainError } from '../../app/services/errors.ts'
import { createRepositories } from '../../app/services/index.ts'
import { MemoryMailer } from '../../app/services/mailer.ts'
import { hashPassword, verifyPassword } from '../../app/services/password.ts'
import { UserService } from '../../app/services/user.service.ts'
import { createTestDb } from '../helpers.ts'

describe('password hashing', () => {
  it('round-trips and rejects wrong passwords', async () => {
    let hash = await hashPassword('hunter2')
    assert.match(hash, /^[0-9a-f]{32}:[0-9a-f]{128}$/)
    assert.equal(await verifyPassword('hunter2', hash), true)
    assert.equal(await verifyPassword('hunter3', hash), false)
    assert.equal(await verifyPassword('x', 'garbage'), false)
  })
})

describe('AuthService', () => {
  let db: Db
  let auth: AuthService
  let mailer: MemoryMailer
  let repos: ReturnType<typeof createRepositories>

  beforeEach(async () => {
    db = await createTestDb()
    repos = createRepositories(db)
    mailer = new MemoryMailer()
    auth = new AuthService(repos.users, repos.sessions, repos.passwordResets, mailer, 'http://app')
  })
  afterEach(() => db.close())

  it('registers then logs in, and rejects duplicates', async () => {
    let user = await auth.register({ name: 'A', email: 'A@X.com', password: 'secret1' })
    assert.equal(user.email, 'a@x.com')
    assert.equal(user.is_admin, false)
    assert.equal((await auth.login({ identifier: 'a@x.com', password: 'secret1' })).id, user.id)
    await assert.rejects(
      auth.register({ name: 'B', email: 'a@x.com', password: 'secret1' }),
      (e: unknown) => e instanceof DomainError && e.kind === 'conflict',
    )
    await assert.rejects(
      auth.login({ identifier: 'a@x.com', password: 'wrong' }),
      (e: unknown) => e instanceof DomainError && e.kind === 'unauthorized',
    )
  })

  it('password reset flow revokes other sessions', async () => {
    let user = await auth.register({ name: 'A', email: 'a@x.com', password: 'secret1' })
    repos.sessions.upsert('old', user.id, '[{},{}]', Date.now() + 10000)

    assert.equal(await auth.requestPasswordReset('nobody@x.com'), null)
    let token = await auth.requestPasswordReset('a@x.com')
    assert.ok(token)
    assert.equal(mailer.sent.length, 1)
    assert.match(mailer.sent[0]!.text, new RegExp(`http://app/reset-password/${token}`))

    await auth.resetPassword(token!, 'newpass1')
    assert.equal(repos.sessions.countByUserId(user.id), 0)
    assert.ok(await auth.login({ identifier: 'a@x.com', password: 'newpass1' }))
    await assert.rejects(auth.resetPassword(token!, 'again'), (e: unknown) => e instanceof DomainError && e.kind === 'not_found')
  })

  it('password change revokes the other sessions and keeps the current one', async () => {
    let user = await auth.register({ name: 'A', email: 'a@x.com', password: 'secret1' })
    repos.sessions.upsert('current', user.id, '[{},{}]', Date.now() + 10000)
    repos.sessions.upsert('other', user.id, '[{},{}]', Date.now() + 10000)

    await auth.changePassword(user.id, 'secret1', 'newpass1', 'current')

    assert.ok(repos.sessions.findById('current'))
    assert.equal(repos.sessions.findById('other'), undefined)
    assert.equal(repos.sessions.countByUserId(user.id), 1)
  })

  it('external login creates the account once', async () => {
    let a = await auth.loginExternal({ email: 'g@x.com', name: 'G', emailVerified: true })
    let b = await auth.loginExternal({ email: 'G@x.com', emailVerified: true })
    assert.equal(a.id, b.id)
    assert.equal(a.is_verified, true)
  })

  it('external login does not link an account when the provider has not verified the email', async () => {
    await auth.register({ name: 'A', email: 'a@x.com', password: 'secret1' })
    await assert.rejects(
      auth.loginExternal({ email: 'a@x.com', emailVerified: false }),
      (e: unknown) => e instanceof DomainError && e.kind === 'unauthorized',
    )
  })

  it('external login takes over an unverified local account from whoever registered it', async () => {
    let squatter = await auth.register({ name: 'S', email: 'owner@x.com', password: 'squatter1' })
    assert.equal(squatter.is_verified, false)
    repos.sessions.upsert('squatter-session', squatter.id, '[{},{}]', Date.now() + 10000)

    let owner = await auth.loginExternal({ email: 'owner@x.com', name: 'Owner', emailVerified: true })

    assert.equal(owner.id, squatter.id)
    assert.equal(owner.is_verified, true)
    assert.equal(repos.sessions.countByUserId(owner.id), 0)
    await assert.rejects(
      auth.login({ identifier: 'owner@x.com', password: 'squatter1' }),
      (e: unknown) => e instanceof DomainError && e.kind === 'unauthorized',
    )
  })
})

describe('UserService', () => {
  it('guards admin operations', async () => {
    let db = await createTestDb()
    let repos = createRepositories(db)
    let auth = new AuthService(repos.users, repos.sessions, repos.passwordResets, new MemoryMailer(), '')
    let users = new UserService(repos.users)
    let admin = await auth.register({ name: 'Admin', email: 'admin@x.com', password: 'secret1' })
    repos.users.updateProfile(admin.id, {}) // no-op touch
    db.run('update users set is_admin = 1 where id = ?', [admin.id])
    admin = { ...admin, is_admin: true }
    let member = await auth.register({ name: 'M', email: 'm@x.com', password: 'secret1' })

    assert.throws(() => users.deleteUsers(member, [admin.id]), (e: unknown) => e instanceof DomainError && e.kind === 'forbidden')
    assert.throws(() => users.deleteUsers(admin, [admin.id]), (e: unknown) => e instanceof DomainError && e.kind === 'validation')
    assert.equal(users.deleteUsers(admin, [member.id]), 1)
    assert.equal(users.listUsers(admin).length, 1)
    db.close()
  })

  it('revokes the sessions of deleted users', async () => {
    let db = await createTestDb()
    let repos = createRepositories(db)
    let auth = new AuthService(repos.users, repos.sessions, repos.passwordResets, new MemoryMailer(), '')
    let users = new UserService(repos.users, repos.sessions)
    let admin = await auth.register({ name: 'Admin', email: 'admin@x.com', password: 'secret1' })
    db.run('update users set is_admin = 1 where id = ?', [admin.id])
    admin = { ...admin, is_admin: true }
    let member = await auth.register({ name: 'M', email: 'm@x.com', password: 'secret1' })
    repos.sessions.upsert('member-session', member.id, '[{},{}]', Date.now() + 10000)
    repos.sessions.upsert('admin-session', admin.id, '[{},{}]', Date.now() + 10000)

    users.deleteUsers(admin, [member.id])

    assert.equal(repos.sessions.countByUserId(member.id), 0)
    assert.ok(repos.sessions.findById('admin-session'))
    db.close()
  })
})
