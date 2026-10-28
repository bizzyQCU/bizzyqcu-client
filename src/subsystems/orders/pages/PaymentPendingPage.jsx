import { useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import Icon from "../../../components/Icon.jsx";
import { orderReference } from "../../../lib/mockData.js";
import { useCart } from "../../../lib/CartContext.jsx";

export default function PaymentPendingPage() {
  const navigate = useNavigate();
  const { state } = useLocation();
  const method = state?.method ?? "gcash";
  const { selected: items, selectedTotal: total } = useCart();

  // Simulates the PayMongo webhook confirming the payment.
  useEffect(() => {
    const t = setTimeout(() => navigate("/payment/confirmed", { state: { method } }), 4000);
    return () => clearTimeout(t);
  }, [navigate, method]);

  return (
    <div className="flex min-h-[70vh] items-center justify-center py-8">
      <section className="flex w-full max-w-[500px] flex-col items-center rounded-2xl border border-slate-200/90 bg-white p-8 text-center shadow-[0_4px_25px_-5px_rgba(0,0,0,0.04)] sm:p-10">
        <div className="mb-8 inline-flex items-center gap-1.5 rounded-full border border-sky-100 bg-sky-50 px-3 py-1 text-[11px] font-medium tracking-tight text-sky-600">
          <Icon name="clock" className="h-3 w-3 text-sky-500" />
          <span>Payment pending</span>
        </div>

        <div className="relative mb-7 flex h-24 w-24 items-center justify-center">
          <svg className="h-full w-full -rotate-90" viewBox="0 0 100 100">
            <circle cx="50" cy="50" r="42" fill="none" stroke="#E0F2FE" strokeWidth="5" />
            <circle className="origin-center animate-spin" cx="50" cy="50" r="42" fill="none" stroke="#0284C7" strokeDasharray="264" strokeDashoffset="180" strokeLinecap="round" strokeWidth="5" />
          </svg>
          <div className="absolute inset-0 flex items-center justify-center text-sky-600">
            <Icon name="wallet" className="h-7 w-7" strokeWidth={1.8} />
          </div>
        </div>

        <h1 className="mb-2 text-xl font-bold tracking-tight text-slate-900 sm:text-[22px]">Waiting for GCash payment.</h1>
        <p className="mx-auto mb-7 max-w-[320px] text-xs leading-relaxed text-slate-400 sm:text-[13px]">
          Complete the payment in GCash. This screen updates automatically.
        </p>

        <div className="mb-7 w-full rounded-xl border border-slate-100/80 bg-[#F1F5F9]/60 p-4 text-left sm:p-5">
          <div className="flex items-start justify-between border-b border-slate-200/60 pb-3.5">
            <div>
              <span className="mb-0.5 block text-[10px] font-bold uppercase tracking-wider text-slate-400">Order Reference</span>
              <span className="text-xs font-bold text-slate-800 sm:text-sm">Order {orderReference}</span>
            </div>
            <div className="text-right">
              <span className="mb-0.5 block text-[10px] font-bold uppercase tracking-wider text-slate-400">Amount Due</span>
              <span className="text-base font-extrabold tracking-tight text-slate-900 sm:text-lg">₱{total.toFixed(2)}</span>
            </div>
          </div>
          <div className="flex items-center justify-between pt-3 text-xs">
            <span className="font-normal text-slate-400">Payment Method</span>
            <span className="flex items-center gap-1.5 font-semibold text-slate-700">
              <span className="h-2 w-2 rounded-full bg-[#0070BA]" />
              {method === "gcash_direct" ? "GCash Direct Transfer" : "GCash E-Wallet"}
            </span>
          </div>
        </div>

        <div className="flex w-full flex-col items-center gap-3.5">
          <button
            type="button"
            onClick={() => window.open("https://www.gcash.com", "_blank", "noopener")}
            className="flex w-full items-center justify-center gap-2 rounded-full border border-sky-300 bg-white px-6 py-3 text-sm font-semibold text-[#0284C7] shadow-sm transition-all duration-150 hover:border-sky-400 hover:bg-sky-50/40"
          >
            <span>Open GCash again</span>
            <Icon name="external" className="h-3.5 w-3.5" strokeWidth={2.2} />
          </button>
          <Link to="/payment" className="py-1 text-xs font-semibold text-sky-700 transition-colors hover:text-sky-800">
            Cancel payment
          </Link>
        </div>
      </section>
    </div>
  );
}
