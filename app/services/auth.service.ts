/**
 * Authentication use-cases: register, login, password reset, change password, external login.
 * No HTTP primitives, no SQL.
 */
import { randomUUID } from 'node:crypto'

import type { PasswordResetRepository } from '../repositories/password-reset.repository.ts'
import type { SessionRepository } from '../repositories/session.repository.ts'
import type { UserRepository, UserRow } from '../repositories/user.repository.ts'
import { errors } from './errors.ts'
import type { Mailer } from './mailer.ts'
import { hashPassword, verifyPassword } from './password.ts'

/** Minimal identity cached in the session payload. Never includes password/phone. */
export interface AuthUser {
  id: string
  name: string | null
  email: string
  avatar: string | null
  is_admin: boolean
  is_verified: boolean
}

export function toAuthUser(user: UserRow): AuthUser {
  return {
    id: user.id,
    name: user.name,
    email: user.email,
    avatar: user.avatar,
    is_admin: user.is_admin === 1,
    is_verified: user.is_verified === 1,
  }
}

export const RESET_TOKEN_TTL_MS = 24 * 60 * 60 * 1000

export class AuthService {
  constructor(
    private users: UserRepository,
    private sessions: SessionRepository,
    private resets: PasswordResetRepository,
    private mailer: Mailer,
    private appUrl: string,
  ) {}

  async register(input: { name: string; email: string; password: string }): Promise<AuthUser> {
    let email = input.email.trim().toLowerCase()
    if (this.users.emailExists(email)) {
      throw errors.conflict('Email already registered. Please use another email or login.', 'email')
    }
    let user = this.users.create({
      id: randomUUID(),
      email,
      name: input.name.trim(),
      password: await hashPassword(input.password),
    })
    return toAuthUser(user)
  }

  async login(input: { identifier: string; password: string }): Promise<AuthUser> {
    let identifier = input.identifier.trim()
    let user = identifier.includes('@')
      ? this.users.findByEmail(identifier.toLowerCase())
      : this.users.findByPhone(identifier)
    if (!user) throw errors.unauthorized('Email/phone not registered')
    if (!(await verifyPassword(input.password, user.password))) {
      throw errors.unauthorized('Incorrect password')
    }
    return toAuthUser(user)
  }

  /** Login/registration via a verified external identity provider (e.g. Google). */
  async loginExternal(profile: {
    email: string
    name?: string | null
    avatar?: string | null
    emailVerified?: boolean
  }): Promise<AuthUser> {
    let email = profile.email.trim().toLowerCase()
    let user = this.users.findByEmail(email)
    if (!user) {
      user = this.users.create({
        id: randomUUID(),
        email,
        name: profile.name ?? null,
        avatar: profile.avatar ?? null,
        is_verified: profile.emailVerified ? 1 : 0,
        // Unusable random password; user can set one via password reset.
        password: await hashPassword(randomUUID()),
      })
    }
    return toAuthUser(user)
  }

  async changePassword(userId: string, currentPassword: string, newPassword: string) {
    let user = this.users.findById(userId)
    if (!user) throw errors.notFound('User not found')
    if (!(await verifyPassword(currentPassword, user.password))) {
      throw errors.validation('Current password does not match', 'current_password')
    }
    this.users.updatePassword(user.id, await hashPassword(newPassword))
  }

  /**
   * Request a password reset. Always resolves (no user enumeration); sends mail only when the
   * account exists. Returns the token for tests/logging callers that need it.
   */
  async requestPasswordReset(identifier: string): Promise<string | null> {
    let id = identifier.trim()
    let user = id.includes('@') ? this.users.findByEmail(id.toLowerCase()) : this.users.findByPhone(id)
    if (!user) return null

    let token = randomUUID()
    this.resets.deleteByEmail(user.email)
    this.resets.create(user.email, token, Date.now() + RESET_TOKEN_TTL_MS)

    let link = `${this.appUrl}/reset-password/${token}`
    try {
      await this.mailer.send({
        to: user.email,
        subject: 'Reset Password',
        text: `You requested a password reset. Open this link to continue:\n\n${link}\n\nIf you did not request this, ignore this email. The link expires in 24 hours.`,
      })
    } catch (error) {
      console.error('Password reset mail failed:', error)
    }
    return token
  }

  /** Validate a reset token; throws not_found when invalid/expired. */
  validateResetToken(token: string) {
    let row = this.resets.findValidByToken(token)
    if (!row) throw errors.notFound('Link is invalid or has expired')
    return row
  }

  async resetPassword(token: string, newPassword: string): Promise<AuthUser> {
    let row = this.validateResetToken(token)
    let user = this.users.findByEmail(row.email)
    if (!user) throw errors.notFound('User not found')
    this.users.updatePassword(user.id, await hashPassword(newPassword))
    this.resets.deleteByToken(token)
    // Password changed: revoke every other session for this user.
    this.sessions.deleteByUserId(user.id)
    return toAuthUser(user)
  }
}
