/**
 * In-memory fixed-window rate limiter keyed by client IP + route. Single-node only (v1 scope).
 */
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

function clientKey(headers: Headers): string {
  let forwarded = headers.get('x-forwarded-for')
  if (forwarded) return forwarded.split(',')[0]!.trim()
  return headers.get('x-real-ip') ?? 'local'
}

export function rateLimit(options: RateLimitOptions): Middleware {
  return async (context, next) => {
    let now = Date.now()
    let key = `${options.name ?? context.url.pathname}:${clientKey(context.headers)}`
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
