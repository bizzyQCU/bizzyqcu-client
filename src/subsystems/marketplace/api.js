import apiClient, { getErrorMessage, getFieldErrors } from "../../lib/api-client";

// ============================================================================
// SUBSYSTEM 2: MARKETPLACE & ORGANIZATION SELLER MANAGEMENT
// Mirrors bizzyqcu-server:
//   - src/modules/marketplace (products, catalog, inventory, dashboard, analytics, stores, categories)
//   - src/modules/orders (orders, messages, pickup locations, paymongo onboarding)
//   - src/modules/organization (profile, cooldown-enforced updates, password)
//   - src/modules/upload (single & multiple file uploads)
//   - src/modules/auth (profile, email, password fallback)
// ============================================================================

// ============================================================================
// PRODUCTS & CATALOG
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
    Object.entries(filters).filter(
      ([, v]) => v !== "" && v !== null && v !== undefined,
    ),
  );
  const response = await apiClient.get("/marketplace/products", { params });
  return response.data;
};

/**
 * GET /marketplace/products/:id (public)
 */
export const getPublicProduct = async (productId) => {
  const response = await apiClient.get(`/marketplace/products/${productId}`);
  return response.data;
};

/**
 * GET /marketplace/seller/products (seller only)
 * Returns the authenticated seller's own products including PENDING/REJECTED.
 *
 * @param {object} [query]
 * @param {number} [query.page]    default 1
 * @param {number} [query.limit]   default 20
 * @param {'PENDING'|'VERIFIED'|'REJECTED'} [query.approvalStatus]
 * @returns {Promise<{ success: boolean, items: object[], pagination: object }>}
 */
export const getSellerProducts = async (query = {}) => {
  const params = Object.fromEntries(
    Object.entries(query).filter(([, v]) => v !== "" && v !== null && v !== undefined),
  );
  const response = await apiClient.get("/marketplace/seller/products", { params });
  return response.data;
};

/**
 * GET /marketplace/seller/products/:id (seller only)
 */
export const getSellerProduct = async (productId) => {
  const response = await apiClient.get(`/marketplace/seller/products/${productId}`);
  return response.data;
};

/**
 * POST /marketplace/products (seller only)
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
  const response = await apiClient.post("/marketplace/products", productData);
  return response.data;
};

/**
 * PATCH /marketplace/products/:id (seller only)
 */
export const updateProduct = async (productId, productData) => {
  const response = await apiClient.patch(
    `/marketplace/products/${productId}`,
    productData,
  );
  return response.data;
};

/**
 * DELETE /marketplace/products/:id (seller only)
 */
export const deleteProduct = async (productId) => {
  const response = await apiClient.delete(`/marketplace/products/${productId}`);
  return response.data;
};

/**
 * PATCH /marketplace/products/:id/stock (seller only)
 */
export const setProductStock = async (productId, stockQuantity) => {
  const response = await apiClient.patch(
    `/marketplace/products/${productId}/stock`,
    { stockQuantity },
  );
  return response.data;
};

/**
 * PATCH /marketplace/products/:id/availability (seller only)
 */
export const setProductAvailability = async (productId, isAvailable) => {
  const response = await apiClient.patch(
    `/marketplace/products/${productId}/availability`,
    { isAvailable },
  );
  return response.data;
};

// ============================================================================
// CATEGORIES
// ============================================================================

/**
 * GET /marketplace/categories (public)
 * @returns {Promise<{ success: boolean, data: { id: string, name: string, slug: string }[] }>}
 */
export const getCategories = async () => {
  const response = await apiClient.get("/marketplace/categories");
  return response.data;
};

/**
 * GET /marketplace/categories/:id (public)
 */
export const getCategoryById = async (categoryId) => {
  const response = await apiClient.get(`/marketplace/categories/${categoryId}`);
  return response.data;
};

// ============================================================================
// STORES
// ============================================================================

/**
 * GET /marketplace/stores/:id (public)
 * Returns the store with its VERIFIED products.
 */
export const getStore = async (storeId) => {
  const response = await apiClient.get(`/marketplace/stores/${storeId}`);
  return response.data;
};

/**
 * GET /marketplace/stores/slug/:slug (public)
 */
export const getStoreBySlug = async (slug) => {
  const response = await apiClient.get(`/marketplace/stores/slug/${slug}`);
  return response.data;
};

/**
 * GET /marketplace/stores/me (seller only)
 */
export const getMyStore = async () => {
  const response = await apiClient.get("/marketplace/stores/me");
  return response.data;
};

/**
 * PATCH /marketplace/stores/me (seller only)
 */
export const updateMyStore = async (storeData) => {
  const response = await apiClient.patch("/marketplace/stores/me", storeData);
  return response.data;
};

/**
 * DELETE /marketplace/stores/me (seller only)
 */
export const deleteMyStore = async () => {
  const response = await apiClient.delete("/marketplace/stores/me");
  return response.data;
};

/**
 * POST /marketplace/stores (seller only)
 */
export const createStore = async (storeData) => {
  const response = await apiClient.post("/marketplace/stores", storeData);
  return response.data;
};

/**
 * GET /marketplace/stores/me (seller only)
 * Fetches the authenticated seller's store profile, returning null on 404.
 */
export const getStoreSettings = async () => {
  try {
    const response = await apiClient.get("/marketplace/stores/me");
    return response.data?.data || response.data;
  } catch (error) {
    if (error.response?.status === 404) {
      return null;
    }
    throw error;
  }
};

/**
 * PATCH /marketplace/stores/me (seller only)
 * Updates the seller's store profile; creates it via POST /marketplace/stores if 404.
 */
export const updateStoreSettings = async (storeData) => {
  try {
    const response = await apiClient.patch("/marketplace/stores/me", storeData);
    return response.data?.data || response.data;
  } catch (error) {
    if (error.response?.status === 404) {
      const payload = {
        name: storeData.name || "Organization Store",
        description:
          storeData.description ||
          "Student Organization Store at Quezon City University",
        pickupLocation: storeData.pickupLocation,
        logoUrl: storeData.logoUrl,
        bannerUrl: storeData.bannerUrl,
      };
      const createRes = await apiClient.post("/marketplace/stores", payload);
      return createRes.data?.data || createRes.data;
    }
    throw error;
  }
};

// ============================================================================
// SELLER DASHBOARD & ANALYTICS
// ============================================================================

/**
 * GET /marketplace/seller/dashboard (seller only)
 * @returns data: { store, sales, ordersByStatus, productsByApproval, lowStock, topSelling }
 */
export const getSellerDashboard = async () => {
  const response = await apiClient.get("/marketplace/seller/dashboard");
  return response.data;
};

/**
 * GET /marketplace/seller/analytics (seller only)
 * @param {object} [dateRange] Optional date range filter
 * @param {string} [dateRange.start] Start date in YYYY-MM-DD format
 * @param {string} [dateRange.end] End date in YYYY-MM-DD format
 * @param {'day'|'week'|'month'} [dateRange.groupBy] Bucket grouping
 * @returns {Promise<{ success: boolean, data: object }>}
 */
export const getSellerAnalytics = async (dateRange) => {
  const params = {};
  if (dateRange?.start) {
    params.start = dateRange.start;
    params.from = dateRange.start;
  }
  if (dateRange?.end) {
    params.end = dateRange.end;
    params.to = dateRange.end;
  }
  if (dateRange?.groupBy) {
    params.groupBy = dateRange.groupBy;
  }

  const response = await apiClient.get("/marketplace/seller/analytics", { params });
  return response.data;
};

// ============================================================================
// ORDERS & SELLER FULFILLMENT / PAYMONGO
// ============================================================================

/**
 * GET /orders/seller
 * Returns all incoming orders for the authenticated seller's store.
 * Requires SELLER role.
 */
export const getSellerOrders = async () => {
  const response = await apiClient.get("/orders/seller");
  return response.data;
};

/**
 * GET /orders/my-orders
 * Returns all orders placed by the authenticated buyer.
 */
export const getMyOrders = async () => {
  const response = await apiClient.get("/orders/my-orders");
  return response.data;
};

/**
 * GET /orders/:id
 * Returns a single order by ID.
 */
export const getOrderById = async (orderId) => {
  const response = await apiClient.get(`/orders/${orderId}`);
  return response.data;
};

/**
 * PATCH /orders/:id/status
 * Advances (or cancels) an order through the state machine.
 */
export const updateOrderStatus = async (orderId, status) => {
  const response = await apiClient.patch(`/orders/${orderId}/status`, {
    status,
  });
  return response.data;
};

/**
 * GET /orders/:id/messages
 * Returns the buyer-seller communication log for an order.
 */
export const getOrderMessages = async (orderId) => {
  const response = await apiClient.get(`/orders/${orderId}/messages`);
  return response.data;
};

/**
 * POST /orders/:id/messages
 * Sends a message on an order thread.
 */
export const createOrderMessage = async (orderId, message) => {
  const response = await apiClient.post(`/orders/${orderId}/messages`, {
    message,
  });
  return response.data;
};

/**
 * GET /orders/pickup-locations
 */
export const getPickupLocations = async () => {
  const response = await apiClient.get("/orders/pickup-locations");
  return response.data;
};

/**
 * POST /orders
 */
export const checkoutCart = async (checkoutData) => {
  const response = await apiClient.post("/orders", checkoutData);
  return response.data;
};

/**
 * GET /orders/seller/paymongo-status
 */
export const getSellerPaymongoStatus = async () => {
  const response = await apiClient.get("/orders/seller/paymongo-status");
  return response.data;
};

/**
 * POST /orders/seller/paymongo-onboard
 */
export const onboardSellerPaymongo = async (payload) => {
  const response = await apiClient.post("/orders/seller/paymongo-onboard", payload);
  return response.data;
};

// ============================================================================
// UPLOADS
// ============================================================================

/**
 * POST /upload (auth required)
 */
export const uploadFile = async (file, folder = "stores") => {
  const formData = new FormData();
  formData.append("file", file);
  formData.append("folder", folder);

  const response = await apiClient.post("/upload", formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });

  return response.data?.data || response.data;
};

/**
 * POST /upload (folder: 'stores/logos')
 */
export const uploadLogo = async (file) => {
  return uploadFile(file, "stores/logos");
};

/**
 * POST /upload/multiple (auth required, max 5 files)
 */
export const uploadMultipleFiles = async (files, folder = "products") => {
  const formData = new FormData();
  files.forEach((file) => {
    if (file instanceof File || file instanceof Blob) {
      formData.append("files", file);
    }
  });
  formData.append("folder", folder);

  const response = await apiClient.post("/upload/multiple", formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });

  return response.data;
};

// ============================================================================
// ORGANIZATION PROFILE & SETTINGS
// ============================================================================

/**
 * GET /auth/profile (auth required)
 */
export const getUserProfile = async () => {
  const response = await apiClient.get("/auth/profile");
  return response.data?.data || response.data;
};

/**
 * PATCH /auth/email (auth required)
 */
export const updateUserEmail = async (email) => {
  const response = await apiClient.patch("/auth/email", { email });
  return response.data?.data || response.data;
};

/**
 * GET /organization/profile (auth required)
 */
export const getOrganizationProfile = async () => {
  try {
    const response = await apiClient.get("/organization/profile");
    return response.data?.data || response.data;
  } catch (error) {
    if (error.response?.status === 404) return null;
    throw error;
  }
};

/**
 * PUT /organization/profile (auth required)
 */
export const updateOrganizationProfile = async (field, value) => {
  const response = await apiClient.put("/organization/profile", {
    field,
    value,
  });
  return response.data?.data || response.data;
};

/**
 * POST /organization/change-password (auth required)
 */
export const changeOrganizationPassword = async ({
  currentPassword,
  newPassword,
}) => {
  const response = await apiClient.post("/organization/change-password", {
    currentPassword,
    newPassword,
  });
  return response.data;
};

/**
 * Changes the seller password via /organization/change-password with PATCH /auth/password fallback.
 */
export const updatePassword = async ({ currentPassword, newPassword }) => {
  try {
    return await changeOrganizationPassword({ currentPassword, newPassword });
  } catch (err) {
    if (err.response?.status === 404) {
      const response = await apiClient.patch("/auth/password", {
        currentPassword,
        newPassword,
      });
      return response.data;
    }
    throw err;
  }
};

/**
 * Convenience helper: Fetches all organization settings data in parallel.
 */
export const getSettingsData = async () => {
  const [orgResult, storeResult, userResult] = await Promise.allSettled([
    getOrganizationProfile(),
    getStoreSettings(),
    getUserProfile(),
  ]);

  const org = orgResult.status === "fulfilled" ? orgResult.value : null;
  const store = storeResult.status === "fulfilled" ? storeResult.value : null;
  const user = userResult.status === "fulfilled" ? userResult.value : null;

  return {
    store: org || store,
    user,
    orgInfo: {
      name: org?.name || store?.name || user?.fullName || "",
      location: org?.location || store?.pickupLocation || "",
      bio: org?.bio || store?.description || "",
    },
    credentials: {
      email: org?.email || user?.email || "",
      contact:
        org?.contactNumber || user?.contactNumber || store?.contactNumber || "",
    },
    cooldowns: org?.cooldowns || null,
    avatarPreview: org?.logoUrl || store?.logoUrl || null,
  };
};

/**
 * Convenience helper: Saves a specific organization setting field.
 */
export const updateSettingField = async (type, value) => {
  const trimmed = value.trim();
  try {
    return await updateOrganizationProfile(type, trimmed);
  } catch (err) {
    if (err.response?.status === 404) {
      switch (type) {
        case "name":
          return updateStoreSettings({ name: trimmed });
        case "location":
          return updateStoreSettings({ pickupLocation: trimmed });
        case "bio":
          return updateStoreSettings({ description: trimmed });
        case "email":
          return updateUserEmail(trimmed);
        case "contact":
          localStorage.setItem("bizzy_contact_number", trimmed);
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
