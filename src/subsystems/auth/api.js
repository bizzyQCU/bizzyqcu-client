import apiClient from '../../lib/api-client';
import { startPasskeyLogin, startPasskeyRegistration } from '../../lib/webauthn';

// ============================================================================
// SUBSYSTEM 1: AUTHENTICATION, IDENTITY VERIFICATION & DEVICE MANAGEMENT
// Mirrors bizzyqcu-server: src/modules/auth
// ============================================================================

// ============================================================================
// 1. VERIFICATION DOCUMENT UPLOADS
// ============================================================================

/**
 * POST /auth/uploads/verification (multipart/form-data)
 * Uploads a QCU ID photo, live selfie, or seller endorsement document before
 * or after registration.
 *
 * @param {File|Blob} file
 * @param {'QCU_ID'|'LIVE_SELFIE'|'SELLER_ENDORSEMENT'} documentType
 * @returns {Promise<{success: boolean, data: { documentType: string, url: string, publicId: string }}>}
 */
export const uploadVerificationDocument = async (file, documentType) => {
  const formData = new FormData();
  const filename =
    file instanceof File && file.name
      ? file.name
      : documentType === 'LIVE_SELFIE'
        ? 'live-selfie.jpg'
        : 'document.jpg';
  formData.append('file', file, filename);
  formData.append('documentType', documentType);

  const response = await apiClient.post('/auth/uploads/verification', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return response.data;
};

// ============================================================================
// 2. REGISTRATION & SELLER APPLICATIONS (Manuel & Vizconde)
// ============================================================================

/**
 * Step 1 (Registration Email OTP): POST /auth/register/otp/request
 * Checks email/QCU ID availability and sends a 6-digit registration OTP to the user's email.
 *
 * @param {{email: string, qcuIdNumber?: string}} payload
 * @returns {Promise<{success: boolean, message: string, data: { otpToken: string, expiresInSeconds: number }}>}
 */
export const requestRegistrationOtp = async (payload) => {
  const response = await apiClient.post('/auth/register/otp/request', payload);
  return response.data;
};

/**
 * Step 2 (Registration Email OTP): POST /auth/register/otp/verify
 * Verifies the 6-digit registration code and returns a short-lived emailVerificationToken.
 *
 * @param {{email: string, otp: string, otpToken: string}} payload
 * @returns {Promise<{success: boolean, message: string, data: { emailVerificationToken: string, expiresInSeconds: number }}>}
 */
export const verifyRegistrationOtp = async (payload) => {
  const response = await apiClient.post('/auth/register/otp/verify', payload);
  return response.data;
};

/**
 * POST /auth/register
 * Registers a Buyer or Seller account (submitted as PENDING until admin review).
 *
 * @param {object} userData
 * @param {string} userData.qcuIdNumber            YY-NNNN (e.g. "24-0001")
 * @param {string} userData.email
 * @param {string} userData.emailVerificationToken token returned by POST /auth/register/otp/verify
 * @param {string} userData.fullName               min 2 chars
 * @param {'STUDENT'} [userData.memberType]    defaults to 'STUDENT' (student-only registration)
 * @param {string} userData.qcuIdPhotoUrl          valid URL
 * @param {string} userData.liveSelfieUrl          valid URL
 * @param {string} [userData.password]             min 8 chars (optional for passkey-only)
 * @param {'BUYER'|'SELLER'} [userData.role]       defaults to 'BUYER'
 * @param {'STUDENT_ENTERPRISE'|'RECOGNIZED_ORGANIZATION'|'INDEPENDENT_SELLER'} [userData.sellerType]
 * @param {string} [userData.supportingDocumentUrl] required when role === 'SELLER'
 * @returns {Promise<{success: boolean, message: string, data: object}>}
 */
export const registerUser = async (userData) => {
  const response = await apiClient.post('/auth/register', userData);
  return response.data;
};

/**
 * POST /auth/seller-application (alias: POST /auth/seller/register)
 * Submits a seller profile application for an existing authenticated STUDENT user.
 *
 * @param {{sellerType: 'STUDENT_ENTERPRISE'|'RECOGNIZED_ORGANIZATION'|'INDEPENDENT_SELLER', supportingDocumentUrl: string}} payload
 * @returns {Promise<{success: boolean, message: string, data: object}>}
 */
export const applyForSeller = async (payload) => {
  const response = await apiClient.post('/auth/seller-application', payload);
  return response.data;
};

// ============================================================================
// 3. ACCOUNT & SELLER VERIFICATION STATUS TRACKING (Manuel)
// ============================================================================

/**
 * GET /auth/account-status (alias: GET /auth/status)
 * Retrieves the authenticated user's account and seller verification status.
 */
export const getAccountStatus = async () => {
  const response = await apiClient.get('/auth/account-status');
  return response.data;
};

/**
 * POST /auth/resubmit-verification
 * Resubmits QCU ID photo and/or live selfie after rejection.
 *
 * @param {{qcuIdPhotoUrl?: string, liveSelfieUrl?: string}} payload
 */
export const resubmitUserVerification = async (payload) => {
  const response = await apiClient.post('/auth/resubmit-verification', payload);
  return response.data;
};

/**
 * POST /auth/seller/resubmit
 * Resubmits seller endorsement document (and optional sellerType) after rejection.
 *
 * @param {{sellerType?: 'STUDENT_ENTERPRISE'|'RECOGNIZED_ORGANIZATION'|'INDEPENDENT_SELLER', supportingDocumentUrl: string}} payload
 */
export const resubmitSellerVerification = async (payload) => {
  const response = await apiClient.post('/auth/seller/resubmit', payload);
  return response.data;
};

// ============================================================================
// 4. PASSWORD + EMAIL OTP LOGIN (Vizconde)
// ============================================================================

/**
 * Step 1: POST /auth/login/password
 * Verifies credentials and sends a 6-digit OTP to the user's registered email.
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

/** Legacy alias for backwards compatibility */
export const loginWithPassword = requestPasswordOtp;

// ============================================================================
// 5. WEBAUTHN / PASSKEY AUTHENTICATION & DEVICE MANAGEMENT
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
 * GET /auth/devices (alias: GET /auth/webauthn/passkeys)
 */
export const listDevices = async () => {
  const response = await apiClient.get('/auth/devices');
  return response.data;
};

export const listPasskeys = async () => {
  const response = await apiClient.get('/auth/webauthn/passkeys');
  return response.data;
};

/**
 * GET /auth/devices/:id
 */
export const getDevice = async (deviceId) => {
  const response = await apiClient.get(`/auth/devices/${encodeURIComponent(deviceId)}`);
  return response.data;
};

/**
 * PATCH /auth/devices/:id
 * Renames a registered passkey / device.
 */
export const updateDeviceName = async (deviceId, deviceName) => {
  const response = await apiClient.patch(`/auth/devices/${encodeURIComponent(deviceId)}`, {
    deviceName: deviceName.trim(),
  });
  return response.data;
};

/**
 * DELETE /auth/devices/:id (alias: DELETE /auth/webauthn/passkeys/:id)
 */
export const deleteDevice = async (deviceId) => {
  const response = await apiClient.delete(`/auth/devices/${encodeURIComponent(deviceId)}`);
  return response.data;
};

export const deletePasskey = async (passkeyId) => {
  const response = await apiClient.delete(`/auth/webauthn/passkeys/${encodeURIComponent(passkeyId)}`);
  return response.data;
};

/**
 * Full passkey registration ceremony (options -> browser prompt -> verify).
 */
export const registerPasskey = async ({ userId, deviceName }) => {
  const { data: options } = await getWebAuthnRegisterOptions(userId);
  const attestation = await startPasskeyRegistration(options);
  const result = await verifyWebAuthnRegistration({
    userId,
    response: attestation,
    deviceName: deviceName?.trim() || undefined,
  });
  return result.data;
};

/**
 * Full passkey login ceremony (options -> browser prompt -> verify).
 */
export const loginWithPasskey = async (qcuIdNumber) => {
  const { data: options } = await getWebAuthnLoginOptions(qcuIdNumber);
  const assertion = await startPasskeyLogin(options);
  const result = await verifyWebAuthnLogin({ qcuIdNumber, response: assertion });
  return result.data;
};

// ============================================================================
// 6. AUTHENTICATED PROFILE, PASSWORD & EMAIL MANAGEMENT
// ============================================================================

/**
 * GET /auth/profile (requires Bearer token)
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

/**
 * PATCH /auth/password (requires Bearer token)
 * @param {{currentPassword: string, newPassword: string}} payload
 */
export const changePassword = async (payload) => {
  const response = await apiClient.patch('/auth/password', payload);
  return response.data;
};

/**
 * PATCH /auth/email (requires Bearer token)
 * @param {{email: string}} payload
 */
export const updateEmail = async (payload) => {
  const response = await apiClient.patch('/auth/email', payload);
  return response.data;
};
