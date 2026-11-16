import { useEffect, useRef, useState } from 'react'
import { Icon } from './AuthUI.jsx'
import { validateDocumentFile, validateImageFile } from '../upload'

/**
 * Click / drag-and-drop file picker with thumbnail preview for images
 * and PDF badge for seller endorsement documents.
 *
 * When `allowPdf` is false (default), accepts JPG/PNG images (QCU_ID).
 * When `allowPdf` is true, accepts JPG, PNG, or PDF (SELLER_ENDORSEMENT).
 */
export default function ImageDropzone({
  id,
  label,
  hint,
  file,
  error,
  onChange,
  onError,
  allowPdf = false,
  disabled = false,
}) {
  const inputRef = useRef(null)
  const [dragging, setDragging] = useState(false)
  const [preview, setPreview] = useState(null)

  useEffect(() => {
    if (!file || file.type === 'application/pdf') {
      setPreview(null)
      return undefined
    }
    const url = URL.createObjectURL(file)
    setPreview(url)
    return () => URL.revokeObjectURL(url)
  }, [file])

  const pick = (candidate) => {
    if (!candidate) return
    const err = allowPdf ? validateDocumentFile(candidate) : validateImageFile(candidate)
    if (err) {
      onError?.(err)
      return
    }
    onChange(candidate)
  }

  const open = () => !disabled && inputRef.current?.click()
  const isPdf = file?.type === 'application/pdf'

  return (
    <div>
      <label className="flex items-center gap-1 text-[11px] font-bold tracking-wider uppercase text-slate-700" htmlFor={id}>
        <span>{label}</span>
        <span className="text-[#0284C7]" aria-hidden="true">*</span>
      </label>
      <input
        ref={inputRef}
        id={id}
        type="file"
        accept={allowPdf ? 'image/jpeg,image/png,application/pdf' : 'image/jpeg,image/png'}
        disabled={disabled}
        onChange={(e) => {
          pick(e.target.files?.[0])
          e.target.value = ''
        }}
        className="sr-only"
      />
      <div
        role="button"
        tabIndex={disabled ? -1 : 0}
        aria-disabled={disabled}
        onClick={open}
        onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && (e.preventDefault(), open())}
        onDragOver={(e) => {
          e.preventDefault()
          if (!disabled) setDragging(true)
        }}
        onDragLeave={() => setDragging(false)}
        onDrop={(e) => {
          e.preventDefault()
          setDragging(false)
          if (!disabled) pick(e.dataTransfer.files?.[0])
        }}
        className={`mt-1.5 flex items-center gap-3 px-3.5 py-3 rounded-2xl border-2 border-dashed transition-colors ${
          disabled ? 'opacity-60 cursor-not-allowed' : 'cursor-pointer'
        } ${
          error
            ? 'border-rose-400 bg-rose-50'
            : dragging
              ? 'border-[#0284C7] bg-[#8ACFF8]/20'
              : 'border-[#8ACFF8] bg-[#F8FAFC] hover:border-[#0284C7] hover:bg-sky-50/70'
        }`}
      >
        {preview ? (
          <img src={preview} alt="" className="w-14 h-14 rounded-xl object-cover border border-slate-200 shrink-0" />
        ) : (
          <span className="w-12 h-12 rounded-full bg-[#8ACFF8]/25 border border-[#8ACFF8] flex items-center justify-center text-[#0369A1] shrink-0">
            <Icon name={isPdf ? 'picture_as_pdf' : file ? 'task_alt' : 'cloud_upload'} className="text-[22px]" />
          </span>
        )}
        <div className="text-left min-w-0">
          {file ? (
            <>
              <p className="text-xs sm:text-sm font-semibold text-slate-900 truncate">{file.name}</p>
              <p className="text-[11px] text-[#0369A1]">
                {(file.size / 1024 / 1024).toFixed(2)} MB · Click to replace
              </p>
            </>
          ) : (
            <>
              <p className="text-xs sm:text-sm text-slate-600">
                <span className="font-bold text-[#0369A1]">Click to upload</span> or drag and drop
              </p>
              <p className="text-[11px] text-slate-500">
                {hint || (allowPdf ? 'JPG, PNG, or PDF (Max 5MB)' : 'JPG or PNG (Max 5MB)')}
              </p>
            </>
          )}
        </div>
      </div>
      {error && <p className="mt-1 text-[11px] text-rose-600">{error}</p>}
    </div>
  )
}
