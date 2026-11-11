import { useEffect, useRef, useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { AuthShowcase } from '../components'
import {
  Alert,
  AuthCard,
  AuthModeTabs,
  Icon,
  inputBase,
  PasskeyOption,
  PasswordToggle,
  Spinner,
  TrustBadges,
} from '../components/AuthUI.jsx'
import { requestPasswordOtp, verifyPasswordOtp, loginWithPasskey } from '../api'
import { getWebAuthnErrorMessage, isWebAuthnSupported } from '../../../lib/webauthn'
import { useAuth } from '../../../hooks/useAuth'
import { getErrorMessage } from '../../../lib/api-client'

// Mirrors bizzyqcu-server: OTP_EXPIRY_MINUTES = 5 (utils/otp.ts).
const OTP_TTL_SECONDS = 5 * 60
// Client-side cooldown so users don't burn through the server limit (5 OTP requests / 15 min).
const RESEND_COOLDOWN_SECONDS = 60

const submitBtn = (done) =>
  `w-full py-3 rounded-xl font-extrabold text-base transition-all duration-200 flex items-center justify-center gap-2 active:scale-[0.98] disabled:cursor-not-allowed ring-1 ring-inset focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-200 ${
    done
      ? 'bg-emerald-500 text-white ring-emerald-300/40 shadow-lg shadow-emerald-500/25'
      : 'bg-gradient-to-r from-amber-400 via-amber-500 to-amber-600 hover:from-amber-300 hover:via-amber-400 hover:to-amber-500 text-slate-950 ring-amber-200/50 shadow-lg shadow-amber-500/25 hover:shadow-xl hover:shadow-amber-500/40 disabled:opacity-60'
  }`

const formatClock = (s) => `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`

/** Where to send the user after a successful sign-in. */
function destinationFor(user, from) {
  if (from && from !== '/login') return from
  if (user?.verificationStatus !== 'VERIFIED') return '/account'
  if (user?.role === 'ADMIN') return '/admin'
  return '/dashboard'
}

function QcuIdInput({ id, value, onChange, disabled, inputRef }) {
  return (
    <div>
      <label className="flex items-center gap-1.5 text-sm font-semibold text-slate-200" htmlFor={id}>
        <Icon name="badge" className="text-[16px] text-amber-400" />
        <span>QCU ID Number</span>
        <span className="text-amber-400" aria-hidden="true">*</span>
      </label>
      <div className="relative mt-1.5">
        <Icon name="account_circle" className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500 text-[20px] pointer-events-none" />
        <input
          ref={inputRef}
          id={id}
          type="text"
          required
          autoComplete="username webauthn"
          value={value}
          disabled={disabled}
          onChange={(e) => onChange(e.target.value)}
          placeholder="e.g. 24-0001"
          className={`${inputBase} border-white/10 pl-11 pr-4`}
        />
      </div>
    </div>
  )
}

export default function Login() {
  const navigate = useNavigate()
  const location = useLocation()
  const { login: authLogin } = useAuth()
  const passkeyCapable = isWebAuthnSupported()

  const [step, setStep] = useState('password') // password | otp
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
  const idInputRef = useRef(null)
  const timers = useRef([])

  const later = (fn, ms) => {
    timers.current.push(setTimeout(fn, ms))
  }
  useEffect(() => () => timers.current.forEach(clearTimeout), [])

  // Tick once a second while an OTP is outstanding (expiry + resend countdowns).
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
    later(() => navigate(destinationFor(user, location.state?.from), { replace: true }), 600)
  }

  // 1. POST /auth/login/password — verify credentials, server emails a 6-digit code.
  const handleRequestOtp = async (e) => {
    e?.preventDefault()
    setLoginError(null)
    setLoginState('loading')
    try {
      const result = await requestPasswordOtp({ qcuIdNumber: identifier.trim(), password })
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

  // 2. POST /auth/login/otp/verify — consume the code and receive the JWT session.
  const handleVerifyOtp = async (e) => {
    e.preventDefault()
    setLoginError(null)
    setLoginState('loading')
    try {
      const result = await verifyPasswordOtp({ qcuIdNumber: identifier.trim(), otp: otp.trim() })
      setLoginState('done')
      finishLogin(result.data)
    } catch (err) {
      setLoginError(getErrorMessage(err))
      setLoginState('idle')
    }
  }

  const backToPassword = () => {
    setStep('password')
    setOtp('')
    setOtpNotice(null)
    setOtpExpiresAt(null)
    setLoginError(null)
  }

  // 3. WebAuthn passkey login — options -> device prompt -> verify -> JWT session.
  const handlePasskeyLogin = async () => {
    setLoginError(null)
    if (!identifier.trim()) {
      setLoginError('Enter your QCU ID Number first to sign in with a passkey.')
      idInputRef.current?.focus()
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

  const busy = loginState !== 'idle' || bioState !== 'idle'

  const passwordBtn = {
    idle: { text: 'Send Login Code', icon: 'send' },
    loading: { text: 'Checking credentials…', icon: null },
  }[loginState] || { text: 'Send Login Code', icon: 'send' }

  const otpBtn = {
    idle: { text: 'Verify & Sign In', icon: 'login' },
    loading: { text: 'Signing in…', icon: null },
    done: { text: 'Signed in!', icon: 'check_circle' },
  }[loginState]

  return (
    <main className="flex-1 min-h-0 w-full max-w-6xl mx-auto px-4 sm:px-6 pt-20 pb-2 lg:py-4 grid lg:grid-cols-2 lg:grid-rows-[minmax(0,1fr)] gap-8 lg:gap-16 items-center">
      <AuthShowcase />

      <section className="w-full max-w-[420px] mx-auto lg:mx-0 lg:justify-self-end" aria-labelledby="login-title">
        <AuthCard>
          {/* Header */}
          <div className="text-center mb-5">
            <div className="mx-auto mb-3 w-11 h-11 rounded-xl bg-gradient-to-br from-amber-300 via-amber-400 to-amber-600 flex items-center justify-center shadow-lg shadow-amber-500/30 ring-1 ring-inset ring-white/30">
              <Icon name="storefront" className="text-slate-950 text-[22px]" />
            </div>
            <h1 id="login-title" className="text-2xl font-extrabold tracking-tight text-white">
              Welcome back
            </h1>
            <p className="text-sm text-slate-400 mt-1">Sign in to your BizzyQCU account</p>
          </div>

          <AuthModeTabs active="login" loginTo="/login" signupTo="/signup" />

          {loginError && <Alert tone="error" className="mb-4">{loginError}</Alert>}

          {step === 'password' ? (
            /* STEP 1: Single Login Form (QCU ID + Password -> Email OTP, or Passkey) */
            <form className="space-y-4" onSubmit={handleRequestOtp}>
              <QcuIdInput
                id="login-identifier"
                value={identifier}
                onChange={setIdentifier}
                disabled={busy}
                inputRef={idInputRef}
              />

              <div>
                <label className="flex items-center gap-1.5 text-sm font-semibold text-slate-200" htmlFor="login-password">
                  <Icon name="lock" className="text-[16px] text-amber-400" />
                  <span>Password</span>
                  <span className="text-amber-400" aria-hidden="true">*</span>
                </label>
                <div className="relative mt-1.5">
                  <Icon name="lock" className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500 text-[20px] pointer-events-none" />
                  <input
                    id="login-password"
                    type={showPassword ? 'text' : 'password'}
                    required
                    minLength={8}
                    autoComplete="current-password"
                    value={password}
                    disabled={busy}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter your password"
                    className={`${inputBase} border-white/10 pl-11 pr-11`}
                  />
                  <PasswordToggle visible={showPassword} onToggle={() => setShowPassword((s) => !s)} />
                </div>
              </div>

              <p className="flex items-center gap-1.5 text-xs text-slate-400">
                <Icon name="verified_user" className="text-[15px] text-emerald-400" />
                <span>We&apos;ll email a 6-digit code to confirm it&apos;s you.</span>
              </p>

              <button type="submit" disabled={busy} className={submitBtn(false)}>
                <span>{passwordBtn.text}</span>
                {loginState === 'loading' ? <Spinner /> : passwordBtn.icon && <Icon name={passwordBtn.icon} className="text-[20px]" />}
              </button>

              <PasskeyOption
                supported={passkeyCapable}
                state={bioState}
                disabled={busy}
                onTrigger={handlePasskeyLogin}
              />
            </form>
          ) : (
            /* STEP 2: Email OTP */
            <form className="space-y-4" onSubmit={handleVerifyOtp}>
              {otpNotice && (
                <Alert tone="info" icon="mark_email_read">
                  {otpNotice}
                  <span className="block text-xs text-amber-200/70 mt-0.5">Signing in as {identifier.trim()}</span>
                </Alert>
              )}

              <div>
                <div className="flex items-center justify-between">
                  <label className="flex items-center gap-1.5 text-sm font-semibold text-slate-200" htmlFor="login-otp">
                    <Icon name="pin" className="text-[16px] text-amber-400" />
                    <span>6-Digit Code</span>
                  </label>
                  <span
                    className={`text-xs font-semibold tabular-nums ${otpExpired ? 'text-red-400' : otpSecondsLeft <= 60 ? 'text-orange-300' : 'text-slate-400'}`}
                    aria-live="polite"
                  >
                    {otpExpired ? 'Code expired' : `Expires in ${formatClock(otpSecondsLeft)}`}
                  </span>
                </div>
                <input
                  id="login-otp"
                  type="text"
                  inputMode="numeric"
                  autoComplete="one-time-code"
                  pattern="\d{6}"
                  maxLength={6}
                  required
                  autoFocus
                  value={otp}
                  disabled={loginState !== 'idle'}
                  onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                  placeholder="••••••"
                  className={`${inputBase} border-white/10 mt-1.5 px-4 text-center tracking-[0.6em] text-xl font-mono`}
                />
              </div>

              <button
                type="submit"
                disabled={loginState !== 'idle' || otp.length !== 6 || otpExpired}
                className={submitBtn(loginState === 'done')}
              >
                <span>{otpBtn.text}</span>
                {loginState === 'loading' ? <Spinner /> : otpBtn.icon && <Icon name={otpBtn.icon} className="text-[20px]" />}
              </button>

              <div className="flex items-center justify-between pt-1">
                <button type="button" onClick={backToPassword} disabled={loginState !== 'idle'} className="text-xs text-slate-400 hover:text-white disabled:opacity-50">
                  ← Use a different account
                </button>
                <button
                  type="button"
                  onClick={handleRequestOtp}
                  disabled={loginState !== 'idle' || resendSecondsLeft > 0}
                  className="text-xs font-semibold text-amber-300 hover:underline disabled:text-slate-500 disabled:no-underline disabled:cursor-not-allowed"
                >
                  {resendSecondsLeft > 0 ? `Resend code in ${resendSecondsLeft}s` : 'Resend code'}
                </button>
              </div>
            </form>
          )}

          {/* Footer */}
          <div className="mt-auto pt-5">
            <div className="pt-4 border-t border-white/10 text-center">
              <Link
                to="/seller-login-form"
                className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wide px-4 py-2 rounded-full bg-amber-400/10 text-amber-300 hover:bg-amber-400/20 hover:text-amber-200 border border-amber-400/25 transition-colors"
              >
                <Icon name="storefront" className="text-[16px]" />
                <span>Want to sell? Seller Portal</span>
              </Link>
            </div>
          </div>
        </AuthCard>

        <TrustBadges />
      </section>
    </main>
  )
}
