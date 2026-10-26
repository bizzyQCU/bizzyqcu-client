import apiClient from '../../lib/api-client';

// ============================================================================
// SUBSYSTEM 3: ORDER, PAYMENT & DELIVERY MANAGEMENT
// ============================================================================

/**
 * Get user's cart
 */
export const getCart = async () => {
  const response = await apiClient.get('/orders/cart');
  return response.data;
};

/**
 * Add item to cart
 */
export const addToCart = async (productId, quantity = 1) => {
  const response = await apiClient.post('/orders/cart/items', { productId, quantity });
  return response.data;
};

/**
 * Update cart item quantity
 */
export const updateCartItem = async (cartItemId, quantity) => {
  const response = await apiClient.put(`/orders/cart/items/${cartItemId}`, { quantity });
  return response.data;
};

/**
 * Remove item from cart
 */
export const removeFromCart = async (cartItemId) => {
  const response = await apiClient.delete(`/orders/cart/items/${cartItemId}`);
  return response.data;
};

/**
 * Clear entire cart
 */
export const clearCart = async () => {
  const response = await apiClient.delete('/orders/cart');
  return response.data;
};

/**
 * Create order from cart
 */
export const createOrder = async (orderData) => {
  const response = await apiClient.post('/orders', orderData);
  return response.data;
};

/**
 * Get all orders for the current user
 */
export const getOrders = async (filters = {}) => {
  const response = await apiClient.get('/orders', { params: filters });
  return response.data;
};

/**
 * Get order by ID
 */
export const getOrder = async (orderId) => {
  const response = await apiClient.get(`/orders/${orderId}`);
  return response.data;
};

/**
 * Update order status (seller only)
 */
export const updateOrderStatus = async (orderId, status) => {
  const response = await apiClient.put(`/orders/${orderId}/status`, { status });
  return response.data;
};

/**
 * Cancel order
 */
export const cancelOrder = async (orderId, reason) => {
  const response = await apiClient.put(`/orders/${orderId}/cancel`, { reason });
  return response.data;
};

/**
 * Create PayMongo checkout session
 */
export const createPaymentCheckout = async (orderId) => {
  const response = await apiClient.post(`/orders/${orderId}/payment/checkout`);
  return response.data;
};

/**
 * Confirm cash payment (seller only)
 */
export const confirmCashPayment = async (orderId) => {
  const response = await apiClient.post(`/orders/${orderId}/payment/confirm-cash`);
  return response.data;
};

/**
 * Get order messages
 */
export const getOrderMessages = async (orderId) => {
  const response = await apiClient.get(`/orders/${orderId}/messages`);
  return response.data;
};

/**
 * Send message to order thread
 */
export const sendOrderMessage = async (orderId, message) => {
  const response = await apiClient.post(`/orders/${orderId}/messages`, { message });
  return response.data;
};

/**
 * Get seller orders (for sellers managing their orders)
 */
export const getSellerOrders = async (filters = {}) => {
  const response = await apiClient.get('/orders/seller', { params: filters });
  return response.data;
};
