import { useEffect, useRef, useState } from 'react'
import { Link, useLocation, useNavigate, useSearchParams } from 'react-router-dom'
import SellerShowcase from '../components/SellerShowcase.jsx'
import { Alert, AuthCard, Icon, inputBase, PasswordToggle, Spinner, TrustBadges } from '../components/AuthUI.jsx'
import StatusLookup from '../components/StatusLookup.jsx'
import { requestPasswordOtp, verifyPasswordOtp, loginWithPasskey } from '../api'
import { getWebAuthnErrorMessage, isWebAuthnSupported } from '../../../lib/webauthn'
import { useAuth } from '../../../hooks/useAuth'
import { getErrorMessage } from '../../../lib/api-client'

const PORTALS = {
  entrepreneur: {
    key: 'entrepreneur',
    shortLabel: 'Enterprise',
    label: 'Student Enterprise',
    badge: 'STUDENT_ENTERPRISE',
    icon: 'school',
    pillCls: 'bg-amber-400/15 text-amber-300 border-amber-400/35',
  },
  individual: {
    key: 'individual',
    shortLabel: 'Independent',
    label: 'Independent Student Seller',
    badge: 'INDEPENDENT_SELLER',
    icon: 'person',
    pillCls: 'bg-sky-400/15 text-sky-300 border-sky-400/35',
  },
  organization: {
    key: 'organization',
    shortLabel: 'Organization',
    label: 'Recognized Organization',
    badge: 'RECOGNIZED_ORGANIZATION',
    icon: 'groups',
    pillCls: 'bg-purple-400/15 text-purple-300 border-purple-400/35',
  },
}

const OTP_TTL_SECONDS = 5 * 60
const RESEND_COOLDOWN_SECONDS = 60

const tabBase =
  'flex-1 py-2 px-2.5 rounded-xl text-xs sm:text-sm font-semibold transition-all duration-200 flex items-center justify-center gap-1.5 focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-400/70'
const tabActive = `${tabBase} bg-gradient-to-r from-amber-400 to-amber-500 text-slate-950 shadow-md shadow-amber-500/20`
const tabIdle = `${tabBase} text-slate-400 hover:text-white hover:bg-white/5`

const formatClock = (s) => `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`

function destinationFor(user) {
  if (user?.verificationStatus !== 'VERIFIED') return '/account'
  if (user?.role === 'ADMIN') return '/admin'
  return '/dashboard'
}

export default function SellerLoginForm() {
  const navigate = useNavigate()
  const location = useLocation()
  const [searchParams, setSearchParams] = useSearchParams()
  const rawType = searchParams.get('type')
  const portal = PORTALS[rawType] || PORTALS.entrepreneur

  const { login: authLogin } = useAuth()
  const passkeyCapable = isWebAuthnSupported()

  const [tab, setTab] = useState('credentials') // 'credentials' | 'passkey' | 'status'
  const [step, setStep] = useState('password') // 'password' | 'otp'
  const [identifier, setIdentifier] = useState(location.state?.qcuIdNumber || '')
  const [password, setPassword] = useState('')
  const [otp, setOtp] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [loginState, setLoginState] = useState('idle') // idle | loading | done
  const [bioState, setBioState] = useState('idle') // idle | scanning | done
  const [loginError, setLoginError] = useState(null)
  const [otpNotice, setOtpNotice] = useState(null)
  const [otpExpiresAt, setOtpExpiresAt] = useState(null)
  const [resendAt, setResendAt] = useState(null)
  const [now, setNow] = useState(() => Date.now())
  const timers = useRef([])

  const later = (fn, ms) => {
    timers.current.push(setTimeout(fn, ms))
  }
  useEffect(() => () => timers.current.forEach(clearTimeout), [])

  useEffect(() => {
    if (step !== 'otp') return undefined
    const t = setInterval(() => setNow(Date.now()), 1000)
    return () => clearInterval(t)
  }, [step])

  const otpSecondsLeft = otpExpiresAt ? Math.max(0, Math.ceil((otpExpiresAt - now) / 1000)) : 0
  const resendSecondsLeft = resendAt ? Math.max(0, Math.ceil((resendAt - now) / 1000)) : 0
  const otpExpired = step === 'otp' && otpSecondsLeft === 0

  const finishLogin = (session) => {
    const { token, accessToken, user } = session
    authLogin(user, token || accessToken)
    later(() => navigate(destinationFor(user), { replace: true }), 600)
  }

  // 1. POST /auth/login/password — verify credentials & send 6-digit OTP email
  const handleRequestOtp = async (e) => {
    e?.preventDefault()
    setLoginError(null)
    setLoginState('loading')
    try {
      const result = await requestPasswordOtp({
        qcuIdNumber: identifier.trim(),
        password,
      })
      const sentAt = Date.now()
      setOtpNotice(result.message || 'Verification code sent to your registered email.')
      setOtpExpiresAt(sentAt + OTP_TTL_SECONDS * 1000)
      setResendAt(sentAt + RESEND_COOLDOWN_SECONDS * 1000)
      setNow(sentAt)
      setOtp('')
      setStep('otp')
    } catch (err) {
      setLoginError(getErrorMessage(err))
    } finally {
      setLoginState('idle')
    }
  }

  // 2. POST /auth/login/otp/verify — consume OTP & issue JWT
  const handleVerifyOtp = async (e) => {
    e.preventDefault()
    setLoginError(null)
    setLoginState('loading')
    try {
      const result = await verifyPasswordOtp({
        qcuIdNumber: identifier.trim(),
        otp: otp.trim(),
      })
      setLoginState('done')
      finishLogin(result.data)
    } catch (err) {
      setLoginError(getErrorMessage(err))
      setLoginState('idle')
    }
  }

  // 3. WebAuthn Passkey Login
  const handlePasskeyLogin = async (e) => {
    e?.preventDefault()
    setLoginError(null)
    if (!identifier.trim()) {
      setLoginError('Please enter your QCU ID Number to sign in with a passkey.')
      return
    }
    setBioState('scanning')
    try {
      const session = await loginWithPasskey(identifier.trim())
      setBioState('done')
      finishLogin(session)
    } catch (err) {
      setBioState('idle')
      setLoginError(getWebAuthnErrorMessage(err) || getErrorMessage(err))
    }
  }

  const switchTab = (next) => {
    setTab(next)
    setLoginError(null)
  }

  return (
    <main className="flex-1 min-h-0 w-full max-w-6xl mx-auto px-4 sm:px-6 pt-20 pb-2 lg:py-4 grid lg:grid-cols-2 lg:grid-rows-[minmax(0,1fr)] gap-8 lg:gap-16 items-center">
      <SellerShowcase badge={portal.badge} />

      <section className="w-full max-w-[440px] mx-auto lg:mx-0 lg:justify-self-end" aria-labelledby="seller-form-title">
        <AuthCard className="border-amber-400/20">
            {/* Seller Portal Selector Bar */}
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
                  Seller Portal Sign In
                </h1>
                <Icon name="auto_awesome" className="text-amber-400 text-[18px]" />
              </div>
              <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                Sign in with your QCU ID using Password + Email OTP or a registered WebAuthn Passkey.
              </p>
            </div>

            {/* Auth Method Tabs */}
            <div role="tablist" aria-label="Seller sign-in method" className="bg-white/[0.04] p-1 rounded-2xl flex gap-1 mb-4 border border-white/10">
              <button
                type="button"
                role="tab"
                aria-selected={tab === 'credentials'}
                className={tab === 'credentials' ? tabActive : tabIdle}
                onClick={() => switchTab('credentials')}
              >
                <Icon name="key" className="text-[17px]" />
                <span>Password + OTP</span>
              </button>
              <button
                type="button"
                role="tab"
                aria-selected={tab === 'passkey'}
                className={tab === 'passkey' ? tabActive : tabIdle}
                onClick={() => switchTab('passkey')}
              >
                <Icon name="fingerprint" className="text-[17px]" />
                <span>Passkey</span>
              </button>
              <button
                type="button"
                role="tab"
                aria-selected={tab === 'status'}
                className={tab === 'status' ? tabActive : tabIdle}
                onClick={() => switchTab('status')}
              >
                <Icon name="fact_check" className="text-[17px]" />
                <span>Status</span>
              </button>
            </div>

            {loginError && (
              <Alert tone="error" className="mb-4">
                {loginError}
              </Alert>
            )}

            {tab === 'status' ? (
              <StatusLookup initialIdentifier={identifier} />
            ) : tab === 'credentials' ? (
              step === 'password' ? (
                <form className="space-y-3.5" onSubmit={handleRequestOtp}>
                  <div>
                    <label className="flex items-center gap-1.5 text-xs font-semibold text-slate-200" htmlFor="seller-login-id">
                      <Icon name="badge" className="text-[15px] text-amber-400" />
                      <span>QCU ID Number</span>
                      <span className="text-amber-400" aria-hidden="true">*</span>
                    </label>
                    <div className="relative mt-1.5">
                      <Icon name="account_circle" className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500 text-[20px] pointer-events-none" />
                      <input
                        id="seller-login-id"
                        type="text"
                        required
                        autoComplete="username"
                        disabled={loginState !== 'idle'}
                        value={identifier}
                        onChange={(e) => setIdentifier(e.target.value)}
                        placeholder="e.g. 24-0001"
                        className={`${inputBase} border-white/10 pl-11 pr-4`}
                      />
                    </div>
                  </div>

                  <div>
                    <label className="flex items-center gap-1.5 text-xs font-semibold text-slate-200" htmlFor="seller-login-password">
                      <Icon name="lock" className="text-[15px] text-amber-400" />
                      <span>Password</span>
                      <span className="text-amber-400" aria-hidden="true">*</span>
                    </label>
                    <div className="relative mt-1.5">
                      <Icon name="lock" className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500 text-[20px] pointer-events-none" />
                      <input
                        id="seller-login-password"
                        type={showPassword ? 'text' : 'password'}
                        required
                        minLength={8}
                        autoComplete="current-password"
                        disabled={loginState !== 'idle'}
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="Enter your password"
                        className={`${inputBase} border-white/10 pl-11 pr-11`}
                      />
                      <PasswordToggle visible={showPassword} onToggle={() => setShowPassword((s) => !s)} />
                    </div>
                  </div>

                  <p className="flex items-center gap-1.5 text-xs text-slate-400">
                    <Icon name="verified_user" className="text-[15px] text-emerald-400" />
                    <span>A 6-digit verification code will be sent to your registered QCU email.</span>
                  </p>

                  <button
                    type="submit"
                    disabled={loginState !== 'idle'}
                    className="w-full py-3 rounded-xl font-extrabold text-base bg-gradient-to-r from-amber-400 via-amber-500 to-amber-600 hover:from-amber-300 hover:via-amber-400 hover:to-amber-500 text-slate-950 ring-1 ring-inset ring-amber-200/50 shadow-lg shadow-amber-500/25 transition-all duration-200 flex items-center justify-center gap-2 active:scale-[0.98] disabled:opacity-60 disabled:cursor-not-allowed"
                  >
                    <span>{loginState === 'loading' ? 'Verifying credentials…' : 'Send Login Code'}</span>
                    {loginState === 'loading' ? <Spinner /> : <Icon name="send" className="text-[18px]" />}
                  </button>
                </form>
              ) : (
                <form className="space-y-4" onSubmit={handleVerifyOtp}>
                  {otpNotice && (
                    <Alert tone="info" icon="mark_email_read">
                      {otpNotice}
                      <span className="block text-xs text-amber-200/70 mt-0.5">Signing in as {identifier.trim()}</span>
                    </Alert>
                  )}

                  <div>
                    <div className="flex items-center justify-between">
                      <label className="flex items-center gap-1.5 text-xs font-semibold text-slate-200" htmlFor="seller-login-otp">
                        <Icon name="pin" className="text-[16px] text-amber-400" />
                        <span>6-Digit Verification Code</span>
                      </label>
                      <span
                        className={`text-xs font-semibold tabular-nums ${
                          otpExpired ? 'text-red-400' : otpSecondsLeft <= 60 ? 'text-orange-300' : 'text-slate-400'
                        }`}
                        aria-live="polite"
                      >
                        {otpExpired ? 'Code expired' : `Expires in ${formatClock(otpSecondsLeft)}`}
                      </span>
                    </div>
                    <input
                      id="seller-login-otp"
                      type="text"
                      inputMode="numeric"
                      autoComplete="one-time-code"
                      pattern="\d{6}"
                      maxLength={6}
                      required
                      autoFocus
                      disabled={loginState !== 'idle'}
                      value={otp}
                      onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                      placeholder="••••••"
                      className={`${inputBase} border-white/10 mt-1.5 px-4 text-center tracking-[0.6em] text-xl font-mono`}
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={loginState !== 'idle' || otp.length !== 6 || otpExpired}
                    className={`w-full py-3 rounded-xl font-extrabold text-base transition-all duration-200 flex items-center justify-center gap-2 active:scale-[0.98] disabled:cursor-not-allowed ${
                      loginState === 'done'
                        ? 'bg-emerald-500 text-white'
                        : 'bg-gradient-to-r from-amber-400 via-amber-500 to-amber-600 hover:from-amber-300 hover:to-amber-500 text-slate-950 shadow-lg shadow-amber-500/25 disabled:opacity-60'
                    }`}
                  >
                    <span>
                      {loginState === 'done' ? 'Authenticated!' : loginState === 'loading' ? 'Signing in…' : 'Verify & Sign In'}
                    </span>
                    {loginState === 'loading' && <Spinner />}
                  </button>

                  <div className="flex items-center justify-between pt-1">
                    <button
                      type="button"
                      onClick={() => {
                        setStep('password')
                        setOtp('')
                        setOtpNotice(null)
                        setOtpExpiresAt(null)
                        setLoginError(null)
                      }}
                      className="text-xs text-slate-400 hover:text-white"
                    >
                      ← Back to password
                    </button>
                    <button
                      type="button"
                      onClick={handleRequestOtp}
                      disabled={loginState !== 'idle' || resendSecondsLeft > 0}
                      className="text-xs font-semibold text-amber-300 hover:underline disabled:text-slate-500 disabled:no-underline"
                    >
                      {resendSecondsLeft > 0 ? `Resend code in ${resendSecondsLeft}s` : 'Resend code'}
                    </button>
                  </div>
                </form>
              )
            ) : (
              /* WebAuthn Passkey Tab */
              <form className="space-y-4" onSubmit={handlePasskeyLogin}>
                <div>
                  <label className="flex items-center gap-1.5 text-xs font-semibold text-slate-200" htmlFor="seller-passkey-id">
                    <Icon name="badge" className="text-[15px] text-amber-400" />
                    <span>QCU ID Number</span>
                    <span className="text-amber-400" aria-hidden="true">*</span>
                  </label>
                  <div className="relative mt-1.5">
                    <Icon name="account_circle" className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500 text-[20px] pointer-events-none" />
                    <input
                      id="seller-passkey-id"
                      type="text"
                      required
                      disabled={bioState !== 'idle'}
                      value={identifier}
                      onChange={(e) => setIdentifier(e.target.value)}
                      placeholder="e.g. 24-0001"
                      className={`${inputBase} border-white/10 pl-11 pr-4`}
                    />
                  </div>
                </div>

                <div className="p-5 rounded-2xl bg-white/[0.03] border border-white/10 flex flex-col items-center text-center space-y-3">
                  <div className="relative w-16 h-16">
                    <span
                      aria-hidden="true"
                      className={`absolute inset-0 rounded-full border-2 border-amber-400/40 ${bioState === 'scanning' ? 'animate-ping' : ''}`}
                    />
                    <div className="relative w-16 h-16 rounded-full bg-amber-400/10 border border-amber-400/30 flex items-center justify-center text-amber-300">
                      <Icon name="fingerprint" className="text-3xl" />
                    </div>
                    <div className="absolute -top-1 -right-1 px-1.5 h-6 rounded-full bg-amber-400 flex items-center justify-center text-slate-950 text-[10px] font-black">
                      FIDO2
                    </div>
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-white">Seller WebAuthn Passkey</h3>
                    <p className="text-xs text-slate-400 max-w-xs mt-1">
                      Unlock with Touch ID, Face ID, Windows Hello, or your device PIN registered to your seller account.
                    </p>
                  </div>
                  {passkeyCapable ? (
                    <button
                      type="submit"
                      disabled={bioState !== 'idle'}
                      className={`w-full py-3 rounded-xl font-bold flex items-center justify-center gap-2 transition-all active:scale-[0.98] disabled:cursor-not-allowed ${
                        bioState === 'done'
                          ? 'bg-emerald-500 text-white'
                          : 'bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 text-slate-950 shadow-lg shadow-amber-500/25'
                      }`}
                    >
                      {bioState === 'scanning' ? (
                        <Spinner />
                      ) : (
                        <Icon name={bioState === 'done' ? 'verified' : 'fingerprint'} className="text-[20px]" />
                      )}
                      <span>
                        {bioState === 'done'
                          ? 'Passkey Verified!'
                          : bioState === 'scanning'
                            ? 'Authenticating passkey…'
                            : 'Sign In with Passkey'}
                      </span>
                    </button>
                  ) : (
                    <Alert tone="warning" icon="no_encryption" className="w-full text-left">
                      WebAuthn Passkeys are not supported on this browser. Please use Password + OTP.
                    </Alert>
                  )}
                </div>
              </form>
            )}

            {/* Footer links */}
            <div className="mt-auto pt-4">
              <div className="pt-3.5 border-t border-white/10 text-center space-y-2.5">
                <p className="text-xs sm:text-sm text-slate-400">
                  Don&apos;t have a seller account yet?{' '}
                  <Link className="text-amber-300 font-bold hover:text-amber-200 hover:underline" to="/seller-signup">
                    Register as Seller
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
        </AuthCard>

        <TrustBadges items={['Official QCU Seller Portal', 'WebAuthn FIDO2 Protected']} />
      </section>
    </main>
  )
}
