import { useState, useMemo, useCallback, useEffect } from "react";
import { deleteProductImages, getProductImages } from "./productImageStorage";

export const MOCK_CATEGORIES = [
  { id: "cat-apparel", name: "Apparel & Uniforms" },
  { id: "cat-stationery", name: "Academic Stationery" },
  { id: "cat-food", name: "Food & Beverages" },
  { id: "cat-tech", name: "Tech & Accessories" },
  { id: "cat-events", name: "Event Tickets & Merch" },
];

/**
 * 10 strategic mock product samples designed to demonstrate:
 * - All 5 categories
 * - All 3 approval statuses: APPROVED, PENDING, REJECTED
 * - Both availability options: AVAILABLE, UNAVAILABLE / PAUSED
 * - All 3 stock levels: In Stock (>5), Low Stock (1-5), Out of Stock (0)
 */
export const INITIAL_MOCK_PRODUCTS = [
  {
    id: "prod-1",
    name: "QCU CCS Official Org Hoodie",
    categoryId: "cat-apparel",
    categoryName: "Apparel & Uniforms",
    description:
      "Heavy-blend fleece navy blue org sweatshirt with collegiate QCU CS chest embroidery and custom drawstring hood. Warm, durable, and officially accredited.",
    price: 650.0,
    stockQuantity: 25, // In Stock (>5)
    imageUrls: [
      "https://images.unsplash.com/photo-1556905055-8f358a7a47b2?auto=format&fit=crop&w=600&q=80",
    ],
    isAvailable: true, // AVAILABLE
    approvalStatus: "APPROVED", // APPROVED
    createdAt: "2026-11-01T08:00:00.000Z",
  },
  {
    id: "prod-2",
    name: "CCS Tech Summit 2024 Lanyard",
    categoryId: "cat-stationery",
    categoryName: "Academic Stationery",
    description:
      "Standard 1-inch satin weave lanyard with silver swivel clasp and conference security badge holder. Ideal for student IDs and campus event passes.",
    price: 70.0,
    stockQuantity: 4, // Low Stock (1-5)
    imageUrls: [
      "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=600&q=80",
    ],
    isAvailable: true, // AVAILABLE
    approvalStatus: "APPROVED", // APPROVED
    createdAt: "2026-11-02T09:30:00.000Z",
  },
  {
    id: "prod-3",
    name: "QCU Collegiate Canvas Tote Bag",
    categoryId: "cat-apparel",
    categoryName: "Apparel & Uniforms",
    description:
      "Reinforced organic canvas carryall featuring vibrant university blueprint screenprint with inner stash pocket. Spacious enough for laptops and textbooks.",
    price: 220.0,
    stockQuantity: 15, // In Stock (>5)
    imageUrls: [
      "https://images.unsplash.com/photo-1544816155-12df9643f363?auto=format&fit=crop&w=600&q=80",
    ],
    isAvailable: false, // UNAVAILABLE / PAUSED
    approvalStatus: "APPROVED", // APPROVED
    createdAt: "2026-11-03T11:00:00.000Z",
  },
  {
    id: "prod-4",
    name: "University Spirit Cold Brew Bottle",
    categoryId: "cat-food",
    categoryName: "Food & Beverages",
    description:
      "Handcrafted cold-brew bottled coffee infused with Madagascar vanilla, brewed by BSE Hospitality student society. Refreshing campus favorite.",
    price: 120.0,
    stockQuantity: 0, // Out of Stock (0)
    imageUrls: [
      "https://images.unsplash.com/photo-1517701550927-30cf4ba1dba5?auto=format&fit=crop&w=600&q=80",
    ],
    isAvailable: false, // UNAVAILABLE / PAUSED
    approvalStatus: "APPROVED", // APPROVED
    createdAt: "2026-11-04T15:30:00.000Z",
  },
  {
    id: "prod-5",
    name: "QCU Engineering Calculator Pouch",
    categoryId: "cat-tech",
    categoryName: "Tech & Accessories",
    description:
      "Shockproof neoprene protective zipper sleeve designed for standard scientific and graphing calculators with internal mesh accessory pocket.",
    price: 130.0,
    stockQuantity: 18, // In Stock (>5)
    imageUrls: [
      "https://images.unsplash.com/photo-1585336261026-78c6e26b38c2?auto=format&fit=crop&w=600&q=80",
    ],
    isAvailable: true, // AVAILABLE
    approvalStatus: "PENDING", // PENDING
    createdAt: "2026-11-05T14:20:00.000Z",
  },
  {
    id: "prod-6",
    name: "Cybersecurity League Vinyl Sticker Pack",
    categoryId: "cat-events",
    categoryName: "Event Tickets & Merch",
    description:
      "Die-cut waterproof vinyl sticker bundle featuring terminal commands, retro cyber art, and IT puns. Scratch resistant with matte finish.",
    price: 55.0,
    stockQuantity: 3, // Low Stock (1-5)
    imageUrls: [
      "https://images.unsplash.com/photo-1572375992501-4b0892d50c69?auto=format&fit=crop&w=600&q=80",
    ],
    isAvailable: true, // AVAILABLE
    approvalStatus: "PENDING", // PENDING
    createdAt: "2026-11-06T08:45:00.000Z",
  },
  {
    id: "prod-7",
    name: "Student Council Hardbound Planner 2025",
    categoryId: "cat-stationery",
    categoryName: "Academic Stationery",
    description:
      "Academic year planner with weekly sprint layouts, campus academic calendar, grade trackers, and motivational monthly dividers.",
    price: 280.0,
    stockQuantity: 0, // Out of Stock (0)
    imageUrls: [
      "https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&w=600&q=80",
    ],
    isAvailable: false, // UNAVAILABLE / PAUSED
    approvalStatus: "PENDING", // PENDING
    createdAt: "2026-11-06T12:00:00.000Z",
  },
  {
    id: "prod-8",
    name: "Algorithm & Coding Bootcamp Pass",
    categoryId: "cat-events",
    categoryName: "Event Tickets & Merch",
    description:
      "Full weekend pass including interactive algorithm workshops, guest speaker sessions, coding contest entry, and digital certificate.",
    price: 150.0,
    stockQuantity: 30, // In Stock (>5)
    imageUrls: [
      "https://images.unsplash.com/photo-1505373877841-8d25f7d46678?auto=format&fit=crop&w=600&q=80",
    ],
    isAvailable: true, // AVAILABLE
    approvalStatus: "REJECTED", // REJECTED
    createdAt: "2026-11-07T11:15:00.000Z",
  },
  {
    id: "prod-9",
    name: "Campus Artisanal Pastry Box",
    categoryId: "cat-food",
    categoryName: "Food & Beverages",
    description:
      "Freshly baked box of assorted chocolate chunk and matcha cookies prepared by the Young Hoteliers Society for student scholarship fundraisers.",
    price: 180.0,
    stockQuantity: 2, // Low Stock (1-5)
    imageUrls: [
      "https://images.unsplash.com/photo-1499636136210-6f4ee915583e?auto=format&fit=crop&w=600&q=80",
    ],
    isAvailable: true, // AVAILABLE
    approvalStatus: "APPROVED", // APPROVED
    createdAt: "2026-11-07T14:40:00.000Z",
  },
  {
    id: "prod-10",
    name: "Commuter Multi-Port USB-C Hub",
    categoryId: "cat-tech",
    categoryName: "Tech & Accessories",
    description:
      "Compact aluminum 5-in-1 dongle adapter featuring 4K HDMI, 2x USB 3.0 ports, SD reader, and 100W Power Delivery pass-through charging.",
    price: 499.0,
    stockQuantity: 0, // Out of Stock (0)
    imageUrls: [
      "https://images.unsplash.com/photo-1616440347437-b1c73416efc2?auto=format&fit=crop&w=600&q=80",
    ],
    isAvailable: false, // UNAVAILABLE / PAUSED
    approvalStatus: "REJECTED", // REJECTED
    createdAt: "2026-11-08T09:10:00.000Z",
  },
];

const LOCAL_STORAGE_KEY = "bizzyqcu_org_products_v2";
const PAGE_SIZE = 9;

export function useProducts() {
  const [products, setProducts] = useState(() => {
    try {
      const saved = localStorage.getItem(LOCAL_STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed;
        }
      }
    } catch (e) {
      console.warn("Could not load products from localStorage:", e);
    }
    return INITIAL_MOCK_PRODUCTS;
  });

  // Sync products to localStorage on update
  useEffect(() => {
    try {
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(products));
    } catch (e) {
      console.warn("Could not save products to localStorage:", e);
    }
  }, [products]);

  // Retrieve stored images from IndexedDB for any products that have locally saved images
  useEffect(() => {
    let isMounted = true;
    const hydrateImagesFromDB = async () => {
      try {
        let hasUpdates = false;
        const updated = await Promise.all(
          products.map(async (prod) => {
            const storedImages = await getProductImages(prod.id);
            if (storedImages && storedImages.length > 0) {
              const dbUrls = storedImages.map((img) => img.url).filter(Boolean);
              if (
                dbUrls.length > 0 &&
                JSON.stringify(dbUrls) !== JSON.stringify(prod.imageUrls)
              ) {
                hasUpdates = true;
                return { ...prod, imageUrls: dbUrls };
              }
            }
            return prod;
          })
        );
        if (isMounted && hasUpdates) {
          setProducts(updated);
        }
      } catch (err) {
        console.warn("Failed to hydrate images from IndexedDB:", err);
      }
    };

    hydrateImagesFromDB();
    return () => {
      isMounted = false;
    };
  }, []);

  // Search input state
  const [searchTerm, setSearchTerm] = useState("");

  // Filter groups state:
  // categories: string[]
  // approvalStatuses: string[]
  // availabilities: string[]
  // stockLevels: string[]
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

  // Dynamic Overview Cards Metrics
  // Calculates strictly based on publication rules:
  // - Total: Total products in dataset
  // - Active for Sale: Marked Available AND (APPROVED or VERIFIED)
  // - Pending: PENDING approval status
  // - Stock Alerts: Low Stock (1 to 5) or Out of Stock (0)
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

  // Add Product (local mock + PENDING status)
  const addProduct = useCallback((newProductData) => {
    const categoryObj = MOCK_CATEGORIES.find(
      (c) => c.id === newProductData.categoryId
    );

    const newProduct = {
      id: newProductData.id || `prod-${Date.now()}`,
      name: newProductData.name.trim(),
      categoryId: newProductData.categoryId || "cat-apparel",
      categoryName:
        newProductData.categoryName || categoryObj?.name || "Apparel & Uniforms",
      description: newProductData.description.trim(),
      price: parseFloat(newProductData.price) || 0,
      stockQuantity: parseInt(newProductData.stockQuantity, 10) || 0,
      imageUrls: newProductData.imageUrls || [],
      isAvailable:
        newProductData.isAvailable !== undefined
          ? Boolean(newProductData.isAvailable)
          : true,
      approvalStatus: "PENDING",
      createdAt: new Date().toISOString(),
    };

    setProducts((prev) => [newProduct, ...prev]);
    setCurrentPage(1);
    return newProduct;
  }, []);

  // Edit Product (preserves existing approvalStatus & creation date)
  const editProduct = useCallback((productId, updatedData) => {
    setProducts((prev) =>
      prev.map((item) => {
        if (item.id !== productId) return item;

        const categoryObj = MOCK_CATEGORIES.find(
          (c) => c.id === updatedData.categoryId
        );

        return {
          ...item,
          name: updatedData.name ? updatedData.name.trim() : item.name,
          categoryId: updatedData.categoryId || item.categoryId,
          categoryName:
            updatedData.categoryName ||
            categoryObj?.name ||
            item.categoryName,
          description:
            updatedData.description !== undefined
              ? updatedData.description.trim()
              : item.description,
          price:
            updatedData.price !== undefined
              ? parseFloat(updatedData.price) || item.price
              : item.price,
          stockQuantity:
            updatedData.stockQuantity !== undefined
              ? parseInt(updatedData.stockQuantity, 10)
              : item.stockQuantity,
          imageUrls: updatedData.imageUrls || item.imageUrls,
          isAvailable:
            updatedData.isAvailable !== undefined
              ? Boolean(updatedData.isAvailable)
              : item.isAvailable,
          // Preserves existing approvalStatus unless explicitly changed
          approvalStatus: item.approvalStatus,
          createdAt: item.createdAt,
        };
      })
    );
  }, []);

  // Delete Product (local mock + cleanup associated IndexedDB images)
  const deleteProduct = useCallback((productId) => {
    setProducts((prev) => prev.filter((item) => item.id !== productId));
    // Clean up stored images from IndexedDB
    deleteProductImages(productId).catch((err) => {
      console.warn("Failed to delete product images from IndexedDB:", err);
    });
  }, []);

  return {
    products,
    filteredProducts,
    paginatedProducts,
    categories: MOCK_CATEGORIES,

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
