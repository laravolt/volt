/**
 * Maps thrown DomainErrors to HTTP responses so raw errors never leak to users.
 */
import type { Middleware } from 'remix/router'

import { DomainError, statusForError } from '../services/errors.ts'

export function domainErrors(): Middleware {
  return async (_context, next) => {
    try {
      return await next()
    } catch (error) {
      if (error instanceof DomainError) {
        return Response.json(
          { success: false, error: { kind: error.kind, message: error.message, field: error.field } },
          { status: statusForError(error) },
        )
      }
      throw error
    }
  }
}
