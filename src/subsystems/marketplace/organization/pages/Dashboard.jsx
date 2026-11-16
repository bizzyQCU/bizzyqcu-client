import { useCallback, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  AlertTriangle,
  ArrowRight,
  CheckCircle2,
  ClipboardList,
  DollarSign,
  Package,
  RotateCw,
  ShoppingBag,
  Store,
  TrendingUp,
} from "lucide-react";
import Sidebar from "../components/Sidebar";
import SellerTopBar from "../components/SellerTopBar";
import {
  getErrorMessage,
  getMyStore,
  getSellerDashboard,
  getSellerOrders,
} from "../../api";
import { peso } from "../../utils/format";

const ACTIVE_ORDER_KEYS = [
  "PENDING_PAYMENT",
  "PENDING_CONFIRMATION",
  "PREPARING",
  "READY_FOR_PICKUP",
  "OUT_FOR_DELIVERY",
];

const ORDER_STATUS_BADGE = {
  PENDING_PAYMENT: "bg-slate-100 text-slate-700",
  PENDING_CONFIRMATION: "bg-amber-50 text-amber-700",
  PREPARING: "bg-sky-50 text-sky-700",
  READY_FOR_PICKUP: "bg-indigo-50 text-indigo-700",
  OUT_FOR_DELIVERY: "bg-blue-50 text-blue-700",
  COMPLETED: "bg-emerald-50 text-emerald-700",
  CANCELLED: "bg-rose-50 text-rose-700",
};

function formatStatus(status) {
  return String(status || "")
    .toLowerCase()
    .split("_")
    .filter(Boolean)
    .map((part) => part[0].toUpperCase() + part.slice(1))
    .join(" ");
}

export default function Dashboard() {
  const [dashboard, setDashboard] = useState(null);
  const [storeInfo, setStoreInfo] = useState(null);
  const [recentOrders, setRecentOrders] = useState([]);
  const [missingStore, setMissingStore] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const loadDashboard = useCallback(async () => {
    setLoading(true);
    setError(null);
    setMissingStore(false);

    try {
      const [dashRes, storeRes, ordersRes] = await Promise.allSettled([
        getSellerDashboard(),
        getMyStore(),
        getSellerOrders(),
      ]);

      const dashErr = dashRes.status === "rejected" ? dashRes.reason : null;
      const storeErr = storeRes.status === "rejected" ? storeRes.reason : null;

      if (dashErr?.response?.status === 404 || storeErr?.response?.status === 404) {
        setMissingStore(true);
        setDashboard(null);
        setStoreInfo(null);
        setRecentOrders([]);
        return;
      }

      if (dashRes.status === "rejected") {
        throw dashRes.reason;
      }

      const dashData = dashRes.value?.data || dashRes.value || null;
      const storeData =
        storeRes.status === "fulfilled"
          ? storeRes.value?.data || storeRes.value
          : dashData?.store || null;
      const ordersList =
        ordersRes.status === "fulfilled"
          ? ordersRes.value?.data || ordersRes.value || []
          : [];

      setDashboard(dashData);
      setStoreInfo(storeData);
      setRecentOrders(Array.isArray(ordersList) ? ordersList.slice(0, 6) : []);
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadDashboard();
  }, [loadDashboard]);

  const ordersByStatus = dashboard?.ordersByStatus || {};
  const activeOrdersCount = ACTIVE_ORDER_KEYS.reduce(
    (sum, key) => sum + (Number(ordersByStatus[key]) || 0),
    0
  );
  const verifiedProductsCount =
    Number(dashboard?.productsByApproval?.VERIFIED) || 0;
  const pendingProductsCount =
    Number(dashboard?.productsByApproval?.PENDING) || 0;
  const lowStockProducts = dashboard?.lowStock?.products || [];
  const lowStockThreshold = dashboard?.lowStock?.threshold ?? 5;
  const topSelling = dashboard?.topSelling || [];

  const approvalStatus =
    storeInfo?.approvalStatus || dashboard?.store?.approvalStatus || "PENDING";
  const isOpen = storeInfo?.isOpen ?? dashboard?.store?.isOpen ?? false;

  return (
    <div className="flex min-h-screen bg-[#F8FAFC] text-slate-900">
      <Sidebar />

      <div className="flex-1 flex flex-col min-w-0">
        <SellerTopBar
          storeName={storeInfo?.name || dashboard?.store?.name}
          storeLocation={storeInfo?.pickupLocation}
        />

        <main className="p-6 sm:p-8 space-y-6 flex-1 overflow-y-auto max-w-7xl w-full mx-auto">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold text-slate-900">
                Organization Dashboard
              </h1>
              <p className="text-sm text-slate-500">
                Overview of your store sales, product approvals, stock alerts,
                and incoming orders.
              </p>
            </div>
            <button
              type="button"
              onClick={loadDashboard}
              disabled={loading}
              className="inline-flex items-center gap-2 px-4 py-2 border border-slate-200 rounded-lg bg-white text-slate-700 text-sm font-medium hover:bg-slate-50 shadow-sm transition-colors disabled:opacity-60"
            >
              <RotateCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
              <span>Refresh</span>
            </button>
          </div>

          {loading ? (
            <div className="bg-white rounded-xl border border-slate-200 p-16 flex flex-col items-center justify-center gap-3">
              <div className="w-8 h-8 border-4 border-slate-200 border-t-[#0284C7] rounded-full animate-spin" />
              <p className="text-sm text-slate-500">Loading store dashboard…</p>
            </div>
          ) : missingStore ? (
            <div className="bg-white rounded-2xl border border-slate-200 p-8 shadow-sm max-w-2xl">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-xl bg-sky-50 text-[#0284C7] flex items-center justify-center shrink-0">
                  <Store className="w-6 h-6" />
                </div>
                <div className="space-y-3">
                  <h2 className="text-lg font-bold text-slate-900">
                    Complete Your Organization Store Setup
                  </h2>
                  <p className="text-sm text-slate-600 leading-relaxed">
                    Your seller account is active, but you haven&apos;t registered a
                    campus store profile yet. Set up your organization name,
                    pickup location, and store bio in Account Settings to unlock
                    live dashboard metrics and product listings.
                  </p>
                  <Link
                    to="/seller/org/settings"
                    className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#0284C7] hover:bg-[#0369A1] text-white text-sm font-semibold transition-colors"
                  >
                    <span>Set Up Store in Account Settings</span>
                    <ArrowRight className="w-4 h-4" />
                  </Link>
                </div>
              </div>
            </div>
          ) : error ? (
            <div className="bg-rose-50 border border-rose-200 rounded-xl p-6 text-center">
              <h3 className="text-base font-bold text-rose-900 mb-1">
                Unable to load seller dashboard
              </h3>
              <p className="text-sm text-rose-700 mb-4">{error}</p>
              <button
                type="button"
                onClick={loadDashboard}
                className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white text-sm font-semibold rounded-lg transition-colors"
              >
                Try Again
              </button>
            </div>
          ) : (
            <>
              {/* Store Status Banner */}
              <div className="bg-white rounded-xl border border-slate-200 px-5 py-3.5 shadow-sm flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-9 h-9 rounded-lg bg-sky-50 text-[#0284C7] flex items-center justify-center shrink-0">
                    <Store className="w-5 h-5" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-bold text-slate-900 truncate">
                      {storeInfo?.name || dashboard?.store?.name || "Organization Store"}
                    </p>
                    <p className="text-xs text-slate-500 truncate">
                      {storeInfo?.pickupLocation || "Campus Pickup Booth"}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2 flex-wrap">
                  <span
                    className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold border ${
                      approvalStatus === "VERIFIED"
                        ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                        : approvalStatus === "REJECTED"
                          ? "bg-rose-50 text-rose-700 border-rose-200"
                          : "bg-amber-50 text-amber-700 border-amber-200"
                    }`}
                  >
                    Approval: {formatStatus(approvalStatus)}
                  </span>
                  <span
                    className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold border ${
                      isOpen
                        ? "bg-sky-50 text-[#0284C7] border-sky-200"
                        : "bg-slate-100 text-slate-600 border-slate-200"
                    }`}
                  >
                    {isOpen ? "Store Open" : "Store Closed"}
                  </span>
                  <Link
                    to="/seller/org/settings"
                    className="text-xs font-semibold text-[#0284C7] hover:underline ml-1"
                  >
                    Manage →
                  </Link>
                </div>
              </div>

              {/* 4 KPI Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-sm font-medium text-slate-600">
                      Total Revenue
                    </span>
                    <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
                      <DollarSign className="w-4 h-4" />
                    </div>
                  </div>
                  <div className="text-2xl font-bold text-slate-900">
                    {peso(dashboard?.sales?.totalRevenue ?? 0)}
                  </div>
                  <p className="text-xs text-slate-500 mt-1">
                    From completed store orders
                  </p>
                </div>

                <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-sm font-medium text-slate-600">
                      Completed Orders
                    </span>
                    <div className="w-8 h-8 rounded-lg bg-sky-50 text-[#0284C7] flex items-center justify-center">
                      <CheckCircle2 className="w-4 h-4" />
                    </div>
                  </div>
                  <div className="text-2xl font-bold text-slate-900">
                    {Number(dashboard?.sales?.completedOrders ?? 0).toLocaleString()}
                  </div>
                  <p className="text-xs text-slate-500 mt-1">
                    Successfully fulfilled
                  </p>
                </div>

                <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-sm font-medium text-slate-600">
                      Pending &amp; Active Orders
                    </span>
                    <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center">
                      <ClipboardList className="w-4 h-4" />
                    </div>
                  </div>
                  <div className="text-2xl font-bold text-slate-900">
                    {activeOrdersCount.toLocaleString()}
                  </div>
                  <p className="text-xs text-slate-500 mt-1">
                    Awaiting prep, pickup, or delivery
                  </p>
                </div>

                <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-sm font-medium text-slate-600">
                      Verified Products
                    </span>
                    <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
                      <Package className="w-4 h-4" />
                    </div>
                  </div>
                  <div className="text-2xl font-bold text-slate-900">
                    {verifiedProductsCount.toLocaleString()}
                  </div>
                  <p className="text-xs text-slate-500 mt-1">
                    {pendingProductsCount > 0
                      ? `${pendingProductsCount} awaiting approval`
                      : "All listings reviewed"}
                  </p>
                </div>
              </div>

              {/* Middle Row: Low Stock Alerts & Top Selling Products */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <section className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm flex flex-col">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2">
                      <AlertTriangle className="w-4 h-4 text-amber-500" />
                      <h2 className="text-base font-bold text-slate-900">
                        Low Stock Alerts
                      </h2>
                    </div>
                    <Link
                      to="/seller/org/inventory"
                      className="text-xs font-semibold text-[#0284C7] hover:underline"
                    >
                      Manage Inventory →
                    </Link>
                  </div>

                  {lowStockProducts.length === 0 ? (
                    <div className="py-8 text-center text-sm text-slate-500 flex-1 flex items-center justify-center">
                      All products are above {lowStockThreshold} units in stock.
                    </div>
                  ) : (
                    <ul className="divide-y divide-slate-100 flex-1">
                      {lowStockProducts.map((item) => (
                        <li
                          key={item.id}
                          className="py-2.5 flex items-center justify-between gap-3 text-sm"
                        >
                          <span className="font-medium text-slate-800 truncate">
                            {item.name}
                          </span>
                          <span
                            className={`px-2 py-0.5 rounded-full text-xs font-semibold shrink-0 ${
                              item.stockQuantity === 0
                                ? "bg-rose-50 text-rose-700"
                                : "bg-amber-50 text-amber-700"
                            }`}
                          >
                            {item.stockQuantity === 0
                              ? "Out of stock"
                              : `${item.stockQuantity} left`}
                          </span>
                        </li>
                      ))}
                    </ul>
                  )}
                </section>

                <section className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm flex flex-col">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2">
                      <TrendingUp className="w-4 h-4 text-[#0284C7]" />
                      <h2 className="text-base font-bold text-slate-900">
                        Top Selling Products
                      </h2>
                    </div>
                    <Link
                      to="/seller/org/products"
                      className="text-xs font-semibold text-[#0284C7] hover:underline"
                    >
                      View Products →
                    </Link>
                  </div>

                  {topSelling.length === 0 ? (
                    <div className="py-8 text-center text-sm text-slate-500 flex-1 flex items-center justify-center">
                      No completed sales recorded yet.
                    </div>
                  ) : (
                    <ul className="divide-y divide-slate-100 flex-1">
                      {topSelling.map((item) => (
                        <li
                          key={item.productId}
                          className="py-2.5 flex items-center justify-between gap-3 text-sm"
                        >
                          <div className="min-w-0">
                            <p className="font-medium text-slate-800 truncate">
                              {item.name || "Store Product"}
                            </p>
                            <p className="text-xs text-slate-500">
                              {item.unitsSold} units sold
                            </p>
                          </div>
                          <span className="font-bold text-slate-900 shrink-0">
                            {peso(item.revenue)}
                          </span>
                        </li>
                      ))}
                    </ul>
                  )}
                </section>
              </div>

              {/* Recent Orders Table */}
              <section className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
                <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <ShoppingBag className="w-4 h-4 text-[#0284C7]" />
                    <h2 className="text-base font-bold text-slate-900">
                      Recent Orders
                    </h2>
                  </div>
                  <Link
                    to="/seller/org/orders"
                    className="text-xs font-semibold text-[#0284C7] hover:underline"
                  >
                    Open Orders Portal →
                  </Link>
                </div>

                {recentOrders.length === 0 ? (
                  <div className="p-8 text-center text-sm text-slate-500">
                    No incoming orders for your store yet.
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse text-sm">
                      <thead>
                        <tr className="bg-slate-50/60 border-b border-slate-200 text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                          <th className="py-3 px-6">Order #</th>
                          <th className="py-3 px-6">Buyer</th>
                          <th className="py-3 px-6">Items</th>
                          <th className="py-3 px-6">Total</th>
                          <th className="py-3 px-6">Status</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {recentOrders.map((order) => (
                          <tr key={order.id} className="hover:bg-slate-50/70">
                            <td className="py-3.5 px-6 font-semibold text-[#0284C7] whitespace-nowrap">
                              {order.orderNumber}
                            </td>
                            <td className="py-3.5 px-6 text-slate-800 whitespace-nowrap">
                              {order.buyer?.fullName || "—"}
                            </td>
                            <td className="py-3.5 px-6 text-slate-600 max-w-xs truncate">
                              {order.items
                                ?.map((i) => `${i.productNameSnapshot} ×${i.quantity}`)
                                .join(", ") || "—"}
                            </td>
                            <td className="py-3.5 px-6 font-bold text-slate-900 whitespace-nowrap">
                              {peso(order.totalAmount)}
                            </td>
                            <td className="py-3.5 px-6 whitespace-nowrap">
                              <span
                                className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                  ORDER_STATUS_BADGE[order.orderStatus] ||
                                  "bg-slate-100 text-slate-700"
                                }`}
                              >
                                {formatStatus(order.orderStatus)}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </section>
            </>
          )}
        </main>
      </div>
    </div>
  );
}
