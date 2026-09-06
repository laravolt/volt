/**
 * Theme selector component (Light / Dark / System).
 * Synchronizes client preference with `volt-theme` cookie so server rendering
 * stays in sync without color-scheme flicker across frame navigations.
 */
import { clientEntry, on, type Handle } from 'remix/ui'
import { setTheme, type ThemePreference } from 'volt-preline/dark-mode'

export type ThemeSelectorProps = {
  initialTheme?: string
  className?: string
}

export const ThemeSelector = clientEntry<ThemeSelectorProps>(
  import.meta.url,
  function ThemeSelector(handle: Handle<ThemeSelectorProps>) {
    let currentTheme: ThemePreference = 'system'
    try {
      let saved = localStorage.getItem('volt-theme')
      if (saved === 'light' || saved === 'dark') currentTheme = saved
    } catch {}

    function selectTheme(theme: ThemePreference) {
      currentTheme = theme
      setTheme(theme)
      try {
        document.cookie =
          theme === 'system'
            ? 'volt-theme=; path=/; max-age=0; SameSite=Lax'
            : `volt-theme=${theme}; path=/; max-age=31536000; SameSite=Lax`
      } catch {}
      handle.update()
    }

    return () => {
      let { className = '' } = handle.props
      let options: Array<{ value: ThemePreference; label: string; desc: string }> = [
        { value: 'light', label: 'Terang', desc: 'Tema terang dengan kontras tinggi' },
        { value: 'dark', label: 'Gelap', desc: 'Tema gelap yang nyaman di mata' },
        { value: 'system', label: 'Sistem', desc: 'Mengikuti preferensi sistem operasi Anda' },
      ]

      return (
        <div className={`grid grid-cols-1 gap-4 sm:grid-cols-3 ${className}`}>
          {options.map((opt) => {
            let selected = currentTheme === opt.value
            return (
              <button
                key={opt.value}
                type="button"
                className={`flex flex-col items-start rounded-xl border p-4 text-left transition-all cursor-pointer ${
                  selected
                    ? 'border-primary bg-primary/5 ring-2 ring-primary/20 dark:border-primary dark:bg-primary/10'
                    : 'border-card-line bg-card hover:border-line-1'
                }`}
                mix={on<HTMLButtonElement, 'click'>('click', () => selectTheme(opt.value))}
              >
                <span className="font-semibold text-foreground text-sm">{opt.label}</span>
                <span className="mt-1 text-xs text-muted-foreground-1">{opt.desc}</span>
              </button>
            )
          })}
        </div>
      )
    }
  },
)
