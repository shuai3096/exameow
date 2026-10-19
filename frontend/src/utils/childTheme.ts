import { isTauri } from './platform'

type Theme = 'system' | 'light' | 'dark'
const THEME_KEY = 'exameow-theme'

function readTheme(): Theme {
  const saved = localStorage.getItem(THEME_KEY)
  if (saved === 'system' || saved === 'light' || saved === 'dark') return saved
  return 'system'
}

export async function initChildTheme(): Promise<() => void> {
  const media = window.matchMedia('(prefers-color-scheme: dark)')
  let theme = readTheme()

  const apply = () => {
    const dark = theme === 'dark' || (theme === 'system' && media.matches)
    document.documentElement.classList.toggle('dark', dark)
  }

  const onMediaChange = () => {
    if (theme === 'system') apply()
  }

  apply()
  media.addEventListener('change', onMediaChange)

  let unlisten: (() => void) | null = null
  if (isTauri()) {
    try {
      const { listen } = await import('@tauri-apps/api/event')
      unlisten = await listen<Theme>('theme-changed', (event) => {
        const value = event.payload
        if (value === 'system' || value === 'light' || value === 'dark') {
          theme = value
          apply()
        }
      })
    } catch { /* not in Tauri */ }
  }

  return () => {
    media.removeEventListener('change', onMediaChange)
    unlisten?.()
  }
}
