import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import SellerShowcase from './SellerShowcase.jsx'
import { registerUser } from '../api'
import { uploadVerificationImage } from '../upload'
import {
  Alert,
  AuthCard,
  Field,
  fieldBorder,
  Icon,
  inputBase,
  PasswordToggle,
  primaryButton,
  Spinner,
  TrustBadges,
  VerificationBadge,
} from './AuthUI.jsx'
import ImageDropzone from './ImageDropzone.jsx'
import CameraCapture from './CameraCapture.jsx'
import PasskeySetup from './PasskeySetup.jsx'
import { getErrorMessage, getFieldErrors } from '../../../lib/api-client'
import { MEMBER_TYPES, MIN_PASSWORD_LENGTH, QCU_ID_PATTERN } from '../../../lib/constants'
import { isWebAuthnSupported } from '../../../lib/webauthn'

export { fieldBorder, Icon, PasswordToggle }
export const sellerInputBase = inputBase

const SELLER_TYPE_LABELS = {
  STUDENT_ENTERPRISE: 'Student Enterprise (BSE / OJT)',
  INDEPENDENT_SELLER: 'Independent Student Seller',
  RECOGNIZED_ORGANIZATION: 'Recognized Student Organization',
}

const SERVER_FIELD_MAP = {
  qcuIdPhotoUrl: 'idPhoto',
  liveSelfieUrl: 'selfie',
  supportingDocumentUrl: 'endorsementDoc',
}

const SUBMIT_TEXT = {
  idle: 'Submit Seller Application',
  uploading: 'Uploading verification documents…',
  submitting: 'Submitting seller application…',
}

/**
 * Shared Seller Registration Form connected to bizzyqcu-server:
 *   1. Uploads QCU_ID, LIVE_SELFIE, and SELLER_ENDORSEMENT via POST /auth/uploads/verification
 *   2. Submits { qcuIdNumber, email, fullName, memberType: 'STUDENT', role: 'SELLER',
 *      sellerType, qcuIdPhotoUrl, liveSelfieUrl, supportingDocumentUrl, password? }
 *      to POST /auth/register
 *   3. Offers WebAuthn Passkey registration on the confirmation screen
 */
export function SellerRegistrationForm({
  portalKey,
  sellerType,
  badge,
  titlePrefix,
  titleHighlight,
  titleSuffix = '',
  subtitle,
  fullNameLabel = 'Student Full Name',
  fullNamePlaceholder = 'As printed on your QCU ID',
  qcuIdLabel = 'Student QCU ID Number',
  emailLabel = 'QCU Email Address',
  emailPlaceholder = 'you@qcu.edu.ph',
  endorsementLabel,
  endorsementHint,
}) {
  const navigate = useNavigate()
  const passkeyCapable = isWebAuthnSupported()

  const [form, setForm] = useState({
    fullName: '',
    qcuIdNumber: '',
    email: '',
    password: '',
    confirmPassword: '',
  })
  const [usePassword, setUsePassword] = useState(true)
  const [endorsementDoc, setEndorsementDoc] = useState(null)
  const [idPhoto, setIdPhoto] = useState(null)
  const [selfie, setSelfie] = useState(null)
  const [showPass, setShowPass] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)
  const [status, setStatus] = useState('idle') // idle | uploading | submitting
  const [formError, setFormError] = useState('')
  const [errors, setErrors] = useState({})
  const [registered, setRegistered] = useState(null)
  const [passkeyAdded, setPasskeyAdded] = useState(false)

  const busy = status !== 'idle'

  const clearError = (key) => setErrors((prev) => ({ ...prev, [key]: undefined }))
  const update = (key) => (e) => {
    setForm((f) => ({ ...f, [key]: e.target.value }))
    clearError(key)
  }

  // Mirrors registerUserSchema (role === 'SELLER') in bizzyqcu-server/src/modules/auth/auth.validation.ts
  const validate = () => {
    const next = {}
    if (form.fullName.trim().length < 2) next.fullName = 'Full name must be at least 2 characters'
    if (!QCU_ID_PATTERN.test(form.qcuIdNumber.trim())) next.qcuIdNumber = 'Format must be YY-NNNN (e.g. 24-0001)'
    if (!/^\S+@\S+\.\S+$/.test(form.email.trim())) next.email = 'Enter a valid email address'
    if (usePassword) {
      if (form.password.length < MIN_PASSWORD_LENGTH) {
        next.password = `Password must be at least ${MIN_PASSWORD_LENGTH} characters`
      }
      if (form.confirmPassword !== form.password) {
        next.confirmPassword = 'Passwords do not match'
      }
    }
    if (!endorsementDoc) next.endorsementDoc = `${endorsementLabel} is required`
    if (!idPhoto) next.idPhoto = 'Please upload a photo of your QCU ID'
    if (!selfie) next.selfie = 'Please take a live selfie with your camera'
    return next
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setFormError('')
    const clientErrors = validate()
    if (Object.keys(clientErrors).length) {
      setErrors(clientErrors)
      return
    }

    const qcuIdNumber = form.qcuIdNumber.trim()
    try {
      setStatus('uploading')
      const [supportingDocumentUrl, qcuIdPhotoUrl, liveSelfieUrl] = await Promise.all([
        uploadVerificationImage(endorsementDoc, { documentType: 'SELLER_ENDORSEMENT', qcuIdNumber }),
        uploadVerificationImage(idPhoto, { documentType: 'QCU_ID', qcuIdNumber }),
        uploadVerificationImage(selfie, { documentType: 'LIVE_SELFIE', qcuIdNumber }),
      ])

      setStatus('submitting')
      const result = await registerUser({
        qcuIdNumber,
        email: form.email.trim(),
        fullName: form.fullName.trim(),
        memberType: MEMBER_TYPES.STUDENT,
        role: 'SELLER',
        sellerType,
        supportingDocumentUrl,
        qcuIdPhotoUrl,
        liveSelfieUrl,
        ...(usePassword ? { password: form.password } : {}),
      })
      setRegistered(result.data)
    } catch (error) {
      const serverErrors = getFieldErrors(error)
      const mapped = Object.fromEntries(
        Object.entries(serverErrors).map(([k, v]) => [SERVER_FIELD_MAP[k] || k, v])
      )
      setErrors(mapped)
      setFormError(getErrorMessage(error))
    } finally {
      setStatus('idle')
    }
  }

  // --------------------------------------------------------------------------
  // Post-registration screen: shows User + SellerProfile status & Passkey setup
  // --------------------------------------------------------------------------
  if (registered) {
    const needsPasskey = !usePassword && !passkeyAdded
    const sellerStatus = registered.sellerProfile?.verificationStatus || 'PENDING'

    return (
      <main className="flex-1 min-h-0 w-full max-w-6xl mx-auto px-4 sm:px-6 pt-20 pb-2 lg:py-4 grid lg:grid-cols-2 lg:grid-rows-[minmax(0,1fr)] gap-8 lg:gap-16 items-center">
        <SellerShowcase badge={badge} />
        <section className="w-full max-w-[490px] mx-auto lg:mx-0 lg:justify-self-end" aria-labelledby="seller-done-title">
          <AuthCard className="border-amber-400/20">
            <div className="space-y-4">
              <div className="text-center space-y-2.5">
                <div className="mx-auto w-14 h-14 rounded-2xl bg-emerald-500/15 border border-emerald-400/30 flex items-center justify-center text-emerald-400">
                  <Icon name="storefront" className="text-3xl" />
                </div>
                <h1 id="seller-done-title" className="text-2xl font-extrabold text-white">
                  Seller Application Submitted
                </h1>
                <p className="text-sm text-slate-300 leading-relaxed">
                  An administrator will verify your QCU ID, live selfie, and seller endorsement document. Once approved, you can create and manage your campus store.
                </p>
              </div>

              <dl className="rounded-2xl bg-white/[0.03] border border-white/10 divide-y divide-white/5 text-sm">
                {[
                  ['Full Name', registered.fullName],
                  ['QCU ID', registered.qcuIdNumber],
                  ['Email', registered.email],
                  ['Seller Type', SELLER_TYPE_LABELS[sellerType] || sellerType],
                ].map(([k, v]) => (
                  <div key={k} className="flex items-center justify-between gap-3 px-4 py-2.5">
                    <dt className="text-slate-400">{k}</dt>
                    <dd className="text-white font-medium truncate">{v}</dd>
                  </div>
                ))}
                <div className="flex items-center justify-between gap-3 px-4 py-2.5">
                  <dt className="text-slate-400">QCU Identity Status</dt>
                  <dd>
                    <VerificationBadge status={registered.verificationStatus} />
                  </dd>
                </div>
                <div className="flex items-center justify-between gap-3 px-4 py-2.5">
                  <dt className="text-slate-400">Seller Profile Status</dt>
                  <dd>
                    <VerificationBadge status={sellerStatus} />
                  </dd>
                </div>
              </dl>

              <div className="pt-3 border-t border-white/10 space-y-3">
                {needsPasskey && passkeyCapable && (
                  <Alert tone="warning">
                    You didn&apos;t set a password, so a passkey is required to sign in. Register one on this device now.
                  </Alert>
                )}
                <PasskeySetup userId={registered.id} onRegistered={() => setPasskeyAdded(true)} />
              </div>
            </div>

            <div className="mt-auto pt-4">
              <button
                type="button"
                disabled={needsPasskey && passkeyCapable}
                onClick={() =>
                  navigate(`/seller-login-form?type=${portalKey}`, {
                    state: { qcuIdNumber: registered.qcuIdNumber },
                  })
                }
                className={primaryButton}
              >
                <span>{needsPasskey && passkeyCapable ? 'Create a passkey to continue' : 'Proceed to Seller Log In'}</span>
                <Icon name="arrow_forward" className="text-[20px]" />
              </button>
            </div>
          </AuthCard>

          <TrustBadges items={['Official QCU Seller Portal', 'WebAuthn FIDO2 Protected']} />
        </section>
      </main>
    )
  }

  // --------------------------------------------------------------------------
  // Seller Registration Form
  // --------------------------------------------------------------------------
  return (
    <main className="flex-1 min-h-0 w-full max-w-6xl mx-auto px-4 sm:px-6 pt-20 pb-2 lg:py-4 grid lg:grid-cols-2 lg:grid-rows-[minmax(0,1fr)] gap-8 lg:gap-16 items-center">
      <SellerShowcase badge={badge} />

      <section className="w-full max-w-[550px] mx-auto lg:mx-0 lg:justify-self-end">
        <AuthCard
          className="border-amber-400/20"
          onClose={() => navigate('/seller-signup')}
          closeLabel="Back to seller portals"
        >
            {/* Header */}
            <div className="text-center mb-4 px-5">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-400/10 border border-amber-400/30 text-[10px] font-extrabold tracking-wider uppercase text-amber-300 mb-2">
                <Icon name="storefront" className="text-[14px]" />
                <span>{SELLER_TYPE_LABELS[sellerType] || badge}</span>
              </span>
              <div className="flex items-center justify-center gap-1.5 flex-wrap">
                <Icon name="auto_awesome" className="text-amber-400 text-[18px]" />
                <h1 className="text-lg sm:text-xl font-extrabold tracking-tight text-white">
                  {titlePrefix}{' '}
                  <span className="text-amber-400">{titleHighlight}</span>
                  {titleSuffix && ` ${titleSuffix}`}
                </h1>
                <Icon name="auto_awesome" className="text-amber-400 text-[18px]" />
              </div>
              <p className="text-xs text-slate-400 mt-1">
                {subtitle || 'Verified QCU students only. Store profile details are set up after seller approval.'}
              </p>
            </div>

            <form className="space-y-3.5" onSubmit={handleSubmit} noValidate>
              {formError && <Alert tone="error">{formError}</Alert>}

              <Field id={`${portalKey}-full-name`} label={fullNameLabel} icon="person" error={errors.fullName}>
                <input
                  id={`${portalKey}-full-name`}
                  type="text"
                  autoComplete="name"
                  disabled={busy}
                  value={form.fullName}
                  onChange={update('fullName')}
                  placeholder={fullNamePlaceholder}
                  className={`${inputBase} ${fieldBorder(errors.fullName)} pl-10 pr-3.5`}
                />
              </Field>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <Field
                  id={`${portalKey}-qcu-id`}
                  label={qcuIdLabel}
                  icon="badge"
                  error={errors.qcuIdNumber}
                  hint="Format: YY-NNNN (Students only)"
                >
                  <input
                    id={`${portalKey}-qcu-id`}
                    type="text"
                    inputMode="numeric"
                    autoComplete="username"
                    maxLength={7}
                    disabled={busy}
                    value={form.qcuIdNumber}
                    onChange={update('qcuIdNumber')}
                    placeholder="e.g. 24-0001"
                    className={`${inputBase} ${fieldBorder(errors.qcuIdNumber)} pl-10 pr-3.5`}
                  />
                </Field>

                <Field
                  id={`${portalKey}-email`}
                  label={emailLabel}
                  icon="mail"
                  error={errors.email}
                  hint="OTP login codes are sent here"
                >
                  <input
                    id={`${portalKey}-email`}
                    type="email"
                    autoComplete="email"
                    disabled={busy}
                    value={form.email}
                    onChange={update('email')}
                    placeholder={emailPlaceholder}
                    className={`${inputBase} ${fieldBorder(errors.email)} pl-10 pr-3.5`}
                  />
                </Field>
              </div>

              {/* Optional password (or Passkey-only) */}
              <div className="rounded-2xl border border-white/10 bg-white/[0.02] p-3.5 space-y-3">
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
                      Sign in with password + 6-digit email OTP.
                      {passkeyCapable && ' Uncheck to use a FIDO2 Passkey only.'}
                    </span>
                  </span>
                </label>

                {usePassword && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                    <Field
                      id={`${portalKey}-password`}
                      label="Password"
                      icon="lock"
                      error={errors.password}
                      hint={`Min ${MIN_PASSWORD_LENGTH} characters`}
                      rightSlot={<PasswordToggle visible={showPass} onToggle={() => setShowPass((s) => !s)} />}
                    >
                      <input
                        id={`${portalKey}-password`}
                        type={showPass ? 'text' : 'password'}
                        autoComplete="new-password"
                        disabled={busy}
                        value={form.password}
                        onChange={update('password')}
                        placeholder="Create a password"
                        className={`${inputBase} ${fieldBorder(errors.password)} pl-10 pr-9`}
                      />
                    </Field>

                    <Field
                      id={`${portalKey}-confirm-password`}
                      label="Confirm Password"
                      icon="lock"
                      error={errors.confirmPassword}
                      rightSlot={<PasswordToggle visible={showConfirm} onToggle={() => setShowConfirm((s) => !s)} />}
                    >
                      <input
                        id={`${portalKey}-confirm-password`}
                        type={showConfirm ? 'text' : 'password'}
                        autoComplete="new-password"
                        disabled={busy}
                        value={form.confirmPassword}
                        onChange={update('confirmPassword')}
                        placeholder="Re-enter password"
                        className={`${inputBase} ${fieldBorder(errors.confirmPassword)} pl-10 pr-9`}
                      />
                    </Field>
                  </div>
                )}
              </div>

              {/* Seller Supporting Endorsement Document (SELLER_ENDORSEMENT) */}
              <ImageDropzone
                id={`${portalKey}-endorsement-file`}
                label={endorsementLabel}
                hint={endorsementHint || 'JPG, PNG, or PDF (Max 5MB)'}
                allowPdf
                file={endorsementDoc}
                error={errors.endorsementDoc}
                disabled={busy}
                onChange={(file) => {
                  setEndorsementDoc(file)
                  clearError('endorsementDoc')
                }}
                onError={(msg) => setErrors((prev) => ({ ...prev, endorsementDoc: msg }))}
              />

              {/* QCU ID Photo (QCU_ID) & Live Selfie Camera Capture (LIVE_SELFIE) */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <ImageDropzone
                  id={`${portalKey}-qcu-id-file`}
                  label="QCU Student ID Photo"
                  hint="JPG or PNG (Max 5MB)"
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
                  id={`${portalKey}-live-selfie`}
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

              <p className="flex items-start gap-1.5 text-[11px] text-slate-500 leading-relaxed">
                <Icon name="shield_lock" className="text-[14px] text-slate-400 mt-px" />
                <span>
                  Identity &amp; endorsement files are protected under RA 10173 and reviewed only by BizzyQCU administrators.
                </span>
              </p>

              <button type="submit" disabled={busy} className={primaryButton}>
                <span>{SUBMIT_TEXT[status]}</span>
                {busy && <Spinner />}
              </button>
            </form>

            {/* Footer link */}
            <div className="mt-auto pt-3.5">
              <div className="pt-3 border-t border-white/10 flex flex-wrap items-center justify-between gap-2 text-xs sm:text-sm text-slate-400">
                <span>
                  Already registered?{' '}
                  <Link
                    className="text-amber-300 font-bold hover:text-amber-200 hover:underline"
                    to={`/seller-login-form?type=${portalKey}`}
                  >
                    Seller Log In
                  </Link>
                </span>
                <Link className="text-slate-400 hover:text-white text-xs" to="/seller-signup">
                  ← Switch seller type
                </Link>
              </div>
            </div>
        </AuthCard>

        <TrustBadges items={['Official QCU Seller Portal', 'WebAuthn FIDO2 Protected']} />
      </section>
    </main>
  )
}
