import { useEffect, useState } from 'react'
import { useLocation } from 'react-router-dom'
import Footer from '../components/Footer.jsx'
import { AuthLogo, DotGridBackground, BlindsOutlet } from '../subsystems/auth/components'
import AuthThemeToggle from '../subsystems/auth/components/AuthThemeToggle.jsx'

const AUTH_THEME_KEY = 'bizzyqcu-auth-theme'

// Scrolls to #hash targets on route change, or to top when there's no hash.
function ScrollManager() {
  const { pathname, hash } = useLocation()

  useEffect(() => {
    if (hash) {
      const el = document.querySelector(hash)
      if (el) {
        el.scrollIntoView({ behavior: 'smooth' })
        return
      }
    }
    window.scrollTo({ top: 0 })
  }, [pathname, hash])

  return null
}

export default function AuthLayout() {
  const [theme, setTheme] = useState(() => (localStorage.getItem(AUTH_THEME_KEY) === 'dark' ? 'dark' : 'light'))

  useEffect(() => {
    localStorage.setItem(AUTH_THEME_KEY, theme)
  }, [theme])

  return (
    <DotGridBackground
      data-theme={theme}
      className={`${theme === 'dark' ? 'dark ' : ''}h-screen flex flex-col text-slate-900 dark:text-white overflow-hidden relative`}
    >
      <ScrollManager />
      <AuthLogo />
      <AuthThemeToggle theme={theme} onChangeTheme={setTheme} />
      <BlindsOutlet />
      <Footer textClassName="text-slate-500 dark:text-slate-300" />
    </DotGridBackground>
  )
}
