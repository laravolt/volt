/**
 * In-memory fixed-window rate limiter keyed by client IP + route. Single-node only (v1 scope).
 *
 * The client IP is the one node-fetch-server resolved for the connection, which only reads
 * forwarded headers when TRUST_PROXY is on. Request headers are never used directly.
 */
import { AsyncLocalStorage } from 'node:async_hooks'
import type { Middleware } from 'remix/router'

export interface RateLimitOptions {
  windowMs: number
  max: number
  name?: string
  onLimited?: (context: any, retryAfterSec: number) => Response | Promise<Response>
}

interface Bucket {
  count: number
  resetAt: number
}

const buckets = new Map<string, Bucket>()

export function resetRateLimits() {
  buckets.clear()
}

const clientAddress = new AsyncLocalStorage<string>()

/** Run `fn` with the connection's client address (see server.ts). */
export function withClientAddress<T>(address: string, fn: () => T): T {
  return clientAddress.run(address, fn)
}

function clientKey(): string {
  return clientAddress.getStore() ?? 'local'
}

export function rateLimit(options: RateLimitOptions): Middleware {
  return async (context, next) => {
    let now = Date.now()
    let key = `${options.name ?? context.url.pathname}:${clientKey()}`
    let bucket = buckets.get(key)
    if (!bucket || bucket.resetAt <= now) {
      bucket = { count: 0, resetAt: now + options.windowMs }
      buckets.set(key, bucket)
    }
    bucket.count++
    if (bucket.count > options.max) {
      let retryAfter = Math.max(1, Math.ceil((bucket.resetAt - now) / 1000))
      if (options.onLimited) {
        let res = await options.onLimited(context, retryAfter)
        if (!res.headers.has('Retry-After')) {
          res.headers.set('Retry-After', String(retryAfter))
        }
        return res
      }
      return new Response('Too Many Requests', {
        status: 429,
        headers: { 'Retry-After': String(retryAfter) },
      })
    }
    return next()
  }
}

/** Opportunistic cleanup of expired buckets. */
setInterval(() => {
  let now = Date.now()
  for (let [key, bucket] of buckets) if (bucket.resetAt <= now) buckets.delete(key)
}, 60_000).unref()
