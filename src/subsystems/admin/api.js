import apiClient from '../../lib/api-client';

// ============================================================================
// SUBSYSTEM 4: PLATFORM MANAGEMENT & ADMINISTRATION API
// Clean RESTful endpoints matching bizzyqcu-server (/api/v1/admin)
// ============================================================================

// ----------------------------------------------------------------------------
// 1. VERIFICATION QUEUE & REVIEWS (Guades)
// ----------------------------------------------------------------------------

/**
 * GET /admin/verifications?type=user|seller|store|product&page=1&limit=20
 * Returns pending items with uploaded documents / photos.
 * @param {object} [params] { type: 'user'|'seller'|'store'|'product', page: number, limit: number }
 */
export const getPendingVerifications = async (params = {}) => {
  const response = await apiClient.get('/admin/verifications', { params });
  return response.data;
};

/**
 * PATCH /admin/verifications/users/:userId
 * Review student/faculty QCU ID photo and live selfie.
 * @param {string} userId
 * @param {'VERIFIED'|'REJECTED'} status
 * @param {string} [rejectionReason] Required if status is REJECTED
 */
export const reviewUserVerification = async (userId, status, rejectionReason) => {
  const response = await apiClient.patch(`/admin/verifications/users/${userId}`, {
    status,
    rejectionReason: status === 'REJECTED' ? rejectionReason : undefined,
  });
  return response.data;
};

export const approveUserVerification = (userId) => reviewUserVerification(userId, 'VERIFIED');
export const rejectUserVerification = (userId, rejectionReason) =>
  reviewUserVerification(userId, 'REJECTED', rejectionReason);

/**
 * PATCH /admin/verifications/sellers/:sellerProfileId
 * Review OJT endorsement, org recognition, or enrollment proof.
 * @param {string} sellerProfileId
 * @param {'VERIFIED'|'REJECTED'} status
 * @param {string} [rejectionReason]
 */
export const reviewSellerVerification = async (sellerProfileId, status, rejectionReason) => {
  const response = await apiClient.patch(`/admin/verifications/sellers/${sellerProfileId}`, {
    status,
    rejectionReason: status === 'REJECTED' ? rejectionReason : undefined,
  });
  return response.data;
};

export const approveSellerVerification = (sellerProfileId) => reviewSellerVerification(sellerProfileId, 'VERIFIED');
export const rejectSellerVerification = (sellerProfileId, rejectionReason) =>
  reviewSellerVerification(sellerProfileId, 'REJECTED', rejectionReason);

/**
 * PATCH /admin/verifications/stores/:storeId
 * Review campus store profile (logo, banner, pickup spot).
 * @param {string} storeId
 * @param {'VERIFIED'|'REJECTED'} status
 * @param {string} [rejectionReason]
 */
export const reviewStoreVerification = async (storeId, status, rejectionReason) => {
  const response = await apiClient.patch(`/admin/verifications/stores/${storeId}`, {
    status,
    rejectionReason: status === 'REJECTED' ? rejectionReason : undefined,
  });
  return response.data;
};

export const approveStore = (storeId) => reviewStoreVerification(storeId, 'VERIFIED');
export const rejectStore = (storeId, rejectionReason) => reviewStoreVerification(storeId, 'REJECTED', rejectionReason);

/**
 * PATCH /admin/verifications/products/:productId
 * Review product approval and uploaded product photo gallery.
 * @param {string} productId
 * @param {'VERIFIED'|'REJECTED'} status
 * @param {string} [rejectionReason]
 */
export const reviewProduct = async (productId, status, rejectionReason) => {
  const response = await apiClient.patch(`/admin/verifications/products/${productId}`, {
    status,
    rejectionReason: status === 'REJECTED' ? rejectionReason : undefined,
  });
  return response.data;
};

export const approveProduct = (productId) => reviewProduct(productId, 'VERIFIED');
export const rejectProduct = (productId, rejectionReason) => reviewProduct(productId, 'REJECTED', rejectionReason);

// ----------------------------------------------------------------------------
// 2. COMPLAINT & REPORT TICKET CRUD (Duay & Castro)
// ----------------------------------------------------------------------------

/**
 * GET /admin/complaints
 * Lists all complaints with pagination, status filter, and multi-field search.
 * @param {object} [params] { page, limit, status, orderId, complainantId, search }
 */
export const getComplaints = async (params = {}) => {
  const response = await apiClient.get('/admin/complaints', { params });
  return response.data;
};

/**
 * GET /admin/complaints/:complaintId
 * View single complaint details with order and complainant metadata.
 * @param {string} complaintId
 */
export const getComplaintById = async (complaintId) => {
  const response = await apiClient.get(`/admin/complaints/${complaintId}`);
  return response.data;
};

/**
 * GET /admin/complaints/my
 * View current user's submitted tickets.
 * @param {object} [params] { page, limit, status }
 */
export const getMyComplaints = async (params = {}) => {
  const response = await apiClient.get('/admin/complaints/my', { params });
  return response.data;
};

/**
 * GET /complaints/my
 * Customer self-service endpoint to view their own submitted tickets and Admin's resolution notes.
 */
export const getCustomerComplaints = async (params = {}) => {
  const response = await apiClient.get('/complaints/my', { params });
  return response.data;
};

/**
 * POST /complaints
 * Customer endpoint for submitting complaints or inquiries directly to Admin.
 */
export const submitCustomerComplaint = async (subjectOrPayload, description, orderId, evidenceUrls) => {
  let payload;
  if (typeof subjectOrPayload === 'object' && subjectOrPayload !== null) {
    payload = subjectOrPayload;
  } else {
    payload = {
      subject: subjectOrPayload,
      description,
      orderId: orderId || undefined,
      evidenceUrls: Array.isArray(evidenceUrls) ? evidenceUrls : [],
    };
  }
  const response = await apiClient.post('/complaints', payload);
  return response.data;
};

/**
 * POST /admin/complaints
 * Submit a new complaint ticket.
 */
export const submitComplaint = async (subjectOrPayload, description, orderId, evidenceUrls) => {
  let payload;
  if (typeof subjectOrPayload === 'object' && subjectOrPayload !== null) {
    payload = subjectOrPayload;
  } else {
    payload = {
      subject: subjectOrPayload,
      description,
      orderId: orderId || undefined,
      evidenceUrls: Array.isArray(evidenceUrls) ? evidenceUrls : [],
    };
  }
  const response = await apiClient.post('/admin/complaints', payload);
  return response.data;
};

/**
 * PATCH /admin/complaints/:complaintId
 * Resolve, review, or dismiss a complaint ticket.
 * @param {string} complaintId
 * @param {'UNDER_REVIEW'|'RESOLVED'|'DISMISSED'} status
 * @param {string} adminResolutionNote Minimum 5 characters
 */
export const resolveComplaint = async (complaintId, status, adminResolutionNote) => {
  const response = await apiClient.patch(`/admin/complaints/${complaintId}`, {
    status,
    adminResolutionNote,
  });
  return response.data;
};

// ----------------------------------------------------------------------------
// 3. SYSTEM ACTIVITY & AUDIT LOGS (Castro)
// ----------------------------------------------------------------------------

/**
 * GET /admin/audit-logs
 * View audit trail with pagination and filters.
 * @param {object} [params] { page, limit, subsystem, action, actorId }
 */
export const getAuditLogs = async (params = {}) => {
  const response = await apiClient.get('/admin/audit-logs', { params });
  return response.data;
};

/**
 * POST /admin/audit-logs
 * Manually record an administrative action or system activity log.
 * @param {object} logData { subsystem, action, targetId, details }
 */
export const createAuditLog = async (logData) => {
  const response = await apiClient.post('/admin/audit-logs', logData);
  return response.data;
};

// ----------------------------------------------------------------------------
// 4. TRANSACTION MONITORING LOGS (Duay & Castro)
// ----------------------------------------------------------------------------

/**
 * GET /admin/transactions
 * View PayMongo split payments & cash logs.
 * @param {object} [params] { page, limit, status, method, orderId, search }
 */
export const getTransactionLogs = async (params = {}) => {
  const response = await apiClient.get('/admin/transactions', { params });
  return response.data;
};

/**
 * GET /admin/transactions/:transactionId
 * Inspect single transaction with webhook payload and order details.
 * @param {string} transactionId
 */
export const getTransactionById = async (transactionId) => {
  const response = await apiClient.get(`/admin/transactions/${transactionId}`);
  return response.data;
};

// ----------------------------------------------------------------------------
// 5. PLATFORM ANALYTICS & DISPUTES (Guades)
// ----------------------------------------------------------------------------

/**
 * GET /admin/analytics/sales
 * Get total sales and revenue reports.
 */
export const getSalesAnalytics = async () => {
  const response = await apiClient.get('/admin/analytics/sales');
  return response.data;
};

/**
 * GET /admin/analytics/demand
 * Get campus demand trends.
 */
export const getDemandAnalytics = async () => {
  const response = await apiClient.get('/admin/analytics/demand');
  return response.data;
};

/**
 * GET /admin/duplicates
 * Scan for duplicate registrations.
 */
export const getDuplicates = async () => {
  const response = await apiClient.get('/admin/duplicates');
  return response.data;
};

/**
 * POST /admin/disputes/:userId/reopen
 * Reopen a rejected account.
 */
export const reopenDispute = async (userId, reason) => {
  const response = await apiClient.post(`/admin/disputes/${userId}/reopen`, { reason });
  return response.data;
};
