import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { registerUser } from '../api'
import { uploadVerificationImage, isImageUploadConfigured } from '../upload'
import { AuthShowcase } from '../components'
import {
  Alert,
  AuthCard,
  AuthModeTabs,
  Field,
  fieldBorder,
  Icon,
  inputBase,
  PasswordToggle,
  primaryButton,
  Spinner,
  TrustBadges,
  VerificationBadge,
} from '../components/AuthUI.jsx'
import ImageDropzone from '../components/ImageDropzone.jsx'
import CameraCapture from '../components/CameraCapture.jsx'
import PasskeySetup from '../components/PasskeySetup.jsx'
import { EulaConsentField, EulaModal } from '../components/EulaModal.jsx'
import { RegistrationOtpStep, useRegistrationOtp } from '../components/RegistrationOtpStep.jsx'
import { MEMBER_TYPES, QCU_ID_PATTERN, MIN_PASSWORD_LENGTH } from '../../../lib/constants'
import { isWebAuthnSupported } from '../../../lib/webauthn'

// Server field name -> form field name
const SERVER_FIELD_MAP = {
  qcuIdPhotoUrl: 'idPhoto',
  liveSelfieUrl: 'selfie',
}

const SUBMIT_TEXT = {
  idle: 'Continue & Verify Email',
  requesting_otp: 'Sending verification code…',
  verifying_otp: 'Verifying email…',
  uploading: 'Uploading photos…',
  submitting: 'Creating account…',
}

export default function Signup() {
  const navigate = useNavigate()
  const otpFlow = useRegistrationOtp(SERVER_FIELD_MAP)

  const [form, setForm] = useState({
    fullName: '',
    qcuIdNumber: '',
    email: '',
    password: '',
    confirmPassword: '',
  })
  const [usePassword, setUsePassword] = useState(true)
  const [idPhoto, setIdPhoto] = useState(null)
  const [selfie, setSelfie] = useState(null)
  const [showPass, setShowPass] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)
  const [status, setStatus] = useState('idle') // idle | requesting_otp | verifying_otp | uploading | submitting
  const [errors, setErrors] = useState({})
  const [registered, setRegistered] = useState(null) // server user object
  const [passkeyAdded, setPasskeyAdded] = useState(false)
  const [eulaAccepted, setEulaAccepted] = useState(false)
  const [eulaModalOpen, setEulaModalOpen] = useState(true)

  const busy = status !== 'idle'
  const passkeyCapable = isWebAuthnSupported()
  const emailAlreadyVerified = Boolean(otpFlow.getVerifiedEmailToken(form.email))

  const clearError = (key) => setErrors((prev) => ({ ...prev, [key]: undefined }))
  const update = (key) => (e) => {
    setForm((f) => ({ ...f, [key]: e.target.value }))
    clearError(key)
  }

  // Mirrors registerUserSchema in bizzyqcu-server/src/modules/auth/auth.validation.ts
  const validate = () => {
    const next = {}
    if (form.fullName.trim().length < 2) next.fullName = 'Full name must be at least 2 characters'
    if (!QCU_ID_PATTERN.test(form.qcuIdNumber.trim())) next.qcuIdNumber = 'Format must be YY-NNNN (e.g. 24-0001)'
    if (!/^\S+@\S+\.\S+$/.test(form.email.trim())) next.email = 'Enter a valid email address'
    if (usePassword) {
      if (form.password.length < MIN_PASSWORD_LENGTH) next.password = `Password must be at least ${MIN_PASSWORD_LENGTH} characters`
      if (form.confirmPassword !== form.password) next.confirmPassword = 'Passwords do not match'
    }
    if (!idPhoto) next.idPhoto = 'Please upload a photo of your QCU Student ID'
    if (!selfie) next.selfie = 'Please take a live selfie'
    if (!eulaAccepted) next.eula = 'Please read and agree to the BizzyQCU End-User License Agreement to continue.'
    return next
  }

  const completeRegistration = async (emailVerificationToken) => {
    const qcuIdNumber = form.qcuIdNumber.trim()
    setStatus('uploading')
    const [qcuIdPhotoUrl, liveSelfieUrl] = await Promise.all([
      uploadVerificationImage(idPhoto, { tag: 'qcu-id', qcuIdNumber }),
      uploadVerificationImage(selfie, { tag: 'selfie', qcuIdNumber }),
    ])

    setStatus('submitting')
    const result = await registerUser({
      qcuIdNumber,
      email: form.email.trim(),
      emailVerificationToken,
      fullName: form.fullName.trim(),
      memberType: MEMBER_TYPES.STUDENT,
      qcuIdPhotoUrl,
      liveSelfieUrl,
      ...(usePassword ? { password: form.password } : {}),
    })
    setRegistered(result.data)
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!eulaAccepted) {
      setErrors(validate())
      setEulaModalOpen(true)
      return undefined
    }
    return otpFlow.handleFormSubmit({
      email: form.email,
      qcuIdNumber: form.qcuIdNumber,
      validate,
      completeRegistration,
      setErrors,
      setStatus,
    })
  }

  const handleVerifyAndSubmit = (e) => {
    e.preventDefault()
    return otpFlow.handleOtpSubmit({
      email: form.email,
      completeRegistration,
      setErrors,
      setStatus,
    })
  }

  const handleResendOtp = () =>
    otpFlow.handleResendOtp({
      email: form.email,
      qcuIdNumber: form.qcuIdNumber,
      setStatus,
    })

  // --------------------------------------------------------------------------
  // Success: registration is PENDING admin verification; offer passkey setup.
  // --------------------------------------------------------------------------
  if (registered) {
    const needsPasskey = !usePassword && !passkeyAdded
    return (
      <main className="flex-1 min-h-0 w-full max-w-6xl mx-auto px-4 sm:px-6 pt-20 pb-2 lg:py-4 grid lg:grid-cols-2 lg:grid-rows-[minmax(0,1fr)] gap-8 lg:gap-16 items-center">
        <AuthShowcase />
        <section className="w-full max-w-[480px] mx-auto lg:mx-0 lg:justify-self-end" aria-labelledby="signup-done-title">
          <AuthCard>
            <div className="text-center space-y-3">
              <div className="mx-auto w-14 h-14 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-600 dark:bg-emerald-500/15 dark:border-emerald-400/30 dark:text-emerald-400 flex items-center justify-center">
                <Icon name="how_to_reg" className="text-3xl" />
              </div>
              <h1 id="signup-done-title" className="text-2xl font-extrabold text-slate-900 dark:text-white">
                Registration submitted
              </h1>
              <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
                An administrator will review your QCU ID and live selfie. You&apos;ll get full marketplace access once your account is verified.
              </p>
            </div>

            <dl className="mt-5 rounded-2xl bg-[#F8FAFC] border border-slate-200 divide-y divide-slate-200 dark:bg-white/[0.03] dark:border-white/10 dark:divide-white/5 text-sm">
              {[
                ['Name', registered.fullName],
                ['QCU ID', registered.qcuIdNumber],
                ['Email', registered.email],
                ['Role', `${registered.memberType} · ${registered.role}`],
              ].map(([k, v]) => (
                <div key={k} className="flex items-center justify-between gap-3 px-4 py-2.5">
                  <dt className="text-slate-500 dark:text-slate-400">{k}</dt>
                  <dd className="text-slate-900 dark:text-white font-medium truncate">{v}</dd>
                </div>
              ))}
              <div className="flex items-center justify-between gap-3 px-4 py-2.5">
                <dt className="text-slate-500 dark:text-slate-400">Status</dt>
                <dd>
                  <VerificationBadge status={registered.verificationStatus} />
                </dd>
              </div>
            </dl>

            <div className="mt-5 pt-5 border-t border-slate-200 dark:border-white/10 space-y-3">
              {needsPasskey && passkeyCapable && (
                <Alert tone="warning">
                  You didn&apos;t set a password, so a passkey is the only way to sign in. Create one now on this device.
                </Alert>
              )}
              {needsPasskey && !passkeyCapable && (
                <Alert tone="error">
                  This browser can&apos;t create passkeys and you didn&apos;t set a password. Open this page on a passkey-capable device, or register again with a password.
                </Alert>
              )}
              <PasskeySetup userId={registered.id} onRegistered={() => setPasskeyAdded(true)} />
            </div>

            <div className="mt-auto pt-5">
              <button
                type="button"
                onClick={() => navigate('/login', { state: { qcuIdNumber: registered.qcuIdNumber } })}
                disabled={needsPasskey && passkeyCapable}
                className={primaryButton}
              >
                <span>{needsPasskey && passkeyCapable ? 'Create a passkey to continue' : 'Proceed to Log In'}</span>
                <Icon name="arrow_forward" className="text-[20px]" />
              </button>
            </div>
          </AuthCard>

          <TrustBadges />
        </section>
      </main>
    )
  }

  // --------------------------------------------------------------------------
  // Registration form
  // --------------------------------------------------------------------------
  const signupInput = `${inputBase} !py-1.5`

  return (
    <main className="flex-1 min-h-0 w-full max-w-6xl mx-auto px-4 sm:px-6 pt-16 pb-1 lg:py-2 grid lg:grid-cols-2 gap-8 lg:gap-12 items-center">
      <AuthShowcase />

      <section className="w-full max-w-[540px] mx-auto lg:mx-0 lg:justify-self-end" aria-labelledby="signup-title">
        <AuthCard
          className="!p-5 sm:!px-6 sm:!py-5"
          onClose={() => navigate('/login')}
          closeLabel="Close and return to login"
        >
          <div className="text-center mb-2.5 px-4">
            <div className="flex items-center justify-center gap-2">
              <Icon name="auto_awesome" className="text-[#0284C7] dark:text-amber-400 text-[18px]" />
              <h1 id="signup-title" className="text-lg sm:text-xl font-extrabold tracking-tight text-slate-900 dark:text-white">
                Create your QCU account
              </h1>
              <Icon name="auto_awesome" className="text-[#0284C7] dark:text-amber-400 text-[18px]" />
            </div>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5 truncate">
              Verified QCU students only — reviewed by an administrator.
            </p>
          </div>

          <AuthModeTabs active="signup" loginTo="/login" signupTo="/signup" className="mb-3" />

          {otpFlow.step === 'otp' ? (
            <RegistrationOtpStep
              id="signup-otp"
              email={form.email}
              otp={otpFlow.otp}
              onOtpChange={otpFlow.setOtp}
              notice={otpFlow.otpNotice}
              secondsLeft={otpFlow.otpSecondsLeft}
              resendSecondsLeft={otpFlow.resendSecondsLeft}
              busy={busy}
              error={otpFlow.formError}
              submitLabel="Verify & Create Account"
              busyLabel={SUBMIT_TEXT[status]}
              onSubmit={handleVerifyAndSubmit}
              onResend={handleResendOtp}
              onBack={otpFlow.backToForm}
            />
          ) : (
            <form className="space-y-2.5" onSubmit={handleSubmit} noValidate>
            {otpFlow.formError && <Alert tone="error">{otpFlow.formError}</Alert>}

            <Field id="signup-full-name" label="Full Name" icon="person" error={errors.fullName}>
              <input
                id="signup-full-name"
                type="text"
                autoComplete="name"
                value={form.fullName}
                onChange={update('fullName')}
                disabled={busy}
                placeholder="As printed on your QCU ID"
                className={`${signupInput} ${fieldBorder(errors.fullName)} pl-10 pr-3.5`}
              />
            </Field>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 items-start">
              <Field id="signup-qcu-id" label="QCU ID Number" icon="badge" error={errors.qcuIdNumber}>
                <input
                  id="signup-qcu-id"
                  type="text"
                  inputMode="numeric"
                  autoComplete="username"
                  maxLength={7}
                  value={form.qcuIdNumber}
                  onChange={update('qcuIdNumber')}
                  disabled={busy}
                  placeholder="e.g. 24-0001"
                  className={`${signupInput} ${fieldBorder(errors.qcuIdNumber)} pl-10 pr-3.5`}
                />
              </Field>

              <Field id="signup-email" label="Email Address" icon="mail" error={errors.email}>
                <input
                  id="signup-email"
                  type="email"
                  autoComplete="email"
                  value={form.email}
                  onChange={update('email')}
                  disabled={busy}
                  placeholder="you@qcu.edu.ph"
                  className={`${signupInput} ${fieldBorder(errors.email)} pl-10 pr-3.5`}
                />
              </Field>
            </div>

            {/* Sign-in method: password is optional on the server */}
            <div className="rounded-xl border border-slate-200 bg-[#F8FAFC] dark:border-white/10 dark:bg-white/[0.02] px-3.5 py-2.5 space-y-2">
              <label className="flex items-center gap-2 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={usePassword}
                  disabled={busy}
                  onChange={(e) => {
                    setUsePassword(e.target.checked)
                    clearError('password')
                    clearError('confirmPassword')
                  }}
                  className="w-4 h-4 rounded bg-white border-slate-300 text-[#0284C7] focus:ring-[#8ACFF8] focus:ring-offset-white dark:bg-white/5 dark:border-white/20 dark:text-amber-500 dark:focus:ring-amber-400 dark:focus:ring-offset-slate-900 shrink-0"
                />
                <span className="text-xs font-semibold text-slate-900 dark:text-white leading-snug">
                  Set a password
                </span>
              </label>

              {usePassword && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 items-start">
                  <Field
                    id="signup-password"
                    label="Password"
                    icon="lock"
                    error={errors.password}
                    rightSlot={<PasswordToggle visible={showPass} onToggle={() => setShowPass((s) => !s)} />}
                  >
                    <input
                      id="signup-password"
                      type={showPass ? 'text' : 'password'}
                      autoComplete="new-password"
                      value={form.password}
                      onChange={update('password')}
                      disabled={busy}
                      placeholder="Create a password"
                      className={`${signupInput} ${fieldBorder(errors.password)} pl-10 pr-9`}
                    />
                  </Field>

                  <Field
                    id="signup-confirm-password"
                    label="Confirm Password"
                    icon="lock"
                    error={errors.confirmPassword}
                    rightSlot={<PasswordToggle visible={showConfirm} onToggle={() => setShowConfirm((s) => !s)} />}
                  >
                    <input
                      id="signup-confirm-password"
                      type={showConfirm ? 'text' : 'password'}
                      autoComplete="new-password"
                      value={form.confirmPassword}
                      onChange={update('confirmPassword')}
                      disabled={busy}
                      placeholder="Re-enter password"
                      className={`${signupInput} ${fieldBorder(errors.confirmPassword)} pl-10 pr-9`}
                    />
                  </Field>
                </div>
              )}
            </div>

            {/* Identity verification */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 items-stretch">
              <ImageDropzone
                id="signup-qcu-id-photo"
                label="QCU Student ID Photo"
                file={idPhoto}
                error={errors.idPhoto}
                disabled={busy}
                onChange={(file) => {
                  setIdPhoto(file)
                  clearError('idPhoto')
                }}
                onError={(msg) => setErrors((prev) => ({ ...prev, idPhoto: msg }))}
              />
              <CameraCapture
                id="signup-selfie"
                label="Live Selfie Capture"
                capture={selfie}
                error={errors.selfie}
                disabled={busy}
                onCapture={(file) => {
                  setSelfie(file)
                  clearError('selfie')
                }}
              />
            </div>

            <p className="flex items-center gap-1.5 text-[11px] text-slate-500 dark:text-slate-400 leading-tight">
              <Icon name="shield_lock" className="text-[14px] text-[#0284C7] dark:text-slate-400 shrink-0" />
              <span>Files are protected under RA 10173.</span>
            </p>

            {import.meta.env.DEV && !isImageUploadConfigured && (
              <Alert tone="warning" icon="construction">
                Dev mode: Cloudinary isn&apos;t configured, so placeholder image URLs will be submitted.
              </Alert>
            )}

            <EulaConsentField
              id="buyer-eula"
              accepted={eulaAccepted}
              error={errors.eula}
              disabled={busy}
              onToggle={(val) => {
                setEulaAccepted(val)
                if (val) clearError('eula')
              }}
              onOpenModal={() => setEulaModalOpen(true)}
            />

            <button type="submit" disabled={busy || !eulaAccepted} className={`${primaryButton} !py-2`}>
              <span>{status === 'idle' && emailAlreadyVerified ? 'Submit for Verification' : SUBMIT_TEXT[status]}</span>
              {busy && <Spinner />}
            </button>
          </form>
          )}

          <div className="mt-2.5 pt-2 border-t border-slate-200 dark:border-white/10 text-center">
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Already have an account?{' '}
              <Link className="text-[#0369A1] hover:text-[#0284C7] dark:text-amber-300 dark:hover:text-amber-200 font-bold hover:underline" to="/login">
                Log in
              </Link>
            </p>
          </div>
        </AuthCard>

        <TrustBadges />
      </section>

      <EulaModal
        open={eulaModalOpen && !registered}
        accepted={eulaAccepted}
        onToggle={(val) => {
          setEulaAccepted(val)
          if (val) clearError('eula')
        }}
        onClose={() => setEulaModalOpen(false)}
      />
    </main>
  )
}
