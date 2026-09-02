/**
 * Password reset token repository — owns all SQL for `password_reset_tokens`.
 */
import type { Db } from '../data/db.ts'

export interface PasswordResetTokenRow {
  id: number
  email: string
  token: string
  expires_at: number
  created_at: number
}

export class PasswordResetRepository {
  constructor(private db: Db) {}

  findValidByToken(token: string, now = Date.now()): PasswordResetTokenRow | undefined {
    return this.db.get<PasswordResetTokenRow>(
      'select id, email, token, expires_at, created_at from password_reset_tokens where token = ? and expires_at > ?',
      [token, now],
    )
  }

  create(email: string, token: string, expiresAt: number): void {
    this.db.run(
      'insert into password_reset_tokens (email, token, expires_at, created_at) values (?, ?, ?, ?)',
      [email, token, expiresAt, Date.now()],
    )
  }

  deleteByToken(token: string): void {
    this.db.run('delete from password_reset_tokens where token = ?', [token])
  }

  deleteByEmail(email: string): void {
    this.db.run('delete from password_reset_tokens where email = ?', [email])
  }

  deleteExpired(now = Date.now()): number {
    return this.db.run('delete from password_reset_tokens where expires_at < ?', [now]).changes
  }
}
