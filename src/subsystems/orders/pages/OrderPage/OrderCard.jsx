import { useState } from "react";
import { Link } from "react-router-dom";
import { canCancel, canConfirmReceived, canRequestRefund } from "../../../../lib/orderRules.js";

export const toneClass = {
  amber: "border-amber-200 dark:border-amber-900 bg-amber-50 dark:bg-amber-950/30 text-amber-700 dark:text-amber-300",
  sky: "border-sky-200 dark:border-sky-900 bg-sky-50 dark:bg-sky-950/40 text-sky-700",
  emerald: "border-emerald-200 dark:border-emerald-900 bg-emerald-50 dark:bg-emerald-950/30 text-emerald-700 dark:text-emerald-300",
  rose: "border-rose-200 dark:border-rose-900 bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300",
};

export default function OrderCard({ order, rated, onRate }) {
  const [status, setStatus] = useState(order.status);
  const [refundRequested, setRefundRequested] = useState(Boolean(order.refundRequested));
  const live = { ...order, status, refundRequested };
  const shortcut = "rounded-full border px-3 py-1 text-xs font-semibold transition";

  return (
    <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 p-4 shadow-sm">
      <div className="min-w-0">
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-xs font-bold text-slate-900 dark:text-slate-100">#{order.orderNumber}</span>
          <span className={`rounded-full border px-2 py-0.5 text-[10px] font-bold ${toneClass[order.tone]}`}>{status}</span>
        </div>
        <p className="mt-1 text-[11px] text-slate-500 dark:text-slate-400">Seller: <span className="font-semibold text-slate-700 dark:text-slate-200">{order.seller}</span></p>
        <p className="mt-0.5 text-[11px] text-slate-400 dark:text-slate-500">{order.fulfillment}</p>
      </div>
      <div className="text-right">
        <p className="text-base font-bold text-slate-900 dark:text-slate-100">₱{order.total.toFixed(2)}</p>
        <div className="mt-2 flex flex-wrap justify-end gap-2">
          <Link to={`/orders/${order.id}`} className={`${shortcut} border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800`}>
            View details
          </Link>
          {canCancel(live) && (
            <button type="button" onClick={() => setStatus("Cancelled")} className={`${shortcut} border-rose-200 dark:border-rose-900 text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40`}>
              Cancel
            </button>
          )}
          {canConfirmReceived(live) && (
            <button type="button" onClick={() => setStatus("Completed")} className={`${shortcut} border-emerald-300 text-emerald-700 dark:text-emerald-300 hover:bg-emerald-50`}>
              Order received
            </button>
          )}
          {canRequestRefund(live) && (
            <button type="button" onClick={() => setRefundRequested(true)} className={`${shortcut} border-rose-300 text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40`}>
              Request refund
            </button>
          )}
          {refundRequested && <span className="self-center text-[10px] font-semibold text-rose-600 dark:text-rose-400">Refund requested</span>}
          {status === "Completed" && (
            <button
              type="button"
              disabled={rated}
              onClick={() => onRate(order)}
              className={`${shortcut} border-amber-300 text-amber-600 hover:bg-amber-50 disabled:opacity-40`}
            >
              {rated ? "Rated" : "★ Rate seller"}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
