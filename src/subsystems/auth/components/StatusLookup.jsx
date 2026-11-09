import { useState } from 'react'
import { checkPublicAccountStatus } from '../api'
import { getErrorMessage } from '../../../lib/api-client'
import { Alert, Icon, inputBase, Spinner, VerificationBadge } from './AuthUI.jsx'

/**
 * Public pre-login account & seller verification status checker.
 * Calls POST /api/v1/auth/check-status with `identifier` (QCU ID or email).
 */
export default function StatusLookup({ initialIdentifier = '' }) {
  const [identifier, setIdentifier] = useState(initialIdentifier)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [result, setResult] = useState(null)

  const handleCheck = async (e) => {
    e.preventDefault()
    if (!identifier.trim()) {
      setError('Enter your QCU ID Number (e.g. 24-0001) or registered email.')
      return
    }
    setLoading(true)
    setError(null)
    setResult(null)
    try {
      const res = await checkPublicAccountStatus(identifier.trim())
      setResult(res.data)
    } catch (err) {
      setError(getErrorMessage(err))
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-4">
      <form onSubmit={handleCheck} className="space-y-3">
        <div>
          <label className="flex items-center gap-1.5 text-sm font-semibold text-slate-200" htmlFor="status-identifier">
            <Icon name="manage_search" className="text-[18px] text-amber-400" />
            <span>QCU ID Number or Email</span>
            <span className="text-amber-400" aria-hidden="true">*</span>
          </label>
          <p className="text-xs text-slate-400 mt-0.5">
            Check whether your QCU ID or seller endorsement has been verified by an administrator.
          </p>
          <div className="relative mt-2">
            <Icon name="badge" className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500 text-[20px] pointer-events-none" />
            <input
              id="status-identifier"
              type="text"
              required
              disabled={loading}
              value={identifier}
              onChange={(e) => setIdentifier(e.target.value)}
              placeholder="e.g. 24-0001 or you@qcu.edu.ph"
              className={`${inputBase} border-white/10 pl-11 pr-4`}
            />
          </div>
        </div>

        {error && <Alert tone="error">{error}</Alert>}

        <button
          type="submit"
          disabled={loading}
          className="w-full py-2.5 rounded-xl font-bold text-sm text-slate-950 bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 shadow-md shadow-amber-500/20 flex items-center justify-center gap-2 disabled:opacity-60"
        >
          {loading ? <Spinner className="text-[18px]" /> : <Icon name="fact_check" className="text-[18px]" />}
          <span>{loading ? 'Checking status…' : 'Check Verification Status'}</span>
        </button>
      </form>

      {result && (
        <div className="rounded-2xl bg-white/[0.03] border border-white/10 p-4 space-y-3 text-sm">
          <div className="flex items-center justify-between gap-2 pb-2.5 border-b border-white/10">
            <div className="min-w-0">
              <p className="font-bold text-white truncate">{result.fullName}</p>
              <p className="text-xs text-slate-400">
                QCU ID: <span className="text-slate-200 font-mono">{result.qcuIdNumber}</span> · Role:{' '}
                <span className="text-amber-300 font-semibold">{result.role}</span>
              </p>
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between gap-2">
              <span className="text-slate-400 text-xs">QCU Identity Verification</span>
              <VerificationBadge status={result.verificationStatus} />
            </div>
            {result.rejectionReason && (
              <p className="text-xs text-red-300 bg-red-500/10 border border-red-400/25 rounded-lg px-3 py-2">
                Reason: {result.rejectionReason}
              </p>
            )}

            {result.sellerVerificationStatus && (
              <>
                <div className="flex items-center justify-between gap-2 pt-1">
                  <span className="text-slate-400 text-xs">Seller Endorsement Status</span>
                  <VerificationBadge status={result.sellerVerificationStatus} />
                </div>
                {result.sellerRejectionReason && (
                  <p className="text-xs text-red-300 bg-red-500/10 border border-red-400/25 rounded-lg px-3 py-2">
                    Seller rejection reason: {result.sellerRejectionReason}
                  </p>
                )}
              </>
            )}
          </div>

          {(result.verificationStatus === 'REJECTED' || result.sellerVerificationStatus === 'REJECTED') && (
            <p className="text-xs text-amber-300 pt-1">
              Sign in and open <strong>Account &amp; Security</strong> to resubmit your verification documents.
            </p>
          )}
        </div>
      )}
    </div>
  )
}

