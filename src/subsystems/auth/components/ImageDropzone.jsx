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
    <div className="flex flex-col h-full">
      <label className="flex items-center gap-1 min-h-[16px] text-[11px] font-bold tracking-wider uppercase text-slate-700 dark:text-slate-300 min-w-0" htmlFor={id}>
        <span className="truncate">{label}</span>
        <span className="text-[#0284C7] dark:text-amber-400 shrink-0" aria-hidden="true">*</span>
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
        className={`mt-1 flex-1 min-h-[48px] flex items-center gap-2.5 px-3 py-1.5 rounded-xl border border-dashed transition-colors ${
          disabled ? 'opacity-60 cursor-not-allowed' : 'cursor-pointer'
        } ${
          error
            ? 'border-rose-400 bg-rose-50 dark:border-red-400/70 dark:bg-red-500/5'
            : dragging
              ? 'border-[#0284C7] bg-[#8ACFF8]/20 dark:border-amber-400 dark:bg-amber-400/10'
              : 'border-[#8ACFF8] bg-[#F8FAFC] hover:border-[#0284C7] hover:bg-sky-50/70 dark:border-amber-400/35 dark:bg-white/[0.03] dark:hover:border-amber-400/60 dark:hover:bg-white/[0.06]'
        }`}
      >
        {preview ? (
          <img src={preview} alt="" className="w-8 h-8 rounded-lg object-cover border border-slate-200 dark:border-white/15 shrink-0" />
        ) : (
          <span className="w-8 h-8 rounded-full bg-[#8ACFF8]/25 border border-[#8ACFF8] text-[#0369A1] dark:bg-amber-400/15 dark:border-amber-400/30 dark:text-amber-400 flex items-center justify-center shrink-0">
            <Icon name={isPdf ? 'picture_as_pdf' : file ? 'task_alt' : 'cloud_upload'} className="text-[17px]" />
          </span>
        )}
        <div className="text-left min-w-0 flex-1">
          {file ? (
            <>
              <p className="text-xs font-semibold text-slate-900 dark:text-white truncate leading-tight">{file.name}</p>
              <p className="text-[10px] text-[#0369A1] dark:text-amber-300 truncate leading-tight">
                {(file.size / 1024 / 1024).toFixed(2)} MB · Replace
              </p>
            </>
          ) : (
            <>
              <p className="text-xs text-slate-600 dark:text-slate-300 truncate leading-tight">
                <span className="font-bold text-[#0369A1] dark:text-amber-300">Click to upload</span>
              </p>
              <p className="text-[10px] text-slate-500 dark:text-slate-400 truncate leading-tight">
                {hint || (allowPdf ? 'JPG, PNG, PDF (5MB)' : 'JPG or PNG (5MB)')}
              </p>
            </>
          )}
        </div>
      </div>
      {error && <p className="mt-1 text-[11px] text-rose-600 dark:text-red-400">{error}</p>}
    </div>
  )
}
