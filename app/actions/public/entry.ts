import {
  detectMultipleImportMapSupport,
  importModule,
  preloadShim,
} from 'remix/multiple-import-maps-polyfill'
import { run, type ResolveFrameOptions } from 'remix/ui'
import { installDarkMode } from 'volt-preline/dark-mode'

// Synchronize theme cookie from localStorage (source of truth on the client) so the server
// renders the correct <html class="dark"> on the first byte and across frame patches.
try {
  let pref = localStorage.getItem('volt-theme')
  document.cookie =
    pref === 'light' || pref === 'dark'
      ? `volt-theme=${pref}; path=/; max-age=31536000; SameSite=Lax`
      : 'volt-theme=; path=/; max-age=0; SameSite=Lax'
} catch {}
installDarkMode()

function normalizeLineBreaks(value: string): string {
  return value.replace(/\r\n|\r|\n/g, '\r\n')
}

function getRequestBody(options?: ResolveFrameOptions): BodyInit | undefined {
  let formData = options?.formData
  if (!formData || options?.method?.toLowerCase() === 'get') return

  if (options?.encType === 'text/plain') {
    let body = ''
    for (let [name, value] of formData) {
      let n = normalizeLineBreaks(name)
      let v = normalizeLineBreaks(typeof value === 'string' ? value : value.name)
      body += `${n}=${v}\r\n`
    }
    return new Blob([body], { type: 'text/plain' })
  }

  if (options?.encType !== 'application/x-www-form-urlencoded') return formData

  let body = new URLSearchParams()
  for (let [name, value] of formData) {
    body.append(name, typeof value === 'string' ? value : value.name)
  }
  return body
}

function showFrameNotice(message: string) {
  if (typeof document === 'undefined') return
  let toast = document.getElementById('volt-frame-notice')
  if (!toast) {
    toast = document.createElement('div')
    toast.id = 'volt-frame-notice'
    toast.setAttribute('role', 'alert')
    toast.className =
      'fixed bottom-4 end-4 z-90 max-w-sm rounded-xl border border-destructive/20 bg-card p-4 text-sm text-destructive shadow-lg backdrop-blur-sm'
    document.body.appendChild(toast)
  }
  toast.textContent = message
  toast.style.display = 'block'
  setTimeout(() => {
    if (toast) toast.style.display = 'none'
  }, 5000)
}

// Thin navigation progress bar at the top of the viewport for frame transitions.
let progressTimer: ReturnType<typeof setTimeout> | undefined
let inflight = 0
function progressEl(): HTMLElement {
  let el = document.getElementById('volt-progress')
  if (!el) {
    el = document.createElement('div')
    el.id = 'volt-progress'
    el.setAttribute('aria-hidden', 'true')
    document.body.appendChild(el)
  }
  return el
}
function progressStart() {
  inflight++
  if (progressTimer) return
  // 120ms delay: quick navigations complete before the bar displays, avoiding flicker.
  progressTimer = setTimeout(() => progressEl().setAttribute('data-state', 'loading'), 120)
}
function progressDone() {
  inflight = Math.max(0, inflight - 1)
  if (inflight > 0) return
  if (progressTimer) clearTimeout(progressTimer)
  progressTimer = undefined
  let el = document.getElementById('volt-progress')
  if (!el || el.getAttribute('data-state') !== 'loading') return
  el.setAttribute('data-state', 'done')
  setTimeout(() => el?.removeAttribute('data-state'), 250)
}

async function resolveFrame(src: string, options?: ResolveFrameOptions): Promise<Response> {
  let response: Response
  progressStart()
  try {
    response = await fetch(src, {
      body: getRequestBody(options),
      headers: { Accept: 'text/html' },
      method: options?.method,
      signal: options?.signal,
    })
  } catch (error) {
    progressDone()
    if (options?.signal?.aborted) throw error
    showFrameNotice('Terjadi kesalahan jaringan. Silakan periksa koneksi Anda.')
    throw error
  }
  progressDone()

  // Same semantics as the built-in resolver: HTML responses with 3xx/4xx status codes (422
  // validation, 401) still render into the frame; only 5xx or non-HTML responses throw.
  let contentType = response.headers.get('content-type') ?? ''
  let isHtml = contentType.toLowerCase().includes('text/html')
  if (response.status < 500 && (response.ok || isHtml)) {
    return response
  }

  let statusText = response.statusText || 'Error'
  showFrameNotice(`Gagal memuat halaman (${response.status} ${statusText}).`)
  throw new Error(`Failed to resolve frame: ${response.status} ${statusText}`.trimEnd())
}

const app = run({
  // Modules resolve through import maps; browsers without support for multiple maps use the polyfill.
  async loadModule(moduleUrl, exportName) {
    let mod = await importModule(moduleUrl)
    let component = mod[exportName]
    if (typeof component !== 'function') {
      throw new Error(`Unknown component: ${moduleUrl}#${exportName}`)
    }
    return component
  },
  async processClientEntryPreloads(preloads) {
    if (await detectMultipleImportMapSupport()) return preloads

    preloadShim(preloads)
    return []
  },
  resolveFrame,
})

// Deterministic hydration marker (<html data-hydrated>): re-applied when frame patches rewrite <html> attributes.
app
  .ready()
  .then(() => {
    let root = document.documentElement
    let mark = () => {
      if (!root.hasAttribute('data-hydrated')) root.setAttribute('data-hydrated', '')
    }
    mark()
    new MutationObserver(mark).observe(root, { attributes: true, attributeFilter: ['data-hydrated'] })
  })
  .catch(() => {})

if (import.meta.hot) {
  import.meta.hot.on('server:update', async () => {
    try {
      await app.ready()
      await app.frames.top.reload()
    } catch (error) {
      console.error('Error reloading top frame on server update', error)
    }
  })
}
