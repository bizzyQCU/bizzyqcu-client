import { useState, useMemo } from "react";

const PAGE_SIZE = 6;

// Returns true if the date string falls within the current Mon–Sun week
function isThisWeek(dateStr) {
  const clean = dateStr.split("•")[0].trim();
  const date = new Date(clean);
  const now = new Date();
  const startOfWeek = new Date(now);
  startOfWeek.setDate(now.getDate() - ((now.getDay() + 6) % 7));
  startOfWeek.setHours(0, 0, 0, 0);
  const endOfWeek = new Date(startOfWeek);
  endOfWeek.setDate(startOfWeek.getDate() + 7);
  return date >= startOfWeek && date < endOfWeek;
}

export function useSellerOrders() {
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [isFilterModalOpen, setIsFilterModalOpen] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [thisWeekOnly, setThisWeekOnly] = useState(false);

  const [appliedFilters, setAppliedFilters] = useState({
    selectedCategories: [],
    selectedStatuses: [],
    selectedPaymentStatuses: [],
  });

  // Mock Orders Data — 6 rows
  const allOrders = useMemo(
    () => [
      {
        id: "ORD-2024-8641",
        date: "Oct 24, 2024 • 10:15 AM",
        buyer: "Bea Angela Santos",
        items: "QCU CCS Official Org Hoodie",
        category: "Apparel & Uniforms",
        total: "₱650.00",
        paymentStatus: "Paid",
        orderStatus: "Processing",
      },
      {
        id: "ORD-2024-8640",
        date: "Oct 24, 2024 • 09:42 AM",
        buyer: "Mark Dave Ramos",
        items: "Tech Summit 2024 Lanyard Pack",
        category: "Academic Stationery",
        total: "₱180.00",
        paymentStatus: "Paid",
        orderStatus: "To Ship",
      },
      {
        id: "ORD-2024-8639",
        date: "Oct 23, 2024 • 04:30 PM",
        buyer: "Christian Jay Flores",
        items: "CS Programmer Sticker Sheet",
        category: "Academic Stationery",
        total: "₱145.00",
        paymentStatus: "Paid",
        orderStatus: "Completed",
      },
      {
        id: "ORD-2024-8638",
        date: "Oct 23, 2024 • 02:18 PM",
        buyer: "Princess Mae Diaz",
        items: "QCU Embroidered Polo Shirt",
        category: "Apparel & Uniforms",
        total: "₱420.00",
        paymentStatus: "Pending",
        orderStatus: "In Transit",
      },
      {
        id: "ORD-2024-8635",
        date: "Oct 22, 2024 • 11:05 AM",
        buyer: "John Carlo Reyes",
        items: "CCS Stainless Steel Tumbler",
        category: "Tech & Accessories",
        total: "₱350.00",
        paymentStatus: "Paid",
        orderStatus: "Completed",
      },
      {
        id: "ORD-2024-8630",
        date: "Oct 21, 2024 • 01:20 PM",
        buyer: "Alyssa Nicole Cruz",
        items: "QCS Membership Card & Badge",
        category: "Event Tickets & Merch",
        total: "₱120.00",
        paymentStatus: "Refunded",
        orderStatus: "Cancelled",
      },
    ],
    [],
  );

  // Apply search + filters
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

  // Pagination — cap at PAGE_SIZE rows per page
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
    // Expose paged slice as `orders` so the JSX doesn't need changes
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
  };
}
