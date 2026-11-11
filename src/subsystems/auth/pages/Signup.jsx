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
import { RegistrationOtpStep, useRegistrationOtp } from '../components/RegistrationOtpStep.jsx'
import { MEMBER_TYPES, QCU_ID_PATTERN, MIN_PASSWORD_LENGTH } from '../../../lib/constants'
import { isWebAuthnSupported } from '../../../lib/webauthn'

// Mirrors bizzyqcu-server QcuMemberType. Faculty & Staff accounts can only buy.
const MEMBER_OPTIONS = [
  { value: MEMBER_TYPES.STUDENT, label: 'Student', icon: 'school' },
  { value: MEMBER_TYPES.FACULTY, label: 'Faculty', icon: 'co_present' },
  { value: MEMBER_TYPES.STAFF, label: 'Staff', icon: 'badge' },
]

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
    memberType: MEMBER_TYPES.STUDENT,
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
    if (!Object.values(MEMBER_TYPES).includes(form.memberType)) next.memberType = 'Select your QCU role'
    if (usePassword) {
      if (form.password.length < MIN_PASSWORD_LENGTH) next.password = `Password must be at least ${MIN_PASSWORD_LENGTH} characters`
      if (form.confirmPassword !== form.password) next.confirmPassword = 'Passwords do not match'
    }
    if (!idPhoto) next.idPhoto = 'Please upload a photo of your QCU ID'
    if (!selfie) next.selfie = 'Please take a live selfie'
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
      memberType: form.memberType,
      qcuIdPhotoUrl,
      liveSelfieUrl,
      ...(usePassword ? { password: form.password } : {}),
    })
    setRegistered(result.data)
  }

  const handleSubmit = (e) => {
    e.preventDefault()
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
              <div className="mx-auto w-14 h-14 rounded-2xl bg-emerald-500/15 border border-emerald-400/30 flex items-center justify-center text-emerald-400">
                <Icon name="how_to_reg" className="text-3xl" />
              </div>
              <h1 id="signup-done-title" className="text-2xl font-extrabold text-white">
                Registration submitted
              </h1>
              <p className="text-sm text-slate-300 leading-relaxed">
                An administrator will review your QCU ID and live selfie. You&apos;ll get full marketplace access once your account is verified.
              </p>
            </div>

            <dl className="mt-5 rounded-2xl bg-white/[0.03] border border-white/10 divide-y divide-white/5 text-sm">
              {[
                ['Name', registered.fullName],
                ['QCU ID', registered.qcuIdNumber],
                ['Email', registered.email],
                ['Role', `${registered.memberType} · ${registered.role}`],
              ].map(([k, v]) => (
                <div key={k} className="flex items-center justify-between gap-3 px-4 py-2.5">
                  <dt className="text-slate-400">{k}</dt>
                  <dd className="text-white font-medium truncate">{v}</dd>
                </div>
              ))}
              <div className="flex items-center justify-between gap-3 px-4 py-2.5">
                <dt className="text-slate-400">Status</dt>
                <dd>
                  <VerificationBadge status={registered.verificationStatus} />
                </dd>
              </div>
            </dl>

            <div className="mt-5 pt-5 border-t border-white/10 space-y-3">
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
  return (
    <main className="flex-1 min-h-0 w-full max-w-6xl mx-auto px-4 sm:px-6 pt-20 pb-2 lg:py-4 grid lg:grid-cols-2 lg:grid-rows-[minmax(0,1fr)] gap-8 lg:gap-16 items-center">
      <AuthShowcase />

      <section className="w-full max-w-[540px] mx-auto lg:mx-0 lg:justify-self-end" aria-labelledby="signup-title">
        <AuthCard onClose={() => navigate('/login')} closeLabel="Close and return to login">
          <div className="text-center mb-5 px-4">
            <div className="flex items-center justify-center gap-2">
              <Icon name="auto_awesome" className="text-amber-400 text-[20px]" />
              <h1 id="signup-title" className="text-xl sm:text-2xl font-extrabold tracking-tight text-white">
                Create your QCU account
              </h1>
              <Icon name="auto_awesome" className="text-amber-400 text-[20px]" />
            </div>
            <p className="text-xs sm:text-sm text-slate-400 mt-1">
              Verified QCUians only — your ID and selfie are reviewed by an administrator.
            </p>
          </div>

          <AuthModeTabs active="signup" loginTo="/login" signupTo="/signup" />

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
            <form className="space-y-4" onSubmit={handleSubmit} noValidate>
            {otpFlow.formError && <Alert tone="error">{otpFlow.formError}</Alert>}

            {/* QCU role */}
            <fieldset>
              <legend className="flex items-center gap-1 text-[11px] font-bold tracking-wider uppercase text-slate-300">
                <span>I am a QCU</span>
                <span className="text-amber-400" aria-hidden="true">*</span>
              </legend>
              <div role="radiogroup" className="mt-1.5 grid grid-cols-3 gap-1.5 p-1 rounded-2xl bg-white/[0.04] border border-white/10">
                {MEMBER_OPTIONS.map((opt) => {
                  const active = form.memberType === opt.value
                  return (
                    <button
                      key={opt.value}
                      type="button"
                      role="radio"
                      aria-checked={active}
                      disabled={busy}
                      onClick={() => {
                        setForm((f) => ({ ...f, memberType: opt.value }))
                        clearError('memberType')
                      }}
                      className={`py-2 rounded-xl text-sm font-semibold flex items-center justify-center gap-1.5 transition-all ${
                        active
                          ? 'bg-gradient-to-r from-amber-400 to-amber-500 text-slate-950 shadow-md shadow-amber-500/20'
                          : 'text-slate-400 hover:text-white hover:bg-white/5'
                      }`}
                    >
                      <Icon name={opt.icon} className="text-[18px]" />
                      <span>{opt.label}</span>
                    </button>
                  )
                })}
              </div>
              {errors.memberType ? (
                <p className="mt-1 text-[11px] text-red-400">{errors.memberType}</p>
              ) : form.memberType !== MEMBER_TYPES.STUDENT ? (
                <p className="mt-1 text-[11px] text-slate-500">Faculty and staff accounts can shop but cannot open a store.</p>
              ) : null}
            </fieldset>

            <Field id="signup-full-name" label="Full Name" icon="person" error={errors.fullName}>
              <input
                id="signup-full-name"
                type="text"
                autoComplete="name"
                value={form.fullName}
                onChange={update('fullName')}
                disabled={busy}
                placeholder="As printed on your QCU ID"
                className={`${inputBase} ${fieldBorder(errors.fullName)} pl-10 pr-3.5`}
              />
            </Field>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Field id="signup-qcu-id" label="QCU ID Number" icon="badge" error={errors.qcuIdNumber} hint="Format: YY-NNNN">
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
                  className={`${inputBase} ${fieldBorder(errors.qcuIdNumber)} pl-10 pr-3.5`}
                />
              </Field>

              <Field id="signup-email" label="Email Address" icon="mail" error={errors.email} hint="Login codes are sent here">
                <input
                  id="signup-email"
                  type="email"
                  autoComplete="email"
                  value={form.email}
                  onChange={update('email')}
                  disabled={busy}
                  placeholder="you@qcu.edu.ph"
                  className={`${inputBase} ${fieldBorder(errors.email)} pl-10 pr-3.5`}
                />
              </Field>
            </div>

            {/* Sign-in method: password is optional on the server */}
            <div className="rounded-2xl border border-white/10 bg-white/[0.02] p-3.5 space-y-3.5">
              <label className="flex items-start gap-2.5 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={usePassword}
                  disabled={busy}
                  onChange={(e) => {
                    setUsePassword(e.target.checked)
                    clearError('password')
                    clearError('confirmPassword')
                  }}
                  className="mt-0.5 w-4 h-4 rounded bg-white/5 border-white/20 text-amber-500 focus:ring-amber-400 focus:ring-offset-slate-900"
                />
                <span>
                  <span className="block text-sm font-semibold text-white">Set a password</span>
                  <span className="block text-[11px] text-slate-400">
                    Sign in with your password plus a 6-digit code sent to your email.
                    {passkeyCapable && ' Skip this to use a passkey only — you\u2019ll create it right after submitting.'}
                  </span>
                </span>
              </label>

              {usePassword && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <Field
                    id="signup-password"
                    label="Password"
                    icon="lock"
                    error={errors.password}
                    hint={`At least ${MIN_PASSWORD_LENGTH} characters`}
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
                      className={`${inputBase} ${fieldBorder(errors.password)} pl-10 pr-9`}
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
                      className={`${inputBase} ${fieldBorder(errors.confirmPassword)} pl-10 pr-9`}
                    />
                  </Field>
                </div>
              )}
            </div>

            {/* Identity verification */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <ImageDropzone
                id="signup-qcu-id-photo"
                label="QCU ID Photo"
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
                capture={selfie}
                error={errors.selfie}
                disabled={busy}
                onCapture={(file) => {
                  setSelfie(file)
                  clearError('selfie')
                }}
              />
            </div>

            <p className="flex items-start gap-1.5 text-[11px] text-slate-500 leading-relaxed">
              <Icon name="shield_lock" className="text-[14px] text-slate-400 mt-px" />
              <span>
                Your ID photo and selfie are protected under the Data Privacy Act (RA 10173) and are viewable by BizzyQCU administrators only.
              </span>
            </p>

            {import.meta.env.DEV && !isImageUploadConfigured && (
              <Alert tone="warning" icon="construction">
                Dev mode: Cloudinary isn&apos;t configured, so placeholder image URLs will be submitted.
              </Alert>
            )}

            <button type="submit" disabled={busy} className={primaryButton}>
              <span>{status === 'idle' && emailAlreadyVerified ? 'Submit for Verification' : SUBMIT_TEXT[status]}</span>
              {busy && <Spinner />}
            </button>
          </form>
          )}

          <div className="mt-auto pt-4">
            <div className="pt-3.5 border-t border-white/10 text-center">
              <p className="text-sm text-slate-400">
                Already have an account?{' '}
                <Link className="text-amber-300 font-bold hover:text-amber-200 hover:underline" to="/login">
                  Log in
                </Link>
              </p>
            </div>
          </div>
        </AuthCard>

        <TrustBadges />
      </section>
    </main>
  )
}
