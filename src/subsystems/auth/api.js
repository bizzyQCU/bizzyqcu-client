import apiClient from '../../lib/api-client';

// ============================================================================
// SUBSYSTEM 1: AUTHENTICATION & VERIFICATION
// Mirrors bizzyqcu-server: src/modules/auth
//
// Not available on the server yet (do not call): login, WebAuthn passkeys,
// OTP, and photo upload. Add them here once the endpoints exist.
// ============================================================================

/**
 * POST /auth/register
 * Registration is submitted as PENDING until an admin verifies the user.
 *
 * @param {object} userData
 * @param {string} userData.qcuIdNumber    YY-NNNN (e.g. "24-0001")
 * @param {string} userData.email
 * @param {string} userData.fullName       min 2 chars
 * @param {'STUDENT'|'FACULTY'|'STAFF'} userData.memberType
 * @param {string} userData.qcuIdPhotoUrl  valid URL
 * @param {string} userData.liveSelfieUrl  valid URL
 * @param {string} [userData.password]     min 8 chars
 * @returns {Promise<{success: boolean, message: string, data: object}>}
 */
export const registerUser = async (userData) => {
  const response = await apiClient.post('/auth/register', userData);
  return response.data;
};

/**
 * POST /auth/login
 * @param {{qcuIdNumber: string, password?: string}} credentials
 * @returns {Promise<{ success: boolean, message: string, data: { token: string, user: object } }>}
 */
export const loginWithPassword = async (credentials) => {
  const response = await apiClient.post('/auth/login', credentials);
  return response.data;
};

/**
 * GET /auth/profile (requires Bearer token)
 * @returns {Promise<{success: boolean, data: object}>} data includes
 *   id, qcuIdNumber, email, fullName, memberType, role, verificationStatus,
 *   sellerProfile, passkeys[]
 */
export const getProfile = async () => {
  const response = await apiClient.get('/auth/profile');
  return response.data;
};

/** Returns the current user object (unwrapped from the API envelope). */
export const getCurrentUser = async () => {
  const { data } = await getProfile();
  return data;
};
