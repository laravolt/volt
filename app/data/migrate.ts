/**
 * Migration runner built on `remix/data-table` SQL migrations.
 *
 * Migrations live in `db/migrations/<YYYYMMDDHHmmss>_<slug>/{up,down}.sql`.
 * The journal table matches `remix.json` so `remix db status|migrate|rollback`
 * and this runner share the same history.
 */
import * as path from 'node:path'
import { fileURLToPath } from 'node:url'
import { loadMigrations } from 'remix/data-table/migrations/node'
import { createSqliteDatabase } from 'remix/data-table/sqlite'

import type { Db } from './db.ts'

export const MIGRATIONS_DIR = path.resolve(import.meta.dirname, '../../db/migrations')
export const JOURNAL_TABLE = 'velix_migrations'

export async function migrate(db: Db, direction: 'up' | 'down' = 'up', step?: number) {
  let migrations = await loadMigrations(MIGRATIONS_DIR)
  let dt = createSqliteDatabase(db.client)
  return direction === 'down'
    ? dt.migrate(migrations, { direction, journalTable: JOURNAL_TABLE, step: step ?? 1 })
    : dt.migrate(migrations, { direction, journalTable: JOURNAL_TABLE })
}

export async function migrationStatus(db: Db) {
  let migrations = await loadMigrations(MIGRATIONS_DIR)
  let dt = createSqliteDatabase(db.client)
  return dt.migrationStatus(migrations, { journalTable: JOURNAL_TABLE })
}

// CLI: node --import remix/node-tsx app/data/migrate.ts [up|down|status]
if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  let { config } = await import('../config.ts')
  let { openDatabase } = await import('./db.ts')
  let command = process.argv[2] ?? 'up'
  let db = openDatabase(config.databaseFile)
  try {
    if (command === 'status') {
      for (let entry of await migrationStatus(db)) console.log(`${entry.status}\t${entry.name}`)
    } else if (command === 'down') {
      let result = await migrate(db, 'down', Number(process.argv[3] ?? 1))
      console.log(`Rolled back ${result.applied.length} migration(s)`)
    } else {
      let result = await migrate(db, 'up')
      console.log(`Applied ${result.applied.length} migration(s)`)
    }
  } finally {
    db.close()
  }
}
