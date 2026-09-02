/**
 * Password hashing (PBKDF2-SHA512), format `salt:hash` — compatible with laju hashes.
 */
import { pbkdf2, randomBytes, timingSafeEqual } from 'node:crypto'
import { promisify } from 'node:util'

const pbkdf2Async = promisify(pbkdf2)
const ITERATIONS = 100_000
const KEYLEN = 64
const DIGEST = 'sha512'
const SALT_SIZE = 16

export async function hashPassword(password: string): Promise<string> {
  let salt = randomBytes(SALT_SIZE).toString('hex')
  let hash = await pbkdf2Async(password, salt, ITERATIONS, KEYLEN, DIGEST)
  return `${salt}:${hash.toString('hex')}`
}

export async function verifyPassword(password: string, stored: string): Promise<boolean> {
  let [salt, hex] = stored.split(':')
  if (!salt || !hex) return false
  let expected = Buffer.from(hex, 'hex')
  let actual = await pbkdf2Async(password, salt, ITERATIONS, KEYLEN, DIGEST)
  return actual.length === expected.length && timingSafeEqual(actual, expected)
}
