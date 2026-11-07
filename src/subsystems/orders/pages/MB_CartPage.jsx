import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import ConfirmDialog from "../../../components/ConfirmDialog.jsx";
import FullScreenPage from "../../../components/FullScreenPage.jsx";
import Icon from "../../../components/Icon.jsx";
import SelectCircle from "../../../components/SelectCircle.jsx";
import { useCart } from "../../../lib/CartContext.jsx";

export default function CartMobile() {
  const navigate = useNavigate();
  const location = useLocation();
  // React Router marks the first page of a session with key "default".
  // If the page was opened directly, there is nothing to go back to.
  const goBack = () => (location.key !== "default" ? navigate(-1) : navigate("/marketplace"));
  const {
    items, count, allSelected, selectedCount, selectedTotal,
    setQty, remove, removeSelected, clear, toggleSelected, setAllSelected, isChecked,
  } = useCart();
  const [confirm, setConfirm] = useState(null);

  const header = (
    <div className="flex items-center justify-between px-4 py-3">
      <button type="button" aria-label="Back" onClick={goBack} className="rounded-full p-1.5 text-slate-700">
        <Icon name="arrowLeft" className="h-5 w-5" />
      </button>
      <span className="text-sm font-bold text-slate-900">Your cart</span>
      <span className="w-8" />
    </div>
  );

  if (items.length === 0) {
    return (
      <FullScreenPage header={header}>
        <div className="flex flex-col items-center p-8 text-center">
          <h1 className="text-base font-bold text-slate-900">Your cart is empty</h1>
          <p className="mt-1 text-xs text-slate-500">Add a product from a store and it will appear here.</p>
          <button type="button" onClick={() => navigate("/marketplace")} className="mt-4 rounded-full bg-[#0284C7] px-5 py-2.5 text-xs font-semibold text-white">
            Browse the marketplace
          </button>
        </div>
      </FullScreenPage>
    );
  }

  return (
    <FullScreenPage
      header={header}
      footer={
        <>
          <div className="flex items-end justify-between">
            <div>
              <p className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Active order subtotal</p>
              <p className="text-[11px] text-slate-500">{selectedCount} {selectedCount === 1 ? "item" : "items"} selected</p>
            </div>
            <span className="text-lg font-extrabold text-slate-900">₱{selectedTotal.toFixed(2)}</span>
          </div>
          <button
            type="button"
            onClick={() => navigate("/checkout")}
            disabled={selectedCount === 0}
            className="mt-3 w-full rounded-full bg-[#0284C7] py-3 text-xs font-semibold text-white shadow-sm transition hover:bg-[#0369A1] disabled:opacity-50"
          >
            {selectedCount === 0 ? "Select items to checkout" : `Checkout · ₱${selectedTotal.toFixed(2)}`}
          </button>
        </>
      }
    >
      <div className="px-4 py-4">
        <p className="text-[11px] font-bold uppercase tracking-wider text-slate-500">Select active seller cart</p>
        <div className="mt-2 flex">
          <span className="rounded-full bg-slate-900 px-3 py-1.5 text-[11px] font-semibold text-white">All items · {count}</span>
        </div>

        <div className="mt-4 flex items-center justify-between rounded-2xl border border-slate-200 bg-white px-4 py-3">
          <button type="button" onClick={() => setAllSelected(!allSelected)} className="flex items-center gap-2.5 text-xs font-semibold text-slate-700">
            <SelectCircle checked={allSelected} onToggle={() => setAllSelected(!allSelected)} label="Select all items" />
            Select all
          </button>
          <div className="flex gap-1">
            <button
              type="button"
              disabled={selectedCount === 0}
              onClick={() => setConfirm({ title: "Remove selected items?", message: `${selectedCount} selected ${selectedCount === 1 ? "item" : "items"} will be removed from your cart.`, confirmLabel: "Remove", tone: "danger", action: removeSelected })}
              className="rounded-full px-3 py-1.5 text-[11px] font-semibold text-slate-500 disabled:opacity-40"
            >
              Remove
            </button>
            <button
              type="button"
              onClick={() => setConfirm({ title: "Clear your cart?", message: "All items will be removed. This can't be undone.", confirmLabel: "Clear cart", tone: "danger", action: clear })}
              className="rounded-full px-3 py-1.5 text-[11px] font-semibold text-rose-600"
            >
              Clear
            </button>
          </div>
        </div>

        <ul className="mt-3 space-y-3">
          {items.map((i) => {
            const checked = isChecked(i);
            return (
              <li key={i.id} className={`flex items-center gap-3 rounded-2xl border bg-white p-3 transition-all ${checked ? "border-sky-300 shadow-sm" : "border-slate-200 opacity-70"}`}>
                <SelectCircle checked={checked} onToggle={() => toggleSelected(i.id)} label={`Select ${i.title}`} />
                <span className="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl bg-sky-100 text-sky-700">
                  <Icon name="tag" className="h-5 w-5" />
                </span>
                <div className="min-w-0 flex-1">
                  <div className="flex items-start justify-between gap-2">
                    <p className="truncate text-xs font-bold text-slate-900">{i.title}</p>
                    <button
                      type="button"
                      aria-label={`Delete ${i.title} from cart`}
                      onClick={() => setConfirm({ title: "Delete this item?", message: `${i.title} will be removed from your cart.`, confirmLabel: "Delete", tone: "danger", action: () => remove(i.id) })}
                      className="text-slate-400 transition hover:text-rose-500"
                    >
                      <Icon name="trash" className="h-4 w-4" />
                    </button>
                  </div>
                  <p className="truncate text-[10px] text-slate-500">{i.meta}</p>
                  <div className="mt-2 flex items-center justify-between">
                    <span className="text-sm font-extrabold text-slate-900">₱{(i.price * i.qty).toFixed(2)}</span>
                    <div className="flex items-center rounded-full border border-slate-200 bg-slate-50">
                      <button type="button" aria-label="Decrease quantity" disabled={i.qty <= 1} onClick={() => setQty(i.id, i.qty - 1)} className="flex h-7 w-7 items-center justify-center text-slate-600 disabled:opacity-40">−</button>
                      <span aria-live="polite" className="min-w-[1.5rem] text-center text-xs font-bold text-slate-900">{i.qty}</span>
                      <button type="button" aria-label="Increase quantity" onClick={() => setQty(i.id, i.qty + 1)} className="flex h-7 w-7 items-center justify-center text-slate-600">+</button>
                    </div>
                  </div>
                </div>
              </li>
            );
          })}
        </ul>
      </div>

      <ConfirmDialog
        open={!!confirm}
        title={confirm?.title}
        message={confirm?.message}
        confirmLabel={confirm?.confirmLabel}
        tone={confirm?.tone}
        onCancel={() => setConfirm(null)}
        onConfirm={() => {
          confirm?.action();
          setConfirm(null);
        }}
      />
    </FullScreenPage>
  );
}
