/**
 * User repository — owns all SQL for the `users` table.
 */
import type { Db } from '../data/db.ts'

export interface UserRow {
  id: string
  name: string | null
  email: string
  phone: string | null
  avatar: string | null
  is_verified: number
  is_admin: number
  password: string
  created_at: number
  updated_at: number
}

export interface CreateUserData {
  id: string
  email: string
  password: string
  name?: string | null
  phone?: string | null
  avatar?: string | null
  is_verified?: number
  is_admin?: number
}

export interface UpdateProfileData {
  name?: string | null
  email?: string
  phone?: string | null
  avatar?: string | null
}

const COLUMNS =
  'id, name, email, phone, avatar, is_verified, is_admin, password, created_at, updated_at'

export class UserRepository {
  constructor(private db: Db) {}

  findById(id: string): UserRow | undefined {
    return this.db.get<UserRow>(`select ${COLUMNS} from users where id = ?`, [id])
  }

  findByEmail(email: string): UserRow | undefined {
    return this.db.get<UserRow>(`select ${COLUMNS} from users where lower(email) = lower(?)`, [
      email,
    ])
  }

  findByPhone(phone: string): UserRow | undefined {
    return this.db.get<UserRow>(`select ${COLUMNS} from users where phone = ?`, [phone])
  }

  emailExists(email: string, excludeId?: string): boolean {
    let row = excludeId
      ? this.db.get<{ n: number }>(
          'select count(*) as n from users where lower(email) = lower(?) and id <> ?',
          [email, excludeId],
        )
      : this.db.get<{ n: number }>('select count(*) as n from users where lower(email) = lower(?)', [
          email,
        ])
    return (row?.n ?? 0) > 0
  }

  create(data: CreateUserData): UserRow {
    let now = Date.now()
    this.db.run(
      `insert into users (id, email, password, name, phone, avatar, is_verified, is_admin, created_at, updated_at)
       values (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        data.id,
        data.email,
        data.password,
        data.name ?? null,
        data.phone ?? null,
        data.avatar ?? null,
        data.is_verified ?? 0,
        data.is_admin ?? 0,
        now,
        now,
      ],
    )
    let user = this.findById(data.id)
    if (!user) throw new Error('Failed to create user')
    return user
  }

  updateProfile(id: string, data: UpdateProfileData): void {
    let sets: string[] = []
    let params: unknown[] = []
    for (let key of ['name', 'email', 'phone', 'avatar'] as const) {
      if (data[key] !== undefined) {
        sets.push(`${key} = ?`)
        params.push(data[key])
      }
    }
    sets.push('updated_at = ?')
    params.push(Date.now(), id)
    this.db.run(`update users set ${sets.join(', ')} where id = ?`, params)
  }

  updatePassword(id: string, hashedPassword: string): void {
    this.db.run('update users set password = ?, updated_at = ? where id = ?', [
      hashedPassword,
      Date.now(),
      id,
    ])
  }

  deleteMany(ids: string[]): number {
    if (ids.length === 0) return 0
    let placeholders = ids.map(() => '?').join(',')
    return this.db.run(`delete from users where id in (${placeholders})`, ids).changes
  }

  list(limit = 100, offset = 0): UserRow[] {
    return this.db.all<UserRow>(
      `select ${COLUMNS} from users order by created_at desc limit ? offset ?`,
      [limit, offset],
    )
  }

  count(): number {
    return this.db.get<{ n: number }>('select count(*) as n from users')?.n ?? 0
  }
}
