import { Link, useLocation } from "react-router-dom";
import Icon from "../../../../components/Icon.jsx";
import { useMessages } from "../../../../lib/MessageContext.jsx";
import VerifiedSeal from "../../../../components/VerifiedSeal.jsx";
import { useCart } from "../../../../lib/CartContext.jsx";
import { getInitials } from "../../../../lib/userDisplay.js";

const methodLabel = { gcash: "GCash", cash: "Cash", gcash_direct: "GCash Direct Transfer" };

export default function PaymentConfirmedPage() {
  const { openSeller } = useMessages();
  const { state } = useLocation();
  const order = state?.order;
  const method = state?.method ?? "gcash";
  const { selected: items, selectedTotal: total } = useCart();
  const isCash = method === "cash";

  const orderNumber = order?.orderNumber ? `#${order.orderNumber}` : "—";
  const storeName = order?.store?.name ?? state?.storeName ?? "Campus Seller";
  const storeInitials = getInitials(storeName, "S");
  const displayTotal = order?.totalAmount != null ? Number(order.totalAmount) : total;
  const itemCount = order?.items?.length ?? items.length;
  const fulfillment = order?.deliveryMethod === "PICKUP"
    ? order?.store?.pickupLocation || "Campus Pickup"
    : [order?.campusBuilding, order?.campusRoomNumber].filter(Boolean).join(" · ") || "Campus Delivery";

  return (
    <div className="flex justify-center py-6">
      <div className="flex w-full max-w-[540px] flex-col items-center rounded-2xl border border-slate-200/90 bg-white dark:bg-slate-900 p-8 text-center shadow-sm">
        <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-[#0284C7] text-white shadow-sm">
          <Icon name="check" className="h-8 w-8" strokeWidth={3} />
        </div>
        <div className="mb-3 inline-flex items-center gap-1.5 rounded-full border border-sky-100 bg-sky-50 dark:bg-sky-950/40 px-3 py-1 text-xs font-semibold text-[#0284C7]">
          <Icon name="check" className="h-3.5 w-3.5" strokeWidth={2.5} />
          <span>{isCash ? "Order placed" : "Payment confirmed"}</span>
        </div>
        <h1 className="mb-2 text-2xl font-extrabold tracking-tight text-slate-900 dark:text-slate-100">{isCash ? "Order placed." : "Payment confirmed."}</h1>
        <p className="mb-6 max-w-sm text-xs leading-relaxed text-slate-500 dark:text-slate-400 sm:text-sm">
          Your order <span className="font-bold text-slate-700 dark:text-slate-200">{orderNumber}</span> is waiting for the seller to confirm.
        </p>

        <div className="mb-6 w-full space-y-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 text-left shadow-sm">
          <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-blue-100 text-xs font-bold text-[#0369A1]">
                {storeInitials}
              </div>
              <div>
                <div className="flex flex-wrap items-center gap-1.5">
                  <span className="text-sm font-bold text-slate-900 dark:text-slate-100">{storeName}</span>
                  <span className="inline-flex items-center gap-0.5 rounded-full bg-sky-100 px-2 py-0.5 text-[10px] font-semibold text-[#0284C7]">
                    <VerifiedSeal className="h-3.5 w-3.5" />
                    Verified QCU
                  </span>
                </div>
                <p className="mt-0.5 text-xs text-slate-400 dark:text-slate-500">{itemCount} {itemCount === 1 ? "item" : "items"}</p>
              </div>
            </div>
            <button
              type="button"
              aria-label="Message seller"
              onClick={() => openSeller({ key: order?.storeId ? `store-${order.storeId}` : storeName, name: storeName, initials: storeInitials })}
              className="rounded-lg p-2 text-slate-400 dark:text-slate-500 transition hover:bg-slate-50 dark:hover:bg-slate-800 hover:text-slate-600"
            >
              <Icon name="chat" className="h-5 w-5" strokeWidth={1.8} />
            </button>
          </div>

          <div className="flex items-center justify-between">
            <div>
              <div className="text-[11px] font-medium text-slate-400 dark:text-slate-500">Total Paid</div>
              <div className="text-xl font-extrabold text-slate-900 dark:text-slate-100">₱{displayTotal.toFixed(2)}</div>
            </div>
            <div className="text-right">
              <div className="text-[11px] font-medium text-slate-400 dark:text-slate-500">{isCash ? "Payment (on handover)" : "Payment Method"}</div>
              <div className="flex items-center justify-end gap-1.5 text-xs font-bold text-slate-800 dark:text-slate-100">
                <span className="h-2 w-2 rounded-full bg-[#0284C7]" />
                {methodLabel[method] ?? method}
              </div>
            </div>
          </div>

          <div className="flex items-start gap-1.5 pt-1 text-xs text-slate-600 dark:text-slate-300">
            <Icon name="pin" className="mt-0.5 h-4 w-4 shrink-0 text-[#0284C7]" />
            <div>
              <span className="font-semibold text-slate-700 dark:text-slate-200">Fulfillment</span>
              <p className="mt-0.5 text-slate-500 dark:text-slate-400">{fulfillment} · Free</p>
            </div>
          </div>
        </div>

        <div className="mb-6 flex w-full items-center justify-between gap-3">
          <Link to="/marketplace" className="flex-1 rounded-full border-[1.5px] border-[#8ACFF8] bg-white dark:bg-slate-900 px-4 py-2.5 text-center text-xs font-semibold text-[#0369A1] transition hover:bg-sky-50 dark:hover:bg-sky-950/40">
            Back to marketplace
          </Link>
          <Link to={order?.id ? `/orders/${order.id}` : "/orders"} className="flex-1 rounded-full bg-[#0284C7] px-4 py-2.5 text-center text-xs font-semibold text-white shadow-sm transition hover:bg-[#0369A1]">
            Track order
          </Link>
        </div>

        <p className="text-xs text-slate-400 dark:text-slate-500">
          Need help with this purchase?{" "}
          <Link to="/messages" className="font-semibold text-[#0284C7] hover:text-[#0369A1] hover:underline">Visit Help &amp; Support</Link>
        </p>
      </div>
    </div>
  );
}
