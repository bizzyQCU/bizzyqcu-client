import { useEffect, useRef, useState } from 'react'
import { NavLink, useLocation } from 'react-router-dom'
import Icon from './Icon.jsx'

// Curved-notch bottom bar for phones. The notch and the active icon glide to the selected tab.
const tabs = [
  { to: '/marketplace', label: 'Marketplace', icon: 'bag', match: (p) => p.startsWith('/marketplace') || p.startsWith('/stores') },
  { to: '/orders', label: 'Orders', icon: 'clock', match: (p) => p.startsWith('/orders') },
  { to: '/messages', label: 'Messages', icon: 'chat', match: (p) => p.startsWith('/messages') },
  { to: '/notifications', label: 'Notifications', icon: 'bell', match: (p) => p.startsWith('/notifications') },
  { to: '/profile', label: 'Profile', icon: 'user', match: (p) => p.startsWith('/profile') },
]

const BAR_H = 92   // px
const NOTCH_R = 30 // px
const CY = 6       // px, centre of the notch circle below the top edge
const KNOB = 50    // px

export default function MobileTabBar({ unread = 0 }) {
  const { pathname } = useLocation()
  const active = Math.max(0, tabs.findIndex((t) => t.match(pathname)))

  const barRef = useRef(null)
  const pathRef = useRef(null)
  const knobRef = useRef(null)
  const s = useRef({ x: 0, v: 0, tx: 0, w: 0, raf: 0 })
  const [, force] = useState(0)

  const centre = (i) => (i + 0.5) * (s.current.w / tabs.length)

  function draw() {
    const { x, w } = s.current
    if (!w) return
    const hw = Math.sqrt(NOTCH_R * NOTCH_R - CY * CY)
    pathRef.current?.setAttribute(
      'd',
      `M0 0H${(x - hw).toFixed(2)}A${NOTCH_R} ${NOTCH_R} 0 1 0 ${(x + hw).toFixed(2)} 0H${w}V${BAR_H}H0Z`
    )
    if (knobRef.current) knobRef.current.style.transform = `translate3d(${(x - KNOB / 2).toFixed(2)}px, 0, 0)`
  }

  function kick() {
    if (s.current.raf) return
    const step = () => {
      const st = s.current
      st.v += (st.tx - st.x) * 0.2
      st.v *= 0.74
      st.x += st.v
      draw()
      if (Math.abs(st.tx - st.x) < 0.05 && Math.abs(st.v) < 0.05) {
        st.x = st.tx
        draw()
        st.raf = 0
        return
      }
      st.raf = requestAnimationFrame(step)
    }
    s.current.raf = requestAnimationFrame(step)
  }

  useEffect(() => {
    const el = barRef.current
    if (!el) return
    s.current.w = el.offsetWidth
    s.current.x = s.current.tx = centre(active)
    draw()
    const ro = new ResizeObserver(() => {
      s.current.w = el.offsetWidth
      s.current.x = s.current.tx = centre(active)
      draw()
    })
    ro.observe(el)
    return () => {
      ro.disconnect()
      cancelAnimationFrame(s.current.raf)
      s.current.raf = 0
    }
  }, [])

  useEffect(() => {
    s.current.tx = centre(active)
    kick()
    force((n) => n + 1)
  }, [active])

  return (
    <nav
      ref={barRef}
      aria-label="Main"
      className="fixed bottom-0 left-0 right-0 z-40 md:hidden"
      style={{ height: BAR_H }}
    >
      <svg className="absolute inset-0 h-full w-full overflow-visible" style={{ filter: 'drop-shadow(0 -6px 14px rgba(15,23,42,0.18))' }} aria-hidden="true">
        <path ref={pathRef} fill="#ffffff" stroke="#CBD5E1" strokeWidth={1} d="" />
      </svg>

      {/* Floating circle that sits in the notch and shows the active icon */}
      <div
        ref={knobRef}
        className="pointer-events-none absolute flex items-center justify-center rounded-full text-white"
        style={{
          width: KNOB,
          height: KNOB,
          top: CY - KNOB / 2,
          left: 0,
          background: 'linear-gradient(135deg,#0A6CFF 0%,#4FA3FF 100%)',
          boxShadow: '0 8px 18px rgba(10,108,255,0.3)',
        }}
      >
        {tabs.map((t, i) => (
          <span
            key={t.icon}
            className="absolute inset-0 flex items-center justify-center transition-all duration-500"
            style={{ opacity: i === active ? 1 : 0, transform: i === active ? 'none' : 'scale(0.6)' }}
          >
            <Icon name={t.icon} strokeWidth={2} className="h-5 w-5" />
          </span>
        ))}
      </div>

      <div className="absolute inset-x-0 top-0 flex" style={{ height: 70 }}>
        {tabs.map((t, i) => {
          const isActive = i === active
          return (
            <NavLink
              key={t.to}
              to={t.to}
              aria-current={isActive ? 'page' : undefined}
              className={`flex flex-1 flex-col items-center justify-center gap-1 pt-1 text-[11px] font-semibold transition-colors duration-300 ${
                isActive ? 'text-[#0369A1]' : 'text-slate-500'
              }`}
            >
              <span className="relative flex h-6 w-6 items-center justify-center">
                <span
                  className="flex h-6 w-6 items-center justify-center transition-all duration-500"
                  style={{ opacity: isActive ? 0 : 1, transform: isActive ? 'translateY(10px)' : 'none' }}
                >
                  <Icon name={t.icon} strokeWidth={1.8} className="h-6 w-6" />
                </span>
                {t.icon === 'bell' && unread > 0 && (
                  <span className="absolute -right-2 -top-1.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-rose-500 px-1 text-[9px] font-bold text-white ring-2 ring-white">
                    {unread}
                  </span>
                )}
              </span>
              <span className="truncate">{t.label}</span>
            </NavLink>
          )
        })}
      </div>
    </nav>
  )
}
