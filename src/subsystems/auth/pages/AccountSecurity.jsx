import { useCallback, useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import {
  applyForSeller,
  changePassword,
  deleteDevice,
  getAccountStatus,
  getProfile,
  listDevices,
  listPasskeys,
  resubmitSellerVerification,
  resubmitUserVerification,
  updateDeviceName,
  updateEmail,
} from '../api'
import { uploadVerificationImage } from '../upload'
import {
  Alert,
  AuthCard,
  Field,
  fieldBorder,
  Icon,
  inputBase,
  PasswordToggle,
  Spinner,
  VerificationBadge,
} from '../components/AuthUI.jsx'
import ImageDropzone from '../components/ImageDropzone.jsx'
import CameraCapture from '../components/CameraCapture.jsx'
import PasskeySetup from '../components/PasskeySetup.jsx'
import { useAuth } from '../../../hooks/useAuth'
import { getErrorMessage } from '../../../lib/api-client'
import { MEMBER_TYPES, MIN_PASSWORD_LENGTH, SELLER_TYPES } from '../../../lib/constants'

const SELLER_TYPE_LABELS = {
  STUDENT_ENTERPRISE: 'Student Enterprise (BSE / OJT)',
  RECOGNIZED_ORGANIZATION: 'Recognized Student Organization',
  INDEPENDENT_SELLER: 'Independent Student Seller',
}

const SELLER_DOC_HINTS = {
  STUDENT_ENTERPRISE: 'Upload your OJT / Faculty Endorsement Document (JPG, PNG, or PDF, Max 5MB)',
  INDEPENDENT_SELLER: 'Upload your Proof of Enrollment / COR (JPG, PNG, or PDF, Max 5MB)',
  RECOGNIZED_ORGANIZATION: 'Upload your OSA Recognition Certificate (JPG, PNG, or PDF, Max 5MB)',
}

const TRANSPORT_LABELS = {
  internal: 'This device',
  hybrid: 'Phone / QR',
  usb: 'USB key',
  nfc: 'NFC',
  ble: 'Bluetooth',
  'smart-card': 'Smart card',
  cable: 'Cable',
}

const formatDate = (value) =>
  value ? new Date(value).toLocaleString(undefined, { dateStyle: 'medium', timeStyle: 'short' }) : null

function initials(name = '') {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((p) => p[0]?.toUpperCase())
    .join('')
}

function SectionTitle({ icon, title, children }) {
  return (
    <div className="flex items-center justify-between gap-3 mb-4">
      <h2 className="flex items-center gap-2 text-base font-bold text-white">
        <Icon name={icon} className="text-[20px] text-amber-400" />
        <span>{title}</span>
      </h2>
      {children}
    </div>
  )
}

function DeviceRow({ device, isLast, onRename, onDelete }) {
  const [editing, setEditing] = useState(false)
  const [nameInput, setNameInput] = useState(device.deviceName || '')
  const [savingName, setSavingName] = useState(false)
  const [confirming, setConfirming] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [error, setError] = useState(null)

  const handleRename = async (e) => {
    e.preventDefault()
    if (!nameInput.trim()) {
      setError('Device name cannot be empty.')
      return
    }
    setSavingName(true)
    setError(null)
    try {
      await onRename(device.id, nameInput.trim())
      setEditing(false)
    } catch (err) {
      setError(getErrorMessage(err))
    } finally {
      setSavingName(false)
    }
  }

  const handleDelete = async () => {
    setDeleting(true)
    setError(null)
    try {
      await onDelete(device.id)
    } catch (err) {
      setError(getErrorMessage(err))
      setDeleting(false)
      setConfirming(false)
    }
  }

  const synced = device.deviceType === 'multiDevice'

  return (
    <li className="rounded-2xl bg-white/[0.03] border border-white/10 p-4">
      <div className="flex items-start gap-3">
        <span className="w-10 h-10 rounded-xl bg-amber-400/10 border border-amber-400/30 flex items-center justify-center text-amber-300 shrink-0">
          <Icon name={synced ? 'cloud_sync' : 'phonelink_lock'} className="text-[20px]" />
        </span>
        <div className="flex-1 min-w-0">
          {editing ? (
            <form onSubmit={handleRename} className="flex items-center gap-2">
              <input
                type="text"
                maxLength={100}
                value={nameInput}
                onChange={(e) => setNameInput(e.target.value)}
                disabled={savingName}
                className={`${inputBase} border-white/15 py-1.5 px-3 text-xs`}
                autoFocus
              />
              <button
                type="submit"
                disabled={savingName}
                className="px-2.5 py-1.5 rounded-lg bg-amber-400 text-slate-950 text-xs font-bold"
              >
                {savingName ? 'Saving…' : 'Save'}
              </button>
              <button
                type="button"
                onClick={() => {
                  setEditing(false)
                  setNameInput(device.deviceName || '')
                }}
                className="px-2 py-1.5 rounded-lg text-xs text-slate-400 hover:text-white"
              >
                Cancel
              </button>
            </form>
          ) : (
            <p className="text-sm font-bold text-white truncate">{device.deviceName || 'Unnamed device'}</p>
          )}
          <div className="mt-1 flex flex-wrap gap-1.5">
            <span className="px-2 py-0.5 rounded-md text-[10px] font-semibold bg-white/[0.06] text-slate-300 border border-white/10">
              {synced ? 'Synced passkey' : 'Device-bound'}
            </span>
            {device.backedUp && (
              <span className="px-2 py-0.5 rounded-md text-[10px] font-semibold bg-emerald-400/10 text-emerald-300 border border-emerald-400/25">
                Backed up
              </span>
            )}
            {(device.transports || []).map((t) => (
              <span key={t} className="px-2 py-0.5 rounded-md text-[10px] font-semibold bg-white/[0.06] text-slate-400 border border-white/10">
                {TRANSPORT_LABELS[t] || t}
              </span>
            ))}
          </div>
          <p className="mt-1.5 text-[11px] text-slate-500">
            Added {formatDate(device.createdAt)} ·{' '}
            {device.lastUsedAt ? `Last used ${formatDate(device.lastUsedAt)}` : 'Never used to sign in'}
          </p>
        </div>
        {!confirming && !editing && (
          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={() => setEditing(true)}
              aria-label={`Rename device ${device.deviceName || ''}`}
              className="p-2 rounded-lg text-slate-400 hover:text-amber-300 hover:bg-amber-400/10 transition-colors"
            >
              <Icon name="edit" className="text-[18px]" />
            </button>
            <button
              type="button"
              onClick={() => setConfirming(true)}
              aria-label={`Remove device ${device.deviceName || ''}`}
              className="p-2 rounded-lg text-slate-400 hover:text-red-300 hover:bg-red-500/10 transition-colors"
            >
              <Icon name="delete" className="text-[18px]" />
            </button>
          </div>
        )}
      </div>

      {confirming && (
        <div className="mt-3 rounded-xl bg-red-500/[0.07] border border-red-400/25 p-3 space-y-2.5">
          <p className="text-xs text-red-200">
            Remove this registered device / passkey?
            {isLast && ' This is your only passkey — make sure you have a password set, or you may be locked out.'}
          </p>
          <div className="flex gap-2 justify-end">
            <button
              type="button"
              onClick={() => setConfirming(false)}
              disabled={deleting}
              className="px-3 py-1.5 rounded-lg text-xs font-semibold text-slate-300 hover:bg-white/[0.06]"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleDelete}
              disabled={deleting}
              className="px-3 py-1.5 rounded-lg text-xs font-bold bg-red-500 hover:bg-red-400 text-white flex items-center gap-1.5 disabled:opacity-60"
            >
              {deleting && <Spinner className="text-[14px]" />}
              <span>{deleting ? 'Removing…' : 'Remove device'}</span>
            </button>
          </div>
        </div>
      )}
      {error && <p className="mt-2 text-[11px] text-red-400">{error}</p>}
    </li>
  )
}

export default function AccountSecurity() {
  const navigate = useNavigate()
  const { logout, refreshUser } = useAuth()
  const [profile, setProfile] = useState(null)
  const [statusData, setStatusData] = useState(null)
  const [devices, setDevices] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [notice, setNotice] = useState(null)

  // Resubmit user verification state
  const [resubmitIdFile, setResubmitIdFile] = useState(null)
  const [resubmitSelfie, setResubmitSelfie] = useState(null)
  const [resubmittingUser, setResubmittingUser] = useState(false)
  const [resubmitUserMsg, setResubmitUserMsg] = useState(null)
  const [resubmitUserErr, setResubmitUserErr] = useState(null)

  // Seller application / resubmit state
  const [sellerTypeInput, setSellerTypeInput] = useState(SELLER_TYPES.STUDENT_ENTERPRISE)
  const [sellerDocFile, setSellerDocFile] = useState(null)
  const [submittingSeller, setSubmittingSeller] = useState(false)
  const [sellerMsg, setSellerMsg] = useState(null)
  const [sellerErr, setSellerErr] = useState(null)

  // Email & Password update state
  const [newEmail, setNewEmail] = useState('')
  const [savingEmail, setSavingEmail] = useState(false)
  const [emailMsg, setEmailMsg] = useState(null)
  const [emailErr, setEmailErr] = useState(null)

  const [passwords, setPasswords] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' })
  const [showCurrPass, setShowCurrPass] = useState(false)
  const [showNewPass, setShowNewPass] = useState(false)
  const [savingPass, setSavingPass] = useState(false)
  const [passMsg, setPassMsg] = useState(null)
  const [passErr, setPassErr] = useState(null)

  const load = useCallback(async () => {
    setError(null)
    try {
      const [profileRes, devicesRes, accountStatusRes] = await Promise.all([
        getProfile(),
        listDevices().catch(() => listPasskeys()),
        getAccountStatus().catch(() => null),
      ])
      setProfile(profileRes.data)
      setNewEmail(profileRes.data?.email || '')
      if (profileRes.data?.sellerProfile?.sellerType) {
        setSellerTypeInput(profileRes.data.sellerProfile.sellerType)
      }
      setDevices(devicesRes?.data || [])
      if (accountStatusRes?.data) {
        setStatusData(accountStatusRes.data)
      }
    } catch (err) {
      setError(getErrorMessage(err))
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    load()
  }, [load])

  const reloadDevices = async () => {
    const res = await listDevices().catch(() => listPasskeys())
    setDevices(res?.data || [])
  }

  const handleRenameDevice = async (id, deviceName) => {
    const res = await updateDeviceName(id, deviceName)
    setNotice(res.message || 'Device name updated.')
    await reloadDevices()
  }

  const handleDeleteDevice = async (id) => {
    const res = await deleteDevice(id)
    setNotice(res.message || 'Device removed.')
    await reloadDevices()
  }

  // POST /auth/resubmit-verification
  const handleResubmitUserVerification = async (e) => {
    e.preventDefault()
    setResubmitUserErr(null)
    setResubmitUserMsg(null)
    if (!resubmitIdFile && !resubmitSelfie) {
      setResubmitUserErr('Upload a new QCU ID photo or capture a new live selfie to resubmit.')
      return
    }
    setResubmittingUser(true)
    try {
      const payload = {}
      if (resubmitIdFile) {
        payload.qcuIdPhotoUrl = await uploadVerificationImage(resubmitIdFile, {
          documentType: 'QCU_ID',
          qcuIdNumber: profile.qcuIdNumber,
        })
      }
      if (resubmitSelfie) {
        payload.liveSelfieUrl = await uploadVerificationImage(resubmitSelfie, {
          documentType: 'LIVE_SELFIE',
          qcuIdNumber: profile.qcuIdNumber,
        })
      }
      const res = await resubmitUserVerification(payload)
      setResubmitUserMsg(res.message || 'Verification documents resubmitted for administrator review.')
      setResubmitIdFile(null)
      setResubmitSelfie(null)
      await refreshUser()
      await load()
    } catch (err) {
      setResubmitUserErr(getErrorMessage(err))
    } finally {
      setResubmittingUser(false)
    }
  }

  // POST /auth/seller-application OR POST /auth/seller/resubmit
  const handleSellerSubmit = async (e, isResubmit = false) => {
    e.preventDefault()
    setSellerErr(null)
    setSellerMsg(null)
    if (!sellerDocFile) {
      setSellerErr('Please upload your supporting endorsement document.')
      return
    }
    setSubmittingSeller(true)
    try {
      const supportingDocumentUrl = await uploadVerificationImage(sellerDocFile, {
        documentType: 'SELLER_ENDORSEMENT',
        qcuIdNumber: profile.qcuIdNumber,
      })
      const res = isResubmit
        ? await resubmitSellerVerification({ sellerType: sellerTypeInput, supportingDocumentUrl })
        : await applyForSeller({ sellerType: sellerTypeInput, supportingDocumentUrl })
      setSellerMsg(res.message || 'Seller endorsement submitted for administrator review.')
      setSellerDocFile(null)
      await refreshUser()
      await load()
    } catch (err) {
      setSellerErr(getErrorMessage(err))
    } finally {
      setSubmittingSeller(false)
    }
  }

  // PATCH /auth/email
  const handleUpdateEmail = async (e) => {
    e.preventDefault()
    setEmailErr(null)
    setEmailMsg(null)
    if (!/^\S+@\S+\.\S+$/.test(newEmail.trim())) {
      setEmailErr('Enter a valid email address.')
      return
    }
    setSavingEmail(true)
    try {
      await updateEmail({ email: newEmail.trim() })
      setEmailMsg('Email address updated.')
      await refreshUser()
      await load()
    } catch (err) {
      setEmailErr(getErrorMessage(err))
    } finally {
      setSavingEmail(false)
    }
  }

  // PATCH /auth/password
  const handleChangePassword = async (e) => {
    e.preventDefault()
    setPassErr(null)
    setPassMsg(null)
    if (passwords.newPassword.length < MIN_PASSWORD_LENGTH) {
      setPassErr(`New password must be at least ${MIN_PASSWORD_LENGTH} characters.`)
      return
    }
    if (passwords.newPassword !== passwords.confirmPassword) {
      setPassErr('New passwords do not match.')
      return
    }
    setSavingPass(true)
    try {
      const res = await changePassword({
        currentPassword: passwords.currentPassword || 'passkey-only',
        newPassword: passwords.newPassword,
      })
      setPassMsg(res.message || 'Password updated successfully.')
      setPasswords({ currentPassword: '', newPassword: '', confirmPassword: '' })
    } catch (err) {
      setPassErr(getErrorMessage(err))
    } finally {
      setSavingPass(false)
    }
  }

  const handleLogout = async () => {
    await logout()
    navigate('/login', { replace: true })
  }

  if (loading) {
    return (
      <main className="flex-grow flex items-center justify-center py-20 text-slate-300 gap-2">
        <Spinner />
        <span className="text-sm">Loading your account…</span>
      </main>
    )
  }

  if (error && !profile) {
    return (
      <main className="flex-grow flex items-center justify-center px-4 pt-20 pb-6">
        <AuthCard className="w-full max-w-md space-y-4">
          <Alert tone="error">{error}</Alert>
          <button
            type="button"
            onClick={() => {
              setLoading(true)
              load()
            }}
            className="w-full py-2.5 rounded-xl bg-white/[0.06] hover:bg-white/[0.1] border border-white/10 text-sm font-semibold text-white"
          >
            Try again
          </button>
        </AuthCard>
      </main>
    )
  }

  const seller = statusData?.sellerProfile || profile.sellerProfile
  const accountRejectionReason = statusData?.accountRejectionReason || profile.rejectionReason
  const sellerRejectionReason = seller?.rejectionReason

  return (
    <main className="flex-grow w-full max-w-3xl mx-auto px-4 sm:px-6 pt-20 pb-8 space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white">Account &amp; Security</h1>
          <p className="text-sm text-slate-400 mt-0.5">
            Manage your QCU identity verification, seller endorsement, and registered passkey devices.
          </p>
        </div>
        <button
          type="button"
          onClick={handleLogout}
          className="shrink-0 inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] border border-white/10 text-sm font-semibold text-slate-200"
        >
          <Icon name="logout" className="text-[18px]" />
          <span>Sign out</span>
        </button>
      </div>

      {error && <Alert tone="error">{error}</Alert>}

      {/* 1. Profile & Verification Status */}
      <AuthCard>
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-amber-300 via-amber-400 to-amber-600 flex items-center justify-center text-slate-950 text-xl font-black shrink-0">
            {initials(profile.fullName)}
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <p className="text-lg font-bold text-white truncate">{profile.fullName}</p>
              <VerificationBadge status={profile.verificationStatus} />
            </div>
            <p className="text-sm text-slate-400 truncate">{profile.email}</p>
          </div>
        </div>

        <dl className="mt-5 grid grid-cols-1 sm:grid-cols-3 gap-3 text-sm">
          {[
            ['QCU ID', profile.qcuIdNumber, 'badge'],
            ['Member Type', profile.memberType, 'school'],
            ['Account Role', profile.role, 'manage_accounts'],
          ].map(([k, v, icon]) => (
            <div key={k} className="rounded-xl bg-white/[0.03] border border-white/10 px-3.5 py-2.5">
              <dt className="flex items-center gap-1 text-[11px] font-bold tracking-wider uppercase text-slate-500">
                <Icon name={icon} className="text-[14px]" />
                {k}
              </dt>
              <dd className="mt-0.5 text-white font-semibold">{v}</dd>
            </div>
          ))}
        </dl>

        {profile.verificationStatus === 'PENDING' && (
          <Alert tone="info" icon="hourglass_top" className="mt-4">
            Your QCU ID and live selfie are awaiting administrator verification.
          </Alert>
        )}

        {profile.verificationStatus === 'REJECTED' && (
          <Alert tone="error" icon="block" className="mt-4">
            Your QCU identity verification was rejected
            {accountRejectionReason ? `: "${accountRejectionReason}"` : '.'} Please resubmit clear documents below.
          </Alert>
        )}

        {/* Resubmit User Verification Form (POST /auth/resubmit-verification) */}
        {profile.verificationStatus !== 'VERIFIED' && (
          <form onSubmit={handleResubmitUserVerification} className="mt-4 pt-4 border-t border-white/10 space-y-3.5">
            <h3 className="text-xs font-bold uppercase tracking-wider text-amber-300 flex items-center gap-1.5">
              <Icon name="upload_file" className="text-[16px]" />
              <span>Resubmit QCU ID / Live Selfie Verification</span>
            </h3>
            {resubmitUserErr && <Alert tone="error">{resubmitUserErr}</Alert>}
            {resubmitUserMsg && <Alert tone="success">{resubmitUserMsg}</Alert>}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              <ImageDropzone
                id="resubmit-qcu-id"
                label="New QCU ID Photo"
                file={resubmitIdFile}
                disabled={resubmittingUser}
                onChange={setResubmitIdFile}
                onError={setResubmitUserErr}
              />
              <CameraCapture
                id="resubmit-selfie"
                label="New Live Selfie"
                capture={resubmitSelfie}
                disabled={resubmittingUser}
                onCapture={setResubmitSelfie}
              />
            </div>
            <button
              type="submit"
              disabled={resubmittingUser || (!resubmitIdFile && !resubmitSelfie)}
              className="px-4 py-2.5 rounded-xl font-bold text-sm text-slate-950 bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 flex items-center gap-2 disabled:opacity-60"
            >
              {resubmittingUser && <Spinner className="text-[16px]" />}
              <span>{resubmittingUser ? 'Resubmitting…' : 'Resubmit Identity Documents'}</span>
            </button>
          </form>
        )}
      </AuthCard>

      {/* 2. Seller Profile & Endorsement Status / Application */}
      <AuthCard>
        <SectionTitle icon="storefront" title="Campus Seller Status">
          {seller && <VerificationBadge status={seller.verificationStatus} />}
        </SectionTitle>

        {seller ? (
          <div className="space-y-3.5">
            <div className="rounded-xl bg-white/[0.03] border border-white/10 px-4 py-3 flex flex-wrap items-center justify-between gap-2 text-sm">
              <div>
                <span className="text-slate-400">Seller Category: </span>
                <span className="text-white font-semibold">
                  {SELLER_TYPE_LABELS[seller.sellerType] || seller.sellerType}
                </span>
              </div>
              <span
                className={`px-2.5 py-0.5 rounded-full border text-[11px] font-bold ${
                  seller.isPaymongoVerified
                    ? 'bg-emerald-500/15 text-emerald-300 border-emerald-400/30'
                    : 'bg-white/[0.06] text-slate-400 border-white/10'
                }`}
              >
                {seller.isPaymongoVerified ? 'GCash (PayMongo) Verified' : 'Cash on Delivery / Pickup'}
              </span>
            </div>

            {seller.verificationStatus === 'PENDING' && (
              <Alert tone="info" icon="hourglass_top">
                Your seller endorsement document is pending administrator review.
              </Alert>
            )}

            {seller.verificationStatus === 'REJECTED' && (
              <Alert tone="error" icon="block">
                Your seller endorsement was rejected
                {sellerRejectionReason ? `: "${sellerRejectionReason}"` : '.'} Upload an updated endorsement document below.
              </Alert>
            )}

            {/* Resubmit Seller Endorsement (POST /auth/seller/resubmit) */}
            {seller.verificationStatus !== 'VERIFIED' && (
              <form onSubmit={(e) => handleSellerSubmit(e, true)} className="pt-3 border-t border-white/10 space-y-3">
                <h3 className="text-xs font-bold uppercase tracking-wider text-amber-300">
                  Update / Resubmit Seller Endorsement Document
                </h3>
                {sellerErr && <Alert tone="error">{sellerErr}</Alert>}
                {sellerMsg && <Alert tone="success">{sellerMsg}</Alert>}
                <Field id="resubmit-seller-type" label="Seller Category" icon="category">
                  <select
                    id="resubmit-seller-type"
                    value={sellerTypeInput}
                    onChange={(e) => setSellerTypeInput(e.target.value)}
                    disabled={submittingSeller}
                    className={`${inputBase} border-white/10 pl-10 pr-8 bg-slate-900/90`}
                  >
                    {Object.entries(SELLER_TYPE_LABELS).map(([val, label]) => (
                      <option key={val} value={val} className="bg-slate-900 text-white">
                        {label}
                      </option>
                    ))}
                  </select>
                </Field>
                <ImageDropzone
                  id="resubmit-seller-doc"
                  label="Supporting Endorsement Document"
                  hint={SELLER_DOC_HINTS[sellerTypeInput]}
                  allowPdf
                  file={sellerDocFile}
                  disabled={submittingSeller}
                  onChange={setSellerDocFile}
                  onError={setSellerErr}
                />
                <button
                  type="submit"
                  disabled={submittingSeller || !sellerDocFile}
                  className="px-4 py-2.5 rounded-xl font-bold text-sm text-slate-950 bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 flex items-center gap-2 disabled:opacity-60"
                >
                  {submittingSeller && <Spinner className="text-[16px]" />}
                  <span>{submittingSeller ? 'Uploading…' : 'Resubmit Seller Endorsement'}</span>
                </button>
              </form>
            )}
          </div>
        ) : profile.memberType === MEMBER_TYPES.STUDENT ? (
          /* Apply for Seller Verification (POST /auth/seller-application) */
          <form onSubmit={(e) => handleSellerSubmit(e, false)} className="space-y-3.5">
            <p className="text-sm text-slate-400">
              Want to open a store on BizzyQCU? Select your seller category and upload your required endorsement document.
            </p>
            {sellerErr && <Alert tone="error">{sellerErr}</Alert>}
            {sellerMsg && <Alert tone="success">{sellerMsg}</Alert>}
            <Field id="apply-seller-type" label="Seller Category" icon="storefront">
              <select
                id="apply-seller-type"
                value={sellerTypeInput}
                onChange={(e) => setSellerTypeInput(e.target.value)}
                disabled={submittingSeller}
                className={`${inputBase} border-white/10 pl-10 pr-8 bg-slate-900/90`}
              >
                {Object.entries(SELLER_TYPE_LABELS).map(([val, label]) => (
                  <option key={val} value={val} className="bg-slate-900 text-white">
                    {label}
                  </option>
                ))}
              </select>
            </Field>
            <ImageDropzone
              id="apply-seller-doc"
              label="Supporting Endorsement Document"
              hint={SELLER_DOC_HINTS[sellerTypeInput]}
              allowPdf
              file={sellerDocFile}
              disabled={submittingSeller}
              onChange={setSellerDocFile}
              onError={setSellerErr}
            />
            <button
              type="submit"
              disabled={submittingSeller || !sellerDocFile}
              className="px-4 py-2.5 rounded-xl font-bold text-sm text-slate-950 bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 flex items-center gap-2 disabled:opacity-60"
            >
              {submittingSeller && <Spinner className="text-[16px]" />}
              <span>{submittingSeller ? 'Submitting application…' : 'Submit Seller Application'}</span>
            </button>
          </form>
        ) : (
          <p className="text-sm text-slate-400">
            Faculty and Staff accounts are eligible for campus shopping (<code className="text-amber-300">BUYER</code>). Only enrolled QCU students may register as sellers.
          </p>
        )}
      </AuthCard>

      {/* 3. Registered Devices & Passkey Management (GET/PATCH/DELETE /auth/devices/:id) */}
      <AuthCard>
        <SectionTitle icon="key" title="Registered Devices &amp; Passkeys">
          <span className="text-xs font-semibold text-slate-400">{devices.length} registered</span>
        </SectionTitle>

        {notice && (
          <Alert tone="success" className="mb-4">
            {notice}
          </Alert>
        )}

        {devices.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-white/15 p-5 text-center mb-5">
            <Icon name="fingerprint" className="text-3xl text-slate-500" />
            <p className="mt-1 text-sm text-slate-300 font-semibold">No passkey devices registered</p>
            <p className="text-xs text-slate-500">
              Register this device below to sign in with biometrics or PIN.
            </p>
          </div>
        ) : (
          <ul className="space-y-3 mb-5">
            {devices.map((dev) => (
              <DeviceRow
                key={dev.id}
                device={dev}
                isLast={devices.length === 1}
                onRename={handleRenameDevice}
                onDelete={handleDeleteDevice}
              />
            ))}
          </ul>
        )}

        <div className="pt-5 border-t border-white/10">
          <PasskeySetup
            userId={profile.id}
            onRegistered={async () => {
              setNotice(null)
              await reloadDevices()
            }}
          />
        </div>
      </AuthCard>

      {/* 4. Email & Password Settings (PATCH /auth/email & PATCH /auth/password) */}
      <AuthCard>
        <SectionTitle icon="lock_reset" title="Email &amp; Password" />

        <div className="space-y-6">
          <form onSubmit={handleUpdateEmail} className="space-y-3">
            {emailErr && <Alert tone="error">{emailErr}</Alert>}
            {emailMsg && <Alert tone="success">{emailMsg}</Alert>}
            <div className="flex flex-col sm:flex-row gap-2 sm:items-end">
              <div className="flex-1">
                <Field id="account-email" label="Registered Email (for Login OTP)" icon="mail">
                  <input
                    id="account-email"
                    type="email"
                    required
                    disabled={savingEmail}
                    value={newEmail}
                    onChange={(e) => setNewEmail(e.target.value)}
                    className={`${inputBase} ${fieldBorder(emailErr)} pl-10 pr-3.5`}
                  />
                </Field>
              </div>
              <button
                type="submit"
                disabled={savingEmail || newEmail.trim() === profile.email}
                className="px-4 py-2.5 rounded-xl font-bold text-sm bg-white/[0.06] hover:bg-white/[0.12] border border-white/15 text-white flex items-center justify-center gap-1.5 disabled:opacity-50"
              >
                {savingEmail && <Spinner className="text-[16px]" />}
                <span>Update Email</span>
              </button>
            </div>
          </form>

          <form onSubmit={handleChangePassword} className="pt-5 border-t border-white/10 space-y-3.5">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-300">Change Password</h3>
            {passErr && <Alert tone="error">{passErr}</Alert>}
            {passMsg && <Alert tone="success">{passMsg}</Alert>}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <Field
                id="curr-password"
                label="Current Password"
                icon="lock"
                required={false}
                rightSlot={<PasswordToggle visible={showCurrPass} onToggle={() => setShowCurrPass((s) => !s)} />}
              >
                <input
                  id="curr-password"
                  type={showCurrPass ? 'text' : 'password'}
                  autoComplete="current-password"
                  disabled={savingPass}
                  value={passwords.currentPassword}
                  onChange={(e) => setPasswords((p) => ({ ...p, currentPassword: e.target.value }))}
                  placeholder="Current password"
                  className={`${inputBase} border-white/10 pl-10 pr-9`}
                />
              </Field>
              <Field
                id="new-password"
                label="New Password"
                icon="key"
                rightSlot={<PasswordToggle visible={showNewPass} onToggle={() => setShowNewPass((s) => !s)} />}
              >
                <input
                  id="new-password"
                  type={showNewPass ? 'text' : 'password'}
                  autoComplete="new-password"
                  disabled={savingPass}
                  value={passwords.newPassword}
                  onChange={(e) => setPasswords((p) => ({ ...p, newPassword: e.target.value }))}
                  placeholder="Min 8 chars"
                  className={`${inputBase} border-white/10 pl-10 pr-9`}
                />
              </Field>
              <Field id="confirm-new-password" label="Confirm Password" icon="key">
                <input
                  id="confirm-new-password"
                  type={showNewPass ? 'text' : 'password'}
                  autoComplete="new-password"
                  disabled={savingPass}
                  value={passwords.confirmPassword}
                  onChange={(e) => setPasswords((p) => ({ ...p, confirmPassword: e.target.value }))}
                  placeholder="Repeat password"
                  className={`${inputBase} border-white/10 pl-10 pr-3.5`}
                />
              </Field>
            </div>
            <button
              type="submit"
              disabled={savingPass || !passwords.newPassword}
              className="px-4 py-2.5 rounded-xl font-bold text-sm bg-white/[0.06] hover:bg-white/[0.12] border border-white/15 text-white flex items-center gap-1.5 disabled:opacity-50"
            >
              {savingPass && <Spinner className="text-[16px]" />}
              <span>Save New Password</span>
            </button>
          </form>
        </div>
      </AuthCard>

      <p className="text-center text-xs text-slate-500">
        <Link to="/dashboard" className="text-amber-300 font-semibold hover:underline">
          Continue to marketplace →
        </Link>
      </p>
    </main>
  )
}
