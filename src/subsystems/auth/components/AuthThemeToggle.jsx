import { useRef } from 'react'
import { flushSync } from 'react-dom'

export default function AuthThemeToggle({ theme, onChangeTheme }) {
  const ref = useRef(null)

  const handleClick = async () => {
    const next = theme === 'dark' ? 'light' : 'dark'
    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches

    const applyNext = () => {
      flushSync(() => onChangeTheme(next))
      window.dispatchEvent(new CustomEvent('bizzyqcu-auth-theme', { detail: next }))
    }

    if (!document.startViewTransition || reduceMotion) {
      applyNext()
      return
    }

    const rect = ref.current.getBoundingClientRect()
    const x = rect.left + rect.width / 2
    const y = rect.top + rect.height / 2
    const endRadius = Math.hypot(
      Math.max(x, window.innerWidth - x),
      Math.max(y, window.innerHeight - y)
    )

    document.documentElement.classList.add('theme-transitioning')

    try {
      const transition = document.startViewTransition(() => {
        applyNext()
      })

      await transition.ready

      const anim = document.documentElement.animate(
        {
          clipPath: [
            `circle(0px at ${x}px ${y}px)`,
            `circle(${endRadius}px at ${x}px ${y}px)`,
          ],
        },
        {
          duration: 600,
          easing: 'ease-in-out',
          pseudoElement: '::view-transition-new(root)',
        }
      )

      await Promise.allSettled([transition.finished, anim.finished])
    } finally {
      document.documentElement.classList.remove('theme-transitioning')
    }
  }

  return (
    <div className="absolute top-5 right-5 sm:top-6 sm:right-8 z-30">
      <button
        ref={ref}
        id="theme-button"
        type="button"
        className="theme-button focus:outline-none focus-visible:ring-2 focus-visible:ring-[#8ACFF8] dark:focus-visible:ring-amber-400/70"
        onClick={handleClick}
        aria-label={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
      >
        {/* Sun icon: shown in light mode */}
        <svg
          className="icon icon-sun"
          viewBox="0 0 24 24"
          width="20"
          height="20"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
        >
          <circle cx="12" cy="12" r="4" />
          <path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M4.93 19.07l1.41-1.41M17.66 6.34l1.41-1.41" />
        </svg>

        {/* Moon icon: shown in dark mode */}
        <svg
          className="icon icon-moon"
          viewBox="0 0 24 24"
          width="20"
          height="20"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
        >
          <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
        </svg>
      </button>
    </div>
  )
}
