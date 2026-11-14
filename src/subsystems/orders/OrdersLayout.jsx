import { useEffect, useState } from 'react'
import { Link, NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom'
import Icon from '../../components/Icon.jsx'
import ConfirmDialog from './components/Dialogs/ConfirmDialog.jsx'
import MessageWidget from './components/Messages/MessageWidget.jsx'
import Popover from './components/MobileUI/Popover.jsx'
import MobileTabBar from './components/MobileUI/MobileTabBar.jsx'
import ThemeToggle from './components/MobileUI/ThemeToggle.jsx'
import { useTheme } from './theme/useTheme.js'
import { useCart } from '../../lib/CartContext.jsx'
import { useMessages } from '../../lib/MessageContext.jsx'
import { getInitials, getVerificationLabel } from '../../lib/userDisplay.js'
import { useAuth } from '../../hooks/useAuth'
import useIsMobile from '../../hooks/useIsMobile.js'
const logo = '/logo-clear.png'

const navClass = ({ isActive }) =>
  `relative pb-1 transition-colors hover:text-[#0284C7] dark:hover:text-amber-700 ${
    isActive
      ? "text-[#0284C7] dark:text-amber-700 after:absolute after:bottom-0 after:left-0 after:right-0 after:h-[2.5px] after:rounded-full after:bg-[#FFD444] after:content-['']"
      : 'text-slate-600 dark:text-slate-700'
  }`

// Buyer-side shell: floating header, authenticated profile menu, and cart on phones.
export default function OrdersLayout() {
  const navigate = useNavigate()
  const { pathname } = useLocation()
  const { user, isAuthenticated, loading: authLoading, logout } = useAuth()
  const { count } = useCart()
  const { theme, toggleTheme } = useTheme()
  const mobile = useIsMobile()
  const { open: chatOpen } = useMessages()
  const covered = /^\/(cart|messages)/.test(pathname)
  const fullScreen = /^\/(stores|cart|checkout|payment|orders\/|messages)/.test(pathname)

  const [menuOpen, setMenuOpen] = useState(false)
  const [confirmSignOut, setConfirmSignOut] = useState(false)

  // On phones, "Message seller" opens the full-screen messages page instead of the chat window.
  useEffect(() => {
    if (mobile && chatOpen && pathname !== '/messages') navigate('/messages')
  }, [mobile, chatOpen, pathname, navigate])

  const initials = isAuthenticated ? getInitials(user?.fullName, 'Q') : '?'
  const displayName = isAuthenticated ? user?.fullName || 'QCU User' : 'Guest'
  const subtitle = isAuthenticated
    ? [user?.qcuIdNumber, getVerificationLabel(user?.verificationStatus)].filter(Boolean).join(' · ')
    : authLoading
      ? 'Checking session…'
      : 'Not signed in'

  const handleSignOut = async () => {
    setConfirmSignOut(false)
    await logout()
    navigate('/login', { replace: true })
  }

  const profileMenu = (
    <div className="relative">
      <button
        type="button"
        data-popover-trigger
        aria-label="Profile menu"
        aria-expanded={menuOpen}
        onClick={() => setMenuOpen((o) => !o)}
        className="flex items-center gap-1.5 pl-2"
      >
        <span className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-200 dark:bg-slate-700 text-xs font-semibold text-slate-700 dark:text-slate-200 ring-2 ring-white dark:ring-slate-900">
          {initials}
        </span>
        <Icon name={menuOpen ? 'chevronUp' : 'chevronDown'} className="h-3.5 w-3.5 text-slate-400 dark:text-slate-500" />
      </button>
      <Popover open={menuOpen} onClose={() => setMenuOpen(false)} className="right-0 z-50 mt-2 w-60 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-2 shadow-lg">
        <div className="px-3 py-2">
          <p className="truncate text-xs font-bold text-slate-900 dark:text-slate-100">{displayName}</p>
          <p className="truncate text-[11px] text-slate-500 dark:text-slate-400">{subtitle}</p>
        </div>
        {isAuthenticated ? (
          <>
            <button
              type="button"
              onClick={() => {
                setMenuOpen(false)
                navigate('/profile')
              }}
              className="w-full rounded-xl px-3 py-2 text-left text-xs font-medium text-slate-700 dark:text-slate-200 transition hover:bg-slate-50 dark:hover:bg-slate-800"
            >
              Profile
            </button>
            <button
              type="button"
              onClick={() => {
                setMenuOpen(false)
                navigate('/account')
              }}
              className="w-full rounded-xl px-3 py-2 text-left text-xs font-medium text-slate-700 dark:text-slate-200 transition hover:bg-slate-50 dark:hover:bg-slate-800"
            >
              Account &amp; Security
            </button>
            <button
              type="button"
              onClick={() => {
                setMenuOpen(false)
                setConfirmSignOut(true)
              }}
              className="w-full rounded-xl px-3 py-2 text-left text-xs font-medium text-rose-600 dark:text-rose-400 transition hover:bg-rose-50 dark:hover:bg-rose-950/40"
            >
              Sign out
            </button>
          </>
        ) : (
          <>
            <button
              type="button"
              onClick={() => {
                setMenuOpen(false)
                navigate('/login')
              }}
              className="w-full rounded-xl px-3 py-2 text-left text-xs font-medium text-[#0284C7] transition hover:bg-sky-50 dark:hover:bg-sky-950/40"
            >
              Sign in
            </button>
            <button
              type="button"
              onClick={() => {
                setMenuOpen(false)
                navigate('/signup')
              }}
              className="w-full rounded-xl px-3 py-2 text-left text-xs font-medium text-slate-700 dark:text-slate-200 transition hover:bg-slate-50 dark:hover:bg-slate-800"
            >
              Create account
            </button>
          </>
        )}
      </Popover>
    </div>
  )

  return (
    <div className="flex h-screen flex-col overflow-hidden bg-[#F8FAFC] dark:bg-[#0b1120] text-slate-800 dark:text-slate-100 antialiased">
      <ConfirmDialog
        open={confirmSignOut}
        title="Sign out of BizzyQCU?"
        message="You'll need to sign in again to place orders."
        confirmLabel="Sign out"
        tone="danger"
        onCancel={() => setConfirmSignOut(false)}
        onConfirm={handleSignOut}
      />

      {mobile && !covered && (
        <header className="flex shrink-0 items-center justify-between border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-4 py-2.5">
          <Link to="/marketplace" className="flex items-center">
            <img src={logo} alt="BizzyQCU logo" className="h-7 w-auto" />
          </Link>
          <div className="flex items-center gap-1">
            <ThemeToggle theme={theme} onToggle={toggleTheme} />
              <button type="button" id="cart-button" aria-label="Cart" onClick={() => navigate('/cart')} className="relative rounded-full p-2 text-slate-600 dark:text-slate-300">
              <Icon name="cart" className="h-5 w-5" strokeWidth={1.8} />
              {count > 0 && <span className="absolute right-0.5 top-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-[#0284C7] text-[10px] font-bold text-white ring-2 ring-white dark:ring-slate-900">{count}</span>}
            </button>
            {profileMenu}
          </div>
        </header>
      )}

      {!mobile && (
        <header className="z-40 flex shrink-0 justify-center px-4 pt-3">
          <div className="flex w-full max-w-7xl items-center justify-between rounded-full border border-slate-200/80 dark:border-amber-200 bg-white dark:bg-amber-50 px-6 py-2.5 shadow-[0_4px_16px_-4px_rgba(15,23,42,0.08)]">
            <Link to="/marketplace" className="flex items-center">
              <img src={logo} alt="BizzyQCU logo" className="h-8 w-auto" />
            </Link>
            <nav className="flex items-center gap-8 text-xs font-bold uppercase tracking-wider">
              <NavLink to="/marketplace" className={navClass}>Marketplace</NavLink>
              <NavLink to="/orders" className={navClass}>Orders</NavLink>
            </nav>
            <div className="flex items-center gap-5">
              <ThemeToggle theme={theme} onToggle={toggleTheme} />
              <button type="button" id="cart-button" aria-label="Cart" onClick={() => navigate('/cart')} className="relative p-1.5 text-slate-500 dark:text-slate-600 transition hover:text-slate-700 dark:hover:text-slate-900">
                <Icon name="cart" className="h-5 w-5" strokeWidth={1.8} />
                {count > 0 && <span className="absolute right-0.5 top-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-[#0284C7] text-[10px] font-bold text-white ring-2 ring-white dark:ring-slate-900">{count}</span>}
              </button>
              {profileMenu}
            </div>
          </div>
        </header>
      )}

      <main className="flex min-h-0 w-full flex-1 flex-col overflow-y-auto">
        <div className="mx-auto w-full max-w-7xl px-4 pb-28 pt-6 md:pb-12 sm:px-6 lg:px-8">
          <Outlet />
        </div>
      </main>

      {mobile && !fullScreen && <MobileTabBar />}
      {!mobile && <MessageWidget />}
    </div>
  )
}
