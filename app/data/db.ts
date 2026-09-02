/**
 * SQLite connection (better-sqlite3).
 *
 * This is the only module that opens the database. Repositories receive a `Db`
 * instance and are the only layer allowed to run SQL against it.
 */
import BetterSqlite3 from 'better-sqlite3'
import * as fs from 'node:fs'
import * as path from 'node:path'

export interface RunResult {
  changes: number
  lastInsertRowid: number
}

export interface Db {
  get<T = Record<string, unknown>>(sql: string, params?: unknown[]): T | undefined
  all<T = Record<string, unknown>>(sql: string, params?: unknown[]): T[]
  run(sql: string, params?: unknown[]): RunResult
  transaction<T>(fn: () => T): T
  /** Raw client, for the migration runner and tests only. */
  readonly client: BetterSqlite3.Database
  close(): void
}

export function openDatabase(filename: string): Db {
  if (filename !== ':memory:') {
    let dir = path.dirname(path.resolve(filename))
    try {
      fs.mkdirSync(dir, { recursive: true })
    } catch (error) {
      throw new Error(
        `Cannot create database directory "${dir}" for DATABASE_FILE="${filename}". ` +
          'Check the DATABASE_FILE environment variable (default ./db/volt.sqlite).',
        { cause: error },
      )
    }
  }
  let client = new BetterSqlite3(filename)
  client.pragma('journal_mode = WAL')
  client.pragma('synchronous = NORMAL')
  client.pragma('foreign_keys = ON')
  client.pragma('busy_timeout = 5000')

  let cache = new Map<string, BetterSqlite3.Statement>()
  function prepare(sql: string) {
    let stmt = cache.get(sql)
    if (!stmt) {
      stmt = client.prepare(sql)
      cache.set(sql, stmt)
    }
    return stmt
  }

  return {
    client,
    get<T>(sql: string, params: unknown[] = []) {
      return prepare(sql).get(...params) as T | undefined
    },
    all<T>(sql: string, params: unknown[] = []) {
      return prepare(sql).all(...params) as T[]
    },
    run(sql: string, params: unknown[] = []) {
      let result = prepare(sql).run(...params)
      return { changes: result.changes, lastInsertRowid: Number(result.lastInsertRowid) }
    },
    transaction<T>(fn: () => T): T {
      return client.transaction(fn)()
    },
    close() {
      cache.clear()
      client.close()
    },
  }
}
