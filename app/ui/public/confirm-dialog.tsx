/**
 * Reusable confirmation dialog wrapping volt-preline Alert.
 */
import { clientEntry, on, type Handle } from 'remix/ui'
import { Alert, AlertActions, AlertDescription, AlertTitle } from 'volt-preline/alert'
import { Button, type ButtonColor } from 'volt-preline/button'

export type ConfirmDialogProps = {
  triggerLabel: string
  triggerVariant?: 'primary' | 'secondary' | 'outline' | 'ghost'
  triggerColor?: ButtonColor
  dialogTitle: string
  dialogDescription: string
  confirmLabel?: string
  cancelLabel?: string
  confirmColor?: ButtonColor
  formAction?: string
  formMethod?: string
  csrfToken?: string
  formId?: string
  className?: string
}

export const ConfirmDialog = clientEntry<ConfirmDialogProps>(
  import.meta.url,
  function ConfirmDialog(handle: Handle<ConfirmDialogProps>) {
    let open = false

    return () => {
      let {
        triggerLabel,
        triggerVariant = 'outline',
        triggerColor = 'red',
        dialogTitle,
        dialogDescription,
        confirmLabel = 'Hapus',
        cancelLabel = 'Batal',
        confirmColor = 'red',
        formAction,
        formMethod = 'POST',
        csrfToken,
        formId,
        className = '',
      } = handle.props

      let openDialog = on<HTMLButtonElement, 'click'>('click', () => {
        open = true
        handle.update()
      })

      let trigger =
        triggerVariant === 'ghost' ? (
          <Button type="button" plain mix={openDialog}>
            {triggerLabel}
          </Button>
        ) : triggerVariant === 'outline' || triggerVariant === 'secondary' ? (
          <Button type="button" outline mix={openDialog}>
            {triggerLabel}
          </Button>
        ) : (
          <Button type="button" color={triggerColor} mix={openDialog}>
            {triggerLabel}
          </Button>
        )

      return (
        <div className={className}>
          {trigger}

          <Alert
            className="text-center"
            open={open}
            onClose={() => {
              open = false
              handle.update()
            }}
          >
            <AlertTitle>{dialogTitle}</AlertTitle>
            <AlertDescription>{dialogDescription}</AlertDescription>
            <AlertActions className="sm:justify-center">
              <Button
                type="button"
                plain
                mix={on<HTMLButtonElement, 'click'>('click', () => {
                  open = false
                  handle.update()
                })}
              >
                {cancelLabel}
              </Button>

              {formAction ? (
                <form method={formMethod} action={formAction}>
                  {csrfToken && <input type="hidden" name="_csrf" value={csrfToken} />}
                  <Button type="submit" color={confirmColor}>
                    {confirmLabel}
                  </Button>
                </form>
              ) : (
                <Button
                  type="button"
                  color={confirmColor}
                  mix={on<HTMLButtonElement, 'click'>('click', () => {
                    open = false
                    handle.update()
                    if (formId) {
                      let form = document.getElementById(formId) as HTMLFormElement | null
                      form?.requestSubmit()
                    }
                  })}
                >
                  {confirmLabel}
                </Button>
              )}
            </AlertActions>
          </Alert>
        </div>
      )
    }
  },
)
