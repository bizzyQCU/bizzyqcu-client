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
    <div>
      <p id={`${id}-label`} className="flex items-center gap-1 text-[11px] font-bold tracking-wider uppercase text-slate-300">
        <span>{label}</span>
        <span className="text-amber-400" aria-hidden="true">*</span>
      </p>
      <div
        aria-labelledby={`${id}-label`}
        className={`mt-1.5 rounded-2xl border p-3 ${showError ? 'border-red-400/70 bg-red-500/5' : 'border-white/10 bg-white/[0.03]'}`}
      >
        {state === 'live' || state === 'starting' ? (
          <div className="space-y-3">
            <div className="relative mx-auto w-full max-w-[240px] aspect-square rounded-2xl overflow-hidden bg-black border border-amber-400/30">
              <video ref={videoRef} playsInline muted className="w-full h-full object-cover -scale-x-100" />
              <div aria-hidden="true" className="pointer-events-none absolute inset-6 rounded-full border-2 border-dashed border-amber-300/60" />
              {state === 'starting' && (
                <div className="absolute inset-0 flex items-center justify-center text-slate-300 text-xs">Starting camera…</div>
              )}
            </div>
            <p className="text-[11px] text-center text-slate-400">Center your face in the circle, in good lighting, without sunglasses or a mask.</p>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={cancel}
                className="flex-1 py-2 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] border border-white/10 text-slate-300 text-sm font-semibold"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={takePhoto}
                disabled={state !== 'live'}
                className="flex-[2] py-2 rounded-xl bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 text-slate-950 text-sm font-bold flex items-center justify-center gap-1.5 disabled:opacity-60"
              >
                <Icon name="photo_camera" className="text-[18px]" />
                <span>Capture</span>
              </button>
            </div>
          </div>
        ) : state === 'captured' && preview ? (
          <div className="flex items-center gap-3">
            <img src={preview} alt="Your captured selfie" className="w-16 h-16 rounded-xl object-cover border border-emerald-400/40" />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-emerald-300 flex items-center gap-1">
                <Icon name="check_circle" className="text-[16px]" /> Selfie captured
              </p>
              <p className="text-[11px] text-slate-400">Reviewed only by BizzyQCU administrators.</p>
            </div>
            <button
              type="button"
              onClick={retake}
              disabled={disabled}
              className="px-3 py-1.5 rounded-lg text-xs font-semibold text-amber-300 hover:bg-amber-400/10 border border-amber-400/30 disabled:opacity-60"
            >
              Retake
            </button>
          </div>
        ) : (
          <button
            type="button"
            onClick={startCamera}
            disabled={disabled}
            className="w-full flex items-center gap-3 text-left disabled:opacity-60"
          >
            <span className="w-12 h-12 rounded-full bg-amber-400/15 border border-amber-400/30 flex items-center justify-center text-amber-400 shrink-0">
              <Icon name="face" className="text-[24px]" />
            </span>
            <span className="min-w-0">
              <span className="block text-sm font-bold text-white">Open camera</span>
              <span className="block text-[11px] text-slate-400">
                Take a live photo so admins can match you with your QCU ID.
              </span>
            </span>
          </button>
        )}
      </div>
      {showError && <p className="mt-1 text-[11px] text-red-400">{showError}</p>}
    </div>
  )
}

