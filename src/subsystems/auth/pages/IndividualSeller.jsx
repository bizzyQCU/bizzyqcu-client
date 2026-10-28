import { useState } from 'react'
import { registerUser } from '../api'
import {
  BiometricScannerBox,
  fieldBorder,
  FileDropzone,
  PasswordToggle,
  QCU_PROGRAMS,
  SellerFormShell,
  sellerInputBase,
  SellerInputField,
  validateUploadFile,
} from '../components/SellerFormParts.jsx'
import { getErrorMessage, getFieldErrors } from '../../../lib/api-client'
import { MEMBER_TYPES, MIN_PASSWORD_LENGTH, QCU_ID_PATTERN } from '../../../lib/constants'

export default function IndividualSeller() {
  const [form, setForm] = useState({
    firstName: '',
    lastName: '',
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
    birthday: '',
    contactNumber: '',
    program: '',
    studentId: '',
  })
  const [idFile, setIdFile] = useState(null)
  const [scanState, setScanState] = useState('idle')
  const [showPass, setShowPass] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)
  const [status, setStatus] = useState('idle')
  const [formError, setFormError] = useState('')
  const [errors, setErrors] = useState({})

  const update = (key) => (e) => {
    setForm((f) => ({ ...f, [key]: e.target.value }))
    setErrors((prev) => ({ ...prev, [key]: undefined }))
  }

  const handleFile = (file) => {
    const err = validateUploadFile(file)
    if (err) {
      setErrors((e) => ({ ...e, idFile: err }))
      return
    }
    setIdFile(file)
    setErrors((e) => ({ ...e, idFile: undefined }))
  }

  const handleScan = () => {
    setScanState('scanning')
    setErrors((e) => ({ ...e, liveness: undefined }))
    setTimeout(() => setScanState('done'), 1100)
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
    if (!form.program) next.program = 'Select your program'
    if (!QCU_ID_PATTERN.test(form.studentId.trim())) next.studentId = 'Format: YY-NNNN (e.g. 24-1679)'
    if (!idFile) next.idFile = 'Please upload your QCU ID'
    if (scanState !== 'done') next.liveness = 'Please complete the facial liveness scan'
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
      const safeId = encodeURIComponent(form.studentId.trim())
      const safeFile = encodeURIComponent(idFile.name)
      await registerUser({
        qcuIdNumber: form.studentId.trim(),
        fullName: `${form.firstName.trim()} ${form.lastName.trim()}`,
        email: form.email.trim(),
        memberType: MEMBER_TYPES.STUDENT,
        password: form.password,
        qcuIdPhotoUrl: `https://res.cloudinary.com/bizzyqcu/image/upload/${safeId}-${safeFile}`,
        liveSelfieUrl: `https://res.cloudinary.com/bizzyqcu/image/upload/${safeId}-liveness.jpg`,
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

  return (
    <SellerFormShell
      portalKey="individual"
      badge="INDEPENDENT SELLER"
      titlePrefix="Create your Account as an"
      titleHighlight="Individual Seller"
      status={status}
      formError={formError}
      onSubmit={handleSubmit}
    >
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <SellerInputField id="ind-first-name" label="First Name" icon="person" error={errors.firstName}>
          <input
            id="ind-first-name"
            type="text"
            required
            value={form.firstName}
            onChange={update('firstName')}
            placeholder="e.g. Juan"
            className={`${sellerInputBase} ${fieldBorder(errors.firstName)} pl-10 pr-3.5`}
          />
        </SellerInputField>

        <SellerInputField id="ind-last-name" label="Last Name" icon="person" error={errors.lastName}>
          <input
            id="ind-last-name"
            type="text"
            required
            value={form.lastName}
            onChange={update('lastName')}
            placeholder="e.g. Dela Cruz"
            className={`${sellerInputBase} ${fieldBorder(errors.lastName)} pl-10 pr-3.5`}
          />
        </SellerInputField>

        <SellerInputField id="ind-username" label="Username" icon="person" error={errors.username}>
          <input
            id="ind-username"
            type="text"
            required
            value={form.username}
            onChange={update('username')}
            placeholder="e.g. chiper123"
            className={`${sellerInputBase} ${fieldBorder(errors.username)} pl-10 pr-3.5`}
          />
        </SellerInputField>

        <SellerInputField id="ind-email" label="Email Address" icon="mail" error={errors.email}>
          <input
            id="ind-email"
            type="email"
            required
            value={form.email}
            onChange={update('email')}
            placeholder="e.g. you@qcu.edu.ph"
            className={`${sellerInputBase} ${fieldBorder(errors.email)} pl-10 pr-3.5`}
          />
        </SellerInputField>

        <SellerInputField
          id="ind-password"
          label="Password"
          icon="lock"
          error={errors.password}
          rightSlot={<PasswordToggle visible={showPass} onToggle={() => setShowPass((s) => !s)} />}
        >
          <input
            id="ind-password"
            type={showPass ? 'text' : 'password'}
            required
            value={form.password}
            onChange={update('password')}
            placeholder="Enter your password"
            className={`${sellerInputBase} ${fieldBorder(errors.password)} pl-10 pr-9`}
          />
        </SellerInputField>

        <SellerInputField
          id="ind-confirm-password"
          label="Confirm Password"
          icon="lock"
          error={errors.confirmPassword}
          rightSlot={<PasswordToggle visible={showConfirm} onToggle={() => setShowConfirm((s) => !s)} />}
        >
          <input
            id="ind-confirm-password"
            type={showConfirm ? 'text' : 'password'}
            required
            value={form.confirmPassword}
            onChange={update('confirmPassword')}
            placeholder="Re-enter your password"
            className={`${sellerInputBase} ${fieldBorder(errors.confirmPassword)} pl-10 pr-9`}
          />
        </SellerInputField>

        <SellerInputField id="ind-birthday" label="Birthday" icon="calendar_today" error={errors.birthday}>
          <input
            id="ind-birthday"
            type="date"
            required
            value={form.birthday}
            onChange={update('birthday')}
            className={`${sellerInputBase} ${fieldBorder(errors.birthday)} pl-10 pr-3.5 [color-scheme:dark]`}
          />
        </SellerInputField>

        <SellerInputField id="ind-contact" label="Contact Number" icon="call" error={errors.contactNumber}>
          <input
            id="ind-contact"
            type="tel"
            required
            value={form.contactNumber}
            onChange={update('contactNumber')}
            placeholder="e.g. 09XX XXX XXXX"
            className={`${sellerInputBase} ${fieldBorder(errors.contactNumber)} pl-10 pr-3.5`}
          />
        </SellerInputField>

        <SellerInputField id="ind-program" label="Program" icon="school" error={errors.program}>
          <select
            id="ind-program"
            required
            value={form.program}
            onChange={update('program')}
            className={`${sellerInputBase} ${fieldBorder(errors.program)} pl-10 pr-8 bg-slate-900/90`}
          >
            <option value="" disabled>
              Select your Program
            </option>
            {QCU_PROGRAMS.map((prog) => (
              <option key={prog} value={prog} className="bg-slate-900 text-white">
                {prog}
              </option>
            ))}
          </select>
        </SellerInputField>

        <SellerInputField id="ind-student-id" label="Student ID" icon="badge" error={errors.studentId}>
          <input
            id="ind-student-id"
            type="text"
            required
            value={form.studentId}
            onChange={update('studentId')}
            placeholder="e.g. 24-1679"
            className={`${sellerInputBase} ${fieldBorder(errors.studentId)} pl-10 pr-3.5`}
          />
        </SellerInputField>
      </div>

      <FileDropzone
        id="ind-qcu-id-file"
        label="Upload QCU ID"
        file={idFile}
        error={errors.idFile}
        onSelect={handleFile}
      />

      <BiometricScannerBox
        subtitle="Camera scan required"
        scanState={scanState}
        error={errors.liveness}
        onScan={handleScan}
      />
    </SellerFormShell>
  )
}

