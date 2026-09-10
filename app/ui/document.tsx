import type { Handle, RemixNode } from 'remix/ui'
import { ImportMap } from 'remix/ui/server'
import { darkModeHeadScript } from 'volt-preline/dark-mode'

import { currentTheme } from '../middleware/theme.ts'
import { scriptEntry } from '../assets.ts'

export interface DocumentProps {
  children?: RemixNode
  head?: RemixNode
  title?: string
}

export function Document(handle: Handle<DocumentProps>) {
  return () => {
    let { children, head, title } = handle.props
    let { href, importMap, preloads } = scriptEntry
    let theme = currentTheme()
    return (
      <html lang="en" className={theme === 'dark' ? 'h-full dark' : 'h-full'} data-theme={theme ?? 'system'}>
        <head>
          <meta charSet="utf-8" />
          <meta name="viewport" content="width=device-width, initial-scale=1" />
          <meta name="color-scheme" content="light dark" />
          <script>{darkModeHeadScript()}</script>
          <link rel="icon" type="image/svg+xml" href="/favicon.svg" />
          <link rel="stylesheet" href="/app.css" />
          <title>{title ? `${title} · Volt` : 'Volt'}</title>
          {head}
          <ImportMap value={importMap} />
          {preloads.map((preloadHref) => (
            <link key={preloadHref} rel="modulepreload" href={preloadHref} />
          ))}
          <script type="module" src={href}></script>
        </head>
        <body className="h-full bg-background text-foreground antialiased">
          {children}
        </body>
      </html>
    )
  }
}
