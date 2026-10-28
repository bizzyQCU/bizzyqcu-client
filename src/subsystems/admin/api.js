import apiClient from '../../lib/api-client';

// ============================================================================
// SUBSYSTEM 4: PLATFORM MANAGEMENT & ANALYTICS
// Mirrors bizzyqcu-server: src/modules/admin (ADMIN role only)
// ============================================================================

/**
 * GET /admin/verifications
 * Users with verificationStatus PENDING (includes qcuIdPhotoUrl, liveSelfieUrl).
 * @returns {Promise<{success: boolean, count: number, data: object[]}>}
 */
export const getPendingVerifications = async () => {
  const response = await apiClient.get('/admin/verifications');
  return response.data;
};

/**
 * PATCH /admin/verifications/:userId
 * @param {string} userId
 * @param {'VERIFIED'|'REJECTED'} status
 * @param {string} [rejectionReason]
 */
export const reviewUserVerification = async (userId, status, rejectionReason) => {
  const response = await apiClient.patch(`/admin/verifications/${userId}`, { status, rejectionReason });
  return response.data;
};

export const approveUserVerification = (userId) => reviewUserVerification(userId, 'VERIFIED');
export const rejectUserVerification = (userId, rejectionReason) =>
  reviewUserVerification(userId, 'REJECTED', rejectionReason);

/**
 * PATCH /admin/products/:productId
 * @param {string} productId
 * @param {'VERIFIED'|'REJECTED'} status
 * @param {string} [rejectionReason]
 */
export const reviewProduct = async (productId, status, rejectionReason) => {
  const response = await apiClient.patch(`/admin/products/${productId}`, { status, rejectionReason });
  return response.data;
};

export const approveProduct = (productId) => reviewProduct(productId, 'VERIFIED');
export const rejectProduct = (productId, rejectionReason) => reviewProduct(productId, 'REJECTED', rejectionReason);

/**
 * GET /admin/complaints
 * Each complaint includes complainant { fullName, email, qcuIdNumber } and order { orderNumber, totalAmount }.
 */
export const getComplaints = async () => {
  const response = await apiClient.get('/admin/complaints');
  return response.data;
};

/**
 * PATCH /admin/complaints/:complaintId
 * @param {string} complaintId
 * @param {'UNDER_REVIEW'|'RESOLVED'|'DISMISSED'} status
 * @param {string} adminResolutionNote  min 5 chars
 */
export const resolveComplaint = async (complaintId, status, adminResolutionNote) => {
  const response = await apiClient.patch(`/admin/complaints/${complaintId}`, { status, adminResolutionNote });
  return response.data;
};

// ============================================================================
// NEW ADDITIONS (Guades & Castro)
// ============================================================================

/**
 * POST /admin/complaints
 * Submit a new complaint (Buyer/Seller)
 */
export const submitComplaint = async (subject, description, orderId) => {
  const response = await apiClient.post('/admin/complaints', { subject, description, orderId });
  return response.data;
};

/**
 * GET /admin/audit-logs
 * View system activity / transaction monitoring logs
 */
export const getAuditLogs = async () => {
  const response = await apiClient.get('/admin/audit-logs');
  return response.data;
};

/**
 * GET /admin/analytics/sales
 * Get total sales and revenue reports
 */
export const getSalesAnalytics = async () => {
  const response = await apiClient.get('/admin/analytics/sales');
  return response.data;
};

/**
 * GET /admin/analytics/demand
 * Get campus demand trends
 */
export const getDemandAnalytics = async () => {
  const response = await apiClient.get('/admin/analytics/demand');
  return response.data;
};

/**
 * GET /admin/duplicates
 * Scan for duplicate registrations
 */
export const getDuplicates = async () => {
  const response = await apiClient.get('/admin/duplicates');
  return response.data;
};

/**
 * POST /admin/disputes/:userId/reopen
 * Reopen a rejected account
 */
export const reopenDispute = async (userId, reason) => {
  const response = await apiClient.post(`/admin/disputes/${userId}/reopen`, { reason });
  return response.data;
};