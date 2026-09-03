import { run, type ResolveFrameOptions } from 'remix/ui'
import { installDarkMode } from 'volt-preline/dark-mode'

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

async function resolveFrame(src: string, options?: ResolveFrameOptions): Promise<Response> {
  let response: Response
  try {
    response = await fetch(src, {
      body: getRequestBody(options),
      headers: { Accept: 'text/html' },
      method: options?.method,
      signal: options?.signal,
    })
  } catch (error) {
    if (options?.signal?.aborted) throw error
    showFrameNotice('Terjadi kesalahan jaringan. Silakan periksa koneksi Anda.')
    throw error
  }

  let contentType = response.headers.get('content-type') ?? ''
  if (contentType.includes('text/html')) {
    return response
  }

  let statusText = response.statusText || 'Error'
  showFrameNotice(`Gagal memuat halaman (${response.status} ${statusText}).`)
  throw new Error(`Failed to resolve frame: ${response.status} ${statusText}`.trimEnd())
}

const app = run({
  async loadModule(moduleUrl, exportName) {
    let mod = await import(moduleUrl)
    return mod[exportName]
  },
  resolveFrame,
})

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
