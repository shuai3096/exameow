import { ref, watch } from 'vue'
import { isTauri } from '@/utils/platform'

export type Theme = 'system' | 'light' | 'dark'
export type AccentColor = 'blue' | 'green' | 'coral' | 'purple' | 'amber'

const THEME_KEY = 'exameow-theme'
const ACCENT_KEY = 'exameow-theme-accent'

function loadTheme(): Theme {
  const saved = localStorage.getItem(THEME_KEY)
  if (saved === 'system' || saved === 'light' || saved === 'dark') return saved
  const legacy = localStorage.getItem('exameow-dark')
  if (legacy === '1') return 'dark'
  if (legacy === '0') return 'light'
  return 'system'
}

function loadAccent(): AccentColor {
  const saved = localStorage.getItem(ACCENT_KEY)
  if (saved === 'blue' || saved === 'green' || saved === 'coral' || saved === 'purple' || saved === 'amber') return saved
  return 'blue'
}

const theme = ref<Theme>(loadTheme())
const accent = ref<AccentColor>(loadAccent())
const media = window.matchMedia('(prefers-color-scheme: dark)')

function applyTheme() {
  const dark = theme.value === 'dark' || (theme.value === 'system' && media.matches)
  document.documentElement.classList.toggle('dark', dark)
  document.documentElement.setAttribute('data-accent', accent.value)
  localStorage.setItem(THEME_KEY, theme.value)
  localStorage.setItem(ACCENT_KEY, accent.value)
  if (isTauri()) {
    import('@tauri-apps/api/event')
      .then(({ emit }) => emit('theme-changed', { mode: theme.value, accent: accent.value }))
      .catch(() => {})
  }
}

let initialized = false

export function useTheme() {
  if (!initialized) {
    initialized = true
    watch(theme, applyTheme, { immediate: true })
    watch(accent, applyTheme, { immediate: true })
    media.addEventListener('change', () => {
      if (theme.value === 'system') applyTheme()
    })
  }

  function setTheme(t: Theme) {
    theme.value = t
  }

  function setAccent(a: AccentColor) {
    accent.value = a
  }

  function cycleTheme() {
    theme.value = theme.value === 'system' ? 'light' : theme.value === 'light' ? 'dark' : 'system'
  }

  return { theme, accent, setTheme, setAccent, cycleTheme }
}
