/**
 * Auto-focuses the first form field with an error on mount.
 * Implements UAT Rule #6 and Rule #7 (Error border beats focus ring).
 */
import { clientEntry, type Handle } from 'remix/ui'

export type AutoFocusErrorProps = {
  selector?: string
}

export const AutoFocusError = clientEntry<AutoFocusErrorProps>(
  import.meta.url,
  function AutoFocusError(handle: Handle<AutoFocusErrorProps>) {
    let focused = false

    return () => {
      let { selector = '[aria-invalid="true"], .is-invalid, [data-invalid="true"]' } = handle.props

      if (!focused && typeof window !== 'undefined') {
        setTimeout(() => {
          let firstError = document.querySelector<HTMLElement>(selector)
          if (firstError) {
            firstError.focus()
            firstError.setAttribute('data-focused-error', 'true')
            focused = true
          }
        }, 50)
      }

      return null
    }
  },
)
