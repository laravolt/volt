/**
 * Handler-layer helpers: form parsing, flash reading, error mapping. HTTP-only, no business logic.
 */
import type { Session } from 'remix/session'
import * as s from 'remix/data-schema'
import type { RequestContext } from 'remix/router'

import { DomainError } from '../services/errors.ts'
import type { FieldErrors, FlashMessages } from '../ui/form.tsx'

export type ParseResult<T> = { ok: true; value: T } | { ok: false; errors: FieldErrors }

export function parseForm<T>(schema: s.Schema<any, T>, formData: FormData): ParseResult<T> {
  let result = s.parseSafe(schema, formData)
  if (result.success) return { ok: true, value: result.value }
  let errors: FieldErrors = {}
  for (let issue of result.issues) {
    let key = issue.path?.map((p) => (typeof p === 'object' ? String(p.key) : String(p))).join('.') || '_'
    if (!errors[key]) errors[key] = issue.message
  }
  return { ok: false, errors }
}

export function readFlash(session: Session): FlashMessages {
  let error = session.get('error')
  let success = session.get('success')
  return {
    error: typeof error === 'string' ? error : undefined,
    success: typeof success === 'string' ? success : undefined,
  }
}

export function formValues(formData: FormData, keys: string[]): Record<string, string> {
  let out: Record<string, string> = {}
  for (let key of keys) {
    let v = formData.get(key)
    if (typeof v === 'string') out[key] = v
  }
  return out
}

/** Convert a DomainError into field errors for form re-render; rethrow anything else. */
export function toFieldErrors(error: unknown): FieldErrors {
  if (error instanceof DomainError) return { [error.field ?? '_']: error.message }
  throw error
}

export function wantsJson(context: RequestContext<any, any>): boolean {
  let accept = context.headers.get('Accept') ?? ''
  return accept.includes('application/json') && !accept.includes('text/html')
}

// --- schema helpers (data-schema checks carry no custom message; use refine) ---
export const str = {
  required: (message: string) => s.string().refine((v) => v.trim().length > 0, message),
  min: (n: number, message: string) => s.string().refine((v) => v.length >= n, message),
  email: (message: string) => s.string().refine((v) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v), message),
}
