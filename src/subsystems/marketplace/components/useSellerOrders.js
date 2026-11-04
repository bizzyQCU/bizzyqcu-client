import { useState, useMemo } from "react";

// ─── Raw mock data (single source of truth) ───────────────────────────────────
const ALL_ORDERS = [
  {
    id: "ORD-2024-8641",
    date: "Oct 24, 2024 • 10:15 AM",
    // ISO string used for date-range filtering
    isoDate: "2024-10-24T10:15:00",
    buyer: "Bea Angela Santos",
    items: "QCU CCS Official Org Hoodie",
    extraItemsCount: 2,
    total: "₱650.00",
    paymentStatus: "Paid",
    orderStatus: "Processing",
  },
  {
    id: "ORD-2024-8640",
    date: "Oct 24, 2024 • 09:42 AM",
    isoDate: "2024-10-24T09:42:00",
    buyer: "Mark Dave Ramos",
    items: "Tech Summit 2024 Lanyard Pack",
    extraItemsCount: 0,
    total: "₱180.00",
    paymentStatus: "Paid",
    orderStatus: "Processing",
  },
  {
    id: "ORD-2024-8639",
    date: "Oct 23, 2024 • 04:30 PM",
    isoDate: "2024-10-23T16:30:00",
    buyer: "Christian Jay Flores",
    items: "CS Programmer Sticker Sheet",
    extraItemsCount: 1,
    total: "₱145.00",
    paymentStatus: "Paid",
    orderStatus: "Completed",
  },
  {
    id: "ORD-2024-8638",
    date: "Oct 23, 2024 • 02:18 PM",
    isoDate: "2024-10-23T14:18:00",
    buyer: "Princess Mae Diaz",
    items: "QCU Embroidered Polo Shirt",
    extraItemsCount: 0,
    total: "₱420.00",
    paymentStatus: "Pending",
    orderStatus: "Out for Delivery",
  },
  {
    id: "ORD-2024-8635",
    date: "Oct 22, 2024 • 11:05 AM",
    isoDate: "2024-10-22T11:05:00",
    buyer: "John Carlo Reyes",
    items: "CCS Stainless Steel Tumbler",
    extraItemsCount: 0,
    total: "₱350.00",
    paymentStatus: "Paid",
    orderStatus: "Completed",
  },
  {
    id: "ORD-2024-8630",
    date: "Oct 21, 2024 • 01:20 PM",
    isoDate: "2024-10-21T13:20:00",
    buyer: "Alyssa Nicole Cruz",
    items: "QCS Membership Card & Badge",
    extraItemsCount: 0,
    total: "₱120.00",
    paymentStatus: "Refunded",
    orderStatus: "Cancelled",
  },
];

const PAGE_SIZE = 6;

// ─── Metric card → filter mapping ─────────────────────────────────────────────
// "New Orders"  → orderStatus filter for orders that are newly placed (Processing)
// "To Process"  → orderStatus = Processing
// "In Transit"  → orderStatus = Out for Delivery
// "Completed"   → orderStatus = Completed
export const METRIC_FILTERS = {
  new: { orderStatus: "Processing" },
  toProcess: { orderStatus: "Processing" },
  inTransit: { orderStatus: "Out for Delivery" },
  completed: { orderStatus: "Completed" },
};

export function useSellerOrders() {
  // ── Filter state ──────────────────────────────────────────────────────────
  const [searchTerm, setSearchTerm] = useState("");
  const [paymentFilter, setPaymentFilter] = useState(""); // '' = all
  const [statusFilter, setStatusFilter] = useState(""); // '' = all
  const [thisWeekOnly, setThisWeekOnly] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // ── Pagination state ──────────────────────────────────────────────────────
  const [currentPage, setCurrentPage] = useState(1);

  // ── "This Week" window relative to the latest order date in mock data ─────
  // Latest order is Oct 24 2024, so "this week" = Oct 21–27 2024.
  const WEEK_START = new Date("2024-10-21T00:00:00");
  const WEEK_END = new Date("2024-10-27T23:59:59");

  // ── Derived: filtered list (no pagination) ────────────────────────────────
  const filteredOrders = useMemo(() => {
    return ALL_ORDERS.filter((order) => {
      // 1. Search
      const term = searchTerm.toLowerCase();
      if (
        term &&
        !order.id.toLowerCase().includes(term) &&
        !order.buyer.toLowerCase().includes(term)
      ) {
        return false;
      }

      // 2. Payment status filter
      if (paymentFilter && order.paymentStatus !== paymentFilter) {
        return false;
      }

      // 3. Order status filter
      if (statusFilter && order.orderStatus !== statusFilter) {
        return false;
      }

      // 4. This-week filter
      if (thisWeekOnly) {
        const d = new Date(order.isoDate);
        if (d < WEEK_START || d > WEEK_END) return false;
      }

      return true;
    });
  }, [searchTerm, paymentFilter, statusFilter, thisWeekOnly]);

  // ── Derived: metric counts (always from full unfiltered data) ─────────────
  const metrics = useMemo(
    () => ({
      newOrders: ALL_ORDERS.filter((o) => o.paymentStatus === "Pending").length,
      toProcess: ALL_ORDERS.filter((o) => o.orderStatus === "Processing")
        .length,
      inTransit: ALL_ORDERS.filter((o) => o.orderStatus === "Out for Delivery")
        .length,
      completed: ALL_ORDERS.filter((o) => o.orderStatus === "Completed").length,
    }),
    [],
  );

  // ── Pagination ────────────────────────────────────────────────────────────
  const totalFiltered = filteredOrders.length;
  const totalPages = Math.max(1, Math.ceil(totalFiltered / PAGE_SIZE));

  // Clamp page when filters reduce the result set
  const safePage = Math.min(currentPage, totalPages);
  const startIndex = (safePage - 1) * PAGE_SIZE;
  const pagedOrders = filteredOrders.slice(startIndex, startIndex + PAGE_SIZE);

  const pageNumbers = Array.from({ length: totalPages }, (_, i) => i + 1);

  // ── Actions ───────────────────────────────────────────────────────────────
  function handleSearch(value) {
    setSearchTerm(value);
    setCurrentPage(1);
  }

  function handlePaymentFilter(value) {
    setPaymentFilter(value);
    setCurrentPage(1);
  }

  function handleStatusFilter(value) {
    setStatusFilter(value);
    setCurrentPage(1);
  }

  function handleToggleThisWeek() {
    setThisWeekOnly((prev) => !prev);
    setCurrentPage(1);
  }

  /** Click a metric card to filter the table by that order/payment status. */
  function handleMetricClick(metricKey) {
    const already =
      (metricKey === "inTransit" && statusFilter === "Out for Delivery") ||
      (metricKey === "completed" && statusFilter === "Completed") ||
      ((metricKey === "new" || metricKey === "toProcess") &&
        statusFilter === "Processing");

    if (already) {
      // Second click clears the filter (toggle behaviour)
      setStatusFilter("");
    } else {
      const map = {
        new: () => {
          setStatusFilter("Processing");
          setPaymentFilter("Pending");
        },
        toProcess: () => setStatusFilter("Processing"),
        inTransit: () => setStatusFilter("Out for Delivery"),
        completed: () => setStatusFilter("Completed"),
      };
      map[metricKey]?.();
    }
    setCurrentPage(1);
  }

  /** Refresh: reset every filter back to defaults. */
  function handleRefresh() {
    setIsRefreshing(true);
    setSearchTerm("");
    setPaymentFilter("");
    setStatusFilter("");
    setThisWeekOnly(false);
    setCurrentPage(1);
    // Brief visual spin then settle
    setTimeout(() => setIsRefreshing(false), 600);
  }

  return {
    // search
    searchTerm,
    handleSearch,

    // filters
    paymentFilter,
    handlePaymentFilter,
    statusFilter,
    handleStatusFilter,
    thisWeekOnly,
    handleToggleThisWeek,

    // refresh
    isRefreshing,
    handleRefresh,

    // metric card counts + click handler
    metrics,
    handleMetricClick,
    activeMetric: {
      new: statusFilter === "Processing" && paymentFilter === "Pending",
      toProcess: statusFilter === "Processing" && paymentFilter === "",
      inTransit: statusFilter === "Out for Delivery",
      completed: statusFilter === "Completed",
    },

    // table data
    pagedOrders,
    totalFiltered,
    startIndex,
    safePage,
    pageNumbers,
    totalPages,
    setCurrentPage,
  };
}
