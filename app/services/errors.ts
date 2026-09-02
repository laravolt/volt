/**
 * Typed domain errors raised by services and mapped to HTTP responses by handlers.
 */
export type DomainErrorKind = 'validation' | 'unauthorized' | 'forbidden' | 'not_found' | 'conflict'

export class DomainError extends Error {
  constructor(
    public kind: DomainErrorKind,
    message: string,
    public field?: string,
  ) {
    super(message)
    this.name = 'DomainError'
  }
}

export const errors = {
  validation: (message: string, field?: string) => new DomainError('validation', message, field),
  unauthorized: (message = 'Unauthorized') => new DomainError('unauthorized', message),
  forbidden: (message = 'Forbidden') => new DomainError('forbidden', message),
  notFound: (message = 'Not found') => new DomainError('not_found', message),
  conflict: (message: string, field?: string) => new DomainError('conflict', message, field),
}

export function statusForError(error: DomainError): number {
  switch (error.kind) {
    case 'validation':
      return 422
    case 'unauthorized':
      return 401
    case 'forbidden':
      return 403
    case 'not_found':
      return 404
    case 'conflict':
      return 409
  }
}
