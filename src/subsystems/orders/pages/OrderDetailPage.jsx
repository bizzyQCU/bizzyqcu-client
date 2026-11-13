import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import Icon from "../../../components/Icon.jsx";
import RatingModal from "../../../components/RatingModal.jsx";
import ConfirmDialog from "../../../components/ConfirmDialog.jsx";
import { useMessages } from "../../../lib/MessageContext.jsx";
import { useRatings } from "../../../lib/RatingContext.jsx";
import ProductArt, { galleryFor } from "../../../components/ProductArt.jsx";
import { canRequestRefund } from "../../../lib/orderRules.js";
import { getOrderById, cancelOrder } from "../api.js";
import { getErrorMessage } from "../../../lib/api-client.js";

const STATUS_LABELS = {
  PENDING_PAYMENT: "To pay",
  PENDING_CONFIRMATION: "Waiting for approval",
  PREPARING: "Preparing",
  READY_FOR_PICKUP: "Ready for pickup",
  OUT_FOR_DELIVERY: "Out for delivery",
  COMPLETED: "Completed",
  CANCELLED: "Cancelled",
};

function getTimelineSteps(orderStatus, deliveryMethod) {
  if (orderStatus === "CANCELLED") {
    return [
      { label: "Order Placed", state: "done" },
      { label: "Cancelled", state: "current" },
    ];
  }

  const fulfillmentLabel = deliveryMethod === "ROOM_TO_ROOM" ? "Out for delivery" : "Ready for pickup";

  const stages = [
    { label: "Waiting for approval" },
    { label: "Preparing" },
    { label: fulfillmentLabel },
    { label: "Completed" },
  ];

  const rankMap = {
    PENDING_PAYMENT: 0,
    PENDING_CONFIRMATION: 0,
    PREPARING: 1,
    READY_FOR_PICKUP: 2,
    OUT_FOR_DELIVERY: 2,
    COMPLETED: 3,
  };

  const currentRank = rankMap[orderStatus] ?? 0;

  return stages.map((stage, idx) => ({
    label: stage.label,
    state: idx < currentRank ? "done" : idx === currentRank ? "current" : "todo",
  }));
}

export default function OrderDetailPage() {
  const { id } = useParams();
  const { openSeller } = useMessages();
  const { addRating } = useRatings();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [status, setStatus] = useState(null);
  const [refundRequested, setRefundRequested] = useState(false);
  const [rated, setRated] = useState(false);
  const [confirmCancel, setConfirmCancel] = useState(false);
  const [cancelling, setCancelling] = useState(false);
  const [cancelError, setCancelError] = useState(null);
  const [showRating, setShowRating] = useState(false);

  useEffect(() => {
    let ignore = false;
    setLoading(true);
    setError(null);
    getOrderById(id)
      .then((res) => {
        if (!ignore) {
          setOrder(res.data);
          setStatus(STATUS_LABELS[res.data.orderStatus] ?? res.data.orderStatus);
        }
      })
      .catch((err) => {
        if (!ignore) {
          setError(err);
        }
      })
      .finally(() => {
        if (!ignore) {
          setLoading(false);
        }
      });
    return () => {
      ignore = true;
    };
  }, [id]);

  const handleCancel = async () => {
    setConfirmCancel(false);
    setCancelling(true);
    setCancelError(null);
    try {
      const res = await cancelOrder(order.id);
      setOrder(res.data);
      setStatus(STATUS_LABELS[res.data.orderStatus] ?? res.data.orderStatus);
    } catch (err) {
      setCancelError(getErrorMessage(err));
    } finally {
      setCancelling(false);
    }
  };

  if (loading) {
    return (
      <div className="mx-auto max-w-[1440px] py-20 text-center">
        <p className="text-sm text-slate-500">Loading order…</p>
      </div>
    );
  }

  if (error) {
    if (error?.response?.status === 404) {
      return (
        <div className="mx-auto max-w-[1440px] py-20 text-center">
          <p className="text-sm font-semibold text-slate-700">Order not found.</p>
          <Link to="/orders" className="mt-2 inline-block text-xs font-semibold text-sky-600">Back to all orders</Link>
        </div>
      );
    }
    return (
      <div className="mx-auto max-w-[1440px] py-20 text-center">
        <p className="text-sm font-semibold text-rose-600">{getErrorMessage(error)}</p>
        <Link to="/orders" className="mt-2 inline-block text-xs font-semibold text-sky-600">Back to all orders</Link>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="mx-auto max-w-[1440px] py-20 text-center">
        <p className="text-sm font-semibold text-slate-700">Order not found.</p>
        <Link to="/orders" className="mt-2 inline-block text-xs font-semibold text-sky-600">Back to all orders</Link>
      </div>
    );
  }

  const seller = order.store.name;
  const initials = seller.split(" ").filter(Boolean).map((w) => w[0]).join("").slice(0, 2);
  const items = order.items ?? [];
  const subtotal = items.reduce((s, i) => s + Number(i.unitPriceSnapshot) * i.quantity, 0);
  const total = Number(order.totalAmount);
  const live = { ...order, status, refundRequested };
  const canCancelOrder = order.orderStatus === "PENDING_PAYMENT" || order.orderStatus === "PENDING_CONFIRMATION";

  return (
    <div className="mx-auto max-w-[1440px]">
      <ConfirmDialog
        open={confirmCancel}
        title="Cancel this order?"
        message="The seller will be notified. Cancelled orders can't be restored."
        confirmLabel="Cancel order"
        tone="danger"
        onCancel={() => setConfirmCancel(false)}
        onConfirm={handleCancel}
      />
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
          <h1 className="text-2xl font-extrabold tracking-tight text-slate-900">Order #{order.orderNumber}</h1>
          <span className="inline-flex items-center gap-1.5 rounded-full border border-[#FFD444]/60 bg-[#FFD444]/20 px-3 py-1 text-xs font-bold text-[#854D0E]">
            <span className="h-2 w-2 rounded-full bg-[#EAB308]" />
            {status}
          </span>
        </div>
        <p className="mt-1 text-xs font-medium text-slate-500">{new Date(order.createdAt).toLocaleDateString()}</p>
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
            {/* Stepper - Clean horizontal line with steps */}
            <div className="space-y-8">
              {/* Line with circles */}
              <div className="flex items-center gap-0 relative">
                {getTimelineSteps(order.orderStatus, order.deliveryMethod).map((step, idx, arr) => {
                  const isDone = step.state === "done";
                  const isCurrent = step.state === "current";
                  const isLast = idx === arr.length - 1;
                  const currentIdx = getTimelineSteps(order.orderStatus, order.deliveryMethod).findIndex(s => s.state === "current");
                  
                  return (
                    <div key={step.label} className="flex-1 flex items-center justify-center relative">
                      {/* Connector Line - Behind circles */}
                      {!isLast && (
                        <div
                          className="absolute left-1/2 top-1/2 h-0.5 w-full ml-4 -translate-y-1/2 z-0"
                          style={{
                            backgroundColor: idx < currentIdx + 1 ? "#10b981" : "#d1d5db"
                          }}
                        />
                      )}
                      
                      {/* Step Circle - On top of line */}
                      <div
                        className={`relative z-10 flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full transition-all ${
                          isDone 
                            ? "bg-emerald-500 text-white shadow-sm ring-4 ring-white" 
                            : isCurrent 
                            ? "bg-sky-500 text-white shadow-sm ring-4 ring-sky-100" 
                            : "border-2 border-slate-300 bg-white"
                        }`}
                      >
                        {isDone && <Icon name="check" className="h-4 w-4" strokeWidth={3} />}
                        {isCurrent && <span className="h-2 w-2 rounded-full bg-white" />}
                      </div>
                    </div>
                  );
                })}
              </div>
              
              {/* Labels Row - Centered below each dot */}
              <div className="flex items-start justify-between">
                {getTimelineSteps(order.orderStatus, order.deliveryMethod).map((step, idx) => {
                  const isDone = step.state === "done";
                  const isCurrent = step.state === "current";
                  
                  return (
                    <div key={step.label} className="flex-1 flex flex-col items-center">
                      <p
                        className={`text-xs font-semibold text-center ${
                          isCurrent
                            ? "text-sky-600 font-bold"
                            : isDone
                            ? "text-slate-700"
                            : "text-slate-500"
                        }`}
                      >
                        {step.label}
                      </p>
                      {isCurrent && (
                        <span className="mt-1 text-[9px] font-bold text-amber-600">● NOW</span>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
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
                  {order.deliveryMethod === "ROOM_TO_ROOM" ? (
                    <>
                      <h4 className="text-sm font-bold text-slate-800">{order.campusBuilding}, {order.campusRoomNumber}</h4>
                      <p className="mt-0.5 text-xs text-slate-500">QCU Campus</p>
                    </>
                  ) : (
                    <>
                      <h4 className="text-sm font-bold text-slate-800">{order.store.pickupLocation}</h4>
                      <p className="mt-0.5 text-xs text-slate-500">QCU Campus</p>
                    </>
                  )}
                </div>
                <div className="mt-4">
                  <span className="inline-flex items-center rounded-md bg-sky-100/70 px-2.5 py-1 text-[11px] font-semibold text-[#0369A1]">
                    <Icon name="building" className="mr-1 h-3.5 w-3.5" />
                    {order.deliveryMethod === "ROOM_TO_ROOM" ? "Classroom Desk Handoff" : "Pickup at Seller"}
                  </span>
                </div>
              </div>
              <div className="flex flex-col justify-between rounded-xl border border-[#E2E8F0] bg-[#F8FAFC] p-4">
                <div>
                  <span className="mb-1.5 block text-[10px] font-bold uppercase tracking-wider text-slate-400">Recipient Student</span>
                  <h4 className="text-sm font-bold text-slate-800">{order.buyer.fullName}</h4>
                  {order.buyer.qcuIdNumber && (
                    <p className="mt-0.5 text-xs text-slate-500">{order.buyer.qcuIdNumber}</p>
                  )}
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
              <span className="text-xs font-semibold text-slate-500">{items.length} Items</span>
            </div>
            <ul className="divide-y divide-slate-100">
              {items.map((i) => (
                <li key={i.id} className="flex items-center justify-between py-4">
                  <div className="flex items-center space-x-4">
                    <div onClick={() => setZoomImage(galleryFor(i.productId)[0])} className="h-14 w-14 flex-shrink-0 overflow-hidden rounded-xl border border-slate-200 cursor-pointer hover:opacity-80 transition-opacity">
                      <ProductArt art={galleryFor(i.productId)[0]} />
                    </div>
                    <div>
                      <div className="flex items-center space-x-2">
                        <h4 className="text-sm font-bold text-slate-900">{i.productNameSnapshot}</h4>
                        <span className="rounded border border-sky-200 bg-sky-50 px-2 py-0.5 text-[10px] font-bold text-sky-600">Qty: {i.quantity}</span>
                      </div>
                    </div>
                  </div>
                  <span className="text-sm font-bold text-slate-900">₱{Number(i.unitPriceSnapshot).toFixed(2)}</span>
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
            
            {/* Confirm received is hidden pending a backend endpoint */}

            <div>
              <button type="button" className="flex w-full items-center justify-center space-x-2 rounded-full border-[1.5px] border-[#8ACFF8] bg-white px-4 py-2.5 text-sm font-bold text-[#0369A1] transition-colors hover:bg-sky-50" onClick={() => openSeller({ key: `order-${order.id}`, name: seller, initials })}>
                <Icon name="chat" className="h-4 w-4 text-[#0369A1]" />
                <span>Message seller</span>
              </button>
            </div>
            {canCancelOrder && (
              <div className="mt-3 text-center">
                <button
                  type="button"
                  disabled={cancelling}
                  onClick={() => setConfirmCancel(true)}
                  className="text-xs font-semibold text-slate-500 transition-colors hover:text-rose-600 disabled:cursor-not-allowed disabled:opacity-40"
                >
                  {cancelling ? "Cancelling…" : "Cancel order"}
                </button>
              </div>
            )}
            {cancelError && (
              <p className="mt-2 text-center text-xs font-medium text-rose-600">{cancelError}</p>
            )}
            <div className="mt-4">
              <button
                type="button"
                disabled={rated || status !== "Completed"}
                onClick={() => setShowRating(true)}
                className="w-full rounded-full border border-amber-300 px-4 py-2.5 text-sm font-bold text-amber-600 transition hover:bg-amber-50 disabled:cursor-not-allowed disabled:opacity-40"
              >
                {rated ? "Rating submitted" : "★ Rate seller"}
              </button>
            </div>

            {canRequestRefund(live) && (
              <button type="button" onClick={() => setRefundRequested(true)} className="mt-3 w-full rounded-full border border-rose-300 px-4 py-2.5 text-sm font-bold text-rose-600 transition hover:bg-rose-50">
                Request refund (stale item)
              </button>
            )}
            {refundRequested && <p className="mt-2 text-center text-[11px] text-rose-600">Refund requested. Customer support will review it.</p>}

            <div className="mt-6 space-y-3.5 border-t border-slate-100 pt-5 text-xs">
              {order.payment?.id && (
                <div className="flex items-center justify-between">
                  <span className="text-slate-500">Payment Reference</span>
                  <span className="font-mono font-bold tracking-wider text-slate-800">{order.payment.id}</span>
                </div>
              )}
              <div className="flex items-center justify-between">
                <span className="text-slate-500">Fulfillment Type</span>
                <span className="font-medium text-slate-800">
                  {order.deliveryMethod === "ROOM_TO_ROOM" ? "Room-to-room delivery" : "Pickup"}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-500">Seller</span>
                <span className="font-semibold text-slate-800">{seller}</span>
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
          seller={seller}
          initials={initials}
          orderRef={`#${order.orderNumber}`}
          onClose={() => setShowRating(false)}
          onSubmit={({ rating, comment }) => {
            addRating(seller, rating, comment);
            setRated(true);
            setShowRating(false);
          }}
        />
      )}
    </div>
  );
}
