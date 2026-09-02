/**
 * DB-backed session storage: the signed cookie carries only the session id; the payload
 * (values + flash) lives in `sessions.data`. `sessions.user_id` mirrors the cached auth identity
 * so all sessions of a user can be revoked.
 */
import { createCookie } from 'remix/cookie'
import { createSession, type Session, type SessionStorage } from 'remix/session'

import type { SessionRepository } from '../repositories/session.repository.ts'

export const SESSION_COOKIE = 'volt_session'
export const SESSION_TTL_MS = 60 * 24 * 60 * 60 * 1000 // 60 days

export function createSessionCookie(secret: string, secure: boolean) {
  return createCookie(SESSION_COOKIE, {
    secrets: [secret],
    httpOnly: true,
    sameSite: 'Lax',
    secure,
    path: '/',
    maxAge: SESSION_TTL_MS / 1000,
  })
}

export function createDbSessionStorage(
  sessions: SessionRepository,
  ttlMs = SESSION_TTL_MS,
): SessionStorage {
  return {
    async read(cookie) {
      if (cookie) {
        let row = sessions.findById(cookie)
        if (row) {
          if (row.expires_at > Date.now()) {
            try {
              return createSession(cookie, JSON.parse(row.data))
            } catch {
              // corrupt payload: fall through to a fresh session
            }
          }
          sessions.delete(cookie)
        }
      }
      return createSession()
    },

    async save(session: Session) {
      if (session.deleteId) sessions.delete(session.deleteId)
      if (session.destroyed) {
        sessions.delete(session.id)
        return ''
      }
      if (session.dirty) {
        let auth = session.get('auth') as { id?: string } | undefined
        sessions.upsert(
          session.id,
          typeof auth?.id === 'string' ? auth.id : null,
          JSON.stringify(session.data),
          Date.now() + ttlMs,
        )
        return session.id
      }
      return null
    },
  }
}
