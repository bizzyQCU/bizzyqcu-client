import { Link, useNavigate } from "react-router-dom";
import Icon from "../../../components/Icon.jsx";
import { orderReference } from "../../../lib/mockData.js";
import { useCart } from "../../../lib/CartContext.jsx";

export default function PaymentFailedPage() {
  const navigate = useNavigate();
  const { selected: items, selectedTotal: total } = useCart();

  return (
    <div className="flex justify-center py-8">
      <div className="flex w-full max-w-[490px] flex-col items-center rounded-2xl border border-slate-100/80 bg-white p-7 text-center shadow-sm md:p-8">
        <div aria-hidden="true" className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-rose-100 text-rose-500">
          <Icon name="alert" className="h-6 w-6" strokeWidth={2.5} />
        </div>
        <div className="mb-4 inline-flex items-center gap-1.5 rounded-full border border-rose-100 bg-rose-50 px-3 py-1 text-xs font-semibold text-rose-600">
          <Icon name="alert" className="h-3.5 w-3.5 shrink-0 text-rose-500" />
          <span>Payment failed (GCash Checkout Timeout / Cancelled)</span>
        </div>
        <h1 className="mb-2 text-xl font-bold tracking-tight text-[#0F172A] md:text-2xl">Payment didn't go through.</h1>
        <p className="mb-6 max-w-sm text-sm text-[#64748B]">No payment was recorded. Your items are still in your cart.</p>

        <div className="mb-4 flex w-full flex-col gap-3">
          <button
            type="button"
            onClick={() => navigate("/payment/pending", { state: { method: "gcash" } })}
            className="flex w-full items-center justify-center gap-2 rounded-full bg-[#0284C7] px-5 py-3 text-sm font-semibold text-white shadow-sm transition-all hover:bg-[#0369A1] active:scale-[0.99]"
          >
            <Icon name="refresh" className="h-4 w-4" strokeWidth={2.5} />
            <span>Try GCash again</span>
          </button>
          <button
            type="button"
            onClick={() => navigate("/payment/confirmed", { state: { method: "cash" } })}
            className="flex w-full items-center justify-center gap-2 rounded-full border-[1.5px] border-[#8ACFF8] bg-white px-5 py-3 text-sm font-semibold text-[#0369A1] transition-all hover:bg-sky-50/50 active:scale-[0.99]"
          >
            <Icon name="cash" className="h-4 w-4" />
            <span>Pay with cash instead</span>
          </button>
        </div>

        <Link to="/marketplace" className="mb-6 text-xs font-semibold text-[#0369A1] underline underline-offset-2 transition-colors hover:text-[#0284C7]">
          Cancel order
        </Link>

        <section aria-label="Order Breakdown" className="w-full rounded-xl border border-slate-100 bg-[#F1F5F9]/60 p-4 text-left">
          <div className="mb-3 flex flex-wrap items-center justify-between gap-2 border-b border-slate-200/60 pb-3">
            <div className="flex items-center gap-1 text-xs font-medium text-[#64748B]">
              <span>Order Reference:</span>
              <span className="font-bold text-[#0F172A]">{orderReference}</span>
            </div>
            <div className="inline-flex items-center gap-1 rounded border border-sky-100 bg-sky-50 px-2 py-0.5 text-[10px] font-semibold text-sky-700">
              <Icon name="pin" className="h-3 w-3 text-sky-500" />
              <span>QCU San Bartolome</span>
            </div>
          </div>
          <div className="mb-3 space-y-2 text-xs">
            <div className="flex items-center justify-between text-[#64748B]">
              <span>Items summary ({items.length} items)</span>
              <span className="font-semibold text-[#0F172A]">₱{total.toFixed(2)}</span>
            </div>
            <div className="flex items-center justify-between text-[#64748B]">
              <span>Campus Delivery</span>
              <span className="font-semibold text-[#0F172A]">Free</span>
            </div>
          </div>
          <div className="mb-2.5 flex items-center justify-between border-t border-slate-200/60 pt-2.5">
            <span className="text-xs font-bold text-[#0F172A]">Total Due</span>
            <span className="text-base font-extrabold text-[#0F172A]">₱{total.toFixed(2)}</span>
          </div>
        </section>
      </div>
    </div>
  );
}
