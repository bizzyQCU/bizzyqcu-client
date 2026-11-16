import { useState } from 'react'
import { registerPasskey } from '../api'
import { getErrorMessage } from '../../../lib/api-client'
import { getWebAuthnErrorMessage, guessDeviceName, isWebAuthnSupported } from '../../../lib/webauthn'
import { Alert, Icon, inputBase, Spinner } from './AuthUI.jsx'

/**
 * Registers a new WebAuthn passkey for `userId`
 * (POST /auth/webauthn/register/options -> navigator.credentials.create -> POST /auth/webauthn/register/verify).
 */
export default function PasskeySetup({ userId, onRegistered, compact = false }) {
  const [deviceName, setDeviceName] = useState(() => guessDeviceName())
  const [state, setState] = useState('idle') // idle | working
  const [error, setError] = useState(null)
  const [success, setSuccess] = useState(null)
  const supported = isWebAuthnSupported()

  const handleRegister = async () => {
    setError(null)
    setSuccess(null)
    setState('working')
    try {
      const passkey = await registerPasskey({ userId, deviceName })
      setSuccess(`Passkey "${passkey?.deviceName || deviceName || 'this device'}" registered.`)
      onRegistered?.(passkey)
    } catch (err) {
      setError(getWebAuthnErrorMessage(err) || getErrorMessage(err))
    } finally {
      setState('idle')
    }
  }

  if (!supported) {
    return (
      <Alert tone="warning" icon="no_encryption">
        This browser does not support passkeys. You can still sign in with your password and an email code.
      </Alert>
    )
  }

  return (
    <div className="space-y-3">
      {!compact && (
        <div className="flex items-start gap-3">
          <span className="w-10 h-10 rounded-xl bg-[#8ACFF8]/25 border border-[#8ACFF8] flex items-center justify-center text-[#0369A1] shrink-0">
            <Icon name="fingerprint" className="text-[22px]" />
          </span>
          <div>
            <h3 className="text-sm font-bold text-slate-900">Add a passkey</h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Sign in with Face ID, Touch ID, Windows Hello, or your device PIN — no password or email code needed.
            </p>
          </div>
        </div>
      )}

      {error && <Alert tone="error">{error}</Alert>}
      {success && <Alert tone="success">{success}</Alert>}

      <div className="flex flex-col sm:flex-row gap-2">
        <div className="relative flex-1">
          <label htmlFor="passkey-device-name" className="sr-only">
            Device name
          </label>
          <Icon name="devices" className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 text-[18px] pointer-events-none" />
          <input
            id="passkey-device-name"
            type="text"
            maxLength={100}
            value={deviceName}
            onChange={(e) => setDeviceName(e.target.value)}
            placeholder="Device name (e.g. My Phone)"
            disabled={state === 'working'}
            className={`${inputBase} border-slate-200 pl-10 pr-3.5`}
          />
        </div>
        <button
          type="button"
          onClick={handleRegister}
          disabled={state === 'working' || !userId}
          className="px-4 py-2.5 rounded-xl font-bold text-sm text-white bg-[#0284C7] hover:bg-[#0369A1] shadow-[0_8px_20px_-6px_rgba(2,132,199,0.45)] flex items-center justify-center gap-1.5 disabled:opacity-60 disabled:cursor-not-allowed whitespace-nowrap transition-colors"
        >
          {state === 'working' ? <Spinner className="text-[18px]" /> : <Icon name="add_moderator" className="text-[18px]" />}
          <span>{state === 'working' ? 'Waiting for device…' : 'Create passkey'}</span>
        </button>
      </div>
    </div>
  )
}

