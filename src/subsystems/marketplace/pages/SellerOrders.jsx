import React, { useState } from "react";

import { useSellerOrders } from "../components/useSellerOrders";
import FilterModal from "../components/FilterModal";
import Sidebar from "../components/Sidebar";
import SellerMessages from "./SellerMessages";

import "../components/SellerOrders.css";

import {
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
  Shirt,
  Sparkles,
} from "lucide-react";

export default function SellerOrders() {
  const {
    searchTerm,
    setSearchTerm,
    currentPage,
    setCurrentPage,
    orders,
    totalFiltered,
    startIndex,
    safePage,
    pageNumbers,
    totalPages,
    isFilterModalOpen,
    setIsFilterModalOpen,
    appliedFilters,
    setAppliedFilters,
    selectedOrder,
    setSelectedOrder,
    thisWeekOnly,
    setThisWeekOnly,
  } = useSellerOrders();

  const [messagesOpen, setMessagesOpen] = useState(false);

  // Calculate total active filters count for the badge indicator
  const totalActiveFilters =
    appliedFilters.selectedCategories.length +
    appliedFilters.selectedStatuses.length +
    appliedFilters.selectedPaymentStatuses.length;

  return (
    <div className="flex min-h-screen bg-[#F8FAFC] relative">
      {/* ================= SIDEBAR ================= */}
      <Sidebar />

      {/* ================= MAIN CONTENT CONTAINER ================= */}
      <div className="flex-1 flex flex-col min-w-0">
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
            <button
              onClick={() => setMessagesOpen(true)}
              className="p-2 text-slate-500 hover:text-slate-700 hover:bg-slate-100 rounded-full transition-colors"
              title="Messages"
            >
              <MessageSquare className="w-5 h-5" />
            </button>
            <button className="p-2 text-slate-500 hover:text-slate-700 hover:bg-slate-100 rounded-full transition-colors relative">
              <Bell className="w-5 h-5" />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full" />
            </button>
            <div className="w-8 h-8 rounded-full bg-[#0284C7] text-white flex items-center justify-center cursor-pointer">
              <User className="w-5 h-5" />
            </div>
          </div>
        </header>

        <main className="p-8 space-y-6 flex-1 overflow-y-auto">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-slate-900">Orders</h1>
              <p className="text-sm text-slate-500">
                Manage customer orders, payments, and fulfillment.
              </p>
            </div>
            <button className="flex items-center space-x-2 px-4 py-2 border border-slate-300 rounded-lg bg-white text-slate-700 text-sm font-medium hover:bg-slate-50 shadow-sm transition-colors">
              <RotateCw className="w-4 h-4" />
              <span>Refresh</span>
            </button>
          </div>

          {/* Metric Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
              <div className="flex items-center justify-between mb-3">
                <span className="text-sm font-medium text-slate-600">
                  New Orders
                </span>
                <div className="w-8 h-8 rounded-lg bg-sky-50 text-sky-600 flex items-center justify-center">
                  <CreditCard className="w-4 h-4" />
                </div>
              </div>
              <div className="text-2xl font-bold text-slate-900">4</div>
              <p className="text-xs text-slate-500 mt-1">
                Awaiting confirmation
              </p>
            </div>
            <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
              <div className="flex items-center justify-between mb-3">
                <span className="text-sm font-medium text-slate-600">
                  To Process
                </span>
                <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center">
                  <PackageCheck className="w-4 h-4" />
                </div>
              </div>
              <div className="text-2xl font-bold text-slate-900">12</div>
              <p className="text-xs text-slate-500 mt-1">
                Ready for packaging/prep
              </p>
            </div>
            <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
              <div className="flex items-center justify-between mb-3">
                <span className="text-sm font-medium text-slate-600">
                  In Transit
                </span>
                <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
                  <Truck className="w-4 h-4" />
                </div>
              </div>
              <div className="text-2xl font-bold text-slate-900">8</div>
              <p className="text-xs text-slate-500 mt-1">
                En route to delivery/pickup
              </p>
            </div>
            <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
              <div className="flex items-center justify-between mb-3">
                <span className="text-sm font-medium text-slate-600">
                  Completed
                </span>
                <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
                  <CheckCircle2 className="w-4 h-4" />
                </div>
              </div>
              <div className="text-2xl font-bold text-slate-900">142</div>
              <p className="text-xs text-slate-500 mt-1">
                Fulfilled successfully
              </p>
            </div>
          </div>

          {/* Search Bar & Filter Button Trigger */}
          <div className="flex items-center space-x-3">
            <div className="relative flex-1">
              <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search by order ID or buyer name..."
                className="w-full pl-9 pr-4 py-2 bg-white border border-slate-200 rounded-lg text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-sky-500 shadow-sm"
              />
            </div>

            {/* Filter Modal Button */}
            <button
              onClick={() => setIsFilterModalOpen(true)}
              className="flex items-center space-x-2 px-4 py-2 border border-slate-200 rounded-lg bg-white text-slate-700 text-sm font-medium hover:bg-slate-50 shadow-sm transition-colors relative"
            >
              <SlidersHorizontal className="w-4 h-4 text-slate-500" />
              <span>Filter</span>
              {totalActiveFilters > 0 && (
                <span className="w-2 h-2 bg-[#0284C7] rounded-full ml-1" />
              )}
            </button>

            <button
              onClick={() => {
                setThisWeekOnly((prev) => !prev);
                setCurrentPage(1);
              }}
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

          {/* HORIZONTALLY SCROLLABLE TABLE AREA */}
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
                  {orders.map((order) => (
                    <tr
                      key={order.id}
                      onClick={() => setSelectedOrder(order)}
                      className="hover:bg-slate-50/80 transition-colors cursor-pointer"
                    >
                      <td className="py-4 px-6 font-semibold text-[#0284C7] cursor-pointer hover:underline whitespace-nowrap">
                        {order.id}
                      </td>
                      <td className="py-4 px-6 text-slate-500 text-xs whitespace-nowrap">
                        {order.date}
                      </td>
                      <td className="py-4 px-6 font-medium text-slate-800 whitespace-nowrap">
                        {order.buyer}
                      </td>
                      <td className="py-4 px-6 text-slate-700 whitespace-nowrap">
                        {order.items}
                      </td>
                      <td className="py-4 px-6 font-bold text-slate-900 whitespace-nowrap">
                        {order.total}
                      </td>
                      <td className="py-4 px-6 whitespace-nowrap">
                        <span
                          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            order.paymentStatus === "Paid"
                              ? "bg-emerald-50 text-emerald-700"
                              : "bg-amber-50 text-amber-700"
                          }`}
                        >
                          {order.paymentStatus}
                        </span>
                      </td>
                      <td className="py-4 px-6 whitespace-nowrap text-slate-600 font-medium">
                        {order.orderStatus}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination Footer */}
            <div className="px-6 py-4 border-t border-slate-200 flex items-center justify-between text-xs text-slate-500">
              <div>
                {totalFiltered === 0 ? (
                  "No orders match your filters."
                ) : (
                  <>
                    Showing{" "}
                    <span className="font-semibold text-slate-800">
                      {startIndex + 1}
                    </span>{" "}
                    to{" "}
                    <span className="font-semibold text-slate-800">
                      {Math.min(startIndex + orders.length, totalFiltered)}
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
                    onClick={() =>
                      setCurrentPage((prev) => Math.max(prev - 1, 1))
                    }
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
                      setCurrentPage((prev) => Math.min(prev + 1, totalPages))
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

      {/* Messages Full-Screen Overlay */}
      {messagesOpen && (
        <div className="fixed inset-0 z-50 overflow-hidden">
          {/* Close button */}
          <button
            onClick={() => setMessagesOpen(false)}
            className="absolute top-4 right-4 z-50 p-2 bg-white border border-slate-300 rounded-full shadow-lg hover:bg-slate-50 transition-colors"
            title="Close Messages"
          >
            <X className="w-5 h-5 text-slate-700" />
          </button>
          {/* Force SellerMessages to fill the full screen by overriding its internal min-height */}
          <div style={{ height: "100vh", overflow: "hidden" }}>
            <SellerMessages />
          </div>
        </div>
      )}

      {/* RENDER THE FILTER MODAL */}
      <FilterModal
        isOpen={isFilterModalOpen}
        onClose={() => setIsFilterModalOpen(false)}
        onApply={(filterData) => {
          setAppliedFilters(filterData);
          console.log("Applied filters updated:", filterData);
        }}
      />

      {/* ================= ORDER DETAILS SLIDE-OVER PANEL ================= */}
      {selectedOrder && (
        <div className="absolute inset-0 bg-black/40 z-50 flex justify-end">
          <div className="w-full max-w-lg bg-white h-full shadow-2xl flex flex-col overflow-y-auto animate-in slide-in-from-right duration-300">
            {/* Panel Header */}
            <div className="p-6 border-b border-slate-200 flex items-start justify-between bg-white sticky top-0 z-10">
              <div>
                <span className="text-[11px] font-semibold text-slate-400 tracking-wider uppercase">
                  Order Details
                </span>
                <h2 className="text-xl font-extrabold text-slate-900 mt-0.5">
                  {selectedOrder.id}
                </h2>
                <p className="text-xs text-slate-500 mt-0.5 flex items-center space-x-1">
                  <Calendar className="w-3.5 h-3.5 mr-1" />
                  <span>{selectedOrder.date}</span>
                </p>
              </div>
              <button
                onClick={() => setSelectedOrder(null)}
                className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-full transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Panel Content Body */}
            <div className="p-6 space-y-6 flex-1 text-sm text-slate-700">
              {/* Current Status Box */}
              <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 flex items-center justify-between">
                <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                  Current Status
                </span>
                <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-amber-50 text-amber-700 border border-amber-200">
                  ● {selectedOrder.orderStatus}
                </span>
              </div>

              {/* Customer Details */}
              <div className="space-y-3">
                <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                  Customer Details
                </h3>
                <div className="bg-slate-50/50 p-4 rounded-xl border border-slate-200 space-y-2.5">
                  <div className="flex justify-between">
                    <span className="text-slate-500">Buyer Name</span>
                    <span className="font-semibold text-slate-900">
                      {selectedOrder.buyer}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Student ID</span>
                    <span className="font-medium text-slate-800 font-mono text-xs bg-slate-200/60 px-2 py-0.5 rounded">
                      {selectedOrder.studentId || "2021-08892-QC"}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Pickup / Booth</span>
                    <span className="font-medium text-slate-800 text-right">
                      {selectedOrder.pickupBooth ||
                        "AWS IK Bldg, Basement Booth #3"}
                    </span>
                  </div>
                </div>
              </div>

              {/* Ordered Items */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                    Ordered Items
                  </h3>
                  <span className="text-xs text-slate-500 bg-slate-100 px-2 py-0.5 rounded font-medium">
                    {selectedOrder.itemsList
                      ? selectedOrder.itemsList.length
                      : 1}{" "}
                    items
                  </span>
                </div>
                <div className="space-y-2">
                  {selectedOrder.itemsList ? (
                    selectedOrder.itemsList.map((itm, idx) => (
                      <div
                        key={idx}
                        className="flex items-center justify-between p-3 rounded-xl border border-slate-200 bg-white"
                      >
                        <div className="flex items-center space-x-3">
                          <div className="w-9 h-9 rounded-lg bg-sky-50 text-[#0284C7] flex items-center justify-center shrink-0">
                            <Shirt className="w-4 h-4" />
                          </div>
                          <div>
                            <p className="font-semibold text-slate-900 text-xs">
                              {itm.name}
                            </p>
                            <p className="text-[11px] text-slate-500">
                              Quantity: {itm.qty} • Unit: {itm.unit}
                            </p>
                          </div>
                        </div>
                        <span className="font-bold text-slate-900 text-xs">
                          {itm.price}
                        </span>
                      </div>
                    ))
                  ) : (
                    <div className="flex items-center justify-between p-3 rounded-xl border border-slate-200 bg-white">
                      <div className="flex items-center space-x-3">
                        <div className="w-9 h-9 rounded-lg bg-sky-50 text-[#0284C7] flex items-center justify-center shrink-0">
                          <Shirt className="w-4 h-4" />
                        </div>
                        <div>
                          <p className="font-semibold text-slate-900 text-xs">
                            {selectedOrder.items}
                          </p>
                          <p className="text-[11px] text-slate-500">
                            Quantity: 1 • Unit: {selectedOrder.total}
                          </p>
                        </div>
                      </div>
                      <span className="font-bold text-slate-900 text-xs">
                        {selectedOrder.total}
                      </span>
                    </div>
                  )}
                </div>
              </div>

              {/* Fulfillment Details */}
              <div className="space-y-3">
                <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                  Fulfillment Details
                </h3>
                <div className="bg-slate-50/50 p-4 rounded-xl border border-slate-200 space-y-2.5 text-xs">
                  <div className="flex justify-between">
                    <span className="text-slate-500">Location</span>
                    <span className="font-medium text-slate-800">
                      AWS IK Bldg, Basement Booth #3
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Target Schedule</span>
                    <span className="font-medium text-slate-800 text-right">
                      {selectedOrder.targetSchedule ||
                        "Oct 24, 2024 (11:30 AM)"}
                    </span>
                  </div>
                </div>
              </div>

              {/* Student Delivery Note */}
              <div className="space-y-2">
                <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                  Student Delivery Note
                </h3>
                <div className="p-3 bg-amber-50/50 border border-amber-200/60 rounded-xl text-xs text-amber-900 italic">
                  {selectedOrder.deliveryNote ||
                    '"Please look for the buyer at the booth counter or drop off during the assigned break."'}
                </div>
              </div>

              {/* Payment Breakdown */}
              <div className="space-y-3">
                <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                  Payment Breakdown
                </h3>
                <div className="bg-slate-50/50 p-4 rounded-xl border border-slate-200 space-y-2.5 text-xs">
                  <div className="flex justify-between">
                    <span className="text-slate-500">Subtotal</span>
                    <span className="font-medium text-slate-800">
                      {selectedOrder.total}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Org Convenience Fee</span>
                    <span className="font-semibold text-emerald-600">
                      {selectedOrder.convenienceFee || "FREE"}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Payment Method</span>
                    <span className="font-medium text-slate-800 flex items-center">
                      <Sparkles className="w-3.5 h-3.5 text-sky-500 mr-1" />
                      {selectedOrder.paymentMethod || "GCash"}
                    </span>
                  </div>
                  <div className="flex justify-between pt-2 border-t border-slate-200">
                    <span className="text-slate-500">Payment Status</span>
                    <span className="font-bold text-emerald-600">
                      {selectedOrder.paymentStatus}
                    </span>
                  </div>
                </div>
              </div>

              {/* Total Amount Summary */}
              <div className="flex items-center justify-between p-4 bg-slate-900 text-white rounded-xl shadow-md">
                <span className="text-xs font-semibold tracking-wider text-slate-300 uppercase">
                  Total Amount
                </span>
                <span className="text-lg font-bold">{selectedOrder.total}</span>
              </div>
            </div>

            {/* Panel Footer Actions */}
            <div className="p-6 border-t border-slate-200 bg-white sticky bottom-0 z-10 flex space-x-3">
              <button
                onClick={() => setSelectedOrder(null)}
                className="w-1/2 px-4 py-2.5 border border-slate-300 rounded-xl text-slate-700 text-sm font-semibold hover:bg-slate-50 transition-colors"
              >
                Close
              </button>
              <button
                onClick={() => {
                  alert(`Marked order ${selectedOrder.id} as completed!`);
                  setSelectedOrder(null);
                }}
                className="w-1/2 px-4 py-2.5 bg-[#0284C7] hover:bg-[#0369A1] text-white rounded-xl text-sm font-semibold shadow-sm transition-colors flex items-center justify-center space-x-1.5"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>Mark as Completed</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
