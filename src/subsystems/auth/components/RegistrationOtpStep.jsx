import { useEffect, useState } from 'react'
import { requestRegistrationOtp, verifyRegistrationOtp } from '../api'
import { Alert, Icon, inputBase, primaryButton, Spinner } from './AuthUI.jsx'
import { getErrorMessage, getFieldErrors } from '../../../lib/api-client'

const DEFAULT_OTP_TTL_SECONDS = 5 * 60
const RESEND_COOLDOWN_SECONDS = 60

function formatClock(totalSeconds) {
  const s = Math.max(0, totalSeconds)
  return `${String(Math.floor(s / 60)).padStart(2, '0')}:${String(s % 60).padStart(2, '0')}`
}

function mapServerErrors(error, fieldMap) {
  const serverErrors = getFieldErrors(error)
  return Object.fromEntries(
    Object.entries(serverErrors).map(([key, msg]) => [fieldMap[key] || key, msg])
  )
}

/**
 * Manages pre-registration 6-digit Email OTP verification flow and shared error
 * handling for buyer (`Signup.jsx`) and seller (`SellerFormParts.jsx`) forms.
 */
export function useRegistrationOtp(serverFieldMap = {}) {
  const [step, setStep] = useState('form') // 'form' | 'otp'
  const [otp, setOtp] = useState('')
  const [otpToken, setOtpToken] = useState('')
  const [otpNotice, setOtpNotice] = useState('')
  const [formError, setFormError] = useState('')
  const [otpSecondsLeft, setOtpSecondsLeft] = useState(0)
  const [resendSecondsLeft, setResendSecondsLeft] = useState(0)
  const [verifiedEmail, setVerifiedEmail] = useState(null) // { email, token }

  useEffect(() => {
    if (step !== 'otp') return undefined
    const id = window.setInterval(() => {
      setOtpSecondsLeft((s) => (s > 0 ? s - 1 : 0))
      setResendSecondsLeft((s) => (s > 0 ? s - 1 : 0))
    }, 1000)
    return () => window.clearInterval(id)
  }, [step])

  const getVerifiedEmailToken = (email) => {
    const normalized = email.trim().toLowerCase()
    if (!verifiedEmail || verifiedEmail.email !== normalized) return null
    return verifiedEmail.token
  }

  const requestOtp = async ({ email, qcuIdNumber }) => {
    const res = await requestRegistrationOtp({
      email: email.trim(),
      ...(qcuIdNumber?.trim() ? { qcuIdNumber: qcuIdNumber.trim() } : {}),
    })
    setOtp('')
    setVerifiedEmail(null)
    setOtpToken(res.data?.otpToken || '')
    setOtpNotice(res.message || 'Verification code sent to your email.')
    setOtpSecondsLeft(res.data?.expiresInSeconds || DEFAULT_OTP_TTL_SECONDS)
    setResendSecondsLeft(RESEND_COOLDOWN_SECONDS)
    setStep('otp')
  }

  const verifyOtp = async (email) => {
    const existing = getVerifiedEmailToken(email)
    if (existing) return existing

    try {
      const res = await verifyRegistrationOtp({
        email: email.trim(),
        otp,
        otpToken,
      })
      const token = res.data?.emailVerificationToken
      if (!token) {
        throw new Error('Missing email verification token from server.')
      }
      setVerifiedEmail({ email: email.trim().toLowerCase(), token })
      return token
    } catch (err) {
      if (getErrorMessage(err).toLowerCase().includes('request a new code')) {
        setResendSecondsLeft(0)
      }
      throw err
    }
  }

  const applySubmissionError = (error, setErrors, returnToFormOnFieldError) => {
    const mapped = mapServerErrors(error, serverFieldMap)
    if (Object.keys(mapped).length) {
      setErrors(mapped)
      if (returnToFormOnFieldError) {
        setOtp('')
        setStep('form')
      }
    }
    setFormError(getErrorMessage(error))
  }

  const handleFormSubmit = async ({
    email,
    qcuIdNumber,
    validate,
    completeRegistration,
    setErrors,
    setStatus,
  }) => {
    setFormError('')
    const clientErrors = validate()
    if (Object.keys(clientErrors).length) {
      setErrors(clientErrors)
      return
    }

    const verifiedToken = getVerifiedEmailToken(email)
    try {
      if (!verifiedToken) {
        setStatus('requesting_otp')
        await requestOtp({ email, qcuIdNumber })
        return
      }
      await completeRegistration(verifiedToken)
    } catch (error) {
      applySubmissionError(error, setErrors, false)
    } finally {
      setStatus('idle')
    }
  }

  const handleOtpSubmit = async ({ email, completeRegistration, setErrors, setStatus }) => {
    setFormError('')
    try {
      setStatus('verifying_otp')
      const emailVerificationToken = await verifyOtp(email)
      await completeRegistration(emailVerificationToken)
    } catch (error) {
      applySubmissionError(error, setErrors, true)
    } finally {
      setStatus('idle')
    }
  }

  const handleResendOtp = async ({ email, qcuIdNumber, setStatus }) => {
    setFormError('')
    try {
      setStatus('requesting_otp')
      await requestOtp({ email, qcuIdNumber })
    } catch (error) {
      setFormError(getErrorMessage(error))
    } finally {
      setStatus('idle')
    }
  }

  const backToForm = () => {
    setOtp('')
    setFormError('')
    setStep('form')
  }

  return {
    step,
    otp,
    setOtp,
    otpNotice,
    formError,
    otpSecondsLeft,
    resendSecondsLeft,
    getVerifiedEmailToken,
    handleFormSubmit,
    handleOtpSubmit,
    handleResendOtp,
    backToForm,
  }
}

export function RegistrationOtpStep({
  id = 'reg-otp',
  email,
  otp,
  onOtpChange,
  notice,
  secondsLeft,
  resendSecondsLeft,
  busy,
  error,
  submitLabel,
  busyLabel,
  onSubmit,
  onResend,
  onBack,
}) {
  const expired = secondsLeft <= 0

  return (
    <form className="space-y-4" onSubmit={onSubmit} noValidate>
      {error && <Alert tone="error">{error}</Alert>}

      <Alert tone="info" icon="mark_email_read">
        {notice || 'Enter the 6-digit verification code sent to your email.'}
        <span className="block text-xs text-amber-200/75 mt-0.5 truncate">
          Verifying {email.trim()}
        </span>
      </Alert>

      <div>
        <div className="flex items-center justify-between gap-2">
          <label className="flex items-center gap-1.5 text-sm font-semibold text-slate-200" htmlFor={id}>
            <Icon name="pin" className="text-[16px] text-amber-400" />
            <span>6-Digit Verification Code</span>
          </label>
          <span
            className={`text-xs font-semibold tabular-nums ${
              expired ? 'text-red-400' : secondsLeft <= 60 ? 'text-orange-300' : 'text-slate-400'
            }`}
            aria-live="polite"
          >
            {expired ? 'Code expired' : `Expires in ${formatClock(secondsLeft)}`}
          </span>
        </div>

        <input
          id={id}
          type="text"
          inputMode="numeric"
          autoComplete="one-time-code"
          pattern="\d{6}"
          maxLength={6}
          required
          autoFocus
          value={otp}
          disabled={busy}
          onChange={(e) => onOtpChange(e.target.value.replace(/\D/g, '').slice(0, 6))}
          placeholder="••••••"
          className={`${inputBase} border-white/10 mt-1.5 px-4 text-center tracking-[0.6em] text-xl font-mono`}
        />
        <p className="mt-1.5 text-[11px] text-slate-400">
          Your form details and uploaded documents are saved while you verify your email.
        </p>
      </div>

      <button
        type="submit"
        disabled={busy || otp.length !== 6 || expired}
        className={primaryButton}
      >
        <span>{busy ? busyLabel : submitLabel}</span>
        {busy ? <Spinner /> : <Icon name="verified_user" className="text-[20px]" />}
      </button>

      <div className="flex items-center justify-between pt-1">
        <button
          type="button"
          onClick={onBack}
          disabled={busy}
          className="text-xs text-slate-400 hover:text-white disabled:opacity-50"
        >
          ← Back to edit details
        </button>
        <button
          type="button"
          onClick={onResend}
          disabled={busy || resendSecondsLeft > 0}
          className="text-xs font-semibold text-amber-300 hover:underline disabled:text-slate-500 disabled:no-underline disabled:cursor-not-allowed"
        >
          {resendSecondsLeft > 0 ? `Resend code in ${resendSecondsLeft}s` : 'Resend code'}
        </button>
      </div>
    </form>
  )
}
