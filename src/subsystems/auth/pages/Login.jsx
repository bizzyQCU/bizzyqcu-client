import { useEffect, useRef, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'

const tabBase = 'flex-1 py-2 px-3 rounded-lg text-sm font-semibold transition-all flex items-center justify-center gap-2'
const tabActive = `${tabBase} bg-white text-slate-900 shadow-sm`
const tabIdle = `${tabBase} text-slate-500 hover:text-slate-900`

export default function Login() {
  const navigate = useNavigate()
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
    // Simulated auth. Replace with a real API call.
    later(() => {
      setLoginState('done')
      later(() => navigate('/dashboard'), 700)
    }, 1100)
  }

  const handleBiometric = () => {
    setBioState('scanning')
    // Simulated face scan. Replace with a real WebAuthn / camera flow.
    later(() => {
      setBioState('done')
      later(() => navigate('/dashboard'), 500)
    }, 1300)
  }

  const submitIcon = { idle: 'arrow_forward', loading: 'sync', done: 'check_circle' }[loginState]
  const submitText = { idle: 'Log In', loading: 'Signing in...', done: 'Authenticated!' }[loginState]
  const bioIcon = { idle: 'center_focus_strong', scanning: 'sync', done: 'verified' }[bioState]
  const bioText = {
    idle: 'Scan Face with Camera',
    scanning: 'Matching biometric data...',
    done: 'QCU Liveness Confirmed',
  }[bioState]

  return (
    <>
      <main className="flex-grow flex items-center justify-center px-4 py-8">
        <div className="relative w-full max-w-[500px]">

          <div className="relative bg-white border border-slate-200 rounded-3xl shadow-modal p-10 text-slate-900">
            <div className="text-center mb-8">
              <div className="flex items-center justify-center gap-2">
                <span className="material-symbols-outlined text-amber-500 text-xl">auto_awesome</span>
                <h1 className="text-2xl font-bold text-slate-900">Welcome back to BizzyQCU</h1>
                <span className="material-symbols-outlined text-amber-500 text-xl">auto_awesome</span>
              </div>
              <p className="text-sm text-slate-500 mt-2">Sign in to access your marketplace account</p>
            </div>

            {/* Tabs */}
            <div className="bg-slate-100 p-1.5 rounded-xl flex mb-7 border border-slate-200">
              <button type="button" className={tab === 'credentials' ? tabActive : tabIdle} onClick={() => setTab('credentials')}>
                <span className={`material-symbols-outlined text-[18px] ${tab === 'credentials' ? 'text-sky-600' : ''}`}>key</span>
                <span>Credentials</span>
              </button>
              <button type="button" className={tab === 'passkey' ? tabActive : tabIdle} onClick={() => setTab('passkey')}>
                <span className={`material-symbols-outlined text-[18px] ${tab === 'passkey' ? 'text-sky-600' : ''}`}>face</span>
                <span>QCU Face ID</span>
                <span className="px-1.5 py-0.5 rounded-full bg-amber-100 text-amber-800 text-[10px] font-bold">Fast</span>
              </button>
            </div>

            {tab === 'credentials' ? (
              <form className="space-y-5" onSubmit={handleLogin}>
                <div>
                  <label className="flex items-center gap-1 text-sm font-semibold text-slate-900" htmlFor="login-identifier">
                    <span>Username or Student ID</span>
                    <span className="text-red-500">*</span>
                  </label>
                  <div className="relative mt-1.5">
                    <span className="material-symbols-outlined absolute left-3.5 top-3 text-slate-400 text-[20px]">account_circle</span>
                    <input
                      id="login-identifier"
                      type="text"
                      required
                      value={identifier}
                      onChange={(e) => setIdentifier(e.target.value)}
                      placeholder="e.g. chiper123 or 24-1679"
                      className="w-full pl-11 pr-4 py-3 rounded-xl border border-slate-300 text-slate-900 placeholder:text-slate-400 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500"
                    />
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between">
                    <label className="flex items-center gap-1 text-sm font-semibold text-slate-900" htmlFor="login-password">
                      <span>Password</span>
                      <span className="text-red-500">*</span>
                    </label>
                    <a className="text-sm font-semibold text-blue-600 hover:text-blue-700 hover:underline" href="#forgot">
                      Forgot password?
                    </a>
                  </div>
                  <div className="relative mt-1.5">
                    <span className="material-symbols-outlined absolute left-3.5 top-3 text-slate-400 text-[20px]">lock</span>
                    <input
                      id="login-password"
                      type={showPassword ? 'text' : 'password'}
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Enter your password"
                      className="w-full pl-11 pr-11 py-3 rounded-xl border border-slate-300 text-slate-900 placeholder:text-slate-400 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500"
                    />
                    <button
                      type="button"
                      aria-label={showPassword ? 'Hide password' : 'Show password'}
                      onClick={() => setShowPassword((s) => !s)}
                      className="absolute right-3.5 top-3 text-slate-400 hover:text-slate-600"
                    >
                      <span className="material-symbols-outlined text-[20px]">
                        {showPassword ? 'visibility' : 'visibility_off'}
                      </span>
                    </button>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-1">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={remember}
                      onChange={(e) => setRemember(e.target.checked)}
                      className="w-4 h-4 rounded text-amber-500 focus:ring-amber-400 border-slate-300"
                    />
                    <span className="text-sm text-slate-700 font-medium">Remember this device</span>
                  </label>
                  <div className="flex items-center gap-1 text-sky-600 text-xs font-semibold">
                    <span className="material-symbols-outlined text-[15px]">verified_user</span>
                    <span>SSL Secured</span>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loginState !== 'idle'}
                  className={`w-full py-3.5 rounded-xl text-white font-bold shadow-lg shadow-amber-500/25 transition-all flex items-center justify-center gap-2 group disabled:cursor-not-allowed ${
                    loginState === 'done' ? 'bg-emerald-600' : 'bg-amber-500 hover:bg-amber-600'
                  }`}
                >
                  <span>{submitText}</span>
                  <span
                    className={`material-symbols-outlined text-[20px] transition-transform ${
                      loginState === 'idle' ? 'group-hover:translate-x-1' : ''
                    } ${loginState === 'loading' ? 'animate-spin' : ''}`}
                  >
                    {submitIcon}
                  </span>
                </button>
              </form>
            ) : (
              <div className="space-y-6">
                <div className="p-6 bg-slate-50 border border-slate-200 rounded-2xl flex flex-col items-center text-center space-y-4">
                  <div className="relative w-20 h-20 rounded-full bg-sky-100 flex items-center justify-center text-sky-600">
                    <span className="material-symbols-outlined text-4xl">face</span>
                    <div className="absolute -top-1 -right-1 w-6 h-6 rounded-full bg-amber-400 flex items-center justify-center text-slate-900 text-xs font-bold">
                      QCU
                    </div>
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-slate-900">Biometric Liveness Verification</h3>
                    <p className="text-sm text-slate-500 max-w-xs">
                      Authenticate instantly against the verified QCU Student Registry
                    </p>
                  </div>
                  <button
                    type="button"
                    disabled={bioState !== 'idle'}
                    onClick={handleBiometric}
                    className={`w-full py-3 rounded-xl text-white font-semibold shadow-md flex items-center justify-center gap-2 disabled:cursor-not-allowed ${
                      bioState === 'done' ? 'bg-emerald-600' : 'bg-sky-600 hover:bg-sky-700'
                    }`}
                  >
                    <span className={`material-symbols-outlined text-[20px] ${bioState === 'scanning' ? 'animate-spin' : ''}`}>
                      {bioIcon}
                    </span>
                    <span>{bioText}</span>
                  </button>
                </div>
                <p className="text-center text-sm text-slate-500">
                  Prefer entering credentials?{' '}
                  <button type="button" className="text-blue-600 font-semibold hover:underline" onClick={() => setTab('credentials')}>
                    Switch to password
                  </button>
                </p>
              </div>
            )}

            {/* Divider */}
            <div className="relative flex items-center justify-center my-6">
              <div className="w-full h-px bg-slate-200" />
              <span className="absolute px-3 bg-white text-xs font-bold uppercase text-slate-400">or sign in with</span>
            </div>

            <button
              type="button"
              onClick={() => setTab('passkey')}
              className="w-full py-3 rounded-xl bg-white hover:bg-slate-50 border border-slate-300 text-slate-700 font-semibold flex items-center justify-center gap-2.5"
            >
              <span className="material-symbols-outlined text-sky-600 text-[20px]">fingerprint</span>
              <span>Sign in with WebAuthn Passkey</span>
            </button>

            {/* Footer links */}
            <div className="mt-8 pt-6 border-t border-slate-100 -mx-10 -mb-10 px-10 pb-6 rounded-b-3xl bg-slate-50/70 text-center space-y-3.5">
              <p className="text-sm text-slate-600">
                Don't have an account yet?{' '}
                <Link className="text-blue-600 font-bold hover:underline inline-flex items-center gap-0.5" to="/signup">
                  Sign up here
                  <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
                </Link>
              </p>
              <Link
                to="/seller-register"
                className="inline-flex items-center gap-1.5 text-xs font-bold uppercase px-4 py-2 rounded-full bg-amber-100 text-amber-900 hover:bg-amber-200 transition-colors border border-amber-200"
              >
                <span className="material-symbols-outlined text-[16px] text-amber-700">storefront</span>
                <span>Want to sell? Register as Seller →</span>
              </Link>
            </div>
          </div>

          {/* Trust badges */}
          <div className="flex flex-wrap items-center justify-center gap-6 text-white text-sm font-medium pt-4">
            <div className="flex items-center gap-1.5">
              <span className="material-symbols-outlined text-sky-400 text-[18px]">verified</span>
              <span>Official QCU Portal</span>
            </div>
            <span className="w-1.5 h-1.5 rounded-full bg-slate-500" />
            <div className="flex items-center gap-1.5">
              <span className="material-symbols-outlined text-amber-400 text-[18px]">local_police</span>
              <span>Biometric Protected</span>
            </div>
          </div>
        </div>
      </main>
    </>
  )
}
