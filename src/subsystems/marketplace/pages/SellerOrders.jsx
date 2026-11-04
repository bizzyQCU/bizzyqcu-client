import React, { useState } from "react";
import { useSellerOrders } from "../components/useSellerOrders";
import "../components/SellerOrders.css";

import {
  LayoutDashboard,
  Package,
  Boxes,
  ClipboardList,
  BarChart3,
  Settings,
  LogOut,
  MessageSquare,
  Bell,
  User,
  RotateCw,
  Search,
  SlidersHorizontal,
  Calendar,
  CreditCard,
  PackageCheck,
  Truck,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  X,
} from "lucide-react";

export default function SellerOrders() {
  const {
    searchTerm,
    handleSearch,
    paymentFilter,
    handlePaymentFilter,
    statusFilter,
    handleStatusFilter,
    thisWeekOnly,
    handleToggleThisWeek,
    isRefreshing,
    handleRefresh,
    metrics,
    handleMetricClick,
    activeMetric,
    pagedOrders,
    totalFiltered,
    startIndex,
    safePage,
    pageNumbers,
    totalPages,
    setCurrentPage,
  } = useSellerOrders();

  // ── Filter dropdown open/close ──────────────────────────────────────────
  const [filterOpen, setFilterOpen] = useState(false);

  const hasActiveFilters =
    paymentFilter || statusFilter || thisWeekOnly || searchTerm;

  return (
    <div className="flex min-h-screen bg-[#F8FAFC]">
      {/* ================= SIDEBAR ================= */}
      <aside className="w-64 bg-[#0F172A] text-slate-300 flex flex-col justify-between shrink-0">
        <div>
          <div className="p-6 flex items-center space-x-3">
            <div className="w-9 h-9 bg-[#0284C7] rounded-lg flex items-center justify-center font-bold text-white text-xl">
              B
            </div>
            <div>
              <h1 className="font-bold text-white text-lg leading-none">
                Bizzy<span className="text-[#0284C7]">QCU</span>
              </h1>
              <span className="text-[10px] tracking-wider text-slate-400 font-semibold uppercase">
                Student Org Seller Portal
              </span>
            </div>
          </div>

          <nav className="px-3 mt-4 space-y-1">
            <a
              href="#dashboard"
              className="flex items-center space-x-3 px-3 py-2.5 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white text-sm font-medium transition-colors"
            >
              <LayoutDashboard className="w-5 h-5" />
              <span>Dashboard</span>
            </a>
            <a
              href="#products"
              className="flex items-center space-x-3 px-3 py-2.5 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white text-sm font-medium transition-colors"
            >
              <Package className="w-5 h-5" />
              <span>Products</span>
            </a>
            <a
              href="#inventory"
              className="flex items-center space-x-3 px-3 py-2.5 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white text-sm font-medium transition-colors"
            >
              <Boxes className="w-5 h-5" />
              <span>Inventory Management</span>
            </a>
            <a
              href="#orders"
              className="flex items-center space-x-3 px-3 py-2.5 rounded-lg bg-[#0284C7] text-white text-sm font-medium shadow-sm"
            >
              <ClipboardList className="w-5 h-5" />
              <span>Orders</span>
            </a>
            <a
              href="#reports"
              className="flex items-center space-x-3 px-3 py-2.5 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white text-sm font-medium transition-colors"
            >
              <BarChart3 className="w-5 h-5" />
              <span>Reports & Analytics</span>
            </a>
          </nav>
        </div>

        <div className="p-3 border-t border-slate-800 space-y-1">
          <a
            href="#settings"
            className="flex items-center space-x-3 px-3 py-2.5 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white text-sm font-medium transition-colors"
          >
            <Settings className="w-5 h-5" />
            <span>Account Settings</span>
          </a>
          {/* Log Out — needs auth service; no-op until backend exists */}
          <button className="w-full flex items-center space-x-3 px-3 py-2.5 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white text-sm font-medium transition-colors text-left">
            <LogOut className="w-5 h-5" />
            <span>Log Out</span>
          </button>
        </div>
      </aside>

      {/* ================= MAIN CONTENT CONTAINER ================= */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* ── Page header (replaces global Navbar on this route) ── */}
        <header className="h-16 bg-white border-b border-slate-200 px-8 flex items-center justify-between">
          <div>
            <h2 className="font-bold text-slate-900 text-base">
              QCU Computer Society (QCS)
            </h2>
            <p className="text-xs text-slate-500">
              AWS IK Building, Basement, Booth No. 3
            </p>
          </div>
          <div className="flex items-center space-x-4">
            {/* Messages — needs messaging API; no-op until backend exists */}
            <button
              className="p-2 text-slate-500 hover:text-slate-700 hover:bg-slate-100 rounded-full transition-colors"
              title="Messages (coming soon)"
            >
              <MessageSquare className="w-5 h-5" />
            </button>
            {/* Notifications — needs notification API; no-op until backend exists */}
            <button
              className="p-2 text-slate-500 hover:text-slate-700 hover:bg-slate-100 rounded-full transition-colors relative"
              title="Notifications (coming soon)"
            >
              <Bell className="w-5 h-5" />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full" />
            </button>
            {/* User profile — needs auth session; no-op until backend exists */}
            <div
              className="w-8 h-8 rounded-full bg-[#0284C7] text-white flex items-center justify-center cursor-pointer"
              title="Profile (coming soon)"
            >
              <User className="w-5 h-5" />
            </div>
          </div>
        </header>

        <main className="p-8 space-y-6 flex-1 overflow-y-auto">
          {/* ── Page title + Refresh ── */}
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-slate-900">Orders</h1>
              <p className="text-sm text-slate-500">
                Manage customer orders, payments, and fulfillment.
              </p>
            </div>
            <button
              onClick={handleRefresh}
              className="flex items-center space-x-2 px-4 py-2 border border-slate-300 rounded-lg bg-white text-slate-700 text-sm font-medium hover:bg-slate-50 shadow-sm transition-colors"
            >
              <RotateCw
                className={`w-4 h-4 ${isRefreshing ? "animate-spin" : ""}`}
              />
              <span>Refresh</span>
            </button>
          </div>

          {/* ── Metric summary cards — click to filter table ── */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* New Orders — filters to Pending payment + Processing status */}
            <button
              type="button"
              onClick={() => handleMetricClick("new")}
              className={`text-left bg-white p-5 rounded-xl border shadow-sm transition-all focus:outline-none focus:ring-2 focus:ring-sky-400 ${
                activeMetric.new
                  ? "border-sky-500 ring-1 ring-sky-400"
                  : "border-slate-200 hover:border-sky-300"
              }`}
            >
              <div className="flex items-center justify-between mb-3">
                <span className="text-sm font-medium text-slate-600">
                  New Orders
                </span>
                <div className="w-8 h-8 rounded-lg bg-sky-50 text-sky-600 flex items-center justify-center">
                  <CreditCard className="w-4 h-4" />
                </div>
              </div>
              <div className="text-2xl font-bold text-slate-900">
                {metrics.newOrders}
              </div>
              <p className="text-xs text-slate-500 mt-1">
                Awaiting confirmation
              </p>
            </button>

            {/* To Process — filters to Processing order status */}
            <button
              type="button"
              onClick={() => handleMetricClick("toProcess")}
              className={`text-left bg-white p-5 rounded-xl border shadow-sm transition-all focus:outline-none focus:ring-2 focus:ring-amber-400 ${
                activeMetric.toProcess
                  ? "border-amber-500 ring-1 ring-amber-400"
                  : "border-slate-200 hover:border-amber-300"
              }`}
            >
              <div className="flex items-center justify-between mb-3">
                <span className="text-sm font-medium text-slate-600">
                  To Process
                </span>
                <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center">
                  <PackageCheck className="w-4 h-4" />
                </div>
              </div>
              <div className="text-2xl font-bold text-slate-900">
                {metrics.toProcess}
              </div>
              <p className="text-xs text-slate-500 mt-1">
                Ready for packaging/prep
              </p>
            </button>

            {/* In Transit — filters to Out for Delivery */}
            <button
              type="button"
              onClick={() => handleMetricClick("inTransit")}
              className={`text-left bg-white p-5 rounded-xl border shadow-sm transition-all focus:outline-none focus:ring-2 focus:ring-blue-400 ${
                activeMetric.inTransit
                  ? "border-blue-500 ring-1 ring-blue-400"
                  : "border-slate-200 hover:border-blue-300"
              }`}
            >
              <div className="flex items-center justify-between mb-3">
                <span className="text-sm font-medium text-slate-600">
                  In Transit
                </span>
                <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
                  <Truck className="w-4 h-4" />
                </div>
              </div>
              <div className="text-2xl font-bold text-slate-900">
                {metrics.inTransit}
              </div>
              <p className="text-xs text-slate-500 mt-1">
                En route to delivery/pickup
              </p>
            </button>

            {/* Completed — filters to Completed */}
            <button
              type="button"
              onClick={() => handleMetricClick("completed")}
              className={`text-left bg-white p-5 rounded-xl border shadow-sm transition-all focus:outline-none focus:ring-2 focus:ring-emerald-400 ${
                activeMetric.completed
                  ? "border-emerald-500 ring-1 ring-emerald-400"
                  : "border-slate-200 hover:border-emerald-300"
              }`}
            >
              <div className="flex items-center justify-between mb-3">
                <span className="text-sm font-medium text-slate-600">
                  Completed
                </span>
                <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
                  <CheckCircle2 className="w-4 h-4" />
                </div>
              </div>
              <div className="text-2xl font-bold text-slate-900">
                {metrics.completed}
              </div>
              <p className="text-xs text-slate-500 mt-1">
                Fulfilled successfully
              </p>
            </button>
          </div>

          {/* ── Search + Filter controls ── */}
          <div className="flex items-center space-x-3">
            {/* Search input */}
            <div className="relative flex-1">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => handleSearch(e.target.value)}
                placeholder="Search by order ID or buyer name..."
                className="w-full pl-9 pr-9 py-2 bg-white border border-slate-200 rounded-lg text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-sky-500 shadow-sm"
              />
              {searchTerm && (
                <button
                  onClick={() => handleSearch("")}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                  aria-label="Clear search"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            {/* Filter dropdown */}
            <div className="relative">
              <button
                onClick={() => setFilterOpen((o) => !o)}
                className={`flex items-center space-x-2 px-4 py-2 border rounded-lg text-sm font-medium shadow-sm transition-colors ${
                  paymentFilter || statusFilter
                    ? "border-sky-500 bg-sky-50 text-sky-700"
                    : "border-slate-200 bg-white text-slate-700 hover:bg-slate-50"
                }`}
              >
                <SlidersHorizontal className="w-4 h-4 text-slate-500" />
                <span>Filter{paymentFilter || statusFilter ? " ●" : ""}</span>
              </button>

              {filterOpen && (
                <div className="seller-orders-filter-dropdown absolute right-0 mt-1 w-56 bg-white border border-slate-200 rounded-xl shadow-lg z-20 p-4 space-y-4">
                  <div>
                    <p className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider mb-2">
                      Payment Status
                    </p>
                    <div className="space-y-1">
                      {["", "Paid", "Pending", "Refunded"].map((val) => (
                        <label
                          key={val}
                          className="flex items-center space-x-2 cursor-pointer group"
                        >
                          <input
                            type="radio"
                            name="paymentFilter"
                            value={val}
                            checked={paymentFilter === val}
                            onChange={() => {
                              handlePaymentFilter(val);
                            }}
                            className="accent-sky-600"
                          />
                          <span className="text-sm text-slate-700 group-hover:text-slate-900">
                            {val || "All"}
                          </span>
                        </label>
                      ))}
                    </div>
                  </div>

                  <div>
                    <p className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider mb-2">
                      Order Status
                    </p>
                    <div className="space-y-1">
                      {[
                        "",
                        "Processing",
                        "Out for Delivery",
                        "Completed",
                        "Cancelled",
                      ].map((val) => (
                        <label
                          key={val}
                          className="flex items-center space-x-2 cursor-pointer group"
                        >
                          <input
                            type="radio"
                            name="statusFilter"
                            value={val}
                            checked={statusFilter === val}
                            onChange={() => {
                              handleStatusFilter(val);
                            }}
                            className="accent-sky-600"
                          />
                          <span className="text-sm text-slate-700 group-hover:text-slate-900">
                            {val || "All"}
                          </span>
                        </label>
                      ))}
                    </div>
                  </div>

                  <button
                    onClick={() => {
                      handlePaymentFilter("");
                      handleStatusFilter("");
                      setFilterOpen(false);
                    }}
                    className="w-full text-xs text-slate-500 hover:text-slate-700 text-center pt-1 border-t border-slate-100"
                  >
                    Clear filters
                  </button>
                </div>
              )}
            </div>

            {/* This Week toggle */}
            <button
              onClick={handleToggleThisWeek}
              className={`flex items-center space-x-2 px-4 py-2 border rounded-lg text-sm font-medium shadow-sm transition-colors ${
                thisWeekOnly
                  ? "border-sky-500 bg-sky-50 text-sky-700"
                  : "border-slate-200 bg-white text-slate-700 hover:bg-slate-50"
              }`}
            >
              <Calendar className="w-4 h-4 text-slate-500" />
              <span>This Week</span>
            </button>
          </div>

          {/* ── Active filter chips ── */}
          {hasActiveFilters && (
            <div className="flex items-center flex-wrap gap-2 -mt-2">
              {searchTerm && (
                <span className="seller-orders-chip">
                  Search: "{searchTerm}"
                  <button
                    onClick={() => handleSearch("")}
                    aria-label="Remove search filter"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </span>
              )}
              {paymentFilter && (
                <span className="seller-orders-chip">
                  Payment: {paymentFilter}
                  <button
                    onClick={() => handlePaymentFilter("")}
                    aria-label="Remove payment filter"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </span>
              )}
              {statusFilter && (
                <span className="seller-orders-chip">
                  Status: {statusFilter}
                  <button
                    onClick={() => handleStatusFilter("")}
                    aria-label="Remove status filter"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </span>
              )}
              {thisWeekOnly && (
                <span className="seller-orders-chip">
                  This Week
                  <button
                    onClick={handleToggleThisWeek}
                    aria-label="Remove this week filter"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </span>
              )}
              <button
                onClick={handleRefresh}
                className="text-xs text-slate-500 hover:text-slate-700 underline underline-offset-2"
              >
                Clear all
              </button>
            </div>
          )}

          {/* ── Table ── */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse min-w-[950px]">
                <thead>
                  <tr className="border-b border-slate-200 bg-slate-50/50 text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                    <th className="py-3.5 px-6">Order ID</th>
                    <th className="py-3.5 px-6">Order Date</th>
                    <th className="py-3.5 px-6">Buyer</th>
                    <th className="py-3.5 px-6">Items</th>
                    <th className="py-3.5 px-6">Total</th>
                    <th className="py-3.5 px-6">Payment Status</th>
                    <th className="py-3.5 px-6">Order Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-sm">
                  {pagedOrders.length === 0 ? (
                    <tr>
                      <td
                        colSpan={7}
                        className="py-12 text-center text-slate-400 text-sm"
                      >
                        No orders match your current filters.
                      </td>
                    </tr>
                  ) : (
                    pagedOrders.map((order) => (
                      <tr
                        key={order.id}
                        className="hover:bg-slate-50/60 transition-colors"
                      >
                        {/*
                          Order ID click — needs an order detail page/route to be built first.
                          Wired as a no-op link for now; replace href with real route when ready.
                        */}
                        <td className="py-4 px-6 font-semibold text-[#0284C7] cursor-pointer hover:underline whitespace-nowrap">
                          {order.id}
                        </td>
                        <td className="py-4 px-6 text-slate-500 text-xs whitespace-nowrap">
                          {order.date}
                        </td>
                        <td className="py-4 px-6 font-medium text-slate-800 whitespace-nowrap">
                          {order.buyer}
                        </td>
                        <td className="py-4 px-6 text-slate-700">
                          <span>{order.items}</span>
                          {order.extraItemsCount > 0 && (
                            <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-slate-100 text-slate-600 whitespace-nowrap">
                              +{order.extraItemsCount} more item
                              {order.extraItemsCount > 1 ? "s" : ""}
                            </span>
                          )}
                        </td>
                        <td className="py-4 px-6 font-bold text-slate-900 whitespace-nowrap">
                          {order.total}
                        </td>
                        <td className="py-4 px-6 whitespace-nowrap">
                          <span
                            className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                              order.paymentStatus === "Paid"
                                ? "bg-emerald-50 text-emerald-700"
                                : order.paymentStatus === "Pending"
                                  ? "bg-amber-50 text-amber-700"
                                  : "bg-rose-50 text-rose-700"
                            }`}
                          >
                            {order.paymentStatus}
                          </span>
                        </td>
                        <td className="py-4 px-6 whitespace-nowrap text-slate-600 font-medium">
                          {order.orderStatus}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            {/* ── Pagination footer ── */}
            <div className="px-6 py-4 border-t border-slate-200 flex items-center justify-between text-xs text-slate-500">
              <div>
                {totalFiltered === 0 ? (
                  "No orders"
                ) : (
                  <>
                    Showing{" "}
                    <span className="font-semibold text-slate-800">
                      {startIndex + 1}
                    </span>{" "}
                    to{" "}
                    <span className="font-semibold text-slate-800">
                      {Math.min(startIndex + pagedOrders.length, totalFiltered)}
                    </span>{" "}
                    of{" "}
                    <span className="font-semibold text-slate-800">
                      {totalFiltered}
                    </span>{" "}
                    orders
                  </>
                )}
              </div>

              {totalPages > 1 && (
                <div className="flex items-center space-x-1">
                  <button
                    disabled={safePage === 1}
                    onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
                    className="flex items-center px-2 py-1 rounded text-slate-400 hover:text-slate-600 disabled:opacity-40 disabled:cursor-not-allowed"
                  >
                    <ChevronLeft className="w-4 h-4 mr-0.5" /> Previous
                  </button>

                  {pageNumbers.map((page) => (
                    <button
                      key={page}
                      onClick={() => setCurrentPage(page)}
                      className={`w-7 h-7 rounded flex items-center justify-center font-medium ${
                        safePage === page
                          ? "bg-[#0284C7] text-white"
                          : "text-slate-600 hover:bg-slate-100"
                      }`}
                    >
                      {page}
                    </button>
                  ))}

                  <button
                    disabled={safePage === totalPages}
                    onClick={() =>
                      setCurrentPage((p) => Math.min(p + 1, totalPages))
                    }
                    className="flex items-center px-2 py-1 rounded text-slate-600 hover:text-slate-800 font-medium disabled:opacity-40 disabled:cursor-not-allowed"
                  >
                    Next <ChevronRight className="w-4 h-4 ml-0.5" />
                  </button>
                </div>
              )}
            </div>
          </div>
        </main>
      </div>

      {/* Close filter dropdown when clicking outside */}
      {filterOpen && (
        <div
          className="fixed inset-0 z-10"
          onClick={() => setFilterOpen(false)}
        />
      )}
    </div>
  );
}
