/**
 * Router factory. `createAppRouter()` builds the full middleware stack and maps controllers;
 * tests call it with an in-memory database and no rate limits.
 */
import { createRouter, createMiddleware, type MiddlewareContext } from 'remix/router'
import { compression } from 'remix/middleware/compression'
import { formData } from 'remix/middleware/form-data'
import { logger } from 'remix/middleware/logger'
import { methodOverride } from 'remix/middleware/method-override'
import { render } from 'remix/middleware/render'
import { session } from 'remix/middleware/session'
import { staticFiles } from 'remix/middleware/static'
import type { SessionStorage } from 'remix/session'

import appController from './actions/app/controller.tsx'
import authController from './actions/auth/controller.tsx'
import rootController from './actions/controller.tsx'
import passwordController from './actions/password/controller.tsx'
import { assets } from './assets.ts'
import { config } from './config.ts'
import type { Db } from './data/db.ts'
import { loadAuth } from './middleware/auth.ts'
import { csrf } from './middleware/csrf.ts'
import { domainErrors } from './middleware/errors.ts'
import { loadServices } from './middleware/services.ts'
import { createDbSessionStorage, createSessionCookie } from './middleware/session.ts'
import { routes } from './routes.ts'
import { type AppServices, createServices } from './services/index.ts'
import type { Mailer } from './services/mailer.ts'

export interface CreateAppRouterOptions {
  db: Db
  mailer?: Mailer
  sessionStorage?: SessionStorage
  sessionSecret?: string
  /** Disable per-route rate limiting (tests). */
  rateLimits?: boolean
  logging?: boolean
}

function buildMiddleware(services: AppServices, sessionStorage: SessionStorage, secret: string) {
  return createMiddleware(
    compression(),
    staticFiles('./public', { index: false }),
    formData({ maxFileSize: 10 * 1024 * 1024 }),
    methodOverride(),
    session(createSessionCookie(secret, config.isProduction), sessionStorage),
    csrf(),
    domainErrors(),
    loadServices(services),
    loadAuth(),
    render({ assets }),
  )
}

export type AppContext = MiddlewareContext<ReturnType<typeof buildMiddleware>>

declare module 'remix/router' {
  interface RouterTypes {
    context: AppContext
  }
}

export function createAppRouter(options: CreateAppRouterOptions) {
  let { services, repositories } = createServices({
    db: options.db,
    mailer: options.mailer,
    appUrl: config.appUrl,
    resendApiKey: config.mail.resendApiKey,
    mailFrom: config.mail.from,
  })
  let sessionStorage = options.sessionStorage ?? createDbSessionStorage(repositories.sessions)
  let middleware = buildMiddleware(
    services,
    sessionStorage,
    options.sessionSecret ?? config.sessionSecret,
  )

  let router = createRouter<AppContext>({
    middleware: options.logging ? [logger(), ...middleware] : middleware,
    defaultHandler() {
      return new Response('Not Found', { status: 404 })
    },
  })

  router.map(routes, rootController)
  router.map(routes.auth, authController(options.rateLimits ?? true))
  router.map(routes.password, passwordController(options.rateLimits ?? true))
  router.map(routes.app, appController)

  return router
}
