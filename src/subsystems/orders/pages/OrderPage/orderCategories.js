export const categories = [
  { id: "all", label: "All orders", icon: "bag", match: () => true },
  { id: "topay", label: "To Pay", icon: "wallet", match: (o) => o.status === "To pay" || o.status === "Waiting for approval" },
  { id: "preparing", label: "Preparing", icon: "clock", match: (o) => o.status === "Preparing" },
  { id: "delivery", label: "Out for Delivery", icon: "pin", match: (o) => o.status === "Out for delivery" || o.status === "Ready for pickup" },
  { id: "completed", label: "Completed", icon: "check", match: (o) => o.status === "Completed" },
  { id: "return", label: "Return/Refund", icon: "refresh", match: (o) => ["Return requested", "Refunded"].includes(o.status) },
  { id: "cancelled", label: "Cancelled", icon: "x", match: (o) => o.status === "Cancelled" },
];
