/**
 * User/profile use-cases.
 */
import type { SessionRepository } from '../repositories/session.repository.ts'
import type { UserRepository, UserRow } from '../repositories/user.repository.ts'
import { type AuthUser, toAuthUser } from './auth.service.ts'
import { errors } from './errors.ts'

export interface PublicUser {
  id: string
  name: string | null
  email: string
  phone: string | null
  avatar: string | null
  is_verified: boolean
  is_admin: boolean
  created_at: number
}

function toPublicUser(row: UserRow): PublicUser {
  return {
    id: row.id,
    name: row.name,
    email: row.email,
    phone: row.phone,
    avatar: row.avatar,
    is_verified: row.is_verified === 1,
    is_admin: row.is_admin === 1,
    created_at: row.created_at,
  }
}

export class UserService {
  constructor(
    private users: UserRepository,
    private sessions?: SessionRepository,
  ) {}

  getProfile(userId: string): PublicUser {
    let user = this.users.findById(userId)
    if (!user) throw errors.notFound('User not found')
    return toPublicUser(user)
  }

  updateProfile(
    userId: string,
    input: { name: string; email: string; phone?: string | null; avatar?: string | null },
  ): AuthUser {
    let email = input.email.trim().toLowerCase()
    if (this.users.emailExists(email, userId)) {
      throw errors.conflict('Email is already used by another account', 'email')
    }
    this.users.updateProfile(userId, {
      name: input.name.trim(),
      email,
      phone: input.phone ?? null,
      avatar: input.avatar ?? null,
    })
    let user = this.users.findById(userId)
    if (!user) throw errors.notFound('User not found')
    return toAuthUser(user)
  }

  listUsers(actor: AuthUser, limit = 100, offset = 0): PublicUser[] {
    if (!actor.is_admin) throw errors.forbidden('Admin access required')
    return this.users.list(limit, offset).map(toPublicUser)
  }

  deleteUsers(actor: AuthUser, ids: string[]): number {
    if (!actor.is_admin) throw errors.forbidden('Admin access required')
    let targets = ids.filter((id) => id !== actor.id)
    if (targets.length === 0) throw errors.validation('Select at least one other user', 'ids')
    let deleted = this.users.deleteMany(targets)
    // A deleted account must not stay signed in anywhere.
    for (let id of targets) this.sessions?.deleteByUserId(id)
    return deleted
  }
}
