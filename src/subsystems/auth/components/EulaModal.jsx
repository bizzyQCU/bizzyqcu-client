import { useEffect } from 'react'
import { Icon } from './AuthUI.jsx'

const EULA_SECTIONS = [
  {
    title: '1. Account Registration',
    paragraphs: [
      "Users must provide accurate and truthful information when creating an account. BizzyQCU may require QCU identification, verification information, or other documents to confirm a user's identity and eligibility.",
      'Users are responsible for keeping their account and login credentials secure.',
    ],
  },
  {
    title: '2. Account Verification',
    paragraphs: [
      'BizzyQCU may use identity verification methods, including QCU ID verification and live selfie verification.',
      "For passkey/WebAuthn authentication, biometric information and device PINs remain on the user's device. BizzyQCU only stores the authentication information necessary to recognize an authorized passkey or device.",
    ],
  },
  {
    title: '3. Buyer and Seller Responsibilities',
    paragraphs: [
      'Buyers must provide accurate information and place orders responsibly.',
      'Sellers must provide truthful product descriptions, prices, availability, and other relevant information. Sellers are responsible for fulfilling their accepted orders and ensuring that their products comply with BizzyQCU and applicable QCU rules.',
    ],
  },
  {
    title: '4. Payments and Transactions',
    paragraphs: [
      'BizzyQCU may use third-party payment providers such as PayMongo to process payments and seller payouts.',
      'Users must not use fraudulent, stolen, or unauthorized payment information. Payment transactions may also be subject to the terms and policies of the applicable payment provider.',
    ],
  },
  {
    title: '5. Prohibited Activities',
    lead: 'Users must not:',
    bullets: [
      'Provide false or misleading information;',
      'Impersonate another person;',
      'Create fraudulent accounts or transactions;',
      'Sell prohibited or unlawful products;',
      'Harass or abuse other users;',
      'Attempt unauthorized access to BizzyQCU;',
      'Upload malicious software or harmful content; or',
      "Violate another person's intellectual property or privacy rights.",
    ],
    afterBullets:
      'Violations may result in the removal of listings, cancellation of transactions, suspension, or termination of an account.',
  },
  {
    title: '6. Privacy',
    paragraphs: [
      'BizzyQCU may collect and process information necessary for account verification, transactions, security, and platform operations.',
      'Personal information will be handled according to the BizzyQCU Privacy Policy and applicable Philippine laws, including the Data Privacy Act of 2012 (Republic Act No. 10173).',
    ],
  },
  {
    title: '7. Platform Availability',
    paragraphs: [
      'BizzyQCU may occasionally be unavailable due to maintenance, updates, technical issues, or third-party service interruptions.',
      'BizzyQCU does not guarantee that the platform will always be available or error-free.',
    ],
  },
  {
    title: '8. Changes and Termination',
    paragraphs: [
      'BizzyQCU may update this EULA when necessary. Users may also have their accounts restricted, suspended, or terminated for violating this Agreement, platform policies, or applicable laws.',
    ],
  },
  {
    title: '9. Acceptance',
    lead: 'By checking “I Agree” or creating an account, you confirm that:',
    bullets: [
      'You have read and understood this EULA;',
      'The information you provide is accurate;',
      "You agree to follow BizzyQCU's rules and policies; and",
      'You agree to use BizzyQCU responsibly and lawfully.',
    ],
  },
]

function renderFormattedText(text) {
  if (text.includes('PayMongo')) {
    const parts = text.split('PayMongo')
    return (
      <>
        {parts[0]}
        <strong className="font-semibold text-slate-900 dark:text-white">PayMongo</strong>
        {parts[1]}
      </>
    )
  }
  if (text.includes('BizzyQCU Privacy Policy')) {
    const [beforePolicy, rest] = text.split('BizzyQCU Privacy Policy')
    const [middle, afterRa] = rest.split('Data Privacy Act of 2012 (Republic Act No. 10173)')
    return (
      <>
        {beforePolicy}
        <strong className="font-semibold text-slate-900 dark:text-white">BizzyQCU Privacy Policy</strong>
        {middle}
        <strong className="font-semibold text-slate-900 dark:text-white">Data Privacy Act of 2012 (Republic Act No. 10173)</strong>
        {afterRa}
      </>
    )
  }
  if (text.includes('“I Agree”')) {
    const parts = text.split('“I Agree”')
    return (
      <>
        {parts[0]}
        <strong className="font-semibold text-slate-900 dark:text-white">“I Agree”</strong>
        {parts[1]}
      </>
    )
  }
  return text
}

/**
 * End-User License Agreement (EULA) modal displayed before account creation.
 */
export function EulaModal({ open, accepted, onToggle, onClose }) {
  useEffect(() => {
    if (!open) return undefined
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [open, onClose])

  if (!open) return null

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="eula-modal-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-slate-900/50 dark:bg-slate-950/75 backdrop-blur-sm modal-overlay"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) onClose()
      }}
    >
      <div className="relative w-full max-w-2xl max-h-[min(680px,calc(100vh-48px))] flex flex-col overflow-hidden rounded-3xl bg-white dark:bg-slate-900/95 border border-slate-200 dark:border-white/15 shadow-[0_20px_50px_-12px_rgba(2,132,199,0.22)] dark:shadow-modal ring-1 ring-inset ring-white dark:ring-white/10 modal-spring">
        <div
          aria-hidden="true"
          className="h-[3px] dark:h-px shrink-0 bg-gradient-to-r from-[#8ACFF8] via-[#0284C7] to-[#FFD444] dark:from-transparent dark:via-amber-400/70 dark:to-transparent"
        />

        {/* Modal Header */}
        <div className="shrink-0 flex items-start justify-between gap-4 border-b border-slate-200 dark:border-white/10 px-6 py-4 sm:px-7">
          <div>
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full bg-[#F4EB6C]/45 border border-[#FFD444] text-slate-900 dark:bg-amber-400/15 dark:border-amber-400/35 dark:text-amber-300 text-[10px] font-extrabold tracking-wider uppercase">
              BIZZYQCU
            </span>
            <h2 id="eula-modal-title" className="mt-1.5 text-lg sm:text-xl font-extrabold tracking-tight text-slate-900 dark:text-white">
              END-USER LICENSE AGREEMENT (EULA)
            </h2>
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label="Close EULA"
            className="w-8 h-8 rounded-full bg-slate-100 hover:bg-sky-50 border border-slate-200 hover:border-[#8ACFF8] text-slate-500 hover:text-[#0369A1] dark:bg-white/[0.06] dark:hover:bg-white/[0.12] dark:border-white/10 dark:hover:border-white/20 dark:text-slate-400 dark:hover:text-white flex items-center justify-center transition-colors shrink-0"
          >
            <Icon name="close" className="text-[18px]" />
          </button>
        </div>

        {/* Scrollable Body */}
        <div className="flex-1 min-h-0 overflow-y-auto overscroll-contain px-6 py-5 sm:px-7 auth-card-scroll space-y-4 text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
          <p>
            Welcome to <strong className="font-semibold text-slate-900 dark:text-white">BizzyQCU</strong>, an online marketplace designed for the Quezon City University (QCU) community. This End-User License Agreement (“EULA”) explains the rules and responsibilities for using BizzyQCU.
          </p>
          <p>
            By creating an account or using BizzyQCU, you confirm that you have read, understood, and agreed to this EULA. If you do not agree, please do not use the platform.
          </p>

          {EULA_SECTIONS.map((section) => (
            <section key={section.title} className="space-y-2">
              <h3 className="text-sm sm:text-base font-bold text-slate-900 dark:text-white">{section.title}</h3>
              {section.paragraphs?.map((p) => (
                <p key={p}>{renderFormattedText(p)}</p>
              ))}
              {section.lead && <p>{renderFormattedText(section.lead)}</p>}
              {section.bullets && (
                <ul className="list-disc pl-5 space-y-1">
                  {section.bullets.map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
              )}
              {section.afterBullets && <p>{section.afterBullets}</p>}
            </section>
          ))}

          <div className="pt-3 border-t border-slate-200 dark:border-white/10 text-center">
            <p className="font-bold text-slate-900 dark:text-white">BizzyQCU</p>
            <p className="italic text-slate-500 dark:text-slate-400 text-xs">Made by Students. Loved on Campus.</p>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="shrink-0 border-t border-slate-200 dark:border-white/10 bg-[#F8FAFC] dark:bg-white/[0.03] px-6 py-4 sm:px-7 space-y-3">
          <label className="flex items-start gap-2.5 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={accepted}
              onChange={(e) => onToggle(e.target.checked)}
              className="mt-0.5 w-4 h-4 rounded bg-white dark:bg-white/5 border-slate-300 dark:border-white/25 text-[#0284C7] dark:text-amber-500 focus:ring-[#8ACFF8] dark:focus:ring-amber-400 focus:ring-offset-white dark:focus:ring-offset-slate-900"
            />
            <span className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white">
              I have read and agree to the BizzyQCU End-User License Agreement.
            </span>
          </label>

          <div className="flex flex-col-reverse sm:flex-row sm:justify-end gap-2.5">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl bg-white hover:bg-sky-50 border-[1.5px] dark:border border-[#8ACFF8] hover:border-[#0284C7] text-[#0369A1] dark:bg-white/[0.05] dark:hover:bg-white/[0.1] dark:border-white/15 dark:hover:border-amber-400/40 dark:text-slate-200 text-sm font-semibold transition-all active:scale-[0.98]"
            >
              Close
            </button>
            <button
              type="button"
              disabled={!accepted}
              onClick={onClose}
              className="px-5 py-2.5 rounded-xl font-extrabold text-sm text-white dark:text-slate-950 bg-[#0284C7] hover:bg-[#0369A1] dark:bg-gradient-to-r dark:from-amber-400 dark:via-amber-500 dark:to-amber-600 dark:hover:from-amber-300 dark:hover:via-amber-400 dark:hover:to-amber-500 shadow-[0_8px_20px_-6px_rgba(2,132,199,0.45)] dark:shadow-lg dark:shadow-amber-500/25 transition-all active:scale-[0.98] disabled:opacity-60 disabled:cursor-not-allowed"
            >
              I Agree &amp; Continue
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

/**
 * Inline signup form EULA consent row linking to the EULA modal.
 */
export function EulaConsentField({ id = 'eula-consent', accepted, error, disabled = false, onToggle, onOpenModal }) {
  return (
    <div>
      <div
        className={`rounded-2xl border p-3.5 transition-colors ${
          error
            ? 'border-rose-400 bg-rose-50 dark:border-red-400/70 dark:bg-red-500/5'
            : accepted
              ? 'border-[#8ACFF8] bg-sky-50/50 dark:border-amber-400/45 dark:bg-amber-400/10'
              : 'border-slate-200 bg-[#F8FAFC] dark:border-white/10 dark:bg-white/[0.02]'
        }`}
      >
        <label htmlFor={id} className="flex items-start gap-2.5 cursor-pointer select-none">
          <input
            id={id}
            type="checkbox"
            checked={accepted}
            disabled={disabled}
            onChange={(e) => {
              if (!accepted && e.target.checked) {
                onOpenModal()
              } else {
                onToggle(e.target.checked)
              }
            }}
            className="mt-0.5 w-4 h-4 rounded bg-white dark:bg-white/5 border-slate-300 dark:border-white/20 text-[#0284C7] dark:text-amber-500 focus:ring-[#8ACFF8] dark:focus:ring-amber-400 focus:ring-offset-white dark:focus:ring-offset-slate-900"
          />
          <span className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
            I have read and agree to the{' '}
            <button
              type="button"
              disabled={disabled}
              onClick={onOpenModal}
              className="text-[#0369A1] hover:text-[#0284C7] dark:text-amber-300 dark:hover:text-amber-200 font-bold underline disabled:opacity-60"
            >
              BizzyQCU End-User License Agreement (EULA)
            </button>
            <span className="text-[#0284C7] dark:text-amber-400 font-bold ml-0.5" aria-hidden="true">*</span>
          </span>
        </label>
      </div>
      {error && <p className="mt-1.5 text-[11px] text-rose-600 dark:text-red-400">{error}</p>}
    </div>
  )
}
