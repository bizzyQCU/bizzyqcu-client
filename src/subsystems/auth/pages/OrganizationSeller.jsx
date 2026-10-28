import { useState } from 'react'
import { registerUser } from '../api'
import {
  BiometricScannerBox,
  fieldBorder,
  FileDropzone,
  PasswordToggle,
  QCU_COLLEGES,
  SellerFormShell,
  sellerInputBase,
  SellerInputField,
  validateUploadFile,
} from '../components/SellerFormParts.jsx'
import { getErrorMessage, getFieldErrors } from '../../../lib/api-client'
import { MEMBER_TYPES, MIN_PASSWORD_LENGTH, QCU_ID_PATTERN } from '../../../lib/constants'

export default function OrganizationSeller() {
  const [form, setForm] = useState({
    organizationName: '',
    firstName: '',
    lastName: '',
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
    studentId: '',
    contactNumber: '',
    college: '',
  })
  const [osaFile, setOsaFile] = useState(null)
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

  const handleOsaFile = (file) => {
    const err = validateUploadFile(file)
    if (err) {
      setErrors((e) => ({ ...e, osaFile: err }))
      return
    }
    setOsaFile(file)
    setErrors((e) => ({ ...e, osaFile: undefined }))
  }

  const handleIdFile = (file) => {
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
    if (!form.organizationName.trim()) next.organizationName = 'Organization name is required'
    if (!form.firstName.trim()) next.firstName = 'First name is required'
    if (!form.lastName.trim()) next.lastName = 'Last name is required'
    if (form.username.trim().length < 3) next.username = 'At least 3 characters'
    if (!/^\S+@\S+\.\S+$/.test(form.email)) next.email = 'Valid email required'
    if (form.password.length < MIN_PASSWORD_LENGTH) next.password = `Min ${MIN_PASSWORD_LENGTH} characters`
    if (form.confirmPassword !== form.password) next.confirmPassword = 'Passwords do not match'
    if (!QCU_ID_PATTERN.test(form.studentId.trim())) next.studentId = 'Format: YY-NNNN (e.g. 24-1879)'
    if (!/^09\d{9}$/.test(form.contactNumber.replace(/\s|-/g, ''))) next.contactNumber = 'Enter a valid 11-digit number'
    if (!form.college) next.college = 'Select your college or branch'
    if (!osaFile) next.osaFile = 'OSA certificate is required'
    if (!idFile) next.idFile = 'Official QCU ID is required'
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
        liveSelfieUrl: `https://res.cloudinary.com/bizzyqcu/image/upload/${safeId}-org-liveness.jpg`,
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
      portalKey="organization"
      badge="RECOGNIZED ORG"
      titlePrefix="Create an"
      titleHighlight="Organization"
      titleSuffix="Account"
      status={status}
      formError={formError}
      onSubmit={handleSubmit}
    >
      <SellerInputField id="org-name" label="Organization Name" icon="groups" error={errors.organizationName}>
        <input
          id="org-name"
          type="text"
          required
          value={form.organizationName}
          onChange={update('organizationName')}
          placeholder="e.g. Junior Philippine Computer Society - QCU Chapter"
          className={`${sellerInputBase} ${fieldBorder(errors.organizationName)} pl-10 pr-3.5`}
        />
      </SellerInputField>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <SellerInputField id="org-first-name" label="President / Rep. First Name" icon="person" error={errors.firstName}>
          <input
            id="org-first-name"
            type="text"
            required
            value={form.firstName}
            onChange={update('firstName')}
            placeholder="e.g. Juan"
            className={`${sellerInputBase} ${fieldBorder(errors.firstName)} pl-10 pr-3.5`}
          />
        </SellerInputField>

        <SellerInputField id="org-last-name" label="President / Rep. Last Name" icon="badge" error={errors.lastName}>
          <input
            id="org-last-name"
            type="text"
            required
            value={form.lastName}
            onChange={update('lastName')}
            placeholder="e.g. Dela Cruz"
            className={`${sellerInputBase} ${fieldBorder(errors.lastName)} pl-10 pr-3.5`}
          />
        </SellerInputField>

        <SellerInputField id="org-username" label="Username" icon="alternate_email" error={errors.username}>
          <input
            id="org-username"
            type="text"
            required
            value={form.username}
            onChange={update('username')}
            placeholder="e.g. qcu_jpcs"
            className={`${sellerInputBase} ${fieldBorder(errors.username)} pl-10 pr-3.5`}
          />
        </SellerInputField>

        <SellerInputField id="org-email" label="Official Org Email Address" icon="mail" error={errors.email}>
          <input
            id="org-email"
            type="email"
            required
            value={form.email}
            onChange={update('email')}
            placeholder="e.g. jpcs@qcu.edu.ph"
            className={`${sellerInputBase} ${fieldBorder(errors.email)} pl-10 pr-3.5`}
          />
        </SellerInputField>

        <SellerInputField
          id="org-password"
          label="Password"
          icon="lock"
          error={errors.password}
          rightSlot={<PasswordToggle visible={showPass} onToggle={() => setShowPass((s) => !s)} />}
        >
          <input
            id="org-password"
            type={showPass ? 'text' : 'password'}
            required
            value={form.password}
            onChange={update('password')}
            placeholder="Enter your password"
            className={`${sellerInputBase} ${fieldBorder(errors.password)} pl-10 pr-9`}
          />
        </SellerInputField>

        <SellerInputField
          id="org-confirm-password"
          label="Confirm Password"
          icon="lock_reset"
          error={errors.confirmPassword}
          rightSlot={<PasswordToggle visible={showConfirm} onToggle={() => setShowConfirm((s) => !s)} />}
        >
          <input
            id="org-confirm-password"
            type={showConfirm ? 'text' : 'password'}
            required
            value={form.confirmPassword}
            onChange={update('confirmPassword')}
            placeholder="Re-enter password"
            className={`${sellerInputBase} ${fieldBorder(errors.confirmPassword)} pl-10 pr-9`}
          />
        </SellerInputField>

        <SellerInputField id="org-student-id" label="Org Officer Student ID" icon="badge" error={errors.studentId}>
          <input
            id="org-student-id"
            type="text"
            required
            value={form.studentId}
            onChange={update('studentId')}
            placeholder="e.g. 24-1879"
            className={`${sellerInputBase} ${fieldBorder(errors.studentId)} pl-10 pr-3.5`}
          />
        </SellerInputField>

        <SellerInputField id="org-contact" label="Contact Number" icon="call" error={errors.contactNumber}>
          <input
            id="org-contact"
            type="tel"
            required
            value={form.contactNumber}
            onChange={update('contactNumber')}
            placeholder="e.g. 09XX XXX XXXX"
            className={`${sellerInputBase} ${fieldBorder(errors.contactNumber)} pl-10 pr-3.5`}
          />
        </SellerInputField>
      </div>

      <SellerInputField id="org-college" label="College / Department Affiliation" icon="account_balance" error={errors.college}>
        <select
          id="org-college"
          required
          value={form.college}
          onChange={update('college')}
          className={`${sellerInputBase} ${fieldBorder(errors.college)} pl-10 pr-8 bg-slate-900/90`}
        >
          <option value="" disabled>
            Select your college or branch
          </option>
          {QCU_COLLEGES.map((col) => (
            <option key={col} value={col} className="bg-slate-900 text-white">
              {col}
            </option>
          ))}
        </select>
      </SellerInputField>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <FileDropzone
          id="org-osa-file"
          label="OSA Accreditation Certificate"
          prompt="OSA certificate"
          subtext="PDF, JPG, PNG (Max 5MB)"
          icon="verified"
          compact
          file={osaFile}
          error={errors.osaFile}
          onSelect={handleOsaFile}
        />

        <FileDropzone
          id="org-id-file"
          label="President / Officer QCU ID"
          prompt="official ID"
          subtext="PDF, JPG, PNG (Max 5MB)"
          icon="cloud_upload"
          compact
          file={idFile}
          error={errors.idFile}
          onSelect={handleIdFile}
        />
      </div>

      <BiometricScannerBox
        subtitle="Camera scan required for Org President"
        scanState={scanState}
        error={errors.liveness}
        onScan={handleScan}
      />
    </SellerFormShell>
  )
}

