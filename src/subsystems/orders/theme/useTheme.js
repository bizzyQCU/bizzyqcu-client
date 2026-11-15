import { useEffect, useState } from 'react'

const KEY = 'bizzyqcu-theme'

// Buyer-side theme. Light is the default. Toggles the "dark" class on <html>
// so Tailwind's dark: variants apply. Saved in localStorage.
export function useTheme() {
  const [theme, setTheme] = useState(() => (localStorage.getItem(KEY) === 'dark' ? 'dark' : 'light'))

  useEffect(() => {
    document.documentElement.classList.toggle('dark', theme === 'dark')
    localStorage.setItem(KEY, theme)
    return () => document.documentElement.classList.remove('dark')
  }, [theme])

  const toggleTheme = () => setTheme((t) => (t === 'dark' ? 'light' : 'dark'))
  return { theme, toggleTheme }
}
