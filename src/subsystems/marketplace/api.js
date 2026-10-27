import apiClient from '../../lib/api-client';

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
    Object.entries(filters).filter(([, v]) => v !== '' && v !== null && v !== undefined)
  );
  const response = await apiClient.get('/marketplace/products', { params });
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
  const response = await apiClient.post('/marketplace/products', productData);
  return response.data;
};

/**
 * PATCH /marketplace/products/:id/stock (seller only)
 */
export const setProductStock = async (productId, stockQuantity) => {
  const response = await apiClient.patch(`/marketplace/products/${productId}/stock`, { stockQuantity });
  return response.data;
};

/**
 * PATCH /marketplace/products/:id/availability (seller only)
 */
export const setProductAvailability = async (productId, isAvailable) => {
  const response = await apiClient.patch(`/marketplace/products/${productId}/availability`, { isAvailable });
  return response.data;
};

/**
 * GET /marketplace/seller/dashboard (seller only)
 * @returns data: { store, sales, ordersByStatus, productsByApproval, lowStock, topSelling }
 */
export const getSellerDashboard = async () => {
  const response = await apiClient.get('/marketplace/seller/dashboard');
  return response.data;
};
