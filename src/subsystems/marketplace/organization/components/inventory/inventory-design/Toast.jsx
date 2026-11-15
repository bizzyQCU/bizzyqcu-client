import { useEffect } from 'react';
import { CircleCheckIcon, CircleXIcon, XIcon } from './icons';

/** Lightweight bottom-right toast. `toast` = { type: 'success' | 'error', message } | null */
export default function Toast({ toast, onClose, duration = 3200 }) {
  useEffect(() => {
    if (!toast) return undefined;
    const t = setTimeout(onClose, duration);
    return () => clearTimeout(t);
  }, [toast, onClose, duration]);

  if (!toast) return null;
  const success = toast.type === 'success';

  return (
    <div className="pointer-events-none fixed bottom-5 right-5 z-[60]" role="status" aria-live="polite">
      <div className="inv-toast-enter pointer-events-auto flex items-center gap-2.5 rounded-xl border border-slate-200 bg-white py-2.5 pl-3 pr-2 shadow-lg shadow-slate-900/10">
        {success
          ? <CircleCheckIcon className="h-4 w-4 text-green-600" />
          : <CircleXIcon className="h-4 w-4 text-red-600" />}
        <p className="text-[12.5px] text-slate-800">{toast.message}</p>
        <button type="button" onClick={onClose} aria-label="Dismiss" className="rounded p-1 text-slate-400 hover:bg-slate-100">
          <XIcon className="h-3.5 w-3.5" />
        </button>
      </div>
    </div>
  );
}
