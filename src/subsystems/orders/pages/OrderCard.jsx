import { useState } from "react";
import { Link } from "react-router-dom";
import { canCancel, canConfirmReceived, canRequestRefund } from "../../../lib/orderRules.js";

export const toneClass = {
  amber: "border-amber-200 bg-amber-50 text-amber-700",
  sky: "border-sky-200 bg-sky-50 text-sky-700",
  emerald: "border-emerald-200 bg-emerald-50 text-emerald-700",
  rose: "border-rose-200 bg-rose-50 text-rose-700",
};

export default function OrderCard({ order, rated, onRate }) {
  const [status, setStatus] = useState(order.status);
  const [refundRequested, setRefundRequested] = useState(Boolean(order.refundRequested));
  const live = { ...order, status, refundRequested };
  const shortcut = "rounded-full border px-3 py-1 text-xs font-semibold transition";

  return (
    <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-slate-100 bg-white p-4 shadow-sm">
      <div className="min-w-0">
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-xs font-bold text-slate-900">#BZ-2024-{order.id}</span>
          <span className={`rounded-full border px-2 py-0.5 text-[10px] font-bold ${toneClass[order.tone]}`}>{status}</span>
        </div>
        <p className="mt-1 text-[11px] text-slate-500">Seller: <span className="font-semibold text-slate-700">{order.seller}</span></p>
        <p className="mt-0.5 text-[11px] text-slate-400">{order.fulfillment}</p>
      </div>
      <div className="text-right">
        <p className="text-base font-bold text-slate-900">₱{order.total.toFixed(2)}</p>
        <div className="mt-2 flex flex-wrap justify-end gap-2">
          <Link to={`/orders/${order.id}`} className={`${shortcut} border-slate-200 text-slate-600 hover:bg-slate-50`}>
            View details
          </Link>
          {canCancel(live) && (
            <button type="button" onClick={() => setStatus("Cancelled")} className={`${shortcut} border-rose-200 text-rose-600 hover:bg-rose-50`}>
              Cancel
            </button>
          )}
          {canConfirmReceived(live) && (
            <button type="button" onClick={() => setStatus("Completed")} className={`${shortcut} border-emerald-300 text-emerald-700 hover:bg-emerald-50`}>
              Order received
            </button>
          )}
          {canRequestRefund(live) && (
            <button type="button" onClick={() => setRefundRequested(true)} className={`${shortcut} border-rose-300 text-rose-600 hover:bg-rose-50`}>
              Request refund
            </button>
          )}
          {refundRequested && <span className="self-center text-[10px] font-semibold text-rose-600">Refund requested</span>}
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
