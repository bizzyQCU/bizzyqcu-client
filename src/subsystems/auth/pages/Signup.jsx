import { useRef, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { registerUser } from '../api'
import { AuthShowcase } from '../components'
import { getErrorMessage, getFieldErrors } from '../../../lib/api-client'
import { MEMBER_TYPES, QCU_ID_PATTERN, MIN_PASSWORD_LENGTH } from '../../../lib/constants'

const MAX_FILE_BYTES = 5 * 1024 * 1024 // 5MB
const ACCEPTED_TYPES = ['image/jpeg', 'image/png', 'application/pdf']

const QCU_SECTIONS = [
  'SBIT-1A', 'SBIT-1B', 'SBIT-2A', 'SBIT-2B', 'SBIT-3A', 'SBIT-3B', 'SBIT-4A', 'SBIT-4B',
  'SBCS-1A', 'SBCS-2A', 'SBCS-3A', 'SBCS-4A',
  'SBIS-1A', 'SBIS-2A', 'SBIS-3A', 'SBIS-4A',
  'SBENT-1A', 'SBENT-2A', 'SBENT-3A', 'SBENT-4A',
  'SBA-1A', 'SBA-2A', 'SBA-3A', 'SBA-4A',
  'SBECE-1A', 'SBECE-2A', 'SBECE-3A', 'SBECE-4A',
  'SBIE-1A', 'SBIE-2A', 'SBIE-3A', 'SBIE-4A',
]

const inputBase =
  'w-full py-2.5 rounded-xl bg-white/[0.04] border text-white placeholder:text-slate-500 text-sm transition-colors duration-200 hover:border-white/20 focus:outline-none focus:border-amber-400/60 focus:ring-2 focus:ring-amber-400/25 focus:bg-white/[0.07]'

function Icon({ name, className = '' }) {
  return (
    <span className={`material-symbols-outlined ${className}`} aria-hidden="true">
      {name}
    </span>
  )
}

function InputField({ id, label, icon, error, rightSlot, children }) {
  return (
    <div>
      <label className="flex items-center gap-1 text-[11px] font-bold tracking-wider uppercase text-slate-300" htmlFor={id}>
        <span>{label}</span>
        <span className="text-amber-400" aria-hidden="true">*</span>
      </label>
      <div className="relative mt-1.5">
        <Icon name={icon} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500 text-[18px] pointer-events-none" />
        {children}
        {rightSlot}
      </div>
      {error && <p className="mt-1 text-[11px] text-red-400">{error}</p>}
    </div>
  )
}

export default function Signup() {
  const navigate = useNavigate()
  const fileInputRef = useRef(null)

  const [form, setForm] = useState({
    firstName: '',
    lastName: '',
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
    birthday: '',
    contactNumber: '',
    section: '',
    studentId: '',
  })
  const [idFile, setIdFile] = useState(null)
  const [dragging, setDragging] = useState(false)
  const [showPass, setShowPass] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)
  const [status, setStatus] = useState('idle') // idle | loading | done
  const [formError, setFormError] = useState('')
  const [errors, setErrors] = useState({})

  const update = (key) => (e) => {
    setForm((f) => ({ ...f, [key]: e.target.value }))
    setErrors((prev) => ({ ...prev, [key]: undefined }))
  }

  const handleFile = (file) => {
    if (!file) return
    if (!ACCEPTED_TYPES.includes(file.type)) {
      setErrors((e) => ({ ...e, idFile: 'Only JPG, PNG, or PDF files are allowed' }))
      return
    }
    if (file.size > MAX_FILE_BYTES) {
      setErrors((e) => ({ ...e, idFile: 'File size must not exceed 5MB' }))
      return
    }
    setIdFile(file)
    setErrors((e) => ({ ...e, idFile: undefined }))
  }

  const validate = () => {
    const next = {}
    if (!form.firstName.trim()) next.firstName = 'First name is required'
    if (!form.lastName.trim()) next.lastName = 'Last name is required'
    if (form.username.trim().length < 3) next.username = 'At least 3 characters'
    if (!/^\S+@\S+\.\S+$/.test(form.email)) next.email = 'Valid email required'
    if (form.password.length < MIN_PASSWORD_LENGTH) next.password = `Min ${MIN_PASSWORD_LENGTH} characters`
    if (form.confirmPassword !== form.password) next.confirmPassword = 'Passwords do not match'
    if (!form.birthday) next.birthday = 'Birthday is required'
    if (!/^09\d{9}$/.test(form.contactNumber.replace(/\s|-/g, ''))) next.contactNumber = 'Enter a valid 11-digit number'
    if (!form.section) next.section = 'Select your section'
    if (!QCU_ID_PATTERN.test(form.studentId.trim())) next.studentId = 'Format: YY-NNNN (e.g. 24-1679)'
    if (!idFile) next.idFile = 'Please upload your QCU ID'
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

    setStatus('loading')
    try {
      const safeFileName = encodeURIComponent(idFile.name)
      const safeId = encodeURIComponent(form.studentId.trim())
      await registerUser({
        qcuIdNumber: form.studentId.trim(),
        fullName: `${form.firstName.trim()} ${form.lastName.trim()}`,
        email: form.email.trim(),
        memberType: MEMBER_TYPES.STUDENT,
        password: form.password,
        // Server currently validates URLs before multipart upload is added
        qcuIdPhotoUrl: `https://res.cloudinary.com/bizzyqcu/image/upload/${safeId}-${safeFileName}`,
        liveSelfieUrl: `https://res.cloudinary.com/bizzyqcu/image/upload/${safeId}-selfie.jpg`,
      })
      setStatus('done')
    } catch (error) {
      const serverErrors = getFieldErrors(error)
      if (serverErrors.qcuIdNumber) serverErrors.studentId = serverErrors.qcuIdNumber
      setErrors(serverErrors)
      setFormError(getErrorMessage(error))
      setStatus('idle')
    }
  }

  const border = (key) => (errors[key] ? 'border-red-400/70' : 'border-white/10')

  if (status === 'done') {
    return (
      <main className="flex-grow w-full max-w-6xl mx-auto px-4 sm:px-6 pt-20 pb-4 lg:py-4 grid lg:grid-cols-2 gap-8 lg:gap-12 items-center">
        <AuthShowcase />
        <section className="w-full max-w-[460px] mx-auto lg:mx-0 lg:justify-self-end">
          <div className="relative overflow-hidden rounded-3xl bg-slate-900/70 backdrop-blur-xl border border-white/10 shadow-modal ring-1 ring-inset ring-white/5 p-8 text-center space-y-4">
            <div className="mx-auto w-14 h-14 rounded-2xl bg-emerald-500/15 border border-emerald-400/30 flex items-center justify-center text-emerald-400">
              <Icon name="check_circle" className="text-3xl" />
            </div>
            <h1 className="text-2xl font-extrabold text-white">Registration submitted</h1>
            <p className="text-sm text-slate-300 leading-relaxed">
              Your QCU student account and ID are pending administrator verification. You&apos;ll be able to log in once verified.
            </p>
            <Link
              to="/login"
              className="inline-flex items-center justify-center w-full py-3 rounded-xl font-extrabold text-slate-950 bg-gradient-to-r from-amber-400 via-amber-500 to-amber-600 hover:from-amber-300 hover:to-amber-500 shadow-lg shadow-amber-500/25 transition-all"
            >
              <span>Proceed to Log In</span>
            </Link>
          </div>
        </section>
      </main>
    )
  }

  return (
    <main className="flex-grow w-full max-w-6xl mx-auto px-4 sm:px-6 pt-20 pb-4 lg:py-4 grid lg:grid-cols-2 gap-8 lg:gap-12 items-center">
      <AuthShowcase />

      <section className="w-full max-w-[540px] mx-auto lg:mx-0 lg:justify-self-end" aria-labelledby="signup-title">
        <div className="relative overflow-hidden rounded-3xl bg-slate-900/70 backdrop-blur-xl border border-white/10 shadow-modal ring-1 ring-inset ring-white/5 p-6 sm:p-7">
          {/* Decorative glow & top hairline */}
          <div aria-hidden="true" className="pointer-events-none absolute -top-24 -right-24 w-64 h-64 rounded-full bg-amber-500/15 blur-3xl" />
          <div aria-hidden="true" className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-amber-400/60 to-transparent" />

          {/* Close button */}
          <button
            type="button"
            onClick={() => navigate('/login')}
            aria-label="Close and return to login"
            className="absolute top-4 right-4 z-10 w-8 h-8 rounded-full bg-white/[0.06] hover:bg-white/[0.12] border border-white/10 flex items-center justify-center text-slate-400 hover:text-white transition-colors"
          >
            <Icon name="close" className="text-[18px]" />
          </button>

          <div className="relative">
            {/* Header */}
            <div className="text-center mb-5 px-4">
              <div className="flex items-center justify-center gap-2">
                <Icon name="auto_awesome" className="text-amber-400 text-[20px]" />
                <h1 id="signup-title" className="text-xl sm:text-2xl font-extrabold tracking-tight text-white">
                  Create your student account
                </h1>
                <Icon name="auto_awesome" className="text-amber-400 text-[20px]" />
              </div>
              <p className="text-xs sm:text-sm text-slate-400 mt-1">
                Join BizzyQCU and start supporting your fellow QCU student entrepreneurs!
              </p>
            </div>

            <form className="space-y-3.5" onSubmit={handleSubmit} noValidate>
              {formError && (
                <div role="alert" className="p-2.5 rounded-xl bg-red-500/10 border border-red-400/30 text-xs text-red-300">
                  {formError}
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <InputField id="signup-first-name" label="First Name" icon="person" error={errors.firstName}>
                  <input
                    id="signup-first-name"
                    type="text"
                    required
                    autoComplete="given-name"
                    value={form.firstName}
                    onChange={update('firstName')}
                    placeholder="e.g. Juan"
                    className={`${inputBase} ${border('firstName')} pl-10 pr-3.5`}
                  />
                </InputField>

                <InputField id="signup-last-name" label="Last Name" icon="person" error={errors.lastName}>
                  <input
                    id="signup-last-name"
                    type="text"
                    required
                    autoComplete="family-name"
                    value={form.lastName}
                    onChange={update('lastName')}
                    placeholder="e.g. Dela Cruz"
                    className={`${inputBase} ${border('lastName')} pl-10 pr-3.5`}
                  />
                </InputField>

                <InputField id="signup-username" label="Username" icon="person" error={errors.username}>
                  <input
                    id="signup-username"
                    type="text"
                    required
                    autoComplete="username"
                    value={form.username}
                    onChange={update('username')}
                    placeholder="e.g. chiper123"
                    className={`${inputBase} ${border('username')} pl-10 pr-3.5`}
                  />
                </InputField>

                <InputField id="signup-email" label="Email Address" icon="mail" error={errors.email}>
                  <input
                    id="signup-email"
                    type="email"
                    required
                    autoComplete="email"
                    value={form.email}
                    onChange={update('email')}
                    placeholder="e.g. you@qcu.edu.ph"
                    className={`${inputBase} ${border('email')} pl-10 pr-3.5`}
                  />
                </InputField>

                <InputField
                  id="signup-password"
                  label="Password"
                  icon="lock"
                  error={errors.password}
                  rightSlot={
                    <button
                      type="button"
                      aria-label={showPass ? 'Hide password' : 'Show password'}
                      onClick={() => setShowPass((s) => !s)}
                      className="absolute right-2.5 top-1/2 -translate-y-1/2 p-1 text-slate-500 hover:text-amber-300"
                    >
                      <Icon name={showPass ? 'visibility' : 'visibility_off'} className="text-[18px]" />
                    </button>
                  }
                >
                  <input
                    id="signup-password"
                    type={showPass ? 'text' : 'password'}
                    required
                    autoComplete="new-password"
                    value={form.password}
                    onChange={update('password')}
                    placeholder="Enter your password"
                    className={`${inputBase} ${border('password')} pl-10 pr-9`}
                  />
                </InputField>

                <InputField
                  id="signup-confirm-password"
                  label="Confirm Password"
                  icon="lock"
                  error={errors.confirmPassword}
                  rightSlot={
                    <button
                      type="button"
                      aria-label={showConfirm ? 'Hide password' : 'Show password'}
                      onClick={() => setShowConfirm((s) => !s)}
                      className="absolute right-2.5 top-1/2 -translate-y-1/2 p-1 text-slate-500 hover:text-amber-300"
                    >
                      <Icon name={showConfirm ? 'visibility' : 'visibility_off'} className="text-[18px]" />
                    </button>
                  }
                >
                  <input
                    id="signup-confirm-password"
                    type={showConfirm ? 'text' : 'password'}
                    required
                    autoComplete="new-password"
                    value={form.confirmPassword}
                    onChange={update('confirmPassword')}
                    placeholder="Re-enter your password"
                    className={`${inputBase} ${border('confirmPassword')} pl-10 pr-9`}
                  />
                </InputField>

                <InputField id="signup-birthday" label="Birthday" icon="calendar_today" error={errors.birthday}>
                  <input
                    id="signup-birthday"
                    type="date"
                    required
                    value={form.birthday}
                    onChange={update('birthday')}
                    className={`${inputBase} ${border('birthday')} pl-10 pr-3.5 [color-scheme:dark]`}
                  />
                </InputField>

                <InputField id="signup-contact" label="Contact Number" icon="call" error={errors.contactNumber}>
                  <input
                    id="signup-contact"
                    type="tel"
                    required
                    autoComplete="tel"
                    value={form.contactNumber}
                    onChange={update('contactNumber')}
                    placeholder="e.g. 09XX XXX XXXX"
                    className={`${inputBase} ${border('contactNumber')} pl-10 pr-3.5`}
                  />
                </InputField>

                <InputField id="signup-section" label="Section" icon="school" error={errors.section}>
                  <select
                    id="signup-section"
                    required
                    value={form.section}
                    onChange={update('section')}
                    className={`${inputBase} ${border('section')} pl-10 pr-8 bg-slate-900/90`}
                  >
                    <option value="" disabled>
                      Select your section
                    </option>
                    {QCU_SECTIONS.map((sec) => (
                      <option key={sec} value={sec} className="bg-slate-900 text-white">
                        {sec}
                      </option>
                    ))}
                  </select>
                </InputField>

                <InputField id="signup-student-id" label="Student ID" icon="badge" error={errors.studentId}>
                  <input
                    id="signup-student-id"
                    type="text"
                    required
                    value={form.studentId}
                    onChange={update('studentId')}
                    placeholder="e.g. 24-1679"
                    className={`${inputBase} ${border('studentId')} pl-10 pr-3.5`}
                  />
                </InputField>
              </div>

              {/* Upload QCU ID */}
              <div>
                <label className="flex items-center gap-1 text-[11px] font-bold tracking-wider uppercase text-slate-300" htmlFor="signup-qcu-id-file">
                  <span>Upload QCU ID</span>
                  <span className="text-amber-400" aria-hidden="true">*</span>
                </label>
                <input
                  ref={fileInputRef}
                  id="signup-qcu-id-file"
                  type="file"
                  accept=".jpg,.jpeg,.png,.pdf"
                  onChange={(e) => handleFile(e.target.files?.[0])}
                  className="sr-only"
                />
                <div
                  role="button"
                  tabIndex={0}
                  onClick={() => fileInputRef.current?.click()}
                  onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && fileInputRef.current?.click()}
                  onDragOver={(e) => {
                    e.preventDefault()
                    setDragging(true)
                  }}
                  onDragLeave={() => setDragging(false)}
                  onDrop={(e) => {
                    e.preventDefault()
                    setDragging(false)
                    handleFile(e.dataTransfer.files?.[0])
                  }}
                  className={`mt-1.5 flex items-center justify-center gap-3 px-4 py-3.5 rounded-2xl border-2 border-dashed cursor-pointer transition-colors ${
                    errors.idFile
                      ? 'border-red-400/70 bg-red-500/5'
                      : dragging
                        ? 'border-amber-400 bg-amber-400/10'
                        : 'border-amber-400/35 bg-white/[0.03] hover:border-amber-400/60 hover:bg-white/[0.06]'
                  }`}
                >
                  <span className="w-10 h-10 rounded-full bg-amber-400/15 border border-amber-400/30 flex items-center justify-center text-amber-400 shrink-0">
                    <Icon name={idFile ? 'task_alt' : 'cloud_upload'} className="text-[20px]" />
                  </span>
                  <div className="text-left min-w-0">
                    {idFile ? (
                      <>
                        <p className="text-xs sm:text-sm font-semibold text-white truncate">{idFile.name}</p>
                        <p className="text-[11px] text-amber-300">
                          {(idFile.size / 1024 / 1024).toFixed(2)} MB · Click to replace
                        </p>
                      </>
                    ) : (
                      <>
                        <p className="text-xs sm:text-sm text-slate-300">
                          <span className="font-bold text-amber-300">Click to upload</span> or drag and drop your QCU ID here
                        </p>
                        <p className="text-[11px] text-slate-500">JPG, PNG or PDF (Max 5MB)</p>
                      </>
                    )}
                  </div>
                </div>
                {errors.idFile && <p className="mt-1 text-[11px] text-red-400">{errors.idFile}</p>}
              </div>

              {/* Submit */}
              <button
                type="submit"
                disabled={status === 'loading'}
                className="w-full py-3 rounded-xl font-extrabold text-base text-slate-950 bg-gradient-to-r from-amber-400 via-amber-500 to-amber-600 hover:from-amber-300 hover:via-amber-400 hover:to-amber-500 ring-1 ring-inset ring-amber-200/50 shadow-lg shadow-amber-500/25 hover:shadow-xl hover:shadow-amber-500/40 transition-all duration-200 flex items-center justify-center gap-2 group active:scale-[0.98] disabled:opacity-60 disabled:cursor-not-allowed"
              >
                <span>{status === 'loading' ? 'Creating Account...' : 'Create Account'}</span>
                {status === 'loading' && <Icon name="progress_activity" className="text-[20px] animate-spin" />}
              </button>
            </form>

            {/* Footer link */}
            <div className="mt-4 pt-3.5 border-t border-white/10 text-center">
              <p className="text-sm text-slate-400">
                Already have an account?{' '}
                <Link className="text-amber-300 font-bold hover:text-amber-200 hover:underline" to="/login">
                  Log in
                </Link>
              </p>
            </div>
          </div>
        </div>

        {/* Trust badges */}
        <div className="flex flex-wrap items-center justify-center gap-5 text-slate-300 text-xs font-medium pt-3">
          <div className="flex items-center gap-1.5">
            <Icon name="verified" className="text-amber-400 text-[16px]" />
            <span>Official QCU Portal</span>
          </div>
          <span className="w-1 h-1 rounded-full bg-slate-500" aria-hidden="true" />
          <div className="flex items-center gap-1.5">
            <Icon name="local_police" className="text-amber-400 text-[16px]" />
            <span>Biometric Protected</span>
          </div>
        </div>
      </section>
    </main>
  )
}
