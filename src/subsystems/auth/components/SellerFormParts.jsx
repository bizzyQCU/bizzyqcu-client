import { useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import SellerShowcase from './SellerShowcase.jsx';

export const MAX_FILE_BYTES = 5 * 1024 * 1024; // 5MB
export const ACCEPTED_TYPES = ['image/jpeg', 'image/png', 'application/pdf'];

export const QCU_SECTIONS = [
  'SBIT-1A', 'SBIT-1B', 'SBIT-2A', 'SBIT-2B', 'SBIT-3A', 'SBIT-3B', 'SBIT-4A', 'SBIT-4B',
  'SBCS-1A', 'SBCS-2A', 'SBCS-3A', 'SBCS-4A',
  'SBIS-1A', 'SBIS-2A', 'SBIS-3A', 'SBIS-4A',
  'SBENT-1A', 'SBENT-2A', 'SBENT-3A', 'SBENT-4A',
  'SBA-1A', 'SBA-2A', 'SBA-3A', 'SBA-4A',
  'SBECE-1A', 'SBECE-2A', 'SBECE-3A', 'SBECE-4A',
  'SBIE-1A', 'SBIE-2A', 'SBIE-3A', 'SBIE-4A',
];

export const QCU_PROGRAMS = [
  'BS in Information Technology (BSIT)',
  'BS in Computer Science (BSCS)',
  'BS in Information Systems (BSIS)',
  'BS in Entrepreneurship (BSENT)',
  'BS in Accountancy (BSA)',
  'BS in Management Accounting (BSMA)',
  'BS in Electronics Engineering (BSECE)',
  'BS in Industrial Engineering (BSIE)',
  'Bachelor of Early Childhood Education (BECED)',
];

export const QCU_COLLEGES = [
  'College of Computer Studies (CCS)',
  'College of Business Administration and Accountancy (CBAA)',
  'College of Engineering (COE)',
  'College of Education (COED)',
  'Supreme Student Council / University-Wide',
  'San Bartolome Campus Organization',
  'Batasan Campus Organization',
  'San Francisco Campus Organization',
];

export const sellerInputBase =
  'w-full py-2.5 rounded-xl bg-white/[0.04] border text-white placeholder:text-slate-500 text-sm transition-colors duration-200 hover:border-white/20 focus:outline-none focus:border-amber-400/60 focus:ring-2 focus:ring-amber-400/25 focus:bg-white/[0.07]';

export const fieldBorder = (hasError) => (hasError ? 'border-red-400/70' : 'border-white/10');

export function validateUploadFile(file) {
  if (!file) return 'File is required';
  if (!ACCEPTED_TYPES.includes(file.type)) return 'Only JPG, PNG, or PDF files are allowed';
  if (file.size > MAX_FILE_BYTES) return 'File size must not exceed 5MB';
  return null;
}

export function Icon({ name, className = '' }) {
  return (
    <span className={`material-symbols-outlined ${className}`} aria-hidden="true">
      {name}
    </span>
  );
}

export function SellerInputField({ id, label, icon, error, rightSlot, children }) {
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
  );
}

export function PasswordToggle({ visible, onToggle }) {
  return (
    <button
      type="button"
      aria-label={visible ? 'Hide password' : 'Show password'}
      onClick={onToggle}
      className="absolute right-2.5 top-1/2 -translate-y-1/2 p-1 text-slate-500 hover:text-amber-300"
    >
      <Icon name={visible ? 'visibility' : 'visibility_off'} className="text-[18px]" />
    </button>
  );
}

export function FileDropzone({
  id,
  label,
  prompt = 'or drag and drop your QCU ID here',
  subtext = 'JPG, PNG or PDF (Max 5MB)',
  icon = 'cloud_upload',
  compact = false,
  file,
  error,
  onSelect,
}) {
  const inputRef = useRef(null);
  const [dragging, setDragging] = useState(false);

  return (
    <div>
      <label className="flex items-center gap-1 text-[11px] font-bold tracking-wider uppercase text-slate-300" htmlFor={id}>
        <span>{label}</span>
        <span className="text-amber-400" aria-hidden="true">*</span>
      </label>
      <input
        ref={inputRef}
        id={id}
        type="file"
        accept=".jpg,.jpeg,.png,.pdf"
        onChange={(e) => onSelect(e.target.files?.[0])}
        className="sr-only"
      />
      <div
        role="button"
        tabIndex={0}
        onClick={() => inputRef.current?.click()}
        onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && inputRef.current?.click()}
        onDragOver={(e) => {
          e.preventDefault();
          setDragging(true);
        }}
        onDragLeave={() => setDragging(false)}
        onDrop={(e) => {
          e.preventDefault();
          setDragging(false);
          onSelect(e.dataTransfer.files?.[0]);
        }}
        className={`mt-1.5 rounded-2xl border-2 border-dashed cursor-pointer transition-colors ${
          compact ? 'flex flex-col items-center justify-center text-center p-3' : 'flex items-center justify-center gap-3 px-4 py-3'
        } ${
          error
            ? 'border-red-400/70 bg-red-500/5'
            : dragging
              ? 'border-amber-400 bg-amber-400/10'
              : 'border-amber-400/35 bg-white/[0.03] hover:border-amber-400/60 hover:bg-white/[0.06]'
        }`}
      >
        <span className="w-9 h-9 rounded-full bg-amber-400/15 border border-amber-400/30 flex items-center justify-center text-amber-400 shrink-0">
          <Icon name={file ? 'task_alt' : icon} className="text-[18px]" />
        </span>
        <div className={compact ? 'mt-1.5 min-w-0 max-w-full' : 'text-left min-w-0'}>
          {file ? (
            <>
              <p className="text-xs font-semibold text-white truncate">{file.name}</p>
              <p className="text-[10px] text-amber-300">
                {(file.size / 1024 / 1024).toFixed(2)} MB · Click to replace
              </p>
            </>
          ) : (
            <>
              <p className="text-xs text-slate-300">
                <span className="font-bold text-amber-300">Click to upload</span> {prompt}
              </p>
              <p className="text-[10px] text-slate-500">{subtext}</p>
            </>
          )}
        </div>
      </div>
      {error && <p className="mt-1 text-[11px] text-red-400">{error}</p>}
    </div>
  );
}

export function BiometricScannerBox({ subtitle = 'Camera scan required', scanState, error, onScan }) {
  return (
    <div>
      <span className="flex items-center gap-1 text-[11px] font-bold tracking-wider uppercase text-slate-300">
        <span>Live Biometric Verification</span>
        <span className="text-amber-400" aria-hidden="true">*</span>
      </span>
      <div
        className={`mt-1.5 flex items-center justify-between gap-3 px-3.5 py-2.5 rounded-2xl border bg-white/[0.03] ${
          error ? 'border-red-400/70' : scanState === 'done' ? 'border-emerald-400/40' : 'border-white/10'
        }`}
      >
        <div className="flex items-center gap-3 min-w-0">
          <span
            className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 border ${
              scanState === 'done'
                ? 'bg-emerald-500/15 border-emerald-400/30 text-emerald-400'
                : 'bg-amber-400/15 border-amber-400/30 text-amber-400'
            }`}
          >
            <Icon
              name={scanState === 'done' ? 'verified' : scanState === 'scanning' ? 'progress_activity' : 'face'}
              className={`text-[18px] ${scanState === 'scanning' ? 'animate-spin' : ''}`}
            />
          </span>
          <div className="min-w-0">
            <p className="text-xs font-bold text-white">Facial Liveness Check</p>
            <p className="text-[11px] text-slate-400 truncate">
              {scanState === 'done'
                ? 'Liveness confirmed via QCU Biometrics'
                : scanState === 'scanning'
                  ? 'Scanning facial landmarks...'
                  : subtitle}
            </p>
          </div>
        </div>
        <button
          type="button"
          disabled={scanState === 'scanning'}
          onClick={onScan}
          className={`shrink-0 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-extrabold transition-all active:scale-[0.98] ${
            scanState === 'done'
              ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-400/40'
              : 'bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 text-slate-950 shadow-sm shadow-amber-500/25'
          }`}
        >
          <Icon name={scanState === 'done' ? 'check_circle' : 'photo_camera'} className="text-[15px]" />
          <span>{scanState === 'done' ? 'Scanned' : scanState === 'scanning' ? 'Scanning...' : 'Face Scanner'}</span>
        </button>
      </div>
      {error && <p className="mt-1 text-[11px] text-red-400">{error}</p>}
    </div>
  );
}

export function SellerFormShell({
  portalKey,
  badge,
  titlePrefix,
  titleHighlight,
  titleSuffix = '',
  status,
  formError,
  onSubmit,
  children,
}) {
  const navigate = useNavigate();

  if (status === 'done') {
    return (
      <main className="flex-grow w-full max-w-6xl mx-auto px-4 sm:px-6 pt-20 pb-4 lg:py-4 grid lg:grid-cols-2 gap-8 lg:gap-12 items-center">
        <SellerShowcase badge={badge} />
        <section className="w-full max-w-[460px] mx-auto lg:mx-0 lg:justify-self-end">
          <div className="relative overflow-hidden rounded-3xl bg-slate-900/70 backdrop-blur-xl border border-white/10 shadow-modal ring-1 ring-inset ring-white/5 p-8 text-center space-y-4">
            <div className="mx-auto w-14 h-14 rounded-2xl bg-emerald-500/15 border border-emerald-400/30 flex items-center justify-center text-emerald-400">
              <Icon name="check_circle" className="text-3xl" />
            </div>
            <h1 className="text-2xl font-extrabold text-white">Seller Registration Submitted</h1>
            <p className="text-sm text-slate-300 leading-relaxed">
              Your seller application, QCU credentials, and biometric verification are pending administrator review.
            </p>
            <Link
              to={`/seller-login-form?type=${portalKey}`}
              className="inline-flex items-center justify-center w-full py-3 rounded-xl font-extrabold text-slate-950 bg-gradient-to-r from-amber-400 via-amber-500 to-amber-600 hover:from-amber-300 hover:to-amber-500 shadow-lg shadow-amber-500/25 transition-all"
            >
              <span>Proceed to Seller Log In</span>
            </Link>
          </div>
        </section>
      </main>
    );
  }

  return (
    <main className="flex-grow w-full max-w-6xl mx-auto px-4 sm:px-6 pt-20 pb-4 lg:py-4 grid lg:grid-cols-2 gap-8 lg:gap-12 items-center">
      <SellerShowcase badge={badge} />

      <section className="w-full max-w-[550px] mx-auto lg:mx-0 lg:justify-self-end">
        <div className="relative overflow-hidden rounded-3xl bg-slate-900/70 backdrop-blur-xl border border-amber-400/20 shadow-modal ring-1 ring-inset ring-white/5 p-6 sm:p-7">
          {/* Decorative glow & top hairline */}
          <div aria-hidden="true" className="pointer-events-none absolute -top-24 -right-24 w-64 h-64 rounded-full bg-amber-500/15 blur-3xl" />
          <div aria-hidden="true" className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-amber-400/70 to-transparent" />

          {/* Close button */}
          <button
            type="button"
            onClick={() => navigate('/seller-signup')}
            aria-label="Back to seller portals"
            className="absolute top-4 right-4 z-10 w-8 h-8 rounded-full bg-white/[0.06] hover:bg-white/[0.12] border border-white/10 flex items-center justify-center text-slate-400 hover:text-white transition-colors"
          >
            <Icon name="close" className="text-[18px]" />
          </button>

          <div className="relative">
            {/* Header */}
            <div className="text-center mb-4 px-5">
              <div className="flex items-center justify-center gap-1.5 flex-wrap">
                <Icon name="auto_awesome" className="text-amber-400 text-[18px]" />
                <h1 className="text-lg sm:text-xl font-extrabold tracking-tight text-white">
                  {titlePrefix}{' '}
                  <span className="text-amber-400">{titleHighlight}</span>
                  {titleSuffix && ` ${titleSuffix}`}
                </h1>
                <Icon name="auto_awesome" className="text-amber-400 text-[18px]" />
              </div>
              <p className="text-xs text-slate-400 mt-1">
                Start selling on BizzyQCU and grow your business while serving the QCU community!
              </p>
            </div>

            <form className="space-y-3" onSubmit={onSubmit} noValidate>
              {formError && (
                <div role="alert" className="p-2.5 rounded-xl bg-red-500/10 border border-red-400/30 text-xs text-red-300">
                  {formError}
                </div>
              )}

              {children}

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
            <div className="mt-3.5 pt-3 border-t border-white/10 text-center">
              <p className="text-xs sm:text-sm text-slate-400">
                Already have an account?{' '}
                <Link
                  className="text-amber-300 font-bold hover:text-amber-200 hover:underline"
                  to={`/seller-login-form?type=${portalKey}`}
                >
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
            <span>Official QCU Seller Portal</span>
          </div>
          <span className="w-1 h-1 rounded-full bg-slate-500" aria-hidden="true" />
          <div className="flex items-center gap-1.5">
            <Icon name="local_police" className="text-amber-400 text-[16px]" />
            <span>Biometric Protected</span>
          </div>
        </div>
      </section>
    </main>
  );
}

