import apiClient from '../../lib/api-client';

// ============================================================================
// SUBSYSTEM 2: MARKETPLACE & ENTERPRISE MANAGEMENT
// ============================================================================

/**
 * Get all stores (with optional filters)
 */
export const getStores = async (filters = {}) => {
  const response = await apiClient.get('/marketplace/stores', { params: filters });
  return response.data;
};

/**
 * Get store by ID or slug
 */
export const getStore = async (identifier) => {
  const response = await apiClient.get(`/marketplace/stores/${identifier}`);
  return response.data;
};

/**
 * Create a new store (seller only)
 */
export const createStore = async (storeData) => {
  const response = await apiClient.post('/marketplace/stores', storeData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return response.data;
};

/**
 * Update store information
 */
export const updateStore = async (storeId, storeData) => {
  const response = await apiClient.put(`/marketplace/stores/${storeId}`, storeData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return response.data;
};

/**
 * Get all categories
 */
export const getCategories = async () => {
  const response = await apiClient.get('/marketplace/categories');
  return response.data;
};

/**
 * Get products with filters
 */
export const getProducts = async (filters = {}) => {
  const response = await apiClient.get('/marketplace/products', { params: filters });
  return response.data;
};

/**
 * Get product by ID
 */
export const getProduct = async (productId) => {
  const response = await apiClient.get(`/marketplace/products/${productId}`);
  return response.data;
};

/**
 * Create a new product (seller only)
 */
export const createProduct = async (productData) => {
  const response = await apiClient.post('/marketplace/products', productData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return response.data;
};

/**
 * Update product
 */
export const updateProduct = async (productId, productData) => {
  const response = await apiClient.put(`/marketplace/products/${productId}`, productData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return response.data;
};

/**
 * Delete product
 */
export const deleteProduct = async (productId) => {
  const response = await apiClient.delete(`/marketplace/products/${productId}`);
  return response.data;
};

/**
 * Get seller dashboard data
 */
export const getSellerDashboard = async () => {
  const response = await apiClient.get('/marketplace/seller/dashboard');
  return response.data;
};

/**
 * Get seller inventory
 */
export const getSellerInventory = async () => {
  const response = await apiClient.get('/marketplace/seller/inventory');
  return response.data;
};
