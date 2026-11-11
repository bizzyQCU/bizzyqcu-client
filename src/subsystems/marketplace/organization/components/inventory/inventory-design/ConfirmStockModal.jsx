import { useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { StockLevelBadge } from './StatusBadge';
import { getCategoryStyle } from './categoryStyles';
import { AlertTriangleIcon, ArrowRightIcon, SpinnerIcon, XIcon } from './icons';
import { STOCK_STATUS, getStockStatus } from '../inventory-functions/inventoryUtils';

export default function ConfirmStockModal({ open, product, proposedStock, saving, error, onCancel, onConfirm }) {
  const confirmRef = useRef(null);

  useEffect(() => {
    if (!open) return undefined;
    const onKey = (e) => { if (e.key === 'Escape' && !saving) onCancel(); };
    document.addEventListener('keydown', onKey);
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    confirmRef.current?.focus();
    return () => { document.removeEventListener('keydown', onKey); document.body.style.overflow = prevOverflow; };
  }, [open, saving, onCancel]);

  if (!open || !product) return null;

  const current = product.stock;
  const diff = proposedStock - current;
  const currentLevel = getStockStatus(current);
  const nextLevel = getStockStatus(proposedStock);
  const { Icon, tile, icon } = getCategoryStyle(product.category);

  return createPortal(
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="inv-backdrop-enter absolute inset-0 bg-slate-900/45 backdrop-blur-[2px]" onClick={() => !saving && onCancel()} aria-hidden="true" />
      <div role="dialog" aria-modal="true" aria-labelledby="confirm-stock-title" className="inv-modal-enter relative w-full max-w-[420px] rounded-2xl bg-white shadow-2xl shadow-slate-900/20">
        <div className="flex items-start justify-between px-5 pb-1 pt-5">
          <div>
            <h2 id="confirm-stock-title" className="text-[15px] font-semibold text-slate-900">Confirm stock update</h2>
            <p className="mt-0.5 text-[12px] text-slate-500">Review the change before saving it to your inventory.</p>
          </div>
          <button type="button" onClick={onCancel} disabled={saving} aria-label="Close"
            className="-mr-1 rounded-md p-1 text-slate-400 transition hover:bg-slate-100 hover:text-slate-600 disabled:opacity-50">
            <XIcon className="h-4 w-4" />
          </button>
        </div>
        <div className="px-5 py-4">
          <div className="flex items-center gap-3 rounded-xl border border-slate-200 bg-slate-50 p-3">
            <span className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border ${tile}`}>
              <Icon className={`h-[18px] w-[18px] ${icon}`} strokeWidth={1.75} />
            </span>
            <div className="min-w-0">
              <p className="truncate text-[13px] font-medium text-slate-900">{product.name}</p>
              <p className="font-mono text-[10.5px] text-slate-500">{product.sku}</p>
            </div>
          </div>
          <div className="mt-4 grid grid-cols-[1fr_auto_1fr] items-stretch gap-2">
            <StockBox label="Current stock"  value={current}       level={currentLevel} />
            <div className="flex flex-col items-center justify-center gap-1">
              <ArrowRightIcon className="h-4 w-4 text-slate-400" />
              <span className={`rounded-full px-1.5 py-px text-[10.5px] font-semibold tabular-nums ${diff > 0 ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-600'}`}>
                {diff > 0 ? `+${diff}` : diff}
              </span>
            </div>
            <StockBox label="Proposed stock" value={proposedStock} level={nextLevel} highlight />
          </div>
          {nextLevel === STOCK_STATUS.OUT && (
            <Notice tone="red">This product will be marked <strong>Out of Stock</strong> and buyers won't be able to order it.</Notice>
          )}
          {nextLevel === STOCK_STATUS.LOW && currentLevel !== STOCK_STATUS.LOW && (
            <Notice tone="amber">This product will be flagged as <strong>Low Stock</strong> (1–5 units left).</Notice>
          )}
          {error && <Notice tone="red">{error}</Notice>}
        </div>
        <div className="flex justify-end gap-2 border-t border-slate-100 px-5 py-3.5">
          <button type="button" onClick={onCancel} disabled={saving}
            className="h-9 rounded-lg border border-slate-200 bg-white px-4 text-[12.5px] font-medium text-slate-700 transition hover:bg-slate-50 disabled:opacity-60">
            Cancel
          </button>
          <button ref={confirmRef} type="button" onClick={onConfirm} disabled={saving}
            className="flex h-9 min-w-[118px] items-center justify-center gap-2 rounded-lg bg-[#1a6fb5] px-4 text-[12.5px] font-medium text-white transition hover:bg-[#155d98] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#1a6fb5]/40 focus-visible:ring-offset-2 disabled:opacity-80">
            {saving ? <><SpinnerIcon className="h-3.5 w-3.5" /> Saving…</> : 'Save changes'}
          </button>
        </div>
      </div>
    </div>,
    document.body,
  );
}

function StockBox({ label, value, level, highlight = false }) {
  return (
    <div className={`flex flex-col items-center gap-1.5 rounded-xl border px-3 py-3 text-center ${highlight ? 'border-[#1a6fb5]/40 bg-blue-50/60' : 'border-slate-200 bg-white'}`}>
      <span className="text-[10.5px] font-semibold uppercase tracking-wide text-slate-500">{label}</span>
      <span className={`text-2xl font-bold leading-none tabular-nums ${value === 0 ? 'text-red-600' : 'text-slate-900'}`}>{value}</span>
      <StockLevelBadge status={level} />
    </div>
  );
}

function Notice({ tone, children }) {
  const cls = tone === 'red' ? 'border-red-200 bg-red-50 text-red-700' : 'border-amber-200 bg-amber-50 text-amber-800';
  return (
    <div className={`mt-3 flex items-start gap-2 rounded-lg border px-3 py-2 text-[11.5px] ${cls}`}>
      <AlertTriangleIcon className="mt-px h-3.5 w-3.5 shrink-0" />
      <p>{children}</p>
    </div>
  );
}
