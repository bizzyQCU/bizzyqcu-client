import { useEffect, useRef, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { AuthShowcase } from '../components'
import { loginWithPassword } from '../api'
import { useAuth } from '../../../hooks/useAuth'
import { getErrorMessage } from '../../../lib/api-client'

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

export default function Login() {
  const navigate = useNavigate()
  const [tab, setTab] = useState('credentials')
  const [identifier, setIdentifier] = useState('')
  const [password, setPassword] = useState('')
  const [remember, setRemember] = useState(true)
  const [showPassword, setShowPassword] = useState(false)
  const [loginState, setLoginState] = useState('idle') // idle | loading | done
  const [loginError, setLoginError] = useState(null)
  const [bioState, setBioState] = useState('idle') // idle | scanning | done
  const { login: authLogin } = useAuth()
  const timers = useRef([])

  const later = (fn, ms) => {
    timers.current.push(setTimeout(fn, ms))
  }
  useEffect(() => () => timers.current.forEach(clearTimeout), [])

  const handleLogin = async (e) => {
    e.preventDefault()
    setLoginError(null)
    setLoginState('loading')
    try {
      const result = await loginWithPassword({ qcuIdNumber: identifier, password })
      const { token, user } = result.data
      authLogin(user, token)
      setLoginState('done')
      later(() => navigate('/dashboard'), 700)
    } catch (err) {
      setLoginError(getErrorMessage(err))
      setLoginState('idle')
    }
  }

  const handleBiometric = () => {
    setBioState('scanning')
    // Simulated face scan. Replace with a real WebAuthn / camera flow.
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
      <AuthShowcase />

      {/* ------------------------------------------------------------------
          Right: login card
         ------------------------------------------------------------------ */}
      <section className="w-full max-w-[420px] mx-auto lg:mx-0 lg:justify-self-end" aria-labelledby="login-title">
        <div className="relative overflow-hidden rounded-3xl bg-slate-900/70 backdrop-blur-xl border border-white/10 shadow-modal ring-1 ring-inset ring-white/5 p-6 sm:p-7">
          {/* decorative amber glow in the corner */}
          <div
            aria-hidden="true"
            className="pointer-events-none absolute -top-24 -right-24 w-64 h-64 rounded-full bg-amber-500/15 blur-3xl"
          />
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-amber-400/60 to-transparent"
          />

          <div className="relative">
            {/* Header */}
            <div className="text-center mb-5">
              <div className="mx-auto mb-3 w-11 h-11 rounded-xl bg-gradient-to-br from-amber-300 via-amber-400 to-amber-600 flex items-center justify-center shadow-lg shadow-amber-500/30 ring-1 ring-inset ring-white/30">
                <Icon name="storefront" className="text-slate-950 text-[22px]" />
              </div>
              <h1 id="login-title" className="text-2xl font-extrabold tracking-tight text-white">
                Welcome back
              </h1>
              <p className="text-sm text-slate-400 mt-1">Sign in to access your BizzyQCU account</p>
            </div>

            {/* Tabs */}
            <div role="tablist" aria-label="Sign-in method" className="bg-white/[0.04] p-1 rounded-2xl flex gap-1 mb-5 border border-white/10">
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
                  className={`px-1.5 py-0.5 rounded-full text-[10px] font-bold ${tab === 'passkey' ? 'bg-slate-950/15 text-slate-950' : 'bg-amber-400/15 text-amber-300'
                    }`}
                >
                  Fast
                </span>
              </button>
            </div>

            {tab === 'credentials' ? (
              <form className="space-y-4" onSubmit={handleLogin}>
                {/* Identifier */}
                <div>
                  <label className="flex items-center gap-1.5 text-sm font-semibold text-slate-200" htmlFor="login-identifier">
                    <Icon name="badge" className="text-[16px] text-amber-400" />
                    <span>Username or Student ID</span>
                    <span className="text-amber-400" aria-hidden="true">*</span>
                  </label>
                  <div className="relative mt-1.5">
                    <Icon name="account_circle" className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500 text-[20px] pointer-events-none" />
                    <input
                      id="login-identifier"
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
                    <label className="flex items-center gap-1.5 text-sm font-semibold text-slate-200" htmlFor="login-password">
                      <Icon name="lock" className="text-[16px] text-amber-400" />
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
                      id="login-password"
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
                    <span className="text-sm text-slate-300 font-medium">Remember this device</span>
                  </label>
                  <div className="flex items-center gap-1 text-emerald-400 text-xs font-semibold">
                    <Icon name="verified_user" className="text-[15px]" />
                    <span>SSL Secured</span>
                  </div>
                </div>

                {/* Error Banner */}
                {loginError && (
                  <div role="alert" className="flex items-start gap-2.5 rounded-xl bg-red-500/10 border border-red-400/25 px-4 py-3 text-sm text-red-300">
                    <Icon name="error" className="text-[18px] text-red-400 mt-px shrink-0" />
                    <span>{loginError}</span>
                  </div>
                )}

                {/* Submit */}
                <button
                  type="submit"
                  disabled={loginState !== 'idle'}
                  className={`w-full py-3 rounded-xl font-extrabold text-base transition-all duration-200 flex items-center justify-center gap-2 group active:scale-[0.98] disabled:cursor-not-allowed ring-1 ring-inset focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-200 ${loginState === 'done'
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
                <p className="sr-only" aria-live="polite">
                  {loginState !== 'idle' ? submitText : ''}
                </p>
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
                    <h3 className="text-base font-bold text-white">Biometric Liveness Verification</h3>
                    <p className="text-sm text-slate-400 max-w-xs mt-1">
                      Authenticate instantly against the verified QCU Student Registry
                    </p>
                  </div>
                  <button
                    type="button"
                    disabled={bioState !== 'idle'}
                    onClick={handleBiometric}
                    className={`w-full py-3 rounded-xl font-bold flex items-center justify-center gap-2 transition-all active:scale-[0.98] disabled:cursor-not-allowed focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-200 ${bioState === 'done'
                      ? 'bg-emerald-500 text-white'
                      : 'bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 text-slate-950 shadow-lg shadow-amber-500/25'
                      }`}
                  >
                    <Icon name={bioIcon} className={`text-[20px] ${bioState === 'scanning' ? 'animate-spin' : ''}`} />
                    <span>{bioText}</span>
                  </button>
                  <p className="sr-only" aria-live="polite">
                    {bioState !== 'idle' ? bioText : ''}
                  </p>
                </div>
                <p className="text-center text-sm text-slate-400">
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
              <span className="absolute px-3 bg-slate-900 rounded-full text-[11px] font-bold tracking-wider uppercase text-slate-500">
                or sign in with
              </span>
            </div>

            <button
              type="button"
              onClick={() => setTab('passkey')}
              className="w-full py-2.5 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] border border-white/10 hover:border-amber-400/40 text-slate-200 font-semibold flex items-center justify-center gap-2.5 transition-all active:scale-[0.98] focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-400/60"
            >
              <Icon name="fingerprint" className="text-amber-400 text-[20px]" />
              <span>Sign in with WebAuthn Passkey</span>
            </button>

            {/* Footer links */}
            <div className="mt-5 pt-4 border-t border-white/10 text-center space-y-3">
              <p className="text-sm text-slate-400">
                Don&apos;t have an account yet?{' '}
                <Link className="text-amber-300 font-bold hover:text-amber-200 hover:underline" to="/signup">
                  Sign up here
                </Link>
              </p>
              <Link
                to="/seller-login-form"
                className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wide px-4 py-2 rounded-full bg-amber-400/10 text-amber-300 hover:bg-amber-400/20 hover:text-amber-200 border border-amber-400/25 transition-colors"
              >
                <Icon name="storefront" className="text-[16px]" />
                <span>Want to sell? Register as Seller</span>
              </Link>
            </div>
          </div>
        </div>

        {/* Trust badges */}
        <div className="flex flex-wrap items-center justify-center gap-5 text-slate-300 text-xs font-medium pt-3">
          <div className="flex items-center gap-1.5">
            <Icon name="verified" className="text-amber-400 text-[16px]" />
            <span>Official QCU Portal</span>
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
