// Shared UI primitives for the auth subsystem (dark glass card theme).
import { Link } from 'react-router-dom'

export const inputBase =
  'w-full py-2.5 rounded-xl bg-white/[0.04] border text-white placeholder:text-slate-500 text-sm transition-colors duration-200 hover:border-white/20 focus:outline-none focus:border-amber-400/60 focus:ring-2 focus:ring-amber-400/25 focus:bg-white/[0.07] disabled:opacity-60'

export const fieldBorder = (error) => (error ? 'border-red-400/70' : 'border-white/10')

export const primaryButton =
  'w-full py-3 rounded-xl font-extrabold text-base text-slate-950 bg-gradient-to-r from-amber-400 via-amber-500 to-amber-600 hover:from-amber-300 hover:via-amber-400 hover:to-amber-500 ring-1 ring-inset ring-amber-200/50 shadow-lg shadow-amber-500/25 hover:shadow-xl hover:shadow-amber-500/40 transition-all duration-200 flex items-center justify-center gap-2 active:scale-[0.98] disabled:opacity-60 disabled:cursor-not-allowed focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-200'

export const secondaryButton =
  'w-full py-2.5 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] border border-white/10 hover:border-amber-400/40 text-slate-200 text-sm font-semibold flex items-center justify-center gap-2 transition-all active:scale-[0.98] disabled:opacity-60 disabled:cursor-not-allowed'

export function Icon({ name, className = '' }) {
  return (
    <span className={`material-symbols-outlined ${className}`} aria-hidden="true">
      {name}
    </span>
  )
}

export function Spinner({ className = 'text-[20px]' }) {
  return <Icon name="progress_activity" className={`animate-spin ${className}`} />
}

/** Glass card with the amber glow + hairline used across auth pages. */
export function AuthCard({ children, className = '', onClose, closeLabel = 'Close', fixedHeight = true }) {
  return (
    <div
      className={`relative overflow-hidden rounded-3xl bg-slate-900/70 backdrop-blur-xl border border-white/10 shadow-modal ring-1 ring-inset ring-white/5 ${
        fixedHeight
          ? 'flex flex-col h-[min(590px,calc(100vh-180px))] lg:h-[min(590px,calc(100vh-130px))]'
          : 'p-6 sm:p-7'
      } ${className}`}
    >
      <div aria-hidden="true" className="pointer-events-none absolute -top-24 -right-24 w-64 h-64 rounded-full bg-amber-500/15 blur-3xl" />
      <div aria-hidden="true" className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-amber-400/60 to-transparent" />
      {onClose && (
        <button
          type="button"
          onClick={onClose}
          aria-label={closeLabel}
          className="absolute top-4 right-4 z-10 w-8 h-8 rounded-full bg-white/[0.06] hover:bg-white/[0.12] border border-white/10 flex items-center justify-center text-slate-400 hover:text-white transition-colors"
        >
          <Icon name="close" className="text-[18px]" />
        </button>
      )}
      {fixedHeight ? (
        <div className="relative flex-1 min-h-0 overflow-y-auto overscroll-contain p-6 sm:p-7 auth-card-scroll">
          <div className="min-h-full flex flex-col">{children}</div>
        </div>
      ) : (
        <div className="relative">{children}</div>
      )}
    </div>
  )
}

const ALERT_STYLES = {
  error: { wrap: 'bg-red-500/10 border-red-400/25 text-red-300', icon: 'error', iconCls: 'text-red-400', role: 'alert' },
  info: { wrap: 'bg-amber-500/10 border-amber-400/25 text-amber-300', icon: 'info', iconCls: 'text-amber-400', role: 'status' },
  success: { wrap: 'bg-emerald-500/10 border-emerald-400/25 text-emerald-300', icon: 'check_circle', iconCls: 'text-emerald-400', role: 'status' },
  warning: { wrap: 'bg-orange-500/10 border-orange-400/25 text-orange-300', icon: 'warning', iconCls: 'text-orange-400', role: 'status' },
}

export function Alert({ tone = 'error', icon, children, className = '' }) {
  const s = ALERT_STYLES[tone]
  return (
    <div role={s.role} className={`flex items-start gap-2.5 rounded-xl border px-4 py-3 text-sm ${s.wrap} ${className}`}>
      <Icon name={icon || s.icon} className={`text-[18px] mt-px shrink-0 ${s.iconCls}`} />
      <div className="min-w-0">{children}</div>
    </div>
  )
}

/** Label + leading icon + input slot + error/hint line. */
export function Field({ id, label, icon, error, hint, required = true, rightSlot, children }) {
  return (
    <div>
      <label className="flex items-center gap-1 text-[11px] font-bold tracking-wider uppercase text-slate-300" htmlFor={id}>
        <span>{label}</span>
        {required ? (
          <span className="text-amber-400" aria-hidden="true">*</span>
        ) : (
          <span className="normal-case tracking-normal font-medium text-slate-500">(optional)</span>
        )}
      </label>
      <div className="relative mt-1.5">
        {icon && (
          <Icon name={icon} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500 text-[18px] pointer-events-none" />
        )}
        {children}
        {rightSlot}
      </div>
      {error ? (
        <p className="mt-1 text-[11px] text-red-400">{error}</p>
      ) : hint ? (
        <p className="mt-1 text-[11px] text-slate-500">{hint}</p>
      ) : null}
    </div>
  )
}

export function PasswordToggle({ visible, onToggle }) {
  return (
    <button
      type="button"
      aria-label={visible ? 'Hide password' : 'Show password'}
      onClick={onToggle}
      className="absolute right-2.5 top-1/2 -translate-y-1/2 p-1 rounded-lg text-slate-500 hover:text-amber-300 focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-400/60"
    >
      <Icon name={visible ? 'visibility' : 'visibility_off'} className="text-[18px]" />
    </button>
  )
}

const STATUS_STYLES = {
  VERIFIED: { cls: 'bg-emerald-500/15 text-emerald-300 border-emerald-400/30', icon: 'verified', label: 'Verified' },
  PENDING: { cls: 'bg-amber-500/15 text-amber-300 border-amber-400/30', icon: 'hourglass_top', label: 'Pending review' },
  REJECTED: { cls: 'bg-red-500/15 text-red-300 border-red-400/30', icon: 'block', label: 'Rejected' },
}

/** Badge for the server's VerificationStatus enum. */
export function VerificationBadge({ status }) {
  const s = STATUS_STYLES[status] || STATUS_STYLES.PENDING
  return (
    <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full border text-[11px] font-bold ${s.cls}`}>
      <Icon name={s.icon} className="text-[14px]" />
      <span>{s.label}</span>
    </span>
  )
}

export function TrustBadges({ items = ['Official QCU Portal', 'WebAuthn FIDO2 Protected'] }) {
  const icons = ['verified', 'local_police']
  return (
    <div className="flex flex-wrap items-center justify-center gap-5 text-slate-300 text-xs font-medium pt-3">
      {items.map((label, i) => (
        <div key={label} className="flex items-center gap-1.5">
          {i > 0 && <span className="w-1 h-1 rounded-full bg-slate-500 mr-3.5" aria-hidden="true" />}
          <Icon name={icons[i % icons.length]} className="text-amber-400 text-[16px]" />
          <span>{label}</span>
        </div>
      ))}
    </div>
  )
}

const modeTabBase =
  'py-2 px-3 rounded-xl text-sm font-semibold transition-all duration-200 flex items-center justify-center gap-2 focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-400/70'
const modeTabActive = `${modeTabBase} bg-gradient-to-r from-amber-400 to-amber-500 text-slate-950 shadow-md shadow-amber-500/20`
const modeTabIdle = `${modeTabBase} text-slate-400 hover:text-white hover:bg-white/5`

/** 2-tab route switcher between Login and Signup. */
export function AuthModeTabs({ active = 'login', loginTo = '/login', signupTo = '/signup', className = 'mb-5' }) {
  return (
    <nav
      aria-label="Account access"
      className={`bg-white/[0.04] p-1 rounded-2xl grid grid-cols-2 gap-1 border border-white/10 ${className}`}
    >
      <Link
        to={loginTo}
        aria-current={active === 'login' ? 'page' : undefined}
        className={active === 'login' ? modeTabActive : modeTabIdle}
      >
        <Icon name="login" className="text-[18px]" />
        <span>Login</span>
      </Link>
      <Link
        to={signupTo}
        aria-current={active === 'signup' ? 'page' : undefined}
        className={active === 'signup' ? modeTabActive : modeTabIdle}
      >
        <Icon name="person_add" className="text-[18px]" />
        <span>Signup</span>
      </Link>
    </nav>
  )
}

/** Inline FIDO2 passkey trigger shown beneath the primary password submit button. */
export function PasskeyOption({ supported, state = 'idle', disabled = false, onTrigger }) {
  const labels = {
    idle: { icon: 'fingerprint', text: 'Sign in with Passkey' },
    scanning: { icon: null, text: 'Waiting for your device…' },
    done: { icon: 'verified', text: 'Passkey verified!' },
  }[state] || { icon: 'fingerprint', text: 'Sign in with Passkey' }

  return (
    <div className="space-y-3 pt-1">
      <div className="flex items-center gap-3 text-[11px] font-semibold uppercase tracking-wider text-slate-500">
        <span className="h-px flex-1 bg-white/10" aria-hidden="true" />
        <span>or</span>
        <span className="h-px flex-1 bg-white/10" aria-hidden="true" />
      </div>

      {supported ? (
        <div className="space-y-2">
          <button
            type="button"
            disabled={disabled}
            onClick={onTrigger}
            className={`w-full py-2.5 px-4 rounded-xl border text-sm font-bold flex items-center justify-center gap-2 transition-all active:scale-[0.98] disabled:opacity-60 disabled:cursor-not-allowed focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-400/70 ${
              state === 'done'
                ? 'bg-emerald-500/20 border-emerald-400/40 text-emerald-200'
                : 'bg-white/[0.04] hover:bg-white/[0.08] border-white/15 hover:border-amber-400/45 text-slate-100'
            }`}
          >
            {labels.icon ? <Icon name={labels.icon} className="text-[20px] text-amber-400" /> : <Spinner className="text-[18px]" />}
            <span>{labels.text}</span>
            <span className="ml-0.5 px-1.5 py-0.5 rounded-full bg-amber-400/15 border border-amber-400/30 text-amber-300 text-[10px] font-black tracking-wide">
              FIDO2
            </span>
          </button>
          <p className="text-center text-[11px] text-slate-400">
            Have a registered passkey? Enter your QCU ID above and tap <span className="text-slate-200 font-medium">Sign in with Passkey</span>.
          </p>
        </div>
      ) : (
        <Alert tone="warning" icon="no_encryption" className="text-xs">
          Passkeys aren&apos;t supported in this browser. Sign in with your QCU ID, password, and email code above.
        </Alert>
      )}
    </div>
  )
}

