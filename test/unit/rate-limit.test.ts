import * as assert from 'remix/assert'
import { beforeEach, describe, it } from 'remix/test'

import { rateLimit, resetRateLimits, withClientAddress } from '../../app/middleware/rate-limit.ts'

function call(mw: ReturnType<typeof rateLimit>, headers: Record<string, string> = {}) {
  let context = { url: new URL('http://app/login'), headers: new Headers(headers) } as any
  return mw(context, async () => new Response('OK')) as Promise<Response>
}

describe('rateLimit', () => {
  beforeEach(() => resetRateLimits())

  it('ignores X-Forwarded-For sent by the client', async () => {
    let mw = rateLimit({ windowMs: 60_000, max: 1, name: 'login' })
    await withClientAddress('203.0.113.7', async () => {
      assert.equal((await call(mw, { 'x-forwarded-for': '198.51.100.1' })).status, 200)
      assert.equal((await call(mw, { 'x-forwarded-for': '198.51.100.2' })).status, 429)
    })
  })

  it('keys buckets by the connection address', async () => {
    let mw = rateLimit({ windowMs: 60_000, max: 1, name: 'login' })
    assert.equal((await withClientAddress('203.0.113.7', () => call(mw))).status, 200)
    assert.equal((await withClientAddress('203.0.113.7', () => call(mw))).status, 429)
    assert.equal((await withClientAddress('203.0.113.8', () => call(mw))).status, 200)
  })
})
