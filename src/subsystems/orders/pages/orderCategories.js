export const categories = [
  { id: "all", label: "All orders", icon: "bag", match: () => true },
  { id: "preparing", label: "Preparing", icon: "clock", match: (o) => o.status === "Preparing" },
  { id: "delivery", label: "Out for Delivery", icon: "pin", match: (o) => o.status === "Out for delivery" || o.status === "Ready for pickup" },
  { id: "completed", label: "Completed", icon: "check", match: (o) => o.status === "Completed" },
  { id: "return", label: "Return/Refund", icon: "refresh", match: (o) => ["Return requested", "Refunded", "Cancelled"].includes(o.status) },
];
