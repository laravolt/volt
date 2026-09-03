/**
 * Form helpers and feedback components based on UAT brain-v2.1 UX standards:
 * - Notice with multi-variant support (success, error, warning, info) and aria-live
 * - ActionRow for consistent primary/secondary button placement
 * - RequiredLegend for standard single-instance required marker
 * - CSRF field helper and flash message reader
 */
import type { ElementProps, Handle, RemixNode } from 'remix/ui'
import { Text } from 'volt-preline/text'

export type FieldErrors = Record<string, string>

export interface FlashMessages {
  error?: string
  success?: string
  warning?: string
  info?: string
}

export function readFlash(session: { get(key: string): unknown }): FlashMessages {
  let error = session.get('error')
  let success = session.get('success')
  let warning = session.get('warning')
  let info = session.get('info')
  return {
    error: typeof error === 'string' ? error : undefined,
    success: typeof success === 'string' ? success : undefined,
    warning: typeof warning === 'string' ? warning : undefined,
    info: typeof info === 'string' ? info : undefined,
  }
}

export function CsrfField(handle: Handle<{ token: string }>) {
  return () => <input type="hidden" name="_csrf" value={handle.props.token} />
}

export type NoticeVariant = 'error' | 'success' | 'warning' | 'info'

export interface NoticeProps extends ElementProps {
  flash?: FlashMessages
  error?: string
  success?: string
  warning?: string
  info?: string
  variant?: NoticeVariant
  title?: string
  className?: string
  children?: RemixNode
}

/**
 * Accessible inline notice banner with semantic variants and aria-live.
 * Follows UAT brain-v2.1 standards: clear color coding, role="alert"/"status", and aria-live="polite".
 */
export function Notice(handle: Handle<NoticeProps>) {
  return () => {
    let {
      flash,
      error,
      success,
      warning,
      info,
      variant,
      title,
      className = '',
      children,
      ...rest
    } = handle.props

    let text =
      error ??
      flash?.error ??
      success ??
      flash?.success ??
      warning ??
      flash?.warning ??
      info ??
      flash?.info

    if (!text && !children) return null

    let resolvedVariant: NoticeVariant =
      variant ??
      (error || flash?.error
        ? 'error'
        : success || flash?.success
          ? 'success'
          : warning || flash?.warning
            ? 'warning'
            : 'info')

    let role: 'alert' | 'status' =
      resolvedVariant === 'error' || resolvedVariant === 'warning' ? 'alert' : 'status'

    let variantStyles = {
      error:
        'bg-red-500/10 border-red-500/20 text-red-700 dark:text-red-400 dark:bg-red-500/10',
      success:
        'bg-green-500/10 border-green-500/20 text-green-700 dark:text-green-400 dark:bg-green-500/10',
      warning:
        'bg-amber-500/10 border-amber-500/20 text-amber-800 dark:text-amber-300 dark:bg-amber-500/10',
      info: 'bg-blue-500/10 border-blue-500/20 text-blue-700 dark:text-blue-300 dark:bg-blue-500/10',
    }

    return (
      <div
        role={role}
        aria-live="polite"
        {...rest}
        className={`rounded-xl border p-4 shadow-2xs ${variantStyles[resolvedVariant]} ${className}`}
      >
        {title && <h4 className="font-semibold text-sm mb-1">{title}</h4>}
        {text && <Text className="text-sm font-medium">{text}</Text>}
        {children}
      </div>
    )
  }
}

export interface ActionRowProps extends ElementProps {
  /** Secondary actions (e.g. Cancel, Back, Delete) positioned on the left */
  secondary?: RemixNode
  /** Primary actions (e.g. Submit, Save) positioned on the right */
  primary?: RemixNode
  className?: string
  children?: RemixNode
}

/**
 * Standard Form Action Row following UAT Rule #1:
 * - Top border separator (`border-t border-card-line`)
 * - Secondary/destructive actions on the left
 * - Primary action on the far right
 */
export function ActionRow(handle: Handle<ActionRowProps>) {
  return () => {
    let { secondary, primary, className = '', children, ...rest } = handle.props
    return (
      <div
        {...rest}
        className={`mt-6 border-t border-card-line pt-4 flex flex-wrap items-center justify-between gap-3 ${className}`}
      >
        <div className="flex flex-wrap items-center gap-2">{secondary}</div>
        <div className="flex flex-wrap items-center justify-end gap-2 ml-auto">
          {children}
          {primary}
        </div>
      </div>
    )
  }
}

/**
 * Standard Required Legend indicator following UAT Rule #5:
 * Placed ONCE at the top of the form, avoiding repeated legends in cards.
 */
export function RequiredLegend(handle: Handle<{ className?: string }>) {
  return () => {
    let { className = '' } = handle.props
    return (
      <p className={`text-xs text-muted-foreground-1 mb-3 ${className}`}>
        <span className="text-destructive font-bold">*</span> Menandakan kolom yang wajib diisi.
      </p>
    )
  }
}
