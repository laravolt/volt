import * as assert from 'remix/assert'
import { afterEach, beforeEach, describe, it } from 'remix/test'

import type { Db } from '../../app/data/db.ts'
import { SessionRepository } from '../../app/repositories/session.repository.ts'
import { UserRepository } from '../../app/repositories/user.repository.ts'
import { createTestDb } from '../helpers.ts'

describe('UserRepository', () => {
  let db: Db
  let users: UserRepository
  beforeEach(async () => {
    db = await createTestDb()
    users = new UserRepository(db)
  })
  afterEach(() => db.close())

  it('creates and finds users case-insensitively by email', () => {
    let created = users.create({ id: 'u1', email: 'Bob@Example.com', password: 'x', name: 'Bob' })
    assert.equal(created.name, 'Bob')
    assert.equal(users.findByEmail('bob@example.com')?.id, 'u1')
    assert.equal(users.emailExists('BOB@example.com'), true)
    assert.equal(users.emailExists('bob@example.com', 'u1'), false)
  })

  it('enforces unique email', () => {
    users.create({ id: 'u1', email: 'a@x.com', password: 'x' })
    assert.throws(() => users.create({ id: 'u2', email: 'a@x.com', password: 'x' }))
  })

  it('updates profile fields selectively', () => {
    users.create({ id: 'u1', email: 'a@x.com', password: 'x', name: 'A', phone: '0811' })
    users.updateProfile('u1', { name: 'B' })
    let row = users.findById('u1')!
    assert.equal(row.name, 'B')
    assert.equal(row.phone, '0811')
  })

  it('deletes many and counts', () => {
    users.create({ id: 'u1', email: 'a@x.com', password: 'x' })
    users.create({ id: 'u2', email: 'b@x.com', password: 'x' })
    assert.equal(users.count(), 2)
    assert.equal(users.deleteMany(['u1', 'u2']), 2)
    assert.equal(users.count(), 0)
  })
})

describe('SessionRepository', () => {
  it('upserts, expires and revokes by user', async () => {
    let db = await createTestDb()
    let sessions = new SessionRepository(db)
    sessions.upsert('s1', 'u1', '[{},{}]', Date.now() + 1000)
    sessions.upsert('s1', 'u1', '[{"a":1},{}]', Date.now() + 1000)
    assert.equal(sessions.findById('s1')?.data, '[{"a":1},{}]')
    sessions.upsert('s2', 'u1', '[{},{}]', Date.now() - 1)
    assert.equal(sessions.deleteExpired(), 1)
    assert.equal(sessions.deleteByUserId('u1'), 1)
    db.close()
  })
})
