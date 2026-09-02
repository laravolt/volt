/**
 * Session repository — owns all SQL for the `sessions` table.
 * `data` holds the serialized session payload (values + flash) as JSON.
 */
import type { Db } from '../data/db.ts'

export interface SessionRow {
  id: string
  user_id: string | null
  data: string
  expires_at: number
  created_at: number
  updated_at: number
}

export class SessionRepository {
  constructor(private db: Db) {}

  findById(id: string): SessionRow | undefined {
    return this.db.get<SessionRow>(
      'select id, user_id, data, expires_at, created_at, updated_at from sessions where id = ?',
      [id],
    )
  }

  upsert(id: string, userId: string | null, data: string, expiresAt: number): void {
    let now = Date.now()
    this.db.run(
      `insert into sessions (id, user_id, data, expires_at, created_at, updated_at)
       values (?, ?, ?, ?, ?, ?)
       on conflict(id) do update set
         user_id = excluded.user_id,
         data = excluded.data,
         expires_at = excluded.expires_at,
         updated_at = excluded.updated_at`,
      [id, userId, data, expiresAt, now, now],
    )
  }

  delete(id: string): void {
    this.db.run('delete from sessions where id = ?', [id])
  }

  deleteByUserId(userId: string): number {
    return this.db.run('delete from sessions where user_id = ?', [userId]).changes
  }

  deleteExpired(now = Date.now()): number {
    return this.db.run('delete from sessions where expires_at < ?', [now]).changes
  }

  countByUserId(userId: string): number {
    return this.db.get<{ n: number }>('select count(*) as n from sessions where user_id = ?', [
      userId,
    ])?.n ?? 0
  }
}
