// Buyer-side order rules (from the agreed minutes).
// Perishable items: never cancellable. Refund only after delivery, when the item is stale.
// Non-perishable items: cancellable only while the seller is Preparing.

export function canCancel(order) {
  return !order.perishable && order.status === "Preparing";
}

export function canConfirmReceived(order) {
  return order.status === "Out for delivery" || order.status === "Ready for pickup";
}

export function canRequestRefund(order) {
  return Boolean(order.perishable) && order.status === "Completed" && !order.refundRequested;
}
