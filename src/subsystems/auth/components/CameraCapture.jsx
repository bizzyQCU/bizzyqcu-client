import { useCallback, useEffect, useRef, useState } from 'react'
import { Icon } from './AuthUI.jsx'

const CAMERA_ERRORS = {
  NotAllowedError: 'Camera access was denied. Allow camera permission in your browser to take your live selfie.',
  NotFoundError: 'No camera was found on this device.',
  NotReadableError: 'Your camera is being used by another application.',
  OverconstrainedError: 'Your camera does not support the required settings.',
  SecurityError: 'Camera access requires a secure (HTTPS) connection.',
}

/**
 * Live selfie capture via the browser camera API (getUserMedia).
 * The server stores this as `liveSelfieUrl` and admins compare it with the QCU ID photo,
 * so gallery uploads are intentionally not offered.
 *
 * Calls onCapture(blob | null) with a JPEG Blob when a photo is taken (null on retake).
 */
export default function CameraCapture({ id, label = 'Live Selfie', capture, error, onCapture, disabled = false }) {
  const videoRef = useRef(null)
  const streamRef = useRef(null)
  const [state, setState] = useState('idle') // idle | starting | live | captured
  const [cameraError, setCameraError] = useState(null)
  const [preview, setPreview] = useState(null)

  const stopStream = useCallback(() => {
    streamRef.current?.getTracks().forEach((t) => t.stop())
    streamRef.current = null
  }, [])

  useEffect(() => stopStream, [stopStream])

  useEffect(() => {
    if (!capture) {
      setPreview(null)
      return undefined
    }
    const url = URL.createObjectURL(capture)
    setPreview(url)
    setState('captured')
    return () => URL.revokeObjectURL(url)
  }, [capture])

  const startCamera = async () => {
    setCameraError(null)
    if (!navigator.mediaDevices?.getUserMedia) {
      setCameraError('This browser does not support camera access. Please use a modern browser.')
      return
    }
    setState('starting')
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'user', width: { ideal: 720 }, height: { ideal: 720 } },
        audio: false,
      })
      streamRef.current = stream
      setState('live')
      // Wait for the <video> to mount before attaching the stream.
      requestAnimationFrame(() => {
        if (videoRef.current) {
          videoRef.current.srcObject = stream
          videoRef.current.play().catch(() => {})
        }
      })
    } catch (err) {
      setCameraError(CAMERA_ERRORS[err?.name] || 'Unable to start the camera.')
      setState('idle')
    }
  }

  const takePhoto = () => {
    const video = videoRef.current
    if (!video || !video.videoWidth) return
    const size = Math.min(video.videoWidth, video.videoHeight)
    const canvas = document.createElement('canvas')
    canvas.width = size
    canvas.height = size
    const ctx = canvas.getContext('2d')
    // Mirror horizontally so the photo matches the preview the user saw.
    ctx.translate(size, 0)
    ctx.scale(-1, 1)
    ctx.drawImage(
      video,
      (video.videoWidth - size) / 2,
      (video.videoHeight - size) / 2,
      size,
      size,
      0,
      0,
      size,
      size
    )
    canvas.toBlob(
      (blob) => {
        if (!blob) return
        stopStream()
        onCapture(new File([blob], 'live-selfie.jpg', { type: 'image/jpeg' }))
      },
      'image/jpeg',
      0.9
    )
  }

  const retake = () => {
    onCapture(null)
    startCamera()
  }

  const cancel = () => {
    stopStream()
    setState('idle')
  }

  const showError = cameraError || error

  return (
    <div className="flex flex-col h-full">
      <p id={`${id}-label`} className="flex items-center gap-1 min-h-[16px] text-[10.5px] font-bold tracking-wider uppercase text-slate-700 dark:text-slate-300 min-w-0">
        <span className="truncate">{label}</span>
        <span className="text-[#0284C7] dark:text-amber-400 shrink-0" aria-hidden="true">*</span>
      </p>
      <div
        aria-labelledby={`${id}-label`}
        className={`mt-1 flex-1 min-h-[48px] flex items-center rounded-xl border px-3 py-1.5 ${showError ? 'border-rose-400 bg-rose-50 dark:border-red-400/70 dark:bg-red-500/5' : 'border-slate-200 bg-[#F8FAFC] dark:border-white/10 dark:bg-white/[0.03]'}`}
      >
        {state === 'live' || state === 'starting' ? (
          <div className="w-full space-y-2 py-1">
            <div className="relative mx-auto w-full max-w-[180px] aspect-square rounded-xl overflow-hidden bg-slate-900 dark:bg-black border border-[#8ACFF8] dark:border-amber-400/30">
              <video ref={videoRef} playsInline muted className="w-full h-full object-cover -scale-x-100" />
              <div aria-hidden="true" className="pointer-events-none absolute inset-5 rounded-full border-2 border-dashed border-[#8ACFF8]/80 dark:border-amber-300/60" />
              {state === 'starting' && (
                <div className="absolute inset-0 flex items-center justify-center text-slate-200 dark:text-slate-300 text-xs">Starting camera…</div>
              )}
            </div>
            <p className="text-[10px] text-center text-slate-500 dark:text-slate-400">Center your face in the circle in good lighting.</p>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={cancel}
                className="flex-1 py-1.5 rounded-lg bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 dark:bg-white/[0.04] dark:hover:bg-white/[0.08] dark:border-white/10 dark:text-slate-300 text-xs font-semibold"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={takePhoto}
                disabled={state !== 'live'}
                className="flex-[2] py-1.5 rounded-lg bg-[#0284C7] hover:bg-[#0369A1] text-white dark:bg-gradient-to-r dark:from-amber-400 dark:to-amber-500 dark:hover:from-amber-300 dark:hover:to-amber-400 dark:text-slate-950 text-xs font-bold flex items-center justify-center gap-1.5 disabled:opacity-60"
              >
                <Icon name="photo_camera" className="text-[16px]" />
                <span>Capture</span>
              </button>
            </div>
          </div>
        ) : state === 'captured' && preview ? (
          <div className="w-full flex items-center gap-2.5">
            <img src={preview} alt="Your captured selfie" className="w-8 h-8 rounded-lg object-cover border border-emerald-300 dark:border-emerald-400/40 shrink-0" />
            <div className="flex-1 min-w-0">
              <p className="text-xs font-semibold text-emerald-700 dark:text-emerald-300 flex items-center gap-1 truncate leading-tight">
                <Icon name="check_circle" className="text-[14px]" /> Captured
              </p>
              <p className="text-[10px] text-slate-500 dark:text-slate-400 truncate leading-tight">Admin verified</p>
            </div>
            <button
              type="button"
              onClick={retake}
              disabled={disabled}
              className="px-2 py-1 rounded-lg text-[10px] font-semibold text-[#0369A1] bg-white hover:bg-sky-50 border border-[#8ACFF8] dark:bg-transparent dark:text-amber-300 dark:hover:bg-amber-400/10 dark:border-amber-400/30 disabled:opacity-60 shrink-0"
            >
              Retake
            </button>
          </div>
        ) : (
          <button
            type="button"
            onClick={startCamera}
            disabled={disabled}
            className="w-full flex items-center gap-2.5 text-left disabled:opacity-60"
          >
            <span className="w-8 h-8 rounded-full bg-[#8ACFF8]/25 border border-[#8ACFF8] text-[#0369A1] dark:bg-amber-400/15 dark:border-amber-400/30 dark:text-amber-400 flex items-center justify-center shrink-0">
              <Icon name="photo_camera" className="text-[17px]" />
            </span>
            <span className="min-w-0 flex-1">
              <span className="block text-xs font-bold text-slate-900 dark:text-white truncate leading-tight">Open camera</span>
              <span className="block text-[10px] text-slate-500 dark:text-slate-400 truncate leading-tight">
                Take a selfie
              </span>
            </span>
          </button>
        )}
      </div>
      {showError && <p className="mt-1 text-[11px] text-rose-600 dark:text-red-400">{showError}</p>}
    </div>
  )
}

