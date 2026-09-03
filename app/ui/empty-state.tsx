/**
 * Standardized EmptyState component for lists, tables, and search results.
 * Follows UAT brain-v2.1 pattern: clear contextual messaging and recovery actions.
 */
import type { ElementProps, Handle, RemixNode } from 'remix/ui'

export type EmptyStateVariant = 'default' | 'search' | 'error'

export interface EmptyStateProps extends ElementProps {
  title: string
  description?: RemixNode
  icon?: RemixNode
  variant?: EmptyStateVariant
  action?: RemixNode
  secondaryAction?: RemixNode
  className?: string
  children?: RemixNode
}

function DefaultIcon() {
  return (
    <svg
      className="size-6 text-muted-foreground-1"
      fill="none"
      viewBox="0 0 24 24"
      strokeWidth="1.5"
      stroke="currentColor"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M2.25 12.75V12A2.25 2.25 0 0 1 4.5 9.75h15A2.25 2.25 0 0 1 21.75 12v.75m-8.69-6.44-2.12-2.12a1.5 1.5 0 0 0-1.061-.44H4.5A2.25 2.25 0 0 0 2.25 6v12a2.25 2.25 0 0 0 2.25 2.25h15A2.25 2.25 0 0 0 21.75 18V9a2.25 2.25 0 0 0-2.25-2.25h-5.379a1.5 1.5 0 0 1-1.06-.44Z"
      />
    </svg>
  )
}

function SearchEmptyIcon() {
  return (
    <svg
      className="size-6 text-muted-foreground-1"
      fill="none"
      viewBox="0 0 24 24"
      strokeWidth="1.5"
      stroke="currentColor"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z"
      />
    </svg>
  )
}

function ErrorEmptyIcon() {
  return (
    <svg
      className="size-6 text-destructive"
      fill="none"
      viewBox="0 0 24 24"
      strokeWidth="1.5"
      stroke="currentColor"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M12 9v3.75m9-.75a9 9 0 1 1-18 0 9 9 0 0 1 18 0Zm-9 3.75h.008v.008H12v-.008Z"
      />
    </svg>
  )
}

export function EmptyState(handle: Handle<EmptyStateProps>) {
  return () => {
    let {
      title,
      description,
      icon,
      variant = 'default',
      action,
      secondaryAction,
      className = '',
      children,
      ...rest
    } = handle.props

    let renderedIcon = icon
    if (!renderedIcon) {
      if (variant === 'search') renderedIcon = SearchEmptyIcon()
      else if (variant === 'error') renderedIcon = ErrorEmptyIcon()
      else renderedIcon = DefaultIcon()
    }

    return (
      <div
        {...rest}
        className={`flex flex-col items-center justify-center p-8 text-center sm:p-12 ${className}`}
      >
        <span className="mb-4 inline-flex size-12 shrink-0 items-center justify-center rounded-xl border border-card-line bg-layer shadow-2xs">
          {renderedIcon}
        </span>

        <h3 className="text-base font-semibold text-foreground">{title}</h3>

        {description && (
          <p className="mt-1.5 max-w-sm text-sm text-muted-foreground-1">{description}</p>
        )}

        {children}

        {(action || secondaryAction) && (
          <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
            {secondaryAction}
            {action}
          </div>
        )}
      </div>
    )
  }
}
