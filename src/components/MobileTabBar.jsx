import { useEffect, useRef, useState } from 'react'
import { NavLink, useLocation } from 'react-router-dom'
import Icon from './Icon.jsx'

// Bottom tab bar for phones. A yellow line stretches from the old tab to the new one.
const tabs = [
  { to: '/marketplace', label: 'Marketplace', icon: 'bag', match: (p) => p.startsWith('/marketplace') || p.startsWith('/stores') },
  { to: '/orders', label: 'Orders', icon: 'clock', match: (p) => p.startsWith('/orders') },
  { to: '/notifications', label: 'Notifications', icon: 'bell', match: (p) => p.startsWith('/notifications') },
  { to: '/messages', label: 'Messages', icon: 'chat', match: (p) => p.startsWith('/messages') },
]

const STEP = 100 / tabs.length
// Clip the yellow line to the tabs from index l to index r.
const span = (l, r) => `inset(0 ${100 - (r + 1) * STEP}% 0 ${l * STEP}%)`

export default function MobileTabBar({ unread = 0 }) {
  const { pathname } = useLocation()
  const active = Math.max(0, tabs.findIndex((t) => t.match(pathname)))

  const prev = useRef(active)
  const [clip, setClip] = useState(span(active, active))

  useEffect(() => {
    const from = prev.current
    prev.current = active
    if (from === active) {
      setClip(span(active, active))
      return
    }
    setClip(from < active ? span(from, active) : span(active, from))
    const t = setTimeout(() => setClip(span(active, active)), 215)
    return () => clearTimeout(t)
  }, [active])

  return (
    <nav
      aria-label="Main"
      className="fixed bottom-0 left-0 right-0 z-40 h-[76px] border-t border-slate-200 bg-white shadow-[0_-6px_18px_rgba(15,23,42,0.08)] md:hidden"
    >
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 top-0 h-[44px] bg-gradient-to-b from-[#FFF6CC] to-transparent"
        style={{ clipPath: clip, transition: 'clip-path 210ms cubic-bezier(0.5, 0, 0.2, 1)' }}
      >
        <i className="absolute inset-x-0 top-0 block h-[3px] bg-[#FFD444]" />
      </div>

      <div className="flex h-full pb-[env(safe-area-inset-bottom)]">
        {tabs.map((t, i) => {
          const on = i === active
          return (
            <NavLink
              key={t.to}
              to={t.to}
              aria-current={on ? 'page' : undefined}
              className={`flex flex-1 flex-col items-center justify-center gap-1 pt-1 transition-colors duration-200 ${
                on ? 'text-[#0369A1]' : 'text-slate-500'
              }`}
            >
              <span className="relative flex h-[22px] w-[22px] items-center justify-center">
                <Icon name={t.icon} strokeWidth={on ? 2 : 1.8} className="h-[22px] w-[22px]" />
                {t.icon === 'bell' && unread > 0 && (
                  <span className="absolute -right-2 -top-1.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-rose-500 px-1 text-[9px] font-bold text-white ring-2 ring-white">
                    {unread}
                  </span>
                )}
              </span>
              <span className="text-[11px] font-semibold">{t.label}</span>
            </NavLink>
          )
        })}
      </div>
    </nav>
  )
}
