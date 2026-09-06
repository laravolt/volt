/**
 * Theme (light/dark) resolution from the `volt-theme` cookie via AsyncLocalStorage.
 * Ensures <html class="dark"> and data-theme are set during initial server render
 * and survive DOM frame patch navigation without color-scheme flickering.
 */
import { AsyncLocalStorage } from 'node:async_hooks'
import type { Middleware } from 'remix/router'

export type ServerTheme = 'light' | 'dark' | null

export const THEME_COOKIE = 'volt-theme'

const storage = new AsyncLocalStorage<ServerTheme>()

export function readThemeCookie(cookieHeader: string | null): ServerTheme {
  if (!cookieHeader) return null
  for (let part of cookieHeader.split(';')) {
    let [name, ...rest] = part.trim().split('=')
    if (name !== THEME_COOKIE) continue
    let value = decodeURIComponent(rest.join('='))
    if (value === 'light' || value === 'dark') return value
  }
  return null
}

/** The client's requested theme for the current render request; null means follow system preference. */
export function currentTheme(): ServerTheme {
  return storage.getStore() ?? null
}

export function theme(): Middleware {
  return (context, next) => storage.run(readThemeCookie(context.request.headers.get('cookie')), next)
}
