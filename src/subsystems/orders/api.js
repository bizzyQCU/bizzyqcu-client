import apiClient from '../../lib/api-client';

// ============================================================================
// SUBSYSTEM 3: ORDER, PAYMENT & DELIVERY MANAGEMENT
// Mirrors bizzyqcu-server: src/modules/orders (all routes require auth)
//
// There is no server-side cart, PayMongo checkout, or order messaging yet.
// Keep the cart client-side until those endpoints exist.
// ============================================================================

/**
 * GET /orders/my-orders
 * @returns {Promise<{success: boolean, count: number, data: object[]}>}
 *   each order includes store { name, pickupLocation }, items[], payment
 */
export const getMyOrders = async () => {
  const response = await apiClient.get('/orders/my-orders');
  return response.data;
};

/**
 * POST /orders
 * One order belongs to exactly one store. Total is computed server-side.
 *
 * @param {object} orderData
 * @param {string} orderData.storeId         uuid
 * @param {'ROOM_TO_ROOM'|'PICKUP'} orderData.deliveryMethod
 * @param {'CASH'|'GCASH_PAYMONGO'} orderData.paymentMethod
 * @param {{productId: string, quantity: number}[]} orderData.items  at least 1
 * @param {string} [orderData.campusBuilding]
 * @param {string} [orderData.campusRoomNumber]
 * @param {string} [orderData.pickupInstructions]
 * @param {string} [orderData.deliveryNotes]
 */
export const createOrder = async (orderData) => {
  const response = await apiClient.post('/orders', orderData);
  return response.data;
};

/**
 * PATCH /orders/:id/status
 * @param {string} orderId  uuid
 * @param {string} status   one of ORDER_STATUS
 */
export const updateOrderStatus = async (orderId, status) => {
  const response = await apiClient.patch(`/orders/${orderId}/status`, { status });
  return response.data;
};

/** Cancels an order (server restores stock). */
export const cancelOrder = (orderId) => updateOrderStatus(orderId, 'CANCELLED');
