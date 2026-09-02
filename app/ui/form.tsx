/**
 * Small form helpers shared by pages: CSRF hidden field, flash/notice banner, error types.
 * Visual components come from `volt-preline`.
 */
import type { Handle } from 'remix/ui'
import { Text } from 'volt-preline/text'

export type FieldErrors = Record<string, string>

export interface FlashMessages {
  error?: string
  success?: string
}

export function CsrfField(handle: Handle<{ token: string }>) {
  return () => <input type="hidden" name="_csrf" value={handle.props.token} />
}

/** Inline notice (the UI kits only ship modal alerts). Renders nothing without a message. */
export function Notice(handle: Handle<{ flash?: FlashMessages; error?: string }>) {
  return () => {
    let { flash, error } = handle.props
    let err = error ?? flash?.error
    if (err) {
      return (
        <div role="alert" className="rounded-lg bg-red-500/10 px-4 py-3 ring-1 ring-red-500/20 ring-inset dark:bg-red-500/10">
          <Text className="text-red-700! dark:text-red-400!">{err}</Text>
        </div>
      )
    }
    if (flash?.success) {
      return (
        <div role="status" className="rounded-lg bg-green-500/10 px-4 py-3 ring-1 ring-green-500/20 ring-inset">
          <Text className="text-green-700! dark:text-green-400!">{flash.success}</Text>
        </div>
      )
    }
    return null
  }
}
