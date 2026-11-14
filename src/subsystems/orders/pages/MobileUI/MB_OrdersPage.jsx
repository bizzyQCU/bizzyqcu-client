import { useEffect, useMemo, useState } from "react";
import Icon from "../../../../components/Icon.jsx";
import RatingModal from "../../components/OrderPage/RatingModal.jsx";
import { useRatings } from "../../../../lib/RatingContext.jsx";
import OrderCard from "../OrderPage/OrderCard.jsx";
import { categories } from "../OrderPage/orderCategories.js";
import { getMyOrders } from "../../api.js";
import { getErrorMessage } from "../../../../lib/api-client.js";

const STATUS_LABELS = {
  PENDING_PAYMENT: "To pay",
  PENDING_CONFIRMATION: "Waiting for approval",
  PREPARING: "Preparing",
  READY_FOR_PICKUP: "Ready for pickup",
  OUT_FOR_DELIVERY: "Out for delivery",
  COMPLETED: "Completed",
  CANCELLED: "Cancelled",
};

const tiles = categories.filter((c) => c.id !== "all");

export default function MB_OrdersPage() {
  const { addRating } = useRatings();
  const [active, setActive] = useState("all");
  const [ratingFor, setRatingFor] = useState(null);
  const [rated, setRated] = useState({});
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let ignore = false;
    setLoading(true);
    setError(null);
    getMyOrders()
      .then((res) => {
        if (!ignore) {
          const mapped = res.data.map((order) => ({
            id: order.id,
            orderNumber: order.orderNumber,
            seller: order.store.name,
            status: STATUS_LABELS[order.orderStatus] || order.orderStatus,
            tone: getOrderTone(order.orderStatus),
            total: Number(order.totalAmount),
            fulfillment: order.deliveryMethod === "ROOM_TO_ROOM" ? "Room-to-room delivery" : "Pickup",
            createdAt: order.createdAt,
          }));
          setOrders(mapped);
        }
      })
      .catch((err) => {
        if (!ignore) {
          setError(getErrorMessage(err));
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
  }, []);

  const current = categories.find((c) => c.id === active);
  const visible = useMemo(() => orders.filter(current.match), [current, orders]);

  if (loading) {
    return (
      <div className="py-20 text-center">
        <p className="text-sm text-slate-500 dark:text-slate-400">Loading orders…</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="py-20 text-center">
        <p className="text-sm font-semibold text-rose-600 dark:text-rose-400">{error}</p>
        <button
          type="button"
          onClick={() => window.location.reload()}
          className="mt-2 text-xs font-semibold text-sky-600"
        >
          Try again
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      <h1 className="text-2xl font-extrabold tracking-tight text-slate-900 dark:text-slate-100">My Orders</h1>

      <section className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4 shadow-sm">
        <div className="mb-4 flex items-center justify-between">
          <p className="text-sm font-bold text-slate-900 dark:text-slate-100">My Purchases</p>
          <button type="button" onClick={() => setActive("all")} className="flex items-center gap-1 text-[11px] font-semibold text-sky-600">
            View order history
            <Icon name="chevronDown" className="h-3 w-3 -rotate-90" />
          </button>
        </div>
        <div className="grid grid-cols-4 gap-2">
          {tiles.map((t) => {
            const count = orders.filter(t.match).length;
            const selected = active === t.id;
            return (
              <button
                key={t.id}
                type="button"
                aria-pressed={selected}
                onClick={() => setActive(selected ? "all" : t.id)}
                className="flex flex-col items-center gap-2 text-center transition active:scale-95"
              >
                <span className={`relative flex h-12 w-12 items-center justify-center rounded-xl border transition ${
                  selected ? "border-[#0284C7] bg-sky-100 text-[#0284C7]" : "border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-600 dark:text-slate-300"
                }`}>
                  <Icon name={t.icon} className="h-5 w-5" />
                  {count > 0 && (
                    <span className="absolute -right-1.5 -top-1.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-rose-500 px-1 text-[9px] font-bold text-white ring-2 ring-white dark:ring-slate-900">
                      {count}
                    </span>
                  )}
                </span>
                <span className={`text-[10px] font-semibold leading-tight ${selected ? "text-[#0284C7]" : "text-slate-600 dark:text-slate-300"}`}>{t.label}</span>
              </button>
            );
          })}
        </div>
      </section>

      <div className="flex items-center justify-between">
        <h2 className="text-sm font-bold text-slate-900 dark:text-slate-100">{current.label}</h2>
        <span className="text-xs text-slate-500 dark:text-slate-400">{visible.length} {visible.length === 1 ? "order" : "orders"}</span>
      </div>

      {visible.length === 0 && (
        <div className="rounded-2xl border border-dashed border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 p-8 text-center text-xs text-slate-500 dark:text-slate-400">
          No orders in this category yet.
        </div>
      )}

      <div className="space-y-3">
        {visible.map((o) => (
          <OrderCard key={o.id} order={o} rated={!!rated[o.id]} onRate={setRatingFor} />
        ))}
      </div>

      {ratingFor && (
        <RatingModal
          seller={ratingFor.seller}
          initials={ratingFor.seller.split(" ").map((w) => w[0]).join("").slice(0, 2)}
          orderRef={`#${ratingFor.orderNumber}`}
          onClose={() => setRatingFor(null)}
          onSubmit={({ rating, comment }) => {
            addRating(ratingFor.seller, rating, comment);
            setRated({ ...rated, [ratingFor.id]: true });
            setRatingFor(null);
          }}
        />
      )}
    </div>
  );
}

function getOrderTone(orderStatus) {
  if (orderStatus === "COMPLETED") return "emerald";
  if (orderStatus === "CANCELLED") return "rose";
  if (orderStatus === "PENDING_PAYMENT" || orderStatus === "PENDING_CONFIRMATION") return "amber";
  return "sky";
}
