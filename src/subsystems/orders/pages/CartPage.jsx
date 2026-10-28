import SelectCircle from "../../../components/SelectCircle.jsx";
import useIsMobile from "../../../hooks/useIsMobile.js";
import CartMobile from "./CartMobile.jsx";
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import Icon from "../../../components/Icon.jsx";
import ConfirmDialog from "../../../components/ConfirmDialog.jsx";
import { useCart } from "../../../lib/CartContext.jsx";

function CartDesktop() {
  const navigate = useNavigate();
  const [confirm, setConfirm] = useState(null);
  const { items, count, allSelected, selectedCount, selectedTotal, setQty, remove, removeSelected, clear, toggleSelected, setAllSelected, isChecked } = useCart();

  if (items.length === 0) {
    return (
      <div className="mx-auto flex max-w-md flex-col items-center rounded-2xl border border-dashed border-slate-300 bg-white p-10 text-center shadow-sm">
        <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-sky-50 text-sky-600">
          <Icon name="cart" className="h-6 w-6" strokeWidth={1.8} />
        </div>
        <h1 className="text-lg font-bold text-slate-900">Your cart is empty</h1>
        <p className="mt-1 text-xs text-slate-500">Add a product from a store and it will appear here.</p>
        <Link to="/marketplace" className="mt-5 rounded-full bg-[#0284C7] px-5 py-2.5 text-xs font-semibold text-white shadow-sm transition hover:bg-[#0369A1]">
          Browse the marketplace
        </Link>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 items-start gap-8 lg:grid-cols-12">
      <ConfirmDialog open={!!confirm} title={confirm?.title} message={confirm?.message} confirmLabel={confirm?.confirmLabel} tone={confirm?.tone} onCancel={() => setConfirm(null)} onConfirm={() => { confirm?.action(); setConfirm(null); }} />
      <section className="space-y-5 lg:col-span-8">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <h1 className="text-2xl font-extrabold tracking-tight text-slate-900">Your cart</h1>
            <p className="mt-1 text-xs text-slate-500">{selectedCount} of {count} items selected for checkout</p>
          </div>
          <div className="flex items-center gap-2">
            <Link to="/marketplace" className="rounded-full border-[1.5px] border-[#8ACFF8] bg-white px-4 py-2 text-xs font-semibold text-[#0369A1] transition hover:bg-sky-50">
              Continue shopping
            </Link>
            <button type="button" onClick={() => setConfirm({ title: "Clear your cart?", message: "All items will be removed. This can't be undone.", confirmLabel: "Clear cart", tone: "danger", action: clear })} className="rounded-full px-4 py-2 text-xs font-semibold text-rose-600 transition hover:bg-rose-50">
              Clear cart
            </button>
          </div>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-slate-200 bg-white px-4 py-3 shadow-sm">
          <div className="flex items-center gap-3">
            <SelectCircle checked={allSelected} onToggle={() => setAllSelected(!allSelected)} label="Select all items" />
            <span className="text-xs font-semibold text-slate-700">Select all</span>
          </div>
          <button
            type="button"
            onClick={() => setConfirm({ title: "Remove selected items?", message: `${selectedCount} selected ${selectedCount === 1 ? "item" : "items"} will be removed from your cart.`, confirmLabel: "Remove", tone: "danger", action: removeSelected })}
            disabled={selectedCount === 0}
            className="rounded-full px-3 py-1.5 text-xs font-semibold text-slate-500 transition hover:bg-rose-50 hover:text-rose-600 disabled:cursor-not-allowed disabled:opacity-40"
          >
            Remove selected
          </button>
        </div>

        <ul className="space-y-3">
          {items.map((i) => {
            const checked = isChecked(i);
            return (
              <li
                key={i.id}
                className={`flex flex-wrap items-center gap-4 rounded-2xl border p-4 transition-all duration-200 ${
                  checked ? "border-sky-300 bg-white shadow-sm ring-1 ring-sky-200/60" : "border-slate-200 bg-slate-50/60"
                }`}
              >
                <SelectCircle checked={checked} onToggle={() => toggleSelected(i.id)} label={`Select ${i.title}`} />

                <div className={`flex h-16 w-16 shrink-0 items-center justify-center rounded-xl border transition-colors duration-200 ${checked ? "border-sky-100 bg-sky-50 text-sky-600" : "border-slate-200 bg-white text-slate-400"}`}>
                  <Icon name="tag" className="h-6 w-6" />
                </div>

                <div className="min-w-0 flex-1">
                  <h2 className={`truncate text-sm font-bold ${checked ? "text-slate-900" : "text-slate-500"}`}>{i.title}</h2>
                  <p className="mt-0.5 truncate text-[11px] text-slate-500">{i.meta}</p>
                  <p className="mt-1 text-xs font-semibold text-slate-700">₱{i.price.toFixed(2)} each</p>
                </div>

                <div className="flex items-center rounded-full border border-slate-200 bg-slate-50" role="group" aria-label={`Quantity for ${i.title}`}>
                  <button
                    type="button"
                    aria-label="Decrease quantity"
                    onClick={() => setQty(i.id, i.qty - 1)}
                    disabled={i.qty <= 1}
                    className="flex h-8 w-8 items-center justify-center rounded-full text-slate-600 transition hover:bg-white disabled:cursor-not-allowed disabled:opacity-40"
                  >
                    <span className="text-base leading-none">−</span>
                  </button>
                  <span aria-live="polite" className="min-w-[2rem] text-center text-xs font-bold text-slate-900">{i.qty}</span>
                  <button
                    type="button"
                    aria-label="Increase quantity"
                    onClick={() => setQty(i.id, i.qty + 1)}
                    className="flex h-8 w-8 items-center justify-center rounded-full text-slate-600 transition hover:bg-white"
                  >
                    <span className="text-base leading-none">+</span>
                  </button>
                </div>

                <div className="w-24 text-right">
                  <p className={`text-sm font-extrabold ${checked ? "text-slate-900" : "text-slate-400"}`}>₱{(i.price * i.qty).toFixed(2)}</p>
                </div>

                <button
                  type="button"
                  aria-label={`Delete ${i.title} from cart`}
                  onClick={() => setConfirm({ title: "Delete this item?", message: `${i.title} will be removed from your cart.`, confirmLabel: "Delete", tone: "danger", action: () => remove(i.id) })}
                  className="rounded-full p-2 text-slate-400 transition hover:bg-rose-50 hover:text-rose-600"
                >
                  <Icon name="trash" className="h-4 w-4" />
                </button>
              </li>
            );
          })}
        </ul>
      </section>

      <aside className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm lg:col-span-4">
        <h2 className="text-sm font-bold text-slate-900">Order summary</h2>
        <p className="mt-0.5 text-[11px] text-slate-400">Only selected items are included</p>
        <div className="mt-4 space-y-2 border-b border-slate-100 pb-4 text-xs">
          <div className="flex justify-between text-slate-500"><span>Subtotal ({selectedCount} {selectedCount === 1 ? "item" : "items"})</span><span className="font-medium text-slate-700">₱{selectedTotal.toFixed(2)}</span></div>
          <div className="flex justify-between text-slate-500"><span>Campus delivery fee</span><span className="font-medium text-slate-700">Free</span></div>
        </div>
        <div className="flex items-baseline justify-between pt-4">
          <span className="text-xs font-bold text-slate-900">Total</span>
          <span className="text-xl font-extrabold tracking-tight text-slate-900">₱{selectedTotal.toFixed(2)}</span>
        </div>
        <button
          type="button"
          onClick={() => navigate("/checkout")}
          disabled={selectedCount === 0}
          className="mt-5 w-full rounded-full bg-[#0284C7] py-3 text-xs font-semibold text-white shadow-sm transition hover:bg-[#0369A1] disabled:cursor-not-allowed disabled:opacity-50"
        >
          {selectedCount === 0 ? "Select items to checkout" : "Proceed to checkout"}
        </button>
        <p className="mt-3 text-center text-[11px] text-slate-400">Delivery details and payment come next.</p>
      </aside>
    </div>
  );
}

export default function CartPage() {
  return useIsMobile() ? <CartMobile /> : <CartDesktop />;
}
