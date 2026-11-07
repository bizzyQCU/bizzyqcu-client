import apiClient from '../../lib/api-client';

// ============================================================================
// SUBSYSTEM 1: AUTHENTICATION & IDENTITY VERIFICATION
// Mirrors bizzyqcu-server: src/modules/auth
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
 * Step 1: POST /auth/login/password
 * Verifies credentials and sends a 6-digit OTP to user's registered email.
 *
 * @param {{qcuIdNumber: string, password: string}} credentials
 * @returns {Promise<{success: boolean, message: string}>}
 */
export const requestPasswordOtp = async (credentials) => {
  const response = await apiClient.post('/auth/login/password', credentials);
  return response.data;
};

/**
 * Step 2: POST /auth/login/otp/verify
 * Consumes the OTP and issues a JWT token with user profile.
 *
 * @param {{qcuIdNumber: string, otp: string}} payload
 * @returns {Promise<{success: boolean, message: string, data: { token: string, accessToken: string, user: object }}>}
 */
export const verifyPasswordOtp = async (payload) => {
  const response = await apiClient.post('/auth/login/otp/verify', payload);
  return response.data;
};

/**
 * Legacy alias for backwards compatibility
 */
export const loginWithPassword = requestPasswordOtp;

// ============================================================================
// WEBAUTHN / PASSKEY AUTHENTICATION
// ============================================================================

/**
 * POST /auth/webauthn/register/options
 */
export const getWebAuthnRegisterOptions = async (userId) => {
  const response = await apiClient.post('/auth/webauthn/register/options', userId ? { userId } : {});
  return response.data;
};

/**
 * POST /auth/webauthn/register/verify
 */
export const verifyWebAuthnRegistration = async ({ response, deviceName, userId }) => {
  const res = await apiClient.post('/auth/webauthn/register/verify', { response, deviceName, userId });
  return res.data;
};

/**
 * POST /auth/webauthn/login/options
 */
export const getWebAuthnLoginOptions = async (qcuIdNumber) => {
  const response = await apiClient.post('/auth/webauthn/login/options', { qcuIdNumber });
  return response.data;
};

/**
 * POST /auth/webauthn/login/verify
 */
export const verifyWebAuthnLogin = async ({ qcuIdNumber, response }) => {
  const res = await apiClient.post('/auth/webauthn/login/verify', { qcuIdNumber, response });
  return res.data;
};

/**
 * GET /auth/webauthn/passkeys
 */
export const listPasskeys = async () => {
  const response = await apiClient.get('/auth/webauthn/passkeys');
  return response.data;
};

/**
 * DELETE /auth/webauthn/passkeys/:id
 */
export const deletePasskey = async (passkeyId) => {
  const response = await apiClient.delete(`/auth/webauthn/passkeys/${passkeyId}`);
  return response.data;
};

// ============================================================================
// PROFILE
// ============================================================================

/**
 * GET /auth/profile (requires Bearer token)
 * @returns {Promise<{success: boolean, data: object}>}
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
