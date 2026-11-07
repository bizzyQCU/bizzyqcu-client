import apiClient, { getErrorMessage, getFieldErrors } from './lib/api-client';

// ============================================================================
// SETTINGS & PROFILE API ENDPOINTS
// Connects bizzyqcu-client with bizzyqcu-server
// Used by Settings.jsx in src/subsystems/marketplace/organization/pages
// ============================================================================

/**
 * GET /marketplace/stores/me (seller only)
 * Fetches the authenticated seller's store profile.
 * Returns null if the seller has not registered a store yet.
 *
 * @returns {Promise<object|null>} Store data or null if not yet created.
 */
export const getStoreSettings = async () => {
  try {
    const response = await apiClient.get('/marketplace/stores/me');
    return response.data?.data || response.data;
  } catch (error) {
    if (error.response?.status === 404) {
      return null;
    }
    throw error;
  }
};

/**
 * Alias for getStoreSettings
 */
export const getMyStore = getStoreSettings;

/**
 * PATCH /marketplace/stores/me (seller only)
 * Updates the seller's store profile. If store doesn't exist yet, creates it.
 *
 * @param {object} storeData
 * @param {string} [storeData.name]            Store name (min 3 chars)
 * @param {string} [storeData.description]     Description/bio (min 10 chars)
 * @param {string} [storeData.pickupLocation]  Campus pickup location
 * @param {string} [storeData.logoUrl]         Cloudinary / image URL
 * @param {string} [storeData.bannerUrl]       Banner URL
 * @param {boolean} [storeData.isOpen]         Store open status
 * @returns {Promise<object>}
 */
export const updateStoreSettings = async (storeData) => {
  try {
    const response = await apiClient.patch('/marketplace/stores/me', storeData);
    return response.data?.data || response.data;
  } catch (error) {
    if (error.response?.status === 404) {
      // Store does not exist yet; create it
      const payload = {
        name: storeData.name || 'Organization Store',
        description: storeData.description || 'Student Organization Store at Quezon City University',
        pickupLocation: storeData.pickupLocation,
        logoUrl: storeData.logoUrl,
        bannerUrl: storeData.bannerUrl,
      };
      const createRes = await apiClient.post('/marketplace/stores', payload);
      return createRes.data?.data || createRes.data;
    }
    throw error;
  }
};

/**
 * Alias for updateStoreSettings
 */
export const updateMyStore = updateStoreSettings;

/**
 * POST /marketplace/stores (seller only)
 * Explicitly register a new store for the seller profile.
 *
 * @param {object} storeData
 * @param {string} storeData.name
 * @param {string} storeData.description
 * @param {string} [storeData.pickupLocation]
 * @param {string} [storeData.logoUrl]
 * @param {string} [storeData.bannerUrl]
 * @returns {Promise<object>}
 */
export const createStore = async (storeData) => {
  const response = await apiClient.post('/marketplace/stores', storeData);
  return response.data?.data || response.data;
};

/**
 * POST /upload (auth required)
 * Uploads a single file (e.g. organization logo) to Cloudinary via server.
 *
 * @param {File|Blob} file
 * @param {string} [folder="stores"]
 * @returns {Promise<{ url: string, publicId: string, format: string, bytes: number }>}
 */
export const uploadFile = async (file, folder = 'stores') => {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('folder', folder);

  const response = await apiClient.post('/upload', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });

  return response.data?.data || response.data;
};

/**
 * Upload an organization/store logo and return its URL.
 *
 * @param {File|Blob} file
 * @returns {Promise<{ url: string }>}
 */
export const uploadLogo = async (file) => {
  return uploadFile(file, 'stores/logos');
};

/**
 * GET /auth/profile (auth required)
 * Retrieves authenticated user credentials and profile.
 *
 * @returns {Promise<object>} User profile (id, email, fullName, memberType, role, verificationStatus)
 */
export const getUserProfile = async () => {
  const response = await apiClient.get('/auth/profile');
  return response.data?.data || response.data;
};

/**
 * PATCH /auth/email (auth required)
 * Updates the user's institutional email address.
 *
 * @param {string} email
 * @returns {Promise<object>}
 */
export const updateUserEmail = async (email) => {
  const response = await apiClient.patch('/auth/email', { email });
  return response.data?.data || response.data;
};

/**
 * GET /organization/profile (auth required)
 * Retrieves organization seller profile and field-level cooldown timestamps.
 */
export const getOrganizationProfile = async () => {
  try {
    const response = await apiClient.get('/organization/profile');
    return response.data?.data || response.data;
  } catch (error) {
    if (error.response?.status === 404) return null;
    throw error;
  }
};

/**
 * PUT /organization/profile (auth required)
 * Updates an organization field with backend 7-day cooldown enforcement.
 *
 * @param {'name'|'location'|'bio'|'email'|'contact'} field
 * @param {string} value
 */
export const updateOrganizationProfile = async (field, value) => {
  const response = await apiClient.put('/organization/profile', {
    field,
    value,
  });
  return response.data?.data || response.data;
};

/**
 * POST /organization/change-password (auth required)
 * Changes password with bcrypt verification and 7-day server cooldown.
 *
 * @param {object} payload
 * @param {string} payload.currentPassword
 * @param {string} payload.newPassword
 */
export const changeOrganizationPassword = async ({ currentPassword, newPassword }) => {
  const response = await apiClient.post('/organization/change-password', {
    currentPassword,
    newPassword,
  });
  return response.data;
};

/**
 * PATCH /auth/password (auth required)
 * Verifies current password and sets a new password.
 *
 * @param {object} payload
 * @param {string} payload.currentPassword
 * @param {string} payload.newPassword
 * @returns {Promise<{ success: boolean, message: string }>}
 */
export const updatePassword = async ({ currentPassword, newPassword }) => {
  try {
    return await changeOrganizationPassword({ currentPassword, newPassword });
  } catch (err) {
    if (err.response?.status === 404) {
      const response = await apiClient.patch('/auth/password', {
        currentPassword,
        newPassword,
      });
      return response.data;
    }
    throw err;
  }
};

/**
 * Convenience helper: Fetches all settings data (store profile + user profile)
 * in parallel for Settings.jsx.
 *
 * @returns {Promise<{
 *   store: object|null,
 *   user: object|null,
 *   orgInfo: { name: string, location: string, bio: string },
 *   credentials: { email: string },
 *   avatarPreview: string|null
 * }>}
 */
export const getSettingsData = async () => {
  const [orgResult, storeResult, userResult] = await Promise.allSettled([
    getOrganizationProfile(),
    getStoreSettings(),
    getUserProfile(),
  ]);

  const org = orgResult.status === 'fulfilled' ? orgResult.value : null;
  const store = storeResult.status === 'fulfilled' ? storeResult.value : null;
  const user = userResult.status === 'fulfilled' ? userResult.value : null;

  return {
    store: org || store,
    user,
    orgInfo: {
      name: org?.name || store?.name || user?.fullName || 'QCU Bookworms Guild',
      location: org?.location || store?.pickupLocation || 'San Bartolome Campus (Main), IK Building, Booth 3',
      bio: org?.bio || store?.description || 'Campus-approved pre-loved engineering textbooks and reviewers.',
    },
    credentials: {
      email: org?.email || user?.email || 'bookworms@qcu.edu.ph',
      contact: org?.contactNumber || localStorage.getItem('bizzy_contact_number') || '09123456789',
    },
    cooldowns: org?.cooldowns || null,
    avatarPreview: org?.logoUrl || store?.logoUrl || null,
  };
};

/**
 * Convenience helper: Saves a specific account setting field.
 *
 * @param {'name'|'location'|'bio'|'email'|'contact'} type
 * @param {string} value
 */
export const updateSettingField = async (type, value) => {
  const trimmed = value.trim();
  try {
    return await updateOrganizationProfile(type, trimmed);
  } catch (err) {
    if (err.response?.status === 404) {
      switch (type) {
        case 'name':
          return updateStoreSettings({ name: trimmed });
        case 'location':
          return updateStoreSettings({ pickupLocation: trimmed });
        case 'bio':
          return updateStoreSettings({ description: trimmed });
        case 'email':
          return updateUserEmail(trimmed);
        case 'contact':
          localStorage.setItem('bizzy_contact_number', trimmed);
          return { contact: trimmed };
        default:
          throw new Error(`Unknown setting field type: ${type}`);
      }
    }
    throw err;
  }
};

// Re-export core client and error utilities
export { apiClient, getErrorMessage, getFieldErrors };
export default apiClient;
