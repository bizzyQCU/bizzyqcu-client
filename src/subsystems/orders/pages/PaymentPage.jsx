import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import Icon from "../../../components/Icon.jsx";
import ConfirmDialog from "../../../components/ConfirmDialog.jsx";
import { useCart } from "../../../lib/CartContext.jsx";

const methods = [
  { id: "gcash", title: "GCash", pill: "Instant", icon: "bolt2", note: "Fast e-wallet payment via PayMongo. Instant confirmation." },
  { id: "cash", title: "Cash", icon: "cash", note: "Pay the seller when you receive your order. In-person cash handover." },
];

export default function PaymentPage() {
  const navigate = useNavigate();
  const [method, setMethod] = useState("gcash");
  const [confirm, setConfirm] = useState(null);
  const { selected: items, selectedTotal: total } = useCart();

  function placeOrder() {
    const target = method === "cash" ? "/payment/confirmed" : "/payment/pending";
    navigate(target, { state: { method } });
  }

  return (
    <>
      <ConfirmDialog open={!!confirm} title={confirm?.title} message={confirm?.message} confirmLabel={confirm?.confirmLabel} tone={confirm?.tone} onCancel={() => setConfirm(null)} onConfirm={() => { confirm?.action(); setConfirm(null); }} />
      <div className="mb-4">
        <Link to="/checkout" className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#0284C7] transition hover:text-sky-700">
          <Icon name="arrowLeft" className="h-4 w-4" />
          <span>Back to delivery</span>
        </Link>
      </div>

      <div className="mx-auto mb-8 flex max-w-xl items-center justify-center">
        <div className="flex items-center gap-3">
          <div className="flex h-6 w-6 items-center justify-center rounded-full bg-[#0284C7] text-white"><Icon name="check" className="h-3.5 w-3.5" strokeWidth={3} /></div>
          <span className="text-xs font-bold text-slate-500">1. Delivery</span>
        </div>
        <div className="mx-4 h-[2px] w-24 bg-[#0284C7] sm:w-32" />
        <div className="flex items-center gap-3">
          <div className="flex h-6 w-6 items-center justify-center rounded-full bg-[#0284C7] text-xs font-bold text-white">2</div>
          <span className="text-xs font-bold text-[#0284C7]">2. Payment</span>
        </div>
      </div>

      <div className="grid grid-cols-1 items-start gap-8 lg:grid-cols-12">
        <section className="space-y-6 lg:col-span-8">
          <div>
            <h1 className="text-xl font-bold tracking-tight text-slate-900 sm:text-2xl">How will you pay?</h1>
            <p className="mt-1 text-xs text-slate-500 sm:text-sm">Select a verified campus payment method</p>
          </div>

          <div role="radiogroup" aria-label="Payment method" className="space-y-3">
            {methods.map((m) => {
              const selected = method === m.id;
              return (
                <label
                  key={m.id}
                  className={`flex cursor-pointer items-start gap-4 rounded-2xl bg-white p-4 transition hover:shadow-sm ${
                    selected ? "border-2 border-[#0284C7] bg-sky-50/40 shadow-sm" : "border border-slate-200"
                  }`}
                >
                  <input type="radio" name="payment_method" value={m.id} checked={selected} onChange={() => setMethod(m.id)} className="sr-only" />
                  <div className={`mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded-full border-2 ${selected ? "border-[#0284C7]" : "border-slate-300"}`}>
                    {selected && <div className="h-2 w-2 rounded-full bg-[#0284C7]" />}
                  </div>
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-sky-50 text-sky-600">
                    <Icon name={m.icon} className="h-4 w-4" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <span className="text-sm font-bold text-slate-900">{m.title}</span>
                      {m.pill && <span className="rounded-full bg-sky-50 px-2 py-0.5 text-[10px] font-bold text-sky-700">{m.pill}</span>}
                    </div>
                    <p className="mt-1 text-[11px] leading-relaxed text-slate-500">{m.note}</p>
                  </div>
                </label>
              );
            })}
          </div>

          <p className="flex items-center gap-1.5 text-[11px] text-slate-500">
            <Icon name="info" className="h-3.5 w-3.5 text-slate-400" />
            Cash payments are recorded in BizzyQCU and settled directly with the seller upon physical handover.
          </p>
        </section>

        <aside className="space-y-4 lg:col-span-4">
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <h2 className="text-sm font-bold text-slate-900">Order summary</h2>
            <div className="mt-3 space-y-2 border-b border-slate-100 pb-3 text-xs">
              <div className="flex justify-between text-slate-500"><span>Items ({items.length})</span><span className="font-medium text-slate-700">₱{total.toFixed(2)}</span></div>
              <div className="flex justify-between text-slate-500"><span>Campus Delivery</span><span className="font-medium text-slate-700">Free</span></div>
            </div>
            <div className="flex items-baseline justify-between pt-4">
              <div>
                <span className="block text-xs font-bold text-slate-900">Total</span>
                <span className="text-[10px] text-slate-400">Includes all campus fees</span>
              </div>
              <span className="text-xl font-extrabold tracking-tight text-slate-900">₱{total.toFixed(2)}</span>
            </div>
            <button
              type="button"
              onClick={() => setConfirm({ title: "Place this order?", message: `You'll pay ₱${total.toFixed(2)} with ${methods.find((m) => m.id === method).title}.`, confirmLabel: "Place order", tone: "primary", action: placeOrder })}
              className="mt-5 w-full rounded-full bg-[#0284C7] px-4 py-3 text-xs font-semibold tracking-wide text-white shadow-sm transition hover:bg-sky-700 hover:shadow active:bg-sky-800"
            >
              Place order · ₱{total.toFixed(2)}
            </button>
          </div>
        </aside>
      </div>
    </>
  );
}
