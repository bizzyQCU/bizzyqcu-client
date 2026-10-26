import apiClient from '../../lib/api-client';

// ============================================================================
// SUBSYSTEM 1: AUTHENTICATION & VERIFICATION
// ============================================================================

/**
 * Register a new user with QCU ID verification
 */
export const registerUser = async (userData) => {
  const response = await apiClient.post('/auth/register', userData);
  return response.data;
};

/**
 * Login with QCU ID and password
 */
export const loginWithPassword = async (credentials) => {
  const response = await apiClient.post('/auth/login', credentials);
  return response.data;
};

/**
 * WebAuthn: Generate registration options for passkey
 */
export const generateRegistrationOptions = async () => {
  const response = await apiClient.post('/auth/webauthn/register/options');
  return response.data;
};

/**
 * WebAuthn: Verify passkey registration
 */
export const verifyRegistration = async (credential) => {
  const response = await apiClient.post('/auth/webauthn/register/verify', credential);
  return response.data;
};

/**
 * WebAuthn: Generate authentication options for passkey login
 */
export const generateAuthenticationOptions = async (qcuIdNumber) => {
  const response = await apiClient.post('/auth/webauthn/login/options', { qcuIdNumber });
  return response.data;
};

/**
 * WebAuthn: Verify passkey authentication
 */
export const verifyAuthentication = async (credential) => {
  const response = await apiClient.post('/auth/webauthn/login/verify', credential);
  return response.data;
};

/**
 * Request OTP for fallback authentication
 */
export const requestOTP = async (qcuIdNumber) => {
  const response = await apiClient.post('/auth/otp/request', { qcuIdNumber });
  return response.data;
};

/**
 * Verify OTP
 */
export const verifyOTP = async (qcuIdNumber, otpCode) => {
  const response = await apiClient.post('/auth/otp/verify', { qcuIdNumber, otpCode });
  return response.data;
};

/**
 * Upload QCU ID photo for verification
 */
export const uploadQcuIdPhoto = async (formData) => {
  const response = await apiClient.post('/auth/verification/upload-id', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return response.data;
};

/**
 * Upload live selfie for verification
 */
export const uploadLiveSelfie = async (formData) => {
  const response = await apiClient.post('/auth/verification/upload-selfie', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return response.data;
};

/**
 * Get current user profile
 */
export const getCurrentUser = async () => {
  const response = await apiClient.get('/auth/me');
  return response.data;
};

/**
 * Logout
 */
export const logout = async () => {
  const response = await apiClient.post('/auth/logout');
  return response.data;
};

/**
 * Register as seller (student enterprise, org, or independent)
 */
export const registerSeller = async (sellerData) => {
  const response = await apiClient.post('/auth/seller/register', sellerData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return response.data;
};

/**
 * Get seller profile
 */
export const getSellerProfile = async () => {
  const response = await apiClient.get('/auth/seller/profile');
  return response.data;
};
