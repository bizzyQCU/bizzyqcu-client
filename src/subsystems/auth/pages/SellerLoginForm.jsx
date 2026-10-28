import { useEffect, useRef, useState } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import SellerShowcase from '../components/SellerShowcase.jsx'

const PORTALS = {
  entrepreneur: {
    key: 'entrepreneur',
    shortLabel: 'Entrepreneur',
    label: 'Entrepreneurship Student',
    badge: 'CURRICULUM VENTURE',
    icon: 'school',
    idPlaceholder: 'e.g. ent-store or 24-1679',
    pillCls: 'bg-amber-400/15 text-amber-300 border-amber-400/35',
  },
  individual: {
    key: 'individual',
    shortLabel: 'Individual',
    label: 'Individual Student Seller',
    badge: 'INDEPENDENT SELLER',
    icon: 'person',
    idPlaceholder: 'e.g. chiper123 or 24-1679',
    pillCls: 'bg-sky-400/15 text-sky-300 border-sky-400/35',
  },
  organization: {
    key: 'organization',
    shortLabel: 'Organization',
    label: 'Student Organization',
    badge: 'RECOGNIZED ORG',
    icon: 'groups',
    idPlaceholder: 'e.g. qcu-ssc or 24-1679',
    pillCls: 'bg-purple-400/15 text-purple-300 border-purple-400/35',
  },
}

const tabBase =
  'flex-1 py-2 px-3 rounded-xl text-sm font-semibold transition-all duration-200 flex items-center justify-center gap-2 focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-400/70'
const tabActive = `${tabBase} bg-gradient-to-r from-amber-400 to-amber-500 text-slate-950 shadow-md shadow-amber-500/20`
const tabIdle = `${tabBase} text-slate-400 hover:text-white hover:bg-white/5`

const inputBase =
  'w-full py-2.5 rounded-xl bg-white/[0.04] border border-white/10 text-white placeholder:text-slate-500 text-sm transition-colors duration-200 hover:border-white/20 focus:outline-none focus:border-amber-400/60 focus:ring-2 focus:ring-amber-400/25 focus:bg-white/[0.07]'

function Icon({ name, className = '' }) {
  return (
    <span className={`material-symbols-outlined ${className}`} aria-hidden="true">
      {name}
    </span>
  )
}

export default function SellerLoginForm() {
  const navigate = useNavigate()
  const [searchParams, setSearchParams] = useSearchParams()
  const rawType = searchParams.get('type')
  const portal = PORTALS[rawType] || PORTALS.entrepreneur

  const [tab, setTab] = useState('credentials')
  const [identifier, setIdentifier] = useState('')
  const [password, setPassword] = useState('')
  const [remember, setRemember] = useState(true)
  const [showPassword, setShowPassword] = useState(false)
  const [loginState, setLoginState] = useState('idle') // idle | loading | done
  const [bioState, setBioState] = useState('idle') // idle | scanning | done
  const timers = useRef([])

  const later = (fn, ms) => {
    timers.current.push(setTimeout(fn, ms))
  }
  useEffect(() => () => timers.current.forEach(clearTimeout), [])

  const handleLogin = (e) => {
    e.preventDefault()
    setLoginState('loading')
    later(() => {
      setLoginState('done')
      later(() => navigate('/dashboard'), 700)
    }, 1100)
  }

  const handleBiometric = () => {
    setBioState('scanning')
    later(() => {
      setBioState('done')
      later(() => navigate('/dashboard'), 500)
    }, 1300)
  }

  const submitIcon = { idle: null, loading: 'progress_activity', done: 'check_circle' }[loginState]
  const submitText = { idle: 'Log In', loading: 'Signing in...', done: 'Authenticated!' }[loginState]
  const bioIcon = { idle: 'center_focus_strong', scanning: 'progress_activity', done: 'verified' }[bioState]
  const bioText = {
    idle: 'Scan Face with Camera',
    scanning: 'Matching biometric data...',
    done: 'QCU Liveness Confirmed',
  }[bioState]

  return (
    <main className="flex-grow w-full max-w-6xl mx-auto px-4 sm:px-6 pt-20 pb-4 lg:py-4 grid lg:grid-cols-2 gap-8 lg:gap-16 items-center">
      <SellerShowcase badge={portal.badge} />

      {/* ------------------------------------------------------------------
          Right: Seller Login Form Card
         ------------------------------------------------------------------ */}
      <section className="w-full max-w-[440px] mx-auto lg:mx-0 lg:justify-self-end" aria-labelledby="seller-form-title">
        <div className="relative overflow-hidden rounded-3xl bg-slate-900/70 backdrop-blur-xl border border-amber-400/20 shadow-modal ring-1 ring-inset ring-white/5 p-6 sm:p-7">
          {/* Decorative glow & top hairline */}
          <div
            aria-hidden="true"
            className="pointer-events-none absolute -top-24 -right-24 w-64 h-64 rounded-full bg-amber-500/15 blur-3xl"
          />
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-amber-400/70 to-transparent"
          />

          <div className="relative">
            {/* Seller Portal Selector Bar (Clearly distinguishes Seller Login from Buyer Login) */}
            <div className="flex items-center justify-between gap-2 pb-3.5 mb-4 border-b border-white/10">
              <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full border text-[11px] font-extrabold uppercase tracking-wide ${portal.pillCls}`}>
                <Icon name={portal.icon} className="text-[14px]" />
                <span>{portal.label}</span>
              </span>
              <Link
                to="/seller-signup"
                className="inline-flex items-center gap-1 text-xs font-semibold text-slate-400 hover:text-amber-300 transition-colors"
              >
                <Icon name="storefront" className="text-[15px]" />
                <span>Register as Seller</span>
              </Link>
            </div>

            {/* Quick 3-portal pills */}
            <div className="grid grid-cols-3 gap-1.5 p-1 rounded-xl bg-white/[0.03] border border-white/10 mb-4">
              {Object.values(PORTALS).map((p) => {
                const active = p.key === portal.key
                return (
                  <button
                    key={p.key}
                    type="button"
                    onClick={() => setSearchParams({ type: p.key }, { replace: true })}
                    className={`py-1.5 px-2 rounded-lg text-[11px] font-bold flex items-center justify-center gap-1 transition-all ${
                      active
                        ? 'bg-amber-400/20 text-amber-300 border border-amber-400/40 shadow-sm'
                        : 'text-slate-400 hover:text-white hover:bg-white/5'
                    }`}
                  >
                    <Icon name={p.icon} className="text-[14px]" />
                    <span className="truncate">{p.shortLabel}</span>
                  </button>
                )
              })}
            </div>

            {/* Header */}
            <div className="text-center mb-4">
              <div className="flex items-center justify-center gap-1.5">
                <Icon name="auto_awesome" className="text-amber-400 text-[18px]" />
                <h1 id="seller-form-title" className="text-xl sm:text-2xl font-extrabold tracking-tight text-white">
                  Welcome back to BizzyQCU
                </h1>
                <Icon name="auto_awesome" className="text-amber-400 text-[18px]" />
              </div>
              <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                Sign in to access your student marketplace account, campus orders, or seller dashboard.
              </p>
            </div>

            {/* Auth Method Tabs */}
            <div role="tablist" aria-label="Seller sign-in method" className="bg-white/[0.04] p-1 rounded-2xl flex gap-1 mb-4 border border-white/10">
              <button
                type="button"
                role="tab"
                aria-selected={tab === 'credentials'}
                className={tab === 'credentials' ? tabActive : tabIdle}
                onClick={() => setTab('credentials')}
              >
                <Icon name="key" className="text-[18px]" />
                <span>Credentials</span>
              </button>
              <button
                type="button"
                role="tab"
                aria-selected={tab === 'passkey'}
                className={tab === 'passkey' ? tabActive : tabIdle}
                onClick={() => setTab('passkey')}
              >
                <Icon name="face" className="text-[18px]" />
                <span>QCU Face ID</span>
                <span
                  className={`px-1.5 py-0.5 rounded-full text-[10px] font-bold ${
                    tab === 'passkey' ? 'bg-slate-950/15 text-slate-950' : 'bg-amber-400/15 text-amber-300'
                  }`}
                >
                  Fast
                </span>
              </button>
            </div>

            {tab === 'credentials' ? (
              <form className="space-y-3.5" onSubmit={handleLogin}>
                {/* Identifier */}
                <div>
                  <label className="flex items-center gap-1.5 text-xs font-semibold text-slate-200" htmlFor="seller-login-id">
                    <span>Username or Student ID</span>
                    <span className="text-amber-400" aria-hidden="true">*</span>
                  </label>
                  <div className="relative mt-1.5">
                    <Icon name="account_circle" className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500 text-[20px] pointer-events-none" />
                    <input
                      id="seller-login-id"
                      type="text"
                      required
                      autoComplete="username"
                      value={identifier}
                      onChange={(e) => setIdentifier(e.target.value)}
                      placeholder="e.g. chiper123 or 24-1679"
                      className={`${inputBase} pl-11 pr-4`}
                    />
                  </div>
                </div>

                {/* Password */}
                <div>
                  <div className="flex items-center justify-between">
                    <label className="flex items-center gap-1.5 text-xs font-semibold text-slate-200" htmlFor="seller-login-password">
                      <span>Password</span>
                      <span className="text-amber-400" aria-hidden="true">*</span>
                    </label>
                    <a className="text-xs font-semibold text-amber-300 hover:text-amber-200 hover:underline" href="#forgot">
                      Forgot password?
                    </a>
                  </div>
                  <div className="relative mt-1.5">
                    <Icon name="lock" className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500 text-[20px] pointer-events-none" />
                    <input
                      id="seller-login-password"
                      type={showPassword ? 'text' : 'password'}
                      required
                      autoComplete="current-password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Enter your password"
                      className={`${inputBase} pl-11 pr-11`}
                    />
                    <button
                      type="button"
                      aria-label={showPassword ? 'Hide password' : 'Show password'}
                      onClick={() => setShowPassword((s) => !s)}
                      className="absolute right-2.5 top-1/2 -translate-y-1/2 p-1 rounded-lg text-slate-500 hover:text-amber-300 focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-400/60"
                    >
                      <Icon name={showPassword ? 'visibility' : 'visibility_off'} className="text-[20px]" />
                    </button>
                  </div>
                </div>

                {/* Options */}
                <div className="flex items-center justify-between">
                  <label className="flex items-center gap-2 cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={remember}
                      onChange={(e) => setRemember(e.target.checked)}
                      className="w-4 h-4 rounded bg-white/5 border-white/20 text-amber-500 focus:ring-amber-400 focus:ring-offset-slate-900"
                    />
                    <span className="text-xs sm:text-sm text-slate-300 font-medium">Remember this device</span>
                  </label>
                  <div className="flex items-center gap-1 text-emerald-400 text-xs font-semibold">
                    <Icon name="verified_user" className="text-[15px]" />
                    <span>SSL Secured</span>
                  </div>
                </div>

                {/* Submit */}
                <button
                  type="submit"
                  disabled={loginState !== 'idle'}
                  className={`w-full py-3 rounded-xl font-extrabold text-base transition-all duration-200 flex items-center justify-center gap-2 group active:scale-[0.98] disabled:cursor-not-allowed ring-1 ring-inset focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-200 ${
                    loginState === 'done'
                      ? 'bg-emerald-500 text-white ring-emerald-300/40 shadow-lg shadow-emerald-500/25'
                      : 'bg-gradient-to-r from-amber-400 via-amber-500 to-amber-600 hover:from-amber-300 hover:via-amber-400 hover:to-amber-500 text-slate-950 ring-amber-200/50 shadow-lg shadow-amber-500/25 hover:shadow-xl hover:shadow-amber-500/40'
                  }`}
                >
                  <span>{submitText}</span>
                  {submitIcon && (
                    <Icon
                      name={submitIcon}
                      className={`text-[20px] ${loginState === 'loading' ? 'animate-spin' : ''}`}
                    />
                  )}
                </button>
              </form>
            ) : (
              <div className="space-y-4">
                <div className="p-5 rounded-2xl bg-white/[0.03] border border-white/10 flex flex-col items-center text-center space-y-3">
                  <div className="relative w-16 h-16">
                    <span
                      aria-hidden="true"
                      className={`absolute inset-0 rounded-full border-2 border-amber-400/40 ${bioState === 'scanning' ? 'animate-ping' : ''}`}
                    />
                    <div className="relative w-16 h-16 rounded-full bg-amber-400/10 border border-amber-400/30 flex items-center justify-center text-amber-300">
                      <Icon name="face" className="text-3xl" />
                    </div>
                    <div className="absolute -top-1 -right-1 px-1.5 h-6 rounded-full bg-amber-400 flex items-center justify-center text-slate-950 text-[10px] font-black">
                      QCU
                    </div>
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-white">Seller Biometric Verification</h3>
                    <p className="text-xs text-slate-400 max-w-xs mt-1">
                      Authenticate instantly against the verified QCU Seller Registry
                    </p>
                  </div>
                  <button
                    type="button"
                    disabled={bioState !== 'idle'}
                    onClick={handleBiometric}
                    className={`w-full py-3 rounded-xl font-bold flex items-center justify-center gap-2 transition-all active:scale-[0.98] disabled:cursor-not-allowed ${
                      bioState === 'done'
                        ? 'bg-emerald-500 text-white'
                        : 'bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 text-slate-950 shadow-lg shadow-amber-500/25'
                    }`}
                  >
                    <Icon name={bioIcon} className={`text-[20px] ${bioState === 'scanning' ? 'animate-spin' : ''}`} />
                    <span>{bioText}</span>
                  </button>
                </div>
                <p className="text-center text-xs text-slate-400">
                  Prefer entering credentials?{' '}
                  <button
                    type="button"
                    className="text-amber-300 font-semibold hover:text-amber-200 hover:underline"
                    onClick={() => setTab('credentials')}
                  >
                    Switch to password
                  </button>
                </p>
              </div>
            )}

            {/* Divider */}
            <div className="relative flex items-center justify-center my-4">
              <div className="w-full h-px bg-gradient-to-r from-transparent via-white/15 to-transparent" />
              <span className="absolute px-3 bg-slate-900 rounded-full text-[10px] font-bold tracking-wider uppercase text-slate-500">
                or sign in with
              </span>
            </div>

            <button
              type="button"
              onClick={() => setTab('passkey')}
              className="w-full py-2.5 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] border border-white/10 hover:border-amber-400/40 text-slate-200 text-sm font-semibold flex items-center justify-center gap-2.5 transition-all active:scale-[0.98]"
            >
              <Icon name="fingerprint" className="text-amber-400 text-[20px]" />
              <span>Sign in with WebAuthn Passkey</span>
            </button>

            {/* Footer links */}
            <div className="mt-4 pt-3.5 border-t border-white/10 text-center space-y-2.5">
              <p className="text-xs sm:text-sm text-slate-400">
                Don&apos;t have an account yet?{' '}
                <Link
                  className="text-amber-300 font-bold hover:text-amber-200 hover:underline"
                  to="/seller-signup"
                >
                  Sign up here
                </Link>
              </p>
              <Link
                to="/login"
                className="inline-flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wide px-3.5 py-1.5 rounded-full bg-white/[0.04] text-slate-300 hover:bg-white/[0.08] hover:text-white border border-white/10 transition-colors"
              >
                <Icon name="shopping_bag" className="text-[14px] text-amber-400" />
                <span>Shopping instead? Buyer Login</span>
              </Link>
            </div>
          </div>
        </div>

        {/* Trust badges */}
        <div className="flex flex-wrap items-center justify-center gap-5 text-slate-300 text-xs font-medium pt-3">
          <div className="flex items-center gap-1.5">
            <Icon name="verified" className="text-amber-400 text-[16px]" />
            <span>Official QCU Seller Portal</span>
          </div>
          <span className="w-1 h-1 rounded-full bg-slate-500" aria-hidden="true" />
          <div className="flex items-center gap-1.5">
            <Icon name="local_police" className="text-amber-400 text-[16px]" />
            <span>Biometric Protected</span>
          </div>
        </div>
      </section>
    </main>
  )
}

