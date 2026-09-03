/**
 * Toast notification component with auto-dismiss, variants, and aria-live.
 * Follows UAT Rule #4.
 */
import { clientEntry, on, type Handle } from 'remix/ui'

export type ToastVariant = 'success' | 'error' | 'warning' | 'info'

export type ToastItem = {
  id: string
  title?: string
  message: string
  variant?: ToastVariant
  durationMs?: number
}

export type ToastProps = {
  toasts: ToastItem[]
  position?: 'top-right' | 'top-left' | 'bottom-right' | 'bottom-left'
}

export const Toast = clientEntry<ToastProps>(import.meta.url, function Toast(handle: Handle<ToastProps>) {
  let activeToasts: ToastItem[] = [...handle.props.toasts]
  let timers: Record<string, ReturnType<typeof setTimeout>> = {}

  function dismiss(id: string) {
    if (timers[id]) {
      clearTimeout(timers[id])
      delete timers[id]
    }
    activeToasts = activeToasts.filter((t) => t.id !== id)
    handle.update()
  }

  // Set up auto-dismiss timers
  for (let t of activeToasts) {
    if (!timers[t.id]) {
      let duration = t.durationMs ?? 5000
      timers[t.id] = setTimeout(() => {
        dismiss(t.id)
      }, duration)
    }
  }

  return () => {
    let { position = 'top-right' } = handle.props

    if (activeToasts.length === 0) return null

    let positionStyles = {
      'top-right': 'top-4 right-4',
      'top-left': 'top-4 left-4',
      'bottom-right': 'bottom-4 right-4',
      'bottom-left': 'bottom-4 left-4',
    }

    let variantStyles = {
      success: 'bg-card border-green-500/30 text-foreground',
      error: 'bg-card border-red-500/30 text-foreground',
      warning: 'bg-card border-amber-500/30 text-foreground',
      info: 'bg-card border-blue-500/30 text-foreground',
    }

    let badgeColors = {
      success: 'bg-green-500/10 text-green-700 dark:text-green-400',
      error: 'bg-red-500/10 text-red-700 dark:text-red-400',
      warning: 'bg-amber-500/10 text-amber-700 dark:text-amber-400',
      info: 'bg-blue-500/10 text-blue-700 dark:text-blue-400',
    }

    return (
      <div
        className={`fixed z-50 flex flex-col gap-2 max-w-sm w-full pointer-events-none ${positionStyles[position]}`}
        aria-live="polite"
      >
        {activeToasts.map((toast) => {
          let variant = toast.variant ?? 'info'
          let role: 'alert' | 'status' =
            variant === 'error' || variant === 'warning' ? 'alert' : 'status'

          return (
            <div
              key={toast.id}
              role={role}
              className={`pointer-events-auto flex items-start gap-3 rounded-xl border p-4 shadow-lg transition-all ${variantStyles[variant]}`}
            >
              <span
                className={`mt-0.5 inline-flex size-6 shrink-0 items-center justify-center rounded-full text-xs font-bold ${badgeColors[variant]}`}
              >
                {variant === 'success' && '✓'}
                {variant === 'error' && '✕'}
                {variant === 'warning' && '!'}
                {variant === 'info' && 'i'}
              </span>

              <div className="flex-1 min-w-0">
                {toast.title && <h5 className="text-sm font-semibold mb-0.5">{toast.title}</h5>}
                <p className="text-xs text-muted-foreground-1 leading-relaxed">{toast.message}</p>
              </div>

              <button
                type="button"
                className="cursor-pointer text-muted-foreground hover:text-foreground text-xs p-1"
                aria-label="Tutup"
                mix={on<HTMLButtonElement, 'click'>('click', () => dismiss(toast.id))}
              >
                ✕
              </button>
            </div>
          )
        })}
      </div>
    )
  }
})
