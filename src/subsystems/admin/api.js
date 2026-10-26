import apiClient from '../../lib/api-client';

// ============================================================================
// SUBSYSTEM 4: PLATFORM MANAGEMENT & ANALYTICS
// ============================================================================

/**
 * Get all users pending verification
 */
export const getPendingVerifications = async () => {
  const response = await apiClient.get('/admin/verifications/pending');
  return response.data;
};

/**
 * Approve user verification
 */
export const approveUserVerification = async (userId) => {
  const response = await apiClient.post(`/admin/verifications/users/${userId}/approve`);
  return response.data;
};

/**
 * Reject user verification
 */
export const rejectUserVerification = async (userId, reason) => {
  const response = await apiClient.post(`/admin/verifications/users/${userId}/reject`, { reason });
  return response.data;
};

/**
 * Get all stores pending approval
 */
export const getPendingStores = async () => {
  const response = await apiClient.get('/admin/stores/pending');
  return response.data;
};

/**
 * Approve store
 */
export const approveStore = async (storeId) => {
  const response = await apiClient.post(`/admin/stores/${storeId}/approve`);
  return response.data;
};

/**
 * Reject store
 */
export const rejectStore = async (storeId, reason) => {
  const response = await apiClient.post(`/admin/stores/${storeId}/reject`, { reason });
  return response.data;
};

/**
 * Get all products pending approval
 */
export const getPendingProducts = async () => {
  const response = await apiClient.get('/admin/products/pending');
  return response.data;
};

/**
 * Approve product
 */
export const approveProduct = async (productId) => {
  const response = await apiClient.post(`/admin/products/${productId}/approve`);
  return response.data;
};

/**
 * Reject product
 */
export const rejectProduct = async (productId, reason) => {
  const response = await apiClient.post(`/admin/products/${productId}/reject`, { reason });
  return response.data;
};

/**
 * Get all complaints
 */
export const getComplaints = async (filters = {}) => {
  const response = await apiClient.get('/admin/complaints', { params: filters });
  return response.data;
};

/**
 * Get complaint by ID
 */
export const getComplaint = async (complaintId) => {
  const response = await apiClient.get(`/admin/complaints/${complaintId}`);
  return response.data;
};

/**
 * Update complaint status
 */
export const updateComplaintStatus = async (complaintId, status, resolutionNote) => {
  const response = await apiClient.put(`/admin/complaints/${complaintId}`, { status, resolutionNote });
  return response.data;
};

/**
 * Create a new complaint (available to all users)
 */
export const createComplaint = async (complaintData) => {
  const response = await apiClient.post('/admin/complaints', complaintData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return response.data;
};

/**
 * Get platform analytics
 */
export const getPlatformAnalytics = async (timeRange = '30d') => {
  const response = await apiClient.get('/admin/analytics', { params: { timeRange } });
  return response.data;
};

/**
 * Get audit logs
 */
export const getAuditLogs = async (filters = {}) => {
  const response = await apiClient.get('/admin/audit-logs', { params: filters });
  return response.data;
};

/**
 * Get all users (admin only)
 */
export const getAllUsers = async (filters = {}) => {
  const response = await apiClient.get('/admin/users', { params: filters });
  return response.data;
};
