import { useState, useMemo, useCallback, useEffect } from "react";
import apiClient, { getErrorMessage } from "../../../../../lib/api-client";
import {
  deleteProductImages,
  getProductImages,
  saveProductImages,
} from "./productImageStorage";

export const DEFAULT_CATEGORIES = [
  { id: "cat-apparel", name: "Apparel & Uniforms" },
  { id: "cat-stationery", name: "Academic Stationery" },
  { id: "cat-food", name: "Food & Beverages" },
  { id: "cat-tech", name: "Tech & Accessories" },
  { id: "cat-events", name: "Event Tickets & Merch" },
];

export const MOCK_CATEGORIES = DEFAULT_CATEGORIES;

const PAGE_SIZE = 9;

/**
 * Normalises a raw product returned from the server into standard UI fields.
 */
function normaliseProduct(raw) {
  if (!raw) return null;
  return {
    id: raw.id,
    storeId: raw.storeId,
    categoryId: raw.categoryId || raw.category?.id || "",
    categoryName: raw.category?.name || raw.categoryName || "General",
    name: raw.name || "Untitled Product",
    description: raw.description || "",
    price: Number(raw.price) || 0,
    stockQuantity: Number(raw.stockQuantity) || 0,
    imageUrls: Array.isArray(raw.imageUrls) ? raw.imageUrls : [],
    isAvailable: raw.isAvailable !== false,
    approvalStatus: raw.approvalStatus || "PENDING",
    rejectionReason: raw.rejectionReason || null,
    createdAt: raw.createdAt || new Date().toISOString(),
    updatedAt: raw.updatedAt || new Date().toISOString(),
  };
}

export function useProducts() {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState(DEFAULT_CATEGORIES);
  const [storeInfo, setStoreInfo] = useState({
    id: null,
    name: "Organization Store",
    pickupLocation: "Campus Store / Booth",
  });

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);
  const [actionError, setActionError] = useState(null);

  // Search input state
  const [searchTerm, setSearchTerm] = useState("");

  // Filter groups state:
  const [appliedFilters, setAppliedFilters] = useState({
    categories: [],
    approvalStatuses: [],
    availabilities: [],
    stockLevels: [],
  });

  // Sorting state: 'newest' | 'oldest' | 'price_asc' | 'price_desc'
  const [sortBy, setSortBy] = useState("newest");

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);

  // 1. Fetch Store Info from backend (GET /marketplace/stores/me)
  const fetchStoreInfo = useCallback(async () => {
    try {
      const res = await apiClient.get("/marketplace/stores/me");
      const store = res.data?.data || res.data;
      if (store && store.id) {
        setStoreInfo({
          id: store.id,
          name: store.name || "Organization Store",
          pickupLocation: store.pickupLocation || "Campus Store / Booth",
        });
        return store;
      }
    } catch (err) {
      console.warn("Could not fetch seller store profile from backend:", err);
    }
    return null;
  }, []);

  // 2. Fetch Categories from backend (GET /marketplace/categories)
  const fetchCategories = useCallback(async () => {
    try {
      const res = await apiClient.get("/marketplace/categories");
      const list = res.data?.data || res.data;
      if (Array.isArray(list) && list.length > 0) {
        setCategories(list);
      }
    } catch (err) {
      console.warn("Could not fetch categories from backend:", err);
    }
  }, []);

  // 3. Fetch Seller's Products from backend (GET /marketplace/seller/products)
  const fetchProducts = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await apiClient.get("/marketplace/seller/products", {
        params: { limit: 100 },
      });
      const rawList = res.data?.items || res.data?.data || [];
      const normalised = (Array.isArray(rawList) ? rawList : [])
        .map(normaliseProduct)
        .filter(Boolean);

      // Hydrate local images from IndexedDB if stored
      const hydrated = await Promise.all(
        normalised.map(async (prod) => {
          try {
            const stored = await getProductImages(prod.id);
            if (stored && stored.length > 0) {
              const urls = stored.map((img) => img.url).filter(Boolean);
              if (urls.length > 0) {
                return { ...prod, imageUrls: urls };
              }
            }
          } catch (e) {
            console.warn("IndexedDB hydration error:", e);
          }
          return prod;
        })
      );

      setProducts(hydrated);
    } catch (err) {
      console.warn("Failed to fetch seller products from backend:", err);
      setError(getErrorMessage(err));
      setProducts([]);
    } finally {
      setLoading(false);
    }
  }, []);

  // Initial load
  useEffect(() => {
    fetchStoreInfo();
    fetchCategories();
    fetchProducts();
  }, [fetchStoreInfo, fetchCategories, fetchProducts]);

  // Dynamic Overview Cards Metrics calculated from current backend product data
  const metrics = useMemo(() => {
    const total = products.length;
    const active = products.filter(
      (p) =>
        p.isAvailable &&
        (p.approvalStatus === "APPROVED" || p.approvalStatus === "VERIFIED")
    ).length;
    const pending = products.filter((p) => p.approvalStatus === "PENDING").length;
    const stockAlerts = products.filter(
      (p) => Number(p.stockQuantity) <= 5
    ).length;

    return {
      total,
      active,
      pending,
      stockAlerts,
    };
  }, [products]);

  // Combined search, multi-filter, and sorting logic
  const filteredProducts = useMemo(() => {
    return products
      .filter((product) => {
        // 1. Search by product name (case-insensitive)
        if (searchTerm.trim()) {
          const query = searchTerm.trim().toLowerCase();
          const match = product.name?.toLowerCase().includes(query);
          if (!match) return false;
        }

        // 2. PRODUCT CATEGORY filter (OR within group, AND across groups)
        if (appliedFilters.categories.length > 0) {
          const matchCat =
            appliedFilters.categories.includes(product.categoryId) ||
            appliedFilters.categories.includes(product.categoryName);
          if (!matchCat) return false;
        }

        // 3. APPROVAL STATUS filter (OR within group)
        if (appliedFilters.approvalStatuses.length > 0) {
          const matchStatus = appliedFilters.approvalStatuses.some((st) => {
            if (st === "APPROVED" || st === "VERIFIED") {
              return (
                product.approvalStatus === "APPROVED" ||
                product.approvalStatus === "VERIFIED"
              );
            }
            return product.approvalStatus === st;
          });
          if (!matchStatus) return false;
        }

        // 4. AVAILABILITY filter (OR within group)
        if (appliedFilters.availabilities.length > 0) {
          const matchAvail = appliedFilters.availabilities.some((av) => {
            if (av === "AVAILABLE") return product.isAvailable === true;
            if (av === "UNAVAILABLE") return product.isAvailable === false;
            return false;
          });
          if (!matchAvail) return false;
        }

        // 5. STOCK LEVEL filter (OR within group)
        // In Stock: > 5, Low Stock: 1 to 5, Out of Stock: 0
        if (appliedFilters.stockLevels.length > 0) {
          const qty = Number(product.stockQuantity) || 0;
          const matchStock = appliedFilters.stockLevels.some((lvl) => {
            if (lvl === "IN_STOCK") return qty > 5;
            if (lvl === "LOW_STOCK") return qty > 0 && qty <= 5;
            if (lvl === "OUT_OF_STOCK") return qty === 0;
            return false;
          });
          if (!matchStock) return false;
        }

        return true;
      })
      .sort((a, b) => {
        if (sortBy === "newest") {
          return new Date(b.createdAt) - new Date(a.createdAt);
        }
        if (sortBy === "oldest") {
          return new Date(a.createdAt) - new Date(b.createdAt);
        }
        if (sortBy === "price_asc") {
          return Number(a.price) - Number(b.price);
        }
        if (sortBy === "price_desc") {
          return Number(b.price) - Number(a.price);
        }
        return 0;
      });
  }, [products, searchTerm, appliedFilters, sortBy]);

  // Dynamic pagination calculation
  const totalItems = filteredProducts.length;
  const totalPages = Math.max(1, Math.ceil(totalItems / PAGE_SIZE));
  const safePage = Math.min(Math.max(1, currentPage), totalPages);

  const startIndex = (safePage - 1) * PAGE_SIZE;
  const endIndex = Math.min(startIndex + PAGE_SIZE, totalItems);
  const paginatedProducts = useMemo(() => {
    return filteredProducts.slice(startIndex, endIndex);
  }, [filteredProducts, startIndex, endIndex]);

  // Total active filter count for badge
  const activeFiltersCount = useMemo(() => {
    return (
      appliedFilters.categories.length +
      appliedFilters.approvalStatuses.length +
      appliedFilters.availabilities.length +
      appliedFilters.stockLevels.length
    );
  }, [appliedFilters]);

  // Update applied filters
  const applyFilters = useCallback((newFilters) => {
    setAppliedFilters(newFilters);
    setCurrentPage(1);
  }, []);

  // Clear all filters and search
  const clearAllFilters = useCallback(() => {
    setSearchTerm("");
    setAppliedFilters({
      categories: [],
      approvalStatuses: [],
      availabilities: [],
      stockLevels: [],
    });
    setSortBy("newest");
    setCurrentPage(1);
  }, []);

  // Change page
  const handlePageChange = useCallback(
    (pageNumber) => {
      if (pageNumber >= 1 && pageNumber <= totalPages) {
        setCurrentPage(pageNumber);
      }
    },
    [totalPages]
  );

  // Add Product (calls POST /marketplace/products & persists uploaded images to IndexedDB)
  const addProduct = useCallback(
    async (newProductData, imageFiles = []) => {
      setActionLoading(true);
      setActionError(null);
      try {
        // 1. Ensure we have seller storeId
        let currentStoreId = storeInfo?.id;
        if (!currentStoreId) {
          const store = await fetchStoreInfo();
          currentStoreId = store?.id;
        }

        if (!currentStoreId) {
          throw new Error(
            "Store profile not found. Please complete store registration before adding products."
          );
        }

        // 2. Upload images to backend if files were provided
        let uploadedUrls = [];
        if (Array.isArray(imageFiles) && imageFiles.length > 0) {
          try {
            const formData = new FormData();
            imageFiles.forEach((file) => {
              if (file instanceof File || file instanceof Blob) {
                formData.append("files", file);
              }
            });
            formData.append("folder", "products");
            const uploadRes = await apiClient.post("/upload/multiple", formData, {
              headers: { "Content-Type": "multipart/form-data" },
            });
            uploadedUrls =
              uploadRes.data?.urls ||
              uploadRes.data?.data?.map((d) => d.url) ||
              [];
          } catch (uploadErr) {
            console.warn("Direct file upload to backend skipped or failed:", uploadErr);
          }
        }

        // Determine final image URLs (backend schema requires valid URL strings)
        let candidateUrls = uploadedUrls.filter(Boolean);
        if (candidateUrls.length === 0 && Array.isArray(newProductData.imageUrls)) {
          candidateUrls = newProductData.imageUrls.filter(Boolean);
        }
        const validHttpUrls = candidateUrls.filter(
          (u) =>
            typeof u === "string" &&
            (u.startsWith("http://") || u.startsWith("https://"))
        );
        const backendImageUrls =
          validHttpUrls.length > 0
            ? validHttpUrls
            : [
                "https://images.unsplash.com/photo-1556905055-8f358a7a47b2?auto=format&fit=crop&w=600&q=80",
              ];

        // 3. POST /marketplace/products
        const payload = {
          storeId: currentStoreId,
          categoryId: newProductData.categoryId,
          name: newProductData.name.trim(),
          description: newProductData.description.trim(),
          price: parseFloat(newProductData.price),
          stockQuantity: parseInt(newProductData.stockQuantity, 10),
          imageUrls: backendImageUrls,
        };

        const res = await apiClient.post("/marketplace/products", payload);
        const createdRaw = res.data?.data || res.data;
        const created = normaliseProduct(createdRaw);

        // 4. Save actual images to IndexedDB using productImageStorage.js
        if (newProductData.rawImages && newProductData.rawImages.length > 0) {
          try {
            await saveProductImages(created.id, newProductData.rawImages);
            const localUrls = newProductData.rawImages
              .map((img) => img.url)
              .filter(Boolean);
            if (localUrls.length > 0) {
              created.imageUrls = localUrls;
            }
          } catch (e) {
            console.warn("Failed to persist images to IndexedDB:", e);
          }
        }

        // 5. If availability was set to false, call PATCH availability
        if (newProductData.isAvailable === false) {
          try {
            await apiClient.patch(
              `/marketplace/products/${created.id}/availability`,
              { isAvailable: false }
            );
            created.isAvailable = false;
          } catch (availErr) {
            console.warn("Failed to update availability on create:", availErr);
          }
        }

        setProducts((prev) => [created, ...prev]);
        setCurrentPage(1);
        return created;
      } catch (err) {
        const msg = getErrorMessage(err);
        setActionError(msg);
        throw err;
      } finally {
        setActionLoading(false);
      }
    },
    [storeInfo?.id, fetchStoreInfo]
  );

  // Edit Product (calls PATCH /marketplace/products/:id & updates IndexedDB)
  const editProduct = useCallback(
    async (productId, updatedData, imageFiles = []) => {
      setActionLoading(true);
      setActionError(null);
      try {
        // 1. Upload new image files if any
        let uploadedUrls = [];
        if (Array.isArray(imageFiles) && imageFiles.length > 0) {
          try {
            const formData = new FormData();
            imageFiles.forEach((file) => {
              if (file instanceof File || file instanceof Blob) {
                formData.append("files", file);
              }
            });
            formData.append("folder", "products");
            const uploadRes = await apiClient.post("/upload/multiple", formData, {
              headers: { "Content-Type": "multipart/form-data" },
            });
            uploadedUrls =
              uploadRes.data?.urls ||
              uploadRes.data?.data?.map((d) => d.url) ||
              [];
          } catch (uploadErr) {
            console.warn("Direct file upload to backend skipped or failed:", uploadErr);
          }
        }

        // Determine final image URLs
        let candidateUrls = uploadedUrls.filter(Boolean);
        if (candidateUrls.length === 0 && Array.isArray(updatedData.imageUrls)) {
          candidateUrls = updatedData.imageUrls.filter(Boolean);
        }
        const validHttpUrls = candidateUrls.filter(
          (u) =>
            typeof u === "string" &&
            (u.startsWith("http://") || u.startsWith("https://"))
        );
        const backendImageUrls =
          validHttpUrls.length > 0
            ? validHttpUrls
            : [
                "https://images.unsplash.com/photo-1556905055-8f358a7a47b2?auto=format&fit=crop&w=600&q=80",
              ];

        // 2. PATCH /marketplace/products/:id
        const payload = {};
        if (updatedData.categoryId) payload.categoryId = updatedData.categoryId;
        if (updatedData.name) payload.name = updatedData.name.trim();
        if (updatedData.description !== undefined)
          payload.description = updatedData.description.trim();
        if (updatedData.price !== undefined)
          payload.price = parseFloat(updatedData.price);
        if (updatedData.stockQuantity !== undefined)
          payload.stockQuantity = parseInt(updatedData.stockQuantity, 10);
        if (backendImageUrls.length > 0) payload.imageUrls = backendImageUrls;

        const res = await apiClient.patch(
          `/marketplace/products/${productId}`,
          payload
        );
        const updatedRaw = res.data?.data || res.data;

        // 3. Save actual updated images to IndexedDB
        if (updatedData.rawImages && updatedData.rawImages.length > 0) {
          try {
            await saveProductImages(productId, updatedData.rawImages);
          } catch (e) {
            console.warn("Failed to persist updated images to IndexedDB:", e);
          }
        }

        // 4. Update availability if explicitly provided
        if (updatedData.isAvailable !== undefined) {
          try {
            await apiClient.patch(
              `/marketplace/products/${productId}/availability`,
              { isAvailable: Boolean(updatedData.isAvailable) }
            );
          } catch (availErr) {
            console.warn("Failed to update availability on edit:", availErr);
          }
        }

        // Update in local state
        setProducts((prev) =>
          prev.map((item) => {
            if (item.id === productId) {
              const cat =
                categories.find((c) => c.id === updatedData.categoryId) ||
                item.category;
              return {
                ...item,
                ...updatedRaw,
                categoryName: cat?.name || item.categoryName,
                isAvailable:
                  updatedData.isAvailable !== undefined
                    ? Boolean(updatedData.isAvailable)
                    : item.isAvailable,
                imageUrls:
                  updatedData.rawImages?.map((img) => img.url).filter(Boolean) ||
                  item.imageUrls,
              };
            }
            return item;
          })
        );
      } catch (err) {
        const msg = getErrorMessage(err);
        setActionError(msg);
        throw err;
      } finally {
        setActionLoading(false);
      }
    },
    [categories]
  );

  // Delete Product (calls DELETE /marketplace/products/:id & removes from IndexedDB)
  const deleteProduct = useCallback(async (productId) => {
    setActionLoading(true);
    setActionError(null);
    try {
      await apiClient.delete(`/marketplace/products/${productId}`);
      await deleteProductImages(productId);
      setProducts((prev) => prev.filter((item) => item.id !== productId));
    } catch (err) {
      const msg = getErrorMessage(err);
      setActionError(msg);
      throw err;
    } finally {
      setActionLoading(false);
    }
  }, []);

  return {
    products,
    filteredProducts,
    paginatedProducts,
    categories,
    storeInfo,

    // Loading & Error states
    loading,
    error,
    actionLoading,
    actionError,
    fetchProducts,

    // Overview cards metrics
    metrics,

    // Search & Filter
    searchTerm,
    setSearchTerm,
    appliedFilters,
    activeFiltersCount,
    applyFilters,
    clearAllFilters,

    // Sorting
    sortBy,
    setSortBy,

    // Pagination
    currentPage: safePage,
    totalPages,
    totalItems,
    startIndex,
    endIndex,
    onPageChange: handlePageChange,

    // Actions
    addProduct,
    editProduct,
    deleteProduct,
  };
}
