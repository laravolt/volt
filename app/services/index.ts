/**
 * Composition root: Db -> Repositories -> Services.
 */
import type { Db } from '../data/db.ts'
import { PasswordResetRepository } from '../repositories/password-reset.repository.ts'
import { SessionRepository } from '../repositories/session.repository.ts'
import { UserRepository } from '../repositories/user.repository.ts'
import { AuthService } from './auth.service.ts'
import { ConsoleMailer, type Mailer, ResendMailer } from './mailer.ts'
import { UserService } from './user.service.ts'

export interface AppServices {
  auth: AuthService
  user: UserService
}

export interface AppRepositories {
  users: UserRepository
  sessions: SessionRepository
  passwordResets: PasswordResetRepository
}

export interface CreateServicesOptions {
  db: Db
  mailer?: Mailer
  appUrl: string
  resendApiKey?: string
  mailFrom?: string
}

export function createRepositories(db: Db): AppRepositories {
  return {
    users: new UserRepository(db),
    sessions: new SessionRepository(db),
    passwordResets: new PasswordResetRepository(db),
  }
}

export function createServices(options: CreateServicesOptions): {
  services: AppServices
  repositories: AppRepositories
} {
  let repositories = createRepositories(options.db)
  let mailer =
    options.mailer ??
    (options.resendApiKey
      ? new ResendMailer(options.resendApiKey, options.mailFrom ?? 'noreply@example.com')
      : new ConsoleMailer())

  let services: AppServices = {
    auth: new AuthService(
      repositories.users,
      repositories.sessions,
      repositories.passwordResets,
      mailer,
      options.appUrl,
    ),
    user: new UserService(repositories.users),
  }
  return { services, repositories }
}
