import { Link } from "react-router-dom";

export const toneClass = {
  amber: "border-amber-200 bg-amber-50 text-amber-700",
  sky: "border-sky-200 bg-sky-50 text-sky-700",
  emerald: "border-emerald-200 bg-emerald-50 text-emerald-700",
  rose: "border-rose-200 bg-rose-50 text-rose-700",
};

export default function OrderCard({ order, rated, onRate }) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-slate-100 bg-white p-4 shadow-sm">
      <div className="min-w-0">
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-xs font-bold text-slate-900">#BZ-2024-{order.id}</span>
          <span className={`rounded-full border px-2 py-0.5 text-[10px] font-bold ${toneClass[order.tone]}`}>{order.status}</span>
        </div>
        <p className="mt-1 text-[11px] text-slate-500">Seller: <span className="font-semibold text-slate-700">{order.seller}</span></p>
        <p className="mt-0.5 text-[11px] text-slate-400">{order.fulfillment}</p>
      </div>
      <div className="text-right">
        <p className="text-base font-bold text-slate-900">₱{order.total.toFixed(2)}</p>
        <div className="mt-2 flex justify-end gap-2">
          <Link to={`/orders/${order.id}`} className="rounded-full border border-slate-200 px-3 py-1 text-xs font-semibold text-slate-600 transition hover:bg-slate-50">
            View details
          </Link>
          {order.status === "Completed" && (
            <button
              type="button"
              disabled={rated}
              onClick={() => onRate(order)}
              className="rounded-full border border-amber-300 px-3 py-1 text-xs font-semibold text-amber-600 transition hover:bg-amber-50 disabled:opacity-40"
            >
              {rated ? "Rated" : "★ Rate seller"}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
