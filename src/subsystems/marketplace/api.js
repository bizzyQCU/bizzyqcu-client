import apiClient from "../../lib/api-client";

// ============================================================================
// SUBSYSTEM 2: MARKETPLACE & ENTERPRISE MANAGEMENT
// Mirrors bizzyqcu-server: src/modules/marketplace
//
// Not available on the server yet (do not call): stores, categories,
// single-product lookup, product update/delete, seller inventory list.
// ============================================================================

/**
 * GET /marketplace/products (public)
 * Only VERIFIED, available, in-stock products from approved stores are returned.
 *
 * @param {object} [filters]
 * @param {string} [filters.search]
 * @param {string} [filters.categoryId]  uuid
 * @param {'STUDENT_ENTERPRISE'|'RECOGNIZED_ORGANIZATION'|'INDEPENDENT_SELLER'} [filters.sellerType]
 * @param {number} [filters.minPrice]
 * @param {number} [filters.maxPrice]
 * @param {'newest'|'price_asc'|'price_desc'} [filters.sort]  default "newest"
 * @param {number} [filters.page]   default 1
 * @param {number} [filters.limit]  default 12, max 50
 * @returns {Promise<{success: boolean, items: object[], pagination: {page, limit, total, totalPages}}>}
 */
export const getProducts = async (filters = {}) => {
  // Drop empty values so the server's zod validation doesn't reject e.g. `search=`
  const params = Object.fromEntries(
    Object.entries(filters).filter(
      ([, v]) => v !== "" && v !== null && v !== undefined,
    ),
  );
  const response = await apiClient.get("/marketplace/products", { params });
  return response.data;
};

/**
 * POST /marketplace/products
 * Product is created as PENDING and awaits admin approval.
 *
 * @param {object} productData
 * @param {string} productData.storeId        uuid
 * @param {string} productData.categoryId     uuid
 * @param {string} productData.name           min 3 chars
 * @param {string} productData.description    min 10 chars
 * @param {number} productData.price          > 0 (send a number, not a string)
 * @param {number} productData.stockQuantity  integer >= 0
 * @param {string[]} productData.imageUrls    at least 1 valid URL
 */
export const createProduct = async (productData) => {
  const response = await apiClient.post("/marketplace/products", productData);
  return response.data;
};

/**
 * PATCH /marketplace/products/:id/stock (seller only)
 */
export const setProductStock = async (productId, stockQuantity) => {
  const response = await apiClient.patch(
    `/marketplace/products/${productId}/stock`,
    { stockQuantity },
  );
  return response.data;
};

/**
 * PATCH /marketplace/products/:id/availability (seller only)
 */
export const setProductAvailability = async (productId, isAvailable) => {
  const response = await apiClient.patch(
    `/marketplace/products/${productId}/availability`,
    { isAvailable },
  );
  return response.data;
};

/**
 * GET /marketplace/seller/dashboard (seller only)
 * @returns data: { store, sales, ordersByStatus, productsByApproval, lowStock, topSelling }
 */
export const getSellerDashboard = async () => {
  const response = await apiClient.get("/marketplace/seller/dashboard");
  return response.data;
};

// ============================================================================
// ORDERS
// Mirrors bizzyqcu-server: src/modules/orders
// All routes require authentication (requireAuth). Buyer/Seller roles are
// enforced server-side via RBAC middleware.
// ============================================================================

/**
 * GET /orders/seller
 * Returns all incoming orders for the authenticated seller's store.
 * Requires SELLER role.
 *
 * Each order has the shape:
 *   { id, orderNumber, orderStatus, deliveryMethod, paymentMethod, totalAmount,
 *     createdAt, updatedAt,
 *     buyer: { id, fullName, email, qcuIdNumber },
 *     items: [{ id, productNameSnapshot, unitPriceSnapshot, quantity, subtotal }],
 *     payment: { id, amount, method, status, paidAt },
 *     _count: { messages } }
 *
 * @returns {Promise<{ success: boolean, count: number, data: object[] }>}
 */
export const getSellerOrders = async () => {
  const response = await apiClient.get("/orders/seller");
  return response.data;
};

/**
 * GET /orders/my-orders
 * Returns all orders placed by the authenticated buyer.
 * Requires BUYER role.
 *
 * @returns {Promise<{ success: boolean, count: number, data: object[] }>}
 */
export const getMyOrders = async () => {
  const response = await apiClient.get("/orders/my-orders");
  return response.data;
};

/**
 * GET /orders/:id
 * Returns a single order by ID. Accessible by the order's buyer, the store's
 * seller, or an admin.
 *
 * @param {string} orderId  UUID
 * @returns {Promise<{ success: boolean, data: object }>}
 */
export const getOrderById = async (orderId) => {
  const response = await apiClient.get(`/orders/${orderId}`);
  return response.data;
};

/**
 * PATCH /orders/:id/status
 * Advances (or cancels) an order through the state machine.
 *
 * Valid status values:
 *   PENDING_PAYMENT | PENDING_CONFIRMATION | PREPARING |
 *   READY_FOR_PICKUP | OUT_FOR_DELIVERY | COMPLETED | CANCELLED
 *
 * Transitions are enforced server-side (order.state.ts).
 * - SELLER can move: PENDING_CONFIRMATION → PREPARING → READY_FOR_PICKUP /
 *   OUT_FOR_DELIVERY → COMPLETED, or cancel before fulfillment.
 * - BUYER can only cancel orders in PENDING_PAYMENT or PENDING_CONFIRMATION.
 *
 * @param {string} orderId  UUID
 * @param {string} status   One of the valid OrderStatus enum values above
 * @returns {Promise<{ success: boolean, message: string, data: object }>}
 */
export const updateOrderStatus = async (orderId, status) => {
  const response = await apiClient.patch(`/orders/${orderId}/status`, {
    status,
  });
  return response.data;
};

/**
 * GET /orders/:id/messages
 * Returns the buyer-seller communication log for an order.
 * Accessible by the order's buyer, the seller, or an admin.
 *
 * @param {string} orderId  UUID
 * @returns {Promise<{ success: boolean, count: number, data: object[] }>}
 */ 
export const getOrderMessages = async (orderId) => {
  const response = await apiClient.get(`/orders/${orderId}/messages`);
  return response.data;
};

/**
 * POST /orders/:id/messages
 * Sends a message on an order thread.
 * Accessible by the order's buyer, the seller, or an admin.
 *
 * @param {string} orderId  UUID
 * @param {string} message  1–1000 characters
 * @returns {Promise<{ success: boolean, message: string, data: object }>}
 */
export const createOrderMessage = async (orderId, message) => {
  const response = await apiClient.post(`/orders/${orderId}/messages`, {
    message,
  });
  return response.data;
};

/**
 * GET /orders/pickup-locations
 * Returns verified store pickup locations and a list of campus buildings.
 *
 * @returns {Promise<{ success: boolean, data: { pickupStores: object[], campusBuildings: string[] } }>}
 */
export const getPickupLocations = async () => {
  const response = await apiClient.get("/orders/pickup-locations");
  return response.data;
};

/**
 * POST /orders
 * Checks out the buyer's cart. Creates one order per seller in the cart.
 * Requires BUYER + VERIFIED roles.
 *
 * @param {object} checkoutData
 * @param {'ROOM_TO_ROOM'|'PICKUP'} checkoutData.deliveryMethod
 * @param {'CASH'|'GCASH_PAYMONGO'}  checkoutData.paymentMethod
 * @param {string}  [checkoutData.campusBuilding]      Required for ROOM_TO_ROOM
 * @param {string}  [checkoutData.campusRoomNumber]    Required for ROOM_TO_ROOM
 * @param {string}  [checkoutData.pickupInstructions]  Optional, max 500 chars
 * @param {string}  [checkoutData.deliveryNotes]       Optional, max 500 chars
 * @returns {Promise<{ success: boolean, message: string, data: { orders: object[] } }>}
 */
export const checkoutCart = async (checkoutData) => {
  const response = await apiClient.post("/orders", checkoutData);
  return response.data;
};

// ============================================================================
// SELLER INVENTORY
// ============================================================================

/**
 * GET /marketplace/seller/products (seller only)
 * Returns the authenticated seller's own products including PENDING/REJECTED.
 *
 * @param {object} [query]
 * @param {number} [query.page]    default 1
 * @param {number} [query.limit]   default 20
 * @param {'PENDING'|'VERIFIED'|'REJECTED'} [query.approvalStatus]
 * @returns {Promise<{ success: boolean, items: object[], pagination: object }>}
 */
export const getSellerProducts = async (query = {}) => {
  const params = Object.fromEntries(
    Object.entries(query).filter(([, v]) => v !== '' && v !== null && v !== undefined),
  );
  const response = await apiClient.get('/marketplace/seller/products', { params });
  return response.data;
};

/**
 * GET /marketplace/categories (public)
 * @returns {Promise<{ success: boolean, data: { id: string, name: string, slug: string }[] }>}
 */
export const getCategories = async () => {
  const response = await apiClient.get('/marketplace/categories');
  return response.data;
};

// ============================================================================
// STORES
// ============================================================================

/**
 * GET /marketplace/stores/me (seller only)
 */
export const getMyStore = async () => {
  const response = await apiClient.get('/marketplace/stores/me');
  return response.data;
};

/**
 * PATCH /marketplace/stores/me (seller only)
 */
export const updateMyStore = async (storeData) => {
  const response = await apiClient.patch('/marketplace/stores/me', storeData);
  return response.data;
};

/**
 * POST /marketplace/stores (seller only)
 */
export const createStore = async (storeData) => {
  const response = await apiClient.post('/marketplace/stores', storeData);
  return response.data;
};

// ============================================================================
// ANALYTICS
// ============================================================================

/**
 * GET /marketplace/seller/dashboard (seller only)
 * Returns seller analytics and dashboard data including:
 * - Store information
 * - Sales metrics (completed orders, total revenue)
 * - Orders by status
 * - Products by approval status
 * - Low stock products
 * - Top selling products
 * 
 * @param {object} [dateRange] Optional date range filter
 * @param {string} [dateRange.start] Start date in YYYY-MM-DD format
 * @param {string} [dateRange.end] End date in YYYY-MM-DD format
 * @returns {Promise<{ success: boolean, data: object }>}
 */
export const getSellerAnalytics = async (dateRange) => {
  const params = {};
  if (dateRange?.start) params.start = dateRange.start;
  if (dateRange?.end) params.end = dateRange.end;
  
  const response = await apiClient.get('/marketplace/seller/dashboard', { params });
  return response.data;
};

