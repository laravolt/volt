/**
 * Submit button with pending state and form-level double-submit prevention.
 */
import { clientEntry, ref, type Handle } from 'remix/ui'
import { Button, type ButtonColor } from 'volt-preline/button'

export type SubmitButtonProps = {
  label?: string
  pendingText?: string
  color?: ButtonColor
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost'
  className?: string
  disabled?: boolean
}

function SpinnerIcon() {
  return (
    <svg className="size-4 animate-spin text-current" fill="none" viewBox="0 0 24 24" aria-hidden="true">
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
      <path
        className="opacity-75"
        fill="currentColor"
        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
      />
    </svg>
  )
}

export const SubmitButton = clientEntry<SubmitButtonProps>(
  import.meta.url,
  function SubmitButton(handle: Handle<SubmitButtonProps>) {
    let pending = false

    let bindForm = ref((node, signal) => {
      if (!(node instanceof HTMLButtonElement)) return
      let form = node.form
      if (!form) return

      form.addEventListener(
        'submit',
        (event) => {
          if (pending) {
            event.preventDefault()
            return
          }
          if (!form.checkValidity()) return

          pending = true
          form.setAttribute('aria-busy', 'true')
          handle.update()
        },
        { signal },
      )
    })

    return () => {
      let {
        label = 'Simpan',
        pendingText = 'Menyimpan...',
        color = 'blue',
        variant = 'primary',
        className = '',
        disabled = false,
      } = handle.props

      let content = pending ? (
        <span className="inline-flex items-center gap-2" role="status">
          {SpinnerIcon()}
          <span>{pendingText}</span>
        </span>
      ) : (
        label
      )

      let common = {
        type: 'submit' as const,
        disabled: disabled || pending,
        'aria-busy': pending ? 'true' : 'false',
        className,
        mix: bindForm,
      }

      if (variant === 'ghost') {
        return (
          <Button {...common} plain>
            {content}
          </Button>
        )
      }

      if (variant === 'outline' || variant === 'secondary') {
        return (
          <Button {...common} outline>
            {content}
          </Button>
        )
      }

      return (
        <Button {...common} color={color}>
          {content}
        </Button>
      )
    }
  },
)
