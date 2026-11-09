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

/**
 * GET /orders/:id
 * Retrieves a single order by ID for the authenticated buyer, seller, or admin.
 *
 * @param {string} orderId  uuid
 * @returns {Promise<{success: boolean, data: object}>}
 *   data includes: id, orderNumber, orderStatus, totalAmount, deliveryMethod,
 *   paymentMethod, createdAt, store: { id, name, pickupLocation },
 *   buyer: { id, fullName, email }, items[], payment: { amount, method, status }
 */
export const getOrderById = async (orderId) => {
  const response = await apiClient.get(`/orders/${orderId}`);
  return response.data;
};


/**
 * POST /orders (multi-store checkout with per-store delivery & payment)
 * Sends orders sequentially, one per store, never in parallel.
 *
 * @param {Array<object>} orderGroups  one group per store
 * @param {string} orderGroups[].storeId
 * @param {string} orderGroups[].deliveryMethod  'ROOM_TO_ROOM'|'PICKUP'
 * @param {string} orderGroups[].paymentMethod   'CASH'|'GCASH_PAYMONGO'
 * @param {{productId: string, quantity: number}[]} orderGroups[].items
 * @param {string} [orderGroups[].campusBuilding]
 * @param {string} [orderGroups[].campusRoomNumber]
 * @param {string} [orderGroups[].pickupInstructions]
 * @param {string} [orderGroups[].deliveryNotes]
 * @returns {Promise<{orders: Array, gcashCheckoutUrls: Array, errors: object}>}
 */
export const createMultiStoreOrders = async (orderGroups) => {
  const results = {
    orders: [],
    gcashCheckoutUrls: [],
    errors: {},
  };

  for (const orderData of orderGroups) {
    try {
      const response = await apiClient.post('/orders', orderData);
      if (response.data?.data?.orders) {
        results.orders.push(...response.data.data.orders);
        response.data.data.orders.forEach((order) => {
          if (order.checkoutUrl) {
            results.gcashCheckoutUrls.push({
              storeId: orderData.storeId,
              checkoutUrl: order.checkoutUrl,
              orderNumber: order.orderNumber,
            });
          }
        });
      }
    } catch (error) {
      results.errors[orderData.storeId] = {
        message: error.response?.data?.message || error.message,
      };
    }
  }

  return results;
};
