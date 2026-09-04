/**
 * Focuses the first invalid field after hydration.
 * For multiple errors, use a focused error summary instead.
 */
import { clientEntry, type Handle } from 'remix/ui'

export type AutoFocusErrorProps = {
  selector?: string
}

export const AutoFocusError = clientEntry<AutoFocusErrorProps>(
  import.meta.url,
  function AutoFocusError(handle: Handle<AutoFocusErrorProps>) {
    let focused = false

    handle.queueTask(() => {
      if (focused) return
      let selector = handle.props.selector ?? '[aria-invalid="true"], .is-invalid, [data-invalid="true"]'
      let firstError = document.querySelector<HTMLElement>(selector)
      if (!firstError) return

      firstError.focus()
      firstError.setAttribute('data-focused-error', 'true')
      focused = true
    })

    return () => null
  },
)
