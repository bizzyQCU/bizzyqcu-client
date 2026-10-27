import { useState } from 'react'
import { Link } from 'react-router-dom'
import { registerUser } from '../api'
import { getErrorMessage, getFieldErrors } from '../../../lib/api-client'
import { MEMBER_TYPES, QCU_ID_PATTERN, MIN_PASSWORD_LENGTH } from '../../../lib/constants'

const inputClass =
  'w-full px-4 py-3 rounded-xl border text-slate-900 placeholder:text-slate-400 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500'

function Field({ id, label, error, hint, required = true, children }) {
  return (
    <div>
      <label className="flex items-center gap-1 text-sm font-semibold text-slate-900" htmlFor={id}>
        <span>{label}</span>
        {required && <span className="text-red-500">*</span>}
      </label>
      <div className="mt-1.5">{children}</div>
      {error ? (
        <p className="mt-1 text-xs text-red-600">{error}</p>
      ) : (
        hint && <p className="mt-1 text-xs text-slate-500">{hint}</p>
      )}
    </div>
  )
}

export default function Signup() {
  const [form, setForm] = useState({
    qcuIdNumber: '',
    fullName: '',
    email: '',
    memberType: MEMBER_TYPES.STUDENT,
    password: '',
    qcuIdPhotoUrl: '',
    liveSelfieUrl: '',
  })
  const [status, setStatus] = useState('idle') // idle | loading | done
  const [formError, setFormError] = useState('')
  const [errors, setErrors] = useState({})

  const update = (key) => (e) => {
    setForm((f) => ({ ...f, [key]: e.target.value }))
    setErrors((prev) => ({ ...prev, [key]: undefined }))
  }

  // Client-side checks mirror the server's zod schema (auth.validation.ts)
  const validate = () => {
    const next = {}
    if (!QCU_ID_PATTERN.test(form.qcuIdNumber)) next.qcuIdNumber = 'QCU ID format must be YY-NNNN (e.g., 24-0001)'
    if (form.fullName.trim().length < 2) next.fullName = 'Full name must be at least 2 characters'
    if (!/^\S+@\S+\.\S+$/.test(form.email)) next.email = 'Invalid email address'
    if (form.password && form.password.length < MIN_PASSWORD_LENGTH)
      next.password = `Password must be at least ${MIN_PASSWORD_LENGTH} characters`
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
      const payload = {
        qcuIdNumber: form.qcuIdNumber.trim(),
        fullName: form.fullName.trim(),
        email: form.email.trim(),
        memberType: form.memberType,
        qcuIdPhotoUrl: form.qcuIdPhotoUrl.trim(),
        liveSelfieUrl: form.liveSelfieUrl.trim(),
      }
      // password is optional on the server; omit it entirely when blank
      if (form.password) payload.password = form.password

      await registerUser(payload)
      setStatus('done')
    } catch (error) {
      setErrors(getFieldErrors(error))
      setFormError(getErrorMessage(error))
      setStatus('idle')
    }
  }

  if (status === 'done') {
    return (
      <main className="flex-grow flex items-center justify-center px-4 py-8">
        <div className="w-full max-w-[500px] bg-white border border-slate-200 rounded-3xl shadow-modal p-10 text-center text-slate-900 space-y-4">
          <span className="material-symbols-outlined text-5xl text-emerald-500">check_circle</span>
          <h1 className="text-2xl font-bold">Registration submitted</h1>
          <p className="text-sm text-slate-500">
            Your QCU ID and selfie are pending administrator verification. You'll be able to sign in once
            you're verified.
          </p>
          <Link to="/login" className="inline-block text-blue-600 font-semibold hover:underline">
            Back to login
          </Link>
        </div>
      </main>
    )
  }

  const border = (key) => (errors[key] ? 'border-red-400' : 'border-slate-300')

  return (
    <main className="flex-grow flex items-center justify-center px-4 py-8">
      <div className="w-full max-w-[500px] bg-white border border-slate-200 rounded-3xl shadow-modal p-10 text-slate-900">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold">Create your BizzyQCU account</h1>
          <p className="text-sm text-slate-500 mt-2">Verify your QCU identity to start shopping</p>
        </div>

        <form className="space-y-5" onSubmit={handleSubmit} noValidate>
          {formError && (
            <div role="alert" className="p-3 rounded-xl bg-red-50 border border-red-200 text-sm text-red-700">
              {formError}
            </div>
          )}

          <Field id="signup-qcu-id" label="QCU ID Number" error={errors.qcuIdNumber}>
            <input
              id="signup-qcu-id"
              type="text"
              required
              value={form.qcuIdNumber}
              onChange={update('qcuIdNumber')}
              placeholder="e.g. 24-0001"
              className={`${inputClass} ${border('qcuIdNumber')}`}
            />
          </Field>

          <Field id="signup-name" label="Full Name" error={errors.fullName}>
            <input
              id="signup-name"
              type="text"
              required
              value={form.fullName}
              onChange={update('fullName')}
              placeholder="Juan Dela Cruz"
              className={`${inputClass} ${border('fullName')}`}
            />
          </Field>

          <Field id="signup-email" label="Email" error={errors.email}>
            <input
              id="signup-email"
              type="email"
              required
              value={form.email}
              onChange={update('email')}
              placeholder="you@example.com"
              className={`${inputClass} ${border('email')}`}
            />
          </Field>

          <Field id="signup-member-type" label="I am a" error={errors.memberType}>
            <select
              id="signup-member-type"
              value={form.memberType}
              onChange={update('memberType')}
              className={`${inputClass} ${border('memberType')} bg-white`}
            >
              <option value={MEMBER_TYPES.STUDENT}>Student</option>
              <option value={MEMBER_TYPES.FACULTY}>Faculty</option>
              <option value={MEMBER_TYPES.STAFF}>Staff</option>
            </select>
          </Field>

          <Field
            id="signup-password"
            label="Password"
            required={false}
            error={errors.password}
            hint={`Optional. At least ${MIN_PASSWORD_LENGTH} characters.`}
          >
            <input
              id="signup-password"
              type="password"
              value={form.password}
              onChange={update('password')}
              autoComplete="new-password"
              className={`${inputClass} ${border('password')}`}
            />
          </Field>

          {/* The server has no upload endpoint yet and expects image URLs. */}
          <Field
            id="signup-id-photo"
            label="QCU ID Photo URL"
            error={errors.qcuIdPhotoUrl}
            hint="Link to a photo of your QCU ID."
          >
            <input
              id="signup-id-photo"
              type="url"
              required
              value={form.qcuIdPhotoUrl}
              onChange={update('qcuIdPhotoUrl')}
              placeholder="https://..."
              className={`${inputClass} ${border('qcuIdPhotoUrl')}`}
            />
          </Field>

          <Field
            id="signup-selfie"
            label="Live Selfie URL"
            error={errors.liveSelfieUrl}
            hint="Link to a recent selfie of you holding your ID."
          >
            <input
              id="signup-selfie"
              type="url"
              required
              value={form.liveSelfieUrl}
              onChange={update('liveSelfieUrl')}
              placeholder="https://..."
              className={`${inputClass} ${border('liveSelfieUrl')}`}
            />
          </Field>

          <button
            type="submit"
            disabled={status === 'loading'}
            className="w-full py-3 rounded-xl bg-sky-600 hover:bg-sky-700 text-white font-semibold shadow-md disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {status === 'loading' ? 'Submitting...' : 'Submit for verification'}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-slate-600">
          Already have an account?{' '}
          <Link className="text-blue-600 font-bold hover:underline" to="/login">
            Log in
          </Link>
        </p>
      </div>
    </main>
  )
}

