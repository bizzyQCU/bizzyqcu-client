import { useState } from "react";
import { Link, useParams } from "react-router-dom";
import Icon from "../../../components/Icon.jsx";
import RatingModal from "../../../components/RatingModal.jsx";
import ConfirmDialog from "../../../components/ConfirmDialog.jsx";
import { useMessages } from "../../../lib/MessageContext.jsx";
import { useRatings } from "../../../lib/RatingContext.jsx";
import { orders, orderItems, orderTimeline, deliveryFee } from "../../../lib/mockData.js";

export default function OrderDetailPage() {
  const { id } = useParams();
  const { openSeller } = useMessages();
  const { addRating } = useRatings();
  const order = orders.find((o) => o.id === id) ?? orders[0];
  const [rated, setRated] = useState(false);
  const [cancelled, setCancelled] = useState(false);
  const [confirmCancel, setConfirmCancel] = useState(false);
  const [showRating, setShowRating] = useState(false);
  const subtotal = orderItems.reduce((s, i) => s + i.price, 0);
  const total = subtotal + deliveryFee;

  return (
    <div className="mx-auto max-w-[1440px]">
      <ConfirmDialog open={confirmCancel} title="Cancel this order?" message="The seller will be notified. Cancelled orders can't be restored." confirmLabel="Cancel order" tone="danger" onCancel={() => setConfirmCancel(false)} onConfirm={() => { setConfirmCancel(false); setCancelled(true); }} />
      <div className="mb-6">
        <nav className="mb-2 flex items-center space-x-2 text-xs font-semibold text-slate-500">
          <Link to="/orders" className="flex items-center hover:text-slate-800">
            <Icon name="chevronLeft" className="mr-1 h-3.5 w-3.5" />
            All Orders
          </Link>
          <span className="text-slate-300">•</span>
          <span className="font-medium text-slate-800">Order Tracking</span>
        </nav>
        <div className="flex flex-wrap items-center gap-3">
          <h1 className="text-2xl font-extrabold tracking-tight text-slate-900">Order #BZ-2024-{order.id}</h1>
          <span className="inline-flex items-center gap-1.5 rounded-full border border-[#FFD444]/60 bg-[#FFD444]/20 px-3 py-1 text-xs font-bold text-[#854D0E]">
            <span className="h-2 w-2 rounded-full bg-[#EAB308]" />
            {cancelled ? "Cancelled" : order.status}
          </span>
        </div>
        <p className="mt-1 text-xs font-medium text-slate-500">{order.placed}</p>
      </div>

      <div className="grid grid-cols-1 items-start gap-6 lg:grid-cols-12">
        <div className="flex flex-col space-y-6 lg:col-span-8">
          <section className="rounded-2xl border border-[#E2E8F0] bg-white p-6 shadow-sm">
            <div className="mb-4 flex items-center justify-between border-b border-slate-100 pb-6">
              <div>
                <h2 className="text-base font-bold text-slate-900">Live Order Progress</h2>
                <p className="mt-0.5 text-xs text-slate-500">Status of your order inside QCU Main Campus</p>
              </div>
              <div className="inline-flex items-center gap-1.5 rounded-full border border-sky-200 bg-sky-50 px-3 py-1 text-xs font-semibold text-sky-600">
                <Icon name="bolt2" className="h-3.5 w-3.5 text-sky-500" />
                Live Sync
              </div>
            </div>
            <ol className="relative pl-1">
              {orderTimeline.map((step, idx) => {
                const last = idx === orderTimeline.length - 1;
                const isDone = step.state === "done";
                const isCurrent = step.state === "current";
                return (
                  <li key={step.label} className={`relative flex items-start space-x-4 ${last ? "" : "pb-7"}`}>
                    {!last && <span className="absolute left-3 top-6 h-full w-px bg-slate-200" aria-hidden="true" />}
                    <div
                      className={`relative z-10 flex h-6 w-6 shrink-0 items-center justify-center rounded-full ring-4 ring-white ${
                        isDone ? "bg-[#0284C7] text-white shadow-sm" : isCurrent ? "bg-sky-500 text-white ring-sky-100 shadow-sm" : "border-2 border-slate-300 bg-slate-100 text-slate-400"
                      }`}
                    >
                      {isDone && <Icon name="check" className="h-3.5 w-3.5" strokeWidth={3} />}
                      {isCurrent && <span className="h-2.5 w-2.5 rounded-full bg-white" />}
                      {!isDone && !isCurrent && <Icon name="clock" className="h-3 w-3 text-slate-400" />}
                    </div>
                    <div className="min-w-0 flex-1 pt-0.5">
                      <div className="flex items-baseline justify-between gap-2">
                        <div className="flex items-center gap-2">
                          <h3 className={`text-sm ${isCurrent ? "font-extrabold text-[#0284C7]" : isDone ? "font-bold text-slate-800" : "font-semibold text-slate-600"}`}>{step.label}</h3>
                          {isCurrent && <span className="rounded-full bg-[#FFD444] px-2 py-0.5 text-[10px] font-extrabold tracking-wide text-slate-900">NOW</span>}
                        </div>
                        <span className={`text-xs ${isCurrent ? "font-bold text-[#0284C7]" : "font-medium text-slate-400"}`}>{step.time}</span>
                      </div>
                      {step.desc && <p className="mt-0.5 text-xs text-slate-500">{step.desc}</p>}
                      {isCurrent && (
                        <div className="mt-2.5 rounded-xl border border-sky-100 bg-[#EFF6FF] p-3.5">
                          <p className="text-xs font-bold text-[#0369A1]">Seller packaging items at Tech Bldg Hub</p>
                          <p className="mt-1 text-[11px] leading-relaxed text-[#475569]">Verification seals applied for textbook edition checks and apparel sizes.</p>
                        </div>
                      )}
                    </div>
                  </li>
                );
              })}
            </ol>
          </section>

          <section className="rounded-2xl border border-[#E2E8F0] bg-white p-6 shadow-sm">
            <div className="mb-4 flex items-center space-x-2 text-sm font-bold text-slate-900">
              <Icon name="pin" className="h-4 w-4 text-sky-600" />
              <h2>Campus Fulfillment &amp; Recipient Details</h2>
            </div>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div className="flex flex-col justify-between rounded-xl border border-[#E2E8F0] bg-[#F8FAFC] p-4">
                <div>
                  <span className="mb-1.5 block text-[10px] font-bold uppercase tracking-wider text-slate-400">Drop-off Location</span>
                  <h4 className="text-sm font-bold text-slate-800">Tech Building, Room 402, 4th Floor</h4>
                  <p className="mt-0.5 text-xs text-slate-500">QCU San Bartolome Main Campus</p>
                </div>
                <div className="mt-4">
                  <span className="inline-flex items-center rounded-md bg-sky-100/70 px-2.5 py-1 text-[11px] font-semibold text-[#0369A1]">
                    <Icon name="building" className="mr-1 h-3.5 w-3.5" />
                    Classroom Desk Handoff
                  </span>
                </div>
              </div>
              <div className="flex flex-col justify-between rounded-xl border border-[#E2E8F0] bg-[#F8FAFC] p-4">
                <div>
                  <span className="mb-1.5 block text-[10px] font-bold uppercase tracking-wider text-slate-400">Recipient Student</span>
                  <h4 className="text-sm font-bold text-slate-800">Alex Valenzuela (BSIT 3-A)</h4>
                  <p className="mt-0.5 text-xs text-slate-500">+63 917 123 4567</p>
                </div>
                <div className="mt-4">
                  <span className="inline-flex items-center rounded-md bg-emerald-100/70 px-2.5 py-1 text-[11px] font-semibold text-emerald-700">
                    <Icon name="shield" className="mr-1 h-3.5 w-3.5 text-emerald-600" />
                    Student ID Verified - 2022-04812
                  </span>
                </div>
              </div>
            </div>
          </section>

          <section className="rounded-2xl border border-[#E2E8F0] bg-white p-6 shadow-sm">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div className="flex items-center space-x-2 text-sm font-bold text-slate-900">
                <Icon name="bag" className="h-4 w-4 text-sky-600" />
                <h2>Items in this Order</h2>
              </div>
              <span className="text-xs font-semibold text-slate-500">{orderItems.length} Items</span>
            </div>
            <ul className="divide-y divide-slate-100">
              {orderItems.map((i) => (
                <li key={i.id} className="flex items-center justify-between py-4">
                  <div className="flex items-center space-x-4">
                    <div className="flex h-14 w-14 flex-shrink-0 items-center justify-center overflow-hidden rounded-xl border border-slate-200 bg-slate-100">
                      <Icon name="book" className="h-6 w-6 text-slate-400" />
                    </div>
                    <div>
                      <div className="flex items-center space-x-2">
                        <h4 className="text-sm font-bold text-slate-900">{i.title}</h4>
                        <span className="rounded border border-sky-200 bg-sky-50 px-2 py-0.5 text-[10px] font-bold text-sky-600">{i.badge}</span>
                      </div>
                      <p className="mt-1 text-xs text-slate-500">{i.meta}</p>
                    </div>
                  </div>
                  <span className="text-sm font-bold text-slate-900">₱{i.price.toFixed(2)}</span>
                </li>
              ))}
            </ul>
            <div className="mt-2 space-y-2 border-t border-slate-100 pt-4">
              <div className="flex justify-between text-xs text-slate-600">
                <span>Subtotal</span>
                <span className="font-semibold text-slate-800">₱{subtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-xs text-slate-600">
                <span>Campus Delivery Fee</span>
                <span className="font-semibold text-slate-800">Free</span>
              </div>
              <div className="flex items-baseline justify-between border-t border-slate-100 pt-3">
                <span className="text-sm font-bold text-slate-900">Total Amount Paid</span>
                <span className="text-xl font-extrabold text-[#0284C7]">₱{total.toFixed(2)}</span>
              </div>
            </div>
          </section>
        </div>

        <aside className="flex flex-col space-y-6 lg:col-span-4">
          <div className="rounded-2xl border border-[#E2E8F0] bg-white p-6 shadow-sm">
            <h2 className="text-sm font-bold text-slate-900">Order Actions</h2>
            <p className="mb-5 mt-0.5 text-xs text-slate-500">Manage transaction status and campus communication</p>
            <div className="space-y-1.5 text-center">
              <button type="button" disabled className="flex w-full cursor-not-allowed items-center justify-center space-x-2 rounded-xl border border-slate-200 bg-slate-200 px-4 py-3 text-sm font-bold text-slate-400">
                <Icon name="check" className="h-4 w-4" strokeWidth={2.5} />
                <span>Confirm received</span>
              </button>
              <p className="flex items-center justify-center gap-1 pt-1 text-[11px] text-slate-400">
                <Icon name="clock" className="h-3 w-3 text-slate-400" />
                Active once the order is handed to you
              </p>
            </div>
            <div className="mt-4">
              <button type="button" className="flex w-full items-center justify-center space-x-2 rounded-full border-[1.5px] border-[#8ACFF8] bg-white px-4 py-2.5 text-sm font-bold text-[#0369A1] transition-colors hover:bg-sky-50" onClick={() => openSeller({ key: `order-${order.id}`, name: order.seller, initials: order.seller.split(" ").map((w) => w[0]).join("").slice(0, 2) })}>
                <Icon name="chat" className="h-4 w-4 text-[#0369A1]" />
                <span>Message seller</span>
              </button>
            </div>
            <div className="mt-3 text-center">
              <button type="button" disabled={cancelled || order.status === "Completed"} onClick={() => setConfirmCancel(true)} className="text-xs font-semibold text-slate-500 transition-colors hover:text-rose-600 disabled:cursor-not-allowed disabled:opacity-40">{cancelled ? "Order cancelled" : "Cancel order"}</button>
            </div>
            <div className="mt-4">
              <button
                type="button"
                disabled={rated || order.status !== "Completed"}
                onClick={() => setShowRating(true)}
                className="w-full rounded-full border border-amber-300 px-4 py-2.5 text-sm font-bold text-amber-600 transition hover:bg-amber-50 disabled:cursor-not-allowed disabled:opacity-40"
              >
                {rated ? "Rating submitted" : "★ Rate seller"}
              </button>
            </div>

            <div className="mt-6 space-y-3.5 border-t border-slate-100 pt-5 text-xs">
              <div className="flex items-center justify-between">
                <span className="text-slate-500">Payment Reference</span>
                <span className="font-mono font-bold tracking-wider text-slate-800">BZ-891-9921</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-500">Fulfillment Type</span>
                <span className="font-medium text-slate-800">Room-to-room delivery</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-500">Seller</span>
                <span className="font-semibold text-slate-800">{order.seller}</span>
              </div>
            </div>
            <div className="mt-6 flex items-center justify-between border-t border-slate-100 pt-4 text-xs">
              <span className="text-slate-500">Need campus mediation?</span>
              <Link to="/messages" className="flex items-center space-x-1 font-bold text-sky-600 hover:text-sky-700">
                <span>Help Center</span>
                <Icon name="external" className="h-3.5 w-3.5" strokeWidth={2} />
              </Link>
            </div>
          </div>
        </aside>
      </div>

      {showRating && (
        <RatingModal
          seller={order.seller}
          initials={order.seller.split(" ").map((w) => w[0]).join("").slice(0, 2)}
          orderRef={`#BZ-2024-${order.id}`}
          onClose={() => setShowRating(false)}
          onSubmit={({ rating, comment }) => {
            addRating(order.storeName, rating, comment);
            setRated(true);
            setShowRating(false);
          }}
        />
      )}
    </div>
  );
}
