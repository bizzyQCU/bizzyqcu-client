import { useState, useMemo, useEffect, useCallback } from "react";
import { getSellerOrders, updateOrderStatus } from "../../../api";
import { getErrorMessage } from "../../../../../lib/api-client";

const PAGE_SIZE = 6;

/**
 * Maps the server's OrderStatus enum values to the display labels used in the UI.
 * The filter modal and table still use the human-readable labels.
 */
const STATUS_DISPLAY = {
  PENDING_PAYMENT: "Processing",
  PENDING_CONFIRMATION: "Processing",
  PREPARING: "To Ship",
  READY_FOR_PICKUP: "To Ship",
  OUT_FOR_DELIVERY: "In Transit",
  COMPLETED: "Completed",
  CANCELLED: "Cancelled",
};

const PAYMENT_STATUS_DISPLAY = {
  PENDING: "Pending",
  PAID: "Paid",
  FAILED: "Refunded",
  CANCELLED: "Refunded",
};

/**
 * Normalises a raw server order into the shape Orders.jsx expects.
 */
function normaliseOrder(raw) {
  return {
    // keep the real UUID for API calls
    _id: raw.id,
    id: raw.orderNumber,
    date: new Date(raw.createdAt).toLocaleString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    }),
    buyer: raw.buyer?.fullName ?? "—",
    studentId: raw.buyer?.qcuIdNumber ?? null,
    items: raw.items?.map((i) => i.productNameSnapshot).join(", ") ?? "—",
    itemsList:
      raw.items?.map((i) => ({
        name: i.productNameSnapshot,
        qty: i.quantity,
        unit: `₱${Number(i.unitPriceSnapshot).toFixed(2)}`,
        price: `₱${Number(i.subtotal).toFixed(2)}`,
      })) ?? [],
    category: raw.items?.[0]?.category ?? "—",
    total: `₱${Number(raw.totalAmount).toFixed(2)}`,
    paymentStatus:
      PAYMENT_STATUS_DISPLAY[raw.payment?.status] ?? raw.payment?.status ?? "—",
    orderStatus: STATUS_DISPLAY[raw.orderStatus] ?? raw.orderStatus,
    // preserve the raw enum so we can send it back for status updates
    _rawStatus: raw.orderStatus,
    paymentMethod: raw.paymentMethod === "GCASH_PAYMONGO" ? "GCash" : "Cash",
    pickupBooth: raw.store?.pickupLocation ?? null,
    messageCount: raw._count?.messages ?? 0,
  };
}

export function useSellerOrders() {
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [isFilterModalOpen, setIsFilterModalOpen] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [thisWeekOnly, setThisWeekOnly] = useState(false);

  // Remote data state
  const [rawOrders, setRawOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [updating, setUpdating] = useState(false);

  const [appliedFilters, setAppliedFilters] = useState({
    selectedCategories: [],
    selectedStatuses: [],
    selectedPaymentStatuses: [],
  });

  // ── Fetch orders from the server ──────────────────────────────────────────
  const fetchOrders = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await getSellerOrders();
      setRawOrders(res.data ?? []);
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  // Normalise once, memoised
  const allOrders = useMemo(() => rawOrders.map(normaliseOrder), [rawOrders]);

  // ── Mark an order as Completed via PATCH /orders/:id/status ───────────────
  const markCompleted = useCallback(
    async (order) => {
      if (!order?._id) return;
      setUpdating(true);
      try {
        await updateOrderStatus(order._id, "COMPLETED");
        await fetchOrders();
        setSelectedOrder(null);
      } catch (err) {
        alert(getErrorMessage(err));
      } finally {
        setUpdating(false);
      }
    },
    [fetchOrders],
  );

  // ── Cancel an order ────────────────────────────────────────────────────────
  const cancelOrder = useCallback(
    async (order) => {
      if (!order?._id) return;
      setUpdating(true);
      try {
        await updateOrderStatus(order._id, "CANCELLED");
        await fetchOrders();
        setSelectedOrder(null);
      } catch (err) {
        alert(getErrorMessage(err));
      } finally {
        setUpdating(false);
      }
    },
    [fetchOrders],
  );

  // ── Filtering ─────────────────────────────────────────────────────────────
  const filteredOrders = useMemo(() => {
    const { selectedCategories, selectedStatuses, selectedPaymentStatuses } =
      appliedFilters;

    return allOrders.filter((order) => {
      const matchesSearch =
        !searchTerm ||
        order.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
        order.buyer.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesCategory =
        selectedCategories.length === 0 ||
        selectedCategories.includes(order.category);

      const matchesStatus =
        selectedStatuses.length === 0 ||
        selectedStatuses.includes(order.orderStatus);

      const matchesPayment =
        selectedPaymentStatuses.length === 0 ||
        selectedPaymentStatuses.includes(order.paymentStatus);

      const matchesWeek = !thisWeekOnly || isThisWeek(order.date);

      return (
        matchesSearch &&
        matchesCategory &&
        matchesStatus &&
        matchesPayment &&
        matchesWeek
      );
    });
  }, [allOrders, searchTerm, appliedFilters, thisWeekOnly]);

  // ── Pagination ────────────────────────────────────────────────────────────
  const totalFiltered = filteredOrders.length;
  const totalPages = Math.max(1, Math.ceil(totalFiltered / PAGE_SIZE));
  const safePage = Math.min(currentPage, totalPages);
  const startIndex = (safePage - 1) * PAGE_SIZE;
  const pagedOrders = filteredOrders.slice(startIndex, startIndex + PAGE_SIZE);

  const pageNumbers = useMemo(() => {
    const pages = [];
    for (let i = 1; i <= totalPages; i++) pages.push(i);
    return pages;
  }, [totalPages]);

  return {
    searchTerm,
    setSearchTerm,
    currentPage,
    setCurrentPage,
    orders: pagedOrders,
    totalFiltered,
    startIndex,
    safePage,
    pageNumbers,
    totalPages,
    isFilterModalOpen,
    setIsFilterModalOpen,
    selectedOrder,
    setSelectedOrder,
    appliedFilters,
    setAppliedFilters,
    thisWeekOnly,
    setThisWeekOnly,
    // loading / error states for the UI
    loading,
    error,
    updating,
    // actions
    refresh: fetchOrders,
    markCompleted,
    cancelOrder,
  };
}

// ── Helpers ──────────────────────────────────────────────────────────────────
function isThisWeek(dateStr) {
  const date = new Date(dateStr);
  const now = new Date();
  const startOfWeek = new Date(now);
  startOfWeek.setDate(now.getDate() - ((now.getDay() + 6) % 7));
  startOfWeek.setHours(0, 0, 0, 0);
  const endOfWeek = new Date(startOfWeek);
  endOfWeek.setDate(startOfWeek.getDate() + 7);
  return date >= startOfWeek && date < endOfWeek;
}
