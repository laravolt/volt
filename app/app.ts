/**
 * Production/dev application instance: opens the configured SQLite file and builds the router.
 * Kept separate from `router.ts` so tests can build routers against in-memory databases.
 */
import { config } from './config.ts'
import { openDatabase } from './data/db.ts'
import { createAppRouter } from './router.ts'

export const db = openDatabase(config.databaseFile)
export const router = createAppRouter({ db, logging: config.isDevelopment })
