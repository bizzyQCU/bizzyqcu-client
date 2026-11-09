import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { getMyOrders } from "../api";
import { useAuth } from "../../../hooks";

const ORDER_STATUS_BADGES = {
  PENDING_CONFIRMATION: {
    label: "Pending Confirmation",
    bg: "bg-amber-500/10 text-amber-400 border-amber-500/30",
  },
  PREPARING: {
    label: "Preparing Order",
    bg: "bg-blue-500/10 text-blue-400 border-blue-500/30",
  },
  READY_FOR_PICKUP: {
    label: "Ready for Campus Pickup",
    bg: "bg-indigo-500/10 text-indigo-400 border-indigo-500/30",
  },
  COMPLETED: {
    label: "Completed",
    bg: "bg-emerald-500/10 text-emerald-400 border-emerald-500/30",
  },
  CANCELLED: {
    label: "Cancelled",
    bg: "bg-rose-500/10 text-rose-400 border-rose-500/30",
  },
};

export default function OrdersPage() {
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchOrders = async () => {
    if (!isAuthenticated) return;
    setLoading(true);
    try {
      const res = await getMyOrders();
      setOrders(res.data || []);
    } catch (err) {
      console.error("Failed to fetch customer orders:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, [isAuthenticated]);

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-[#0B1120] text-slate-100 flex flex-col items-center justify-center p-6 text-center">
        <div className="max-w-md bg-[#1E293B] border border-slate-700/80 rounded-2xl p-8 shadow-xl space-y-4">
          <div className="text-4xl">🔐</div>
          <h2 className="text-xl font-bold text-white">Sign In Required</h2>
          <p className="text-sm text-slate-400">
            Please log in with your QCU credentials to view your order history and manage your purchases.
          </p>
          <Link
            to="/login"
            className="inline-block px-6 py-2.5 bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold text-sm rounded-xl transition-all"
          >
            Log In to View Orders
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0B1120] text-slate-100 py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl mx-auto space-y-8">
        {/* ============================================================== */}
        {/* HEADER */}
        {/* ============================================================== */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-5">
          <div className="space-y-1">
            <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
              My Orders & Purchase History
            </h1>
            <p className="text-xs sm:text-sm text-slate-400">
              Track your campus deliveries, pickup schedules, and contact administrators for dispute mediation.
            </p>
          </div>

          <Link
            to="/marketplace"
            className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-bold rounded-xl self-start sm:self-auto transition-colors"
          >
            ← Browse Marketplace
          </Link>
        </div>

        {/* ============================================================== */}
        {/* ORDERS LIST */}
        {/* ============================================================== */}
        {loading ? (
          <div className="space-y-4">
            {[1, 2, 3].map((n) => (
              <div key={n} className="bg-[#1E293B] p-6 rounded-2xl border border-slate-800 animate-pulse space-y-4">
                <div className="h-5 bg-slate-700 rounded w-1/3" />
                <div className="h-16 bg-slate-800 rounded-xl" />
                <div className="h-8 bg-slate-700 rounded w-1/4" />
              </div>
            ))}
          </div>
        ) : orders.length === 0 ? (
          <div className="bg-[#1E293B] border border-dashed border-slate-700 p-12 rounded-2xl text-center space-y-3">
            <div className="text-4xl">📦</div>
            <h3 className="text-lg font-bold text-white">No orders placed yet</h3>
            <p className="text-xs text-slate-400 max-w-sm mx-auto">
              You haven't ordered from any student enterprise or campus shop yet. Support fellow QCUian entrepreneurs today!
            </p>
            <Link
              to="/marketplace"
              className="inline-block mt-2 px-5 py-2.5 bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold text-xs rounded-xl shadow-md"
            >
              Start Shopping
            </Link>
          </div>
        ) : (
          <div className="space-y-5">
            {orders.map((order) => {
              const statusBadge =
                ORDER_STATUS_BADGES[order.orderStatus] || {
                  label: order.orderStatus,
                  bg: "bg-slate-500/10 text-slate-300 border-slate-500/30",
                };

              return (
                <div
                  key={order.id}
                  className="bg-[#1E293B] border border-slate-700/80 rounded-2xl p-6 shadow-xl space-y-4 hover:border-slate-600 transition-all"
                >
                  {/* Order Top Bar */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-700/60 pb-4">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2.5">
                        <span className="font-mono font-bold text-amber-400 text-sm">
                          {order.orderNumber}
                        </span>
                        <span className="text-slate-500">•</span>
                        <span className="text-xs text-slate-400">
                          {new Date(order.createdAt).toLocaleDateString("en-US", {
                            month: "short",
                            day: "numeric",
                            year: "numeric",
                          })}
                        </span>
                      </div>
                      <div className="text-xs text-slate-300">
                        Sold by: <strong className="text-white">{order.store?.name || "Campus Enterprise"}</strong>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-bold border ${statusBadge.bg}`}
                      >
                        {statusBadge.label}
                      </span>
                    </div>
                  </div>

                  {/* Items List */}
                  <div className="space-y-2">
                    <div className="text-[11px] font-bold uppercase text-slate-400 tracking-wider">
                      Ordered Items
                    </div>
                    <div className="bg-[#0B1120] rounded-xl p-3 border border-slate-800 space-y-2">
                      {order.items?.map((item) => (
                        <div
                          key={item.id}
                          className="flex items-center justify-between text-xs py-1 border-b border-slate-800/60 last:border-0"
                        >
                          <div className="space-y-0.5">
                            <span className="font-medium text-white">{item.productNameSnapshot}</span>
                            <div className="text-[11px] text-slate-400">
                              Qty: {item.quantity} × ₱{Number(item.unitPriceSnapshot).toFixed(2)}
                            </div>
                          </div>
                          <span className="font-mono font-bold text-slate-200">
                            ₱{Number(item.subtotal).toFixed(2)}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Delivery & Payment Details */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs bg-[#0B1120] p-3 rounded-xl border border-slate-800">
                    <div className="space-y-0.5">
                      <span className="text-slate-400">Delivery Method:</span>
                      <p className="text-slate-200 font-semibold">
                        {order.deliveryMethod === "PICKUP"
                          ? `📍 Campus Pickup: ${order.pickupInstructions || order.store?.pickupLocation || "Campus Lobby"}`
                          : `🚪 Room-to-Room: ${order.campusBuilding || ""} ${order.campusRoomNumber || ""}`}
                      </p>
                    </div>

                    <div className="space-y-0.5 sm:text-right">
                      <span className="text-slate-400">Payment:</span>
                      <p className="text-slate-200 font-semibold">
                        {order.paymentMethod === "GCASH_PAYMONGO"
                          ? "💳 PayMongo GCash Split"
                          : "💵 Cash on Campus Pickup"}{" "}
                        ({order.payment?.status || "PENDING"})
                      </p>
                    </div>
                  </div>

                  {/* Order Footer & Actions */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2 border-t border-slate-700/60">
                    <div className="text-sm">
                      <span className="text-slate-400">Total Amount: </span>
                      <strong className="text-lg font-extrabold text-amber-400">
                        ₱{Number(order.totalAmount).toFixed(2)}
                      </strong>
                    </div>

                    {/* CONTACT ADMIN FOR THIS ORDER BUTTON */}
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => navigate(`/contact-admin?orderId=${order.id}`)}
                        className="py-2 px-3.5 rounded-xl bg-amber-500/10 hover:bg-amber-500/20 text-amber-400 border border-amber-400/30 text-xs font-bold transition-all flex items-center gap-1.5"
                      >
                        <span>🛡️</span>
                        <span>Report Issue to Admin</span>
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

