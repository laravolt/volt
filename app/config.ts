/**
 * Runtime configuration read from the environment once at startup.
 */
import { randomBytes } from 'node:crypto'

const nodeEnv = process.env.NODE_ENV ?? 'development'
const isTest = nodeEnv === 'test'
const isProduction = nodeEnv === 'production'

let sessionSecret = process.env.SESSION_SECRET
if (!sessionSecret) {
  if (isProduction) throw new Error('SESSION_SECRET is required in production')
  // Dev/test fallback: ephemeral secret (sessions reset on restart).
  sessionSecret = isTest ? 'test-only-secret' : randomBytes(32).toString('hex')
}

export const config = {
  nodeEnv,
  isTest,
  isProduction,
  isDevelopment: nodeEnv === 'development',
  port: process.env.PORT ? Number.parseInt(process.env.PORT, 10) : 5555,
  appUrl: process.env.APP_URL ?? 'http://localhost:5555',
  sessionSecret,
  databaseFile: process.env.DATABASE_FILE ?? './db/velix.sqlite',
  google: {
    clientId: process.env.GOOGLE_CLIENT_ID ?? '',
    clientSecret: process.env.GOOGLE_CLIENT_SECRET ?? '',
  },
  mail: {
    resendApiKey: process.env.RESEND_API_KEY ?? '',
    from: process.env.MAIL_FROM ?? 'Velix <noreply@example.com>',
  },
} as const
