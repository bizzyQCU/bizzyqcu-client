import React, { useState, useEffect } from "react";
import {
  Plus,
  Search,
  X,
  Pencil,
  Trash2,
  ImageOff,
  SlidersHorizontal,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  AlertTriangle,
  Package,
  CheckCircle2,
  Clock,
  Check,
} from "lucide-react";
import { DEFAULT_CATEGORIES } from "./useProducts";
import ProductDetailsModal from "./ProductDetailsModal";

// Helper for subtle stock level indicators and effects
const getStockDetails = (quantity) => {
  const qty = Number(quantity) || 0;
  if (qty <= 0) {
    return {
      status: "OUT_OF_STOCK",
      label: "Out of Stock",
      dotClass: "bg-rose-500",
      badgeClass: "bg-rose-50 text-rose-700 border-rose-200/80",
      cardBorder: "border-slate-200 hover:border-rose-300",
    };
  }
  if (qty <= 5) {
    return {
      status: "LOW_STOCK",
      label: "Low Stock",
      dotClass: "bg-amber-500",
      badgeClass: "bg-amber-50 text-amber-700 border-amber-200/80",
      cardBorder: "border-slate-200 hover:border-amber-300",
    };
  }
  return {
    status: "IN_STOCK",
    label: "In Stock",
    dotClass: "bg-emerald-500",
    badgeClass: "bg-emerald-50 text-emerald-700 border-emerald-200/80",
    cardBorder: "border-slate-200 hover:border-sky-300",
  };
};

export default function ProductList({
  paginatedProducts = [],
  totalItems = 0,
  currentPage = 1,
  totalPages = 1,
  startIndex = 0,
  endIndex = 0,
  onPageChange,

  // Metrics
  metrics = { total: 0, active: 0, pending: 0, stockAlerts: 0 },

  // Search
  searchTerm = "",
  setSearchTerm,

  // Filter
  appliedFilters = {
    categories: [],
    approvalStatuses: [],
    availabilities: [],
    stockLevels: [],
  },
  activeFiltersCount = 0,
  applyFilters,
  clearAllFilters,

  // Sorting
  sortBy = "newest",
  setSortBy,

  // Actions
  onAddProduct,
  onEditProduct,
  deleteProduct,

  // Backend Integration Props
  categories = [],
  loading = false,
  error = null,
  onRefresh,
}) {
  const [imageErrors, setImageErrors] = useState({});
  const [deletingProduct, setDeletingProduct] = useState(null);
  const [isFilterModalOpen, setIsFilterModalOpen] = useState(false);
  const [selectedProductDetails, setSelectedProductDetails] = useState(null);

  // Local state for filter modal before applying
  const [draftFilters, setDraftFilters] = useState(appliedFilters);

  // Sync draft filters when modal opens
  useEffect(() => {
    if (isFilterModalOpen) {
      setDraftFilters(appliedFilters);
    }
  }, [isFilterModalOpen, appliedFilters]);

  const handleImageError = (id) => {
    setImageErrors((prev) => ({ ...prev, [id]: true }));
  };

  const handleConfirmDelete = () => {
    if (deletingProduct) {
      deleteProduct(deletingProduct.id);
      setDeletingProduct(null);
    }
  };

  // Toggle selection within draft filters
  const toggleFilter = (group, value) => {
    setDraftFilters((prev) => {
      const current = prev[group] || [];
      const exists = current.includes(value);
      const next = exists
        ? current.filter((item) => item !== value)
        : [...current, value];
      return { ...prev, [group]: next };
    });
  };

  const handleApplyFilterModal = () => {
    applyFilters(draftFilters);
    setIsFilterModalOpen(false);
  };

  const handleClearAllModal = () => {
    const emptyFilters = {
      categories: [],
      approvalStatuses: [],
      availabilities: [],
      stockLevels: [],
    };
    setDraftFilters(emptyFilters);
    applyFilters(emptyFilters);
    setIsFilterModalOpen(false);
  };

  return (
    <div className="space-y-6">
      {/* ================= 1. HEADING & ADD PRODUCT ACTION ================= */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
            Products
          </h1>
          <p className="text-sm text-slate-500 mt-0.5">
            Manage your organization's product listings, availability, and inventory.
          </p>
        </div>
        <button
          onClick={onAddProduct}
          className="flex items-center space-x-2 px-4 py-2.5 bg-[#0284C7] hover:bg-[#0369A1] text-white text-sm font-semibold rounded-lg shadow-sm transition-colors shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>Add Product</span>
        </button>
      </div>

      {/* ================= 2. FOUR OVERVIEW CARDS ================= */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Products */}
        <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs sm:text-sm font-medium text-slate-600">
              Total Products
            </span>
            <div className="w-8 h-8 rounded-lg bg-slate-100 text-slate-700 flex items-center justify-center">
              <Package className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-bold text-slate-900">{metrics.total}</div>
          <p className="text-xs text-slate-500 mt-1">Total org listings</p>
        </div>

        {/* Active for Sale */}
        <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs sm:text-sm font-medium text-slate-600">
              Active for Sale
            </span>
            <div className="w-8 h-8 rounded-lg bg-sky-50 text-[#0284C7] flex items-center justify-center">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-bold text-[#0284C7]">{metrics.active}</div>
          <p className="text-xs text-slate-500 mt-1">Available for campus buyers</p>
        </div>

        {/* Pending Approval */}
        <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs sm:text-sm font-medium text-slate-600">
              Pending Approval
            </span>
            <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-bold text-amber-600">{metrics.pending}</div>
          <p className="text-xs text-slate-500 mt-1">Awaiting admin review</p>
        </div>

        {/* Stock Alerts */}
        <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs sm:text-sm font-medium text-slate-600">
              Stock Alerts
            </span>
            <div className="w-8 h-8 rounded-lg bg-rose-50 text-rose-600 flex items-center justify-center">
              <AlertTriangle className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-bold text-rose-600">{metrics.stockAlerts}</div>
          <p className="text-xs text-slate-500 mt-1">Low stock or out of stock</p>
        </div>
      </div>

      {/* ================= 3. SEARCH, FILTER, AND SORTING TOOLBAR ================= */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-col md:flex-row items-stretch md:items-center gap-3.5">
        {/* Search Field: expanded to utilize available horizontal space, close to Filter */}
        <div className="relative flex-1 min-w-[260px]">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search products by name..."
            className="w-full h-10 pl-9 pr-9 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 transition-all"
          />
          {searchTerm && (
            <button
              onClick={() => setSearchTerm("")}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-0.5 rounded"
              title="Clear search"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Filter Button & Sorting Dropdown with balanced dimensions and consistent h-10 height */}
        <div className="flex items-center gap-3 w-full md:w-auto shrink-0 flex-wrap sm:flex-nowrap">
          {/* Filter Button */}
          <button
            type="button"
            onClick={() => setIsFilterModalOpen(true)}
            className={`h-10 flex items-center justify-center space-x-2 px-4 border rounded-lg text-sm font-semibold transition-colors shrink-0 min-w-[100px] ${
              activeFiltersCount > 0
                ? "bg-sky-50 border-sky-300 text-[#0284C7] hover:bg-sky-100/60"
                : "border-slate-200 text-slate-700 bg-slate-50 hover:bg-slate-100"
            }`}
          >
            <SlidersHorizontal className="w-4 h-4 shrink-0" />
            <span>Filter</span>
            {activeFiltersCount > 0 && (
              <span className="w-5 h-5 rounded-full bg-[#0284C7] text-white text-[11px] font-bold flex items-center justify-center shrink-0">
                {activeFiltersCount}
              </span>
            )}
          </button>

          {/* Sorting Dropdown with custom chevron and clipping prevention */}
          <div className="relative flex-1 sm:flex-initial min-w-[190px]">
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="w-full h-10 appearance-none pl-3.5 pr-8 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-700 font-medium focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 cursor-pointer"
            >
              <option value="newest">Newest to Oldest</option>
              <option value="oldest">Oldest to Newest</option>
              <option value="price_asc">Price: Low to High</option>
              <option value="price_desc">Price: High to Low</option>
            </select>
            <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
              <ChevronDown className="w-4 h-4" />
            </div>
          </div>
        </div>
      </div>

      {/* Backend Error Banner with Retry */}
      {error && !loading && (
        <div className="bg-rose-50 border border-rose-200 rounded-xl p-4 flex items-center justify-between text-sm shadow-xs">
          <div className="flex items-center space-x-2 text-rose-800">
            <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
            <span>{error}</span>
          </div>
          {onRefresh && (
            <button
              type="button"
              onClick={onRefresh}
              className="px-3 py-1.5 bg-rose-600 hover:bg-rose-700 text-white rounded-lg text-xs font-semibold transition-colors cursor-pointer"
            >
              Retry
            </button>
          )}
        </div>
      )}

      {/* Loading State Skeleton */}
      {loading && (
        <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center shadow-xs">
          <div className="w-10 h-10 border-4 border-sky-500/20 border-t-[#0284C7] rounded-full animate-spin mx-auto mb-3" />
          <p className="text-sm font-semibold text-slate-700">Loading products from store...</p>
          <p className="text-xs text-slate-400 mt-1">Retrieving latest listings from backend</p>
        </div>
      )}

      {/* ================= 4. EMPTY STATE ================= */}
      {!loading && paginatedProducts.length === 0 && (
        <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center max-w-md mx-auto shadow-sm">
          <div className="w-16 h-16 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center mx-auto mb-4">
            <Package className="w-8 h-8" />
          </div>
          <h2 className="text-xl font-bold text-slate-900 mb-1">
            {searchTerm || activeFiltersCount > 0 ? "No products found" : "No products listed yet"}
          </h2>
          <p className="text-sm text-slate-500 mb-6">
            {searchTerm || activeFiltersCount > 0
              ? "No products match your current search, filter selections, or sorting criteria."
              : "Your organization does not have any product listings in the store yet."}
          </p>
          {searchTerm || activeFiltersCount > 0 ? (
            <button
              onClick={clearAllFilters}
              className="inline-flex items-center space-x-1.5 px-4 py-2 border border-slate-300 rounded-lg bg-white text-slate-700 text-sm font-medium hover:bg-slate-50 shadow-sm transition-colors"
            >
              <X className="w-4 h-4" />
              <span>Reset Search & Filters</span>
            </button>
          ) : (
            <button
              onClick={onAddProduct}
              className="inline-flex items-center space-x-1.5 px-5 py-2.5 rounded-lg bg-[#0284C7] hover:bg-[#0369A1] text-white text-sm font-semibold shadow-sm transition-colors cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Add Your First Product</span>
            </button>
          )}
        </div>
      )}

      {/* ================= 5. RESPONSIVE PRODUCT CARD GRID ================= */}
      {/* 3 cols desktop (lg:grid-cols-3), 2 cols tablet (md:grid-cols-2), 1 col mobile */}
      {!loading && paginatedProducts.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {paginatedProducts.map((product) => {
            const hasImage =
              product.imageUrls &&
              product.imageUrls.length > 0 &&
              !imageErrors[product.id];
            const stockDetails = getStockDetails(product.stockQuantity);

            return (
              <div
                key={product.id}
                role="button"
                tabIndex={0}
                aria-label={`View details for ${product.name}`}
                onClick={() => setSelectedProductDetails(product)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault();
                    setSelectedProductDetails(product);
                  }
                }}
                className={`product-card bg-white rounded-2xl border ${stockDetails.cardBorder} p-4 shadow-sm hover:shadow-md transition-all flex flex-col justify-between cursor-pointer focus:outline-none focus:ring-2 focus:ring-sky-500/30 h-full`}
              >
                {/* Product Image Container with Overlay Badges */}
                <div className="relative w-full aspect-[4/3] rounded-xl bg-slate-50 overflow-hidden flex items-center justify-center border border-slate-100">
                  {/* Availability Badge (Upper-Left) */}
                  <div className="absolute top-2.5 left-2.5 z-10">
                    <span
                      className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold tracking-wide uppercase ${
                        product.isAvailable
                          ? "bg-sky-100 text-sky-600"
                          : "bg-slate-200 text-slate-600"
                      }`}
                    >
                      {product.isAvailable ? "AVAILABLE" : "UNAVAILABLE"}
                    </span>
                  </div>

                  {/* Approval Status Badge (Upper-Right) */}
                  <div className="absolute top-2.5 right-2.5 z-10">
                    <span
                      className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold tracking-wide uppercase border ${
                        product.approvalStatus === "APPROVED" ||
                        product.approvalStatus === "VERIFIED"
                          ? "bg-white text-sky-600 border-sky-200 shadow-xs"
                          : product.approvalStatus === "PENDING"
                          ? "bg-amber-50 text-amber-700 border-amber-200"
                          : "bg-rose-50 text-rose-700 border-rose-200"
                      }`}
                    >
                      {product.approvalStatus === "APPROVED" ||
                      product.approvalStatus === "VERIFIED"
                        ? "APPROVED"
                        : product.approvalStatus === "PENDING"
                        ? "PENDING"
                        : "REJECTED"}
                    </span>
                  </div>

                  {/* Image or Placeholder */}
                  {hasImage ? (
                    <img
                      src={product.imageUrls[0]}
                      alt={product.name}
                      onError={() => handleImageError(product.id)}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="flex flex-col items-center justify-center text-slate-400 p-4">
                      <ImageOff className="w-8 h-8 mb-1" />
                      <span className="text-[11px]">No image</span>
                    </div>
                  )}
                </div>

                {/* Card Content Details */}
                <div className="flex-1 flex flex-col justify-between mt-3">
                  <div>
                    {/* Category Pill */}
                    <span className="inline-block text-[10px] font-semibold text-slate-600 bg-slate-100 px-2.5 py-0.5 rounded-md mb-1.5">
                      {product.categoryName || product.category?.name || "General"}
                    </span>

                    {/* Product Name */}
                    <h3
                      className="font-bold text-slate-900 text-base leading-snug line-clamp-1"
                      title={product.name}
                    >
                      {product.name}
                    </h3>

                    {/* Short Description */}
                    <p
                      className="text-xs text-slate-500 line-clamp-2 mt-1 leading-relaxed"
                      title={product.description}
                    >
                      {product.description}
                    </p>
                  </div>

                  {/* Unit Price & Stock Row with subtle stock indicator */}
                  <div className="flex items-center justify-between mt-3 pt-3 border-t border-slate-100/70">
                    <div className="flex flex-col">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                        Price
                      </span>
                      <span className="text-lg font-bold text-slate-900 leading-tight">
                        ₱{Number(product.price).toFixed(2)}
                      </span>
                    </div>

                    <div className="flex flex-col items-end">
                      <span
                        className={`inline-flex items-center space-x-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold border ${stockDetails.badgeClass} transition-colors`}
                        title={`${stockDetails.label}: ${product.stockQuantity} units`}
                      >
                        <span className={`w-1.5 h-1.5 rounded-full ${stockDetails.dotClass}`} />
                        <span>{stockDetails.label}</span>
                        <span className="font-normal text-[10px] text-slate-500 ml-0.5">
                          ({product.stockQuantity})
                        </span>
                      </span>
                    </div>
                  </div>
                </div>

                {/* Edit & Delete Action Buttons (Stops propagation to prevent opening details modal) */}
                <div className="grid grid-cols-2 gap-3 mt-4 pt-3 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      onEditProduct(product);
                    }}
                    className="flex items-center justify-center space-x-1.5 py-2 px-3 border border-sky-300 rounded-lg text-sky-600 text-xs font-semibold hover:bg-sky-50 transition-colors"
                  >
                    <Pencil className="w-3.5 h-3.5 text-sky-500" />
                    <span>Edit</span>
                  </button>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setDeletingProduct(product);
                    }}
                    className="flex items-center justify-center space-x-1.5 py-2 px-3 border border-rose-300 rounded-lg text-rose-600 text-xs font-semibold hover:bg-rose-50 transition-colors"
                  >
                    <Trash2 className="w-3.5 h-3.5 text-rose-500" />
                    <span>Delete</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ================= 6. DYNAMIC PAGINATION ================= */}
      {totalItems > 0 && (
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4 border-t border-slate-200">
          <span className="text-xs sm:text-sm text-slate-500">
            Showing <strong className="text-slate-800">{startIndex + 1}–{endIndex}</strong> of{" "}
            <strong className="text-slate-800">{totalItems}</strong> products
          </span>

          <div className="flex items-center space-x-1">
            <button
              onClick={() => onPageChange(currentPage - 1)}
              disabled={currentPage <= 1}
              className="p-2 border border-slate-200 rounded-lg text-slate-600 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              title="Previous page"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>

            {Array.from({ length: totalPages }, (_, i) => i + 1).map((pageNum) => (
              <button
                key={pageNum}
                onClick={() => onPageChange(pageNum)}
                className={`w-9 h-9 rounded-lg text-xs sm:text-sm font-semibold transition-colors ${
                  pageNum === currentPage
                    ? "bg-[#0284C7] text-white shadow-sm"
                    : "text-slate-600 hover:bg-slate-100 border border-transparent"
                }`}
              >
                {pageNum}
              </button>
            ))}

            <button
              onClick={() => onPageChange(currentPage + 1)}
              disabled={currentPage >= totalPages}
              className="p-2 border border-slate-200 rounded-lg text-slate-600 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              title="Next page"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* ================= 7. FILTER PRODUCTS MODAL ================= */}
      {isFilterModalOpen && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full max-h-[90vh] flex flex-col shadow-2xl border border-slate-200 overflow-hidden">
            {/* Modal Header */}
            <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <SlidersHorizontal className="w-5 h-5 text-[#0284C7]" />
                <h3 className="text-lg font-bold text-slate-900">Filter Products</h3>
              </div>
              <button
                onClick={() => setIsFilterModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 p-1 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body: Filter Groups */}
            <div className="px-6 py-5 overflow-y-auto space-y-6 flex-1 text-sm">
              {/* Group 1: PRODUCT CATEGORY */}
              <div>
                <span className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-3">
                  Product Category
                </span>
                <div className="space-y-2">
                  {(categories && categories.length > 0 ? categories : DEFAULT_CATEGORIES).map((cat) => {
                    const isSelected = draftFilters.categories.includes(cat.id);
                    return (
                      <label
                        key={cat.id}
                        className="flex items-center space-x-3 cursor-pointer text-slate-700 hover:text-slate-900"
                      >
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => toggleFilter("categories", cat.id)}
                          className="w-4 h-4 rounded border-slate-300 text-[#0284C7] focus:ring-sky-500 cursor-pointer"
                        />
                        <span>{cat.name}</span>
                      </label>
                    );
                  })}
                </div>
              </div>

              {/* Group 2: APPROVAL STATUS */}
              <div className="border-t border-slate-100 pt-4">
                <span className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-3">
                  Approval Status
                </span>
                <div className="space-y-2">
                  {[
                    { key: "APPROVED", label: "Approved / Verified" },
                    { key: "PENDING", label: "Pending Approval" },
                    { key: "REJECTED", label: "Rejected" },
                  ].map((status) => {
                    const isSelected = draftFilters.approvalStatuses.includes(status.key);
                    return (
                      <label
                        key={status.key}
                        className="flex items-center space-x-3 cursor-pointer text-slate-700 hover:text-slate-900"
                      >
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => toggleFilter("approvalStatuses", status.key)}
                          className="w-4 h-4 rounded border-slate-300 text-[#0284C7] focus:ring-sky-500 cursor-pointer"
                        />
                        <span>{status.label}</span>
                      </label>
                    );
                  })}
                </div>
              </div>

              {/* Group 3: AVAILABILITY */}
              <div className="border-t border-slate-100 pt-4">
                <span className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-3">
                  Availability
                </span>
                <div className="space-y-2">
                  {[
                    { key: "AVAILABLE", label: "Available" },
                    { key: "UNAVAILABLE", label: "Unavailable / Paused" },
                  ].map((avail) => {
                    const isSelected = draftFilters.availabilities.includes(avail.key);
                    return (
                      <label
                        key={avail.key}
                        className="flex items-center space-x-3 cursor-pointer text-slate-700 hover:text-slate-900"
                      >
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => toggleFilter("availabilities", avail.key)}
                          className="w-4 h-4 rounded border-slate-300 text-[#0284C7] focus:ring-sky-500 cursor-pointer"
                        />
                        <span>{avail.label}</span>
                      </label>
                    );
                  })}
                </div>
              </div>

              {/* Group 4: STOCK LEVEL */}
              <div className="border-t border-slate-100 pt-4">
                <span className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-3">
                  Stock Level
                </span>
                <div className="space-y-2">
                  {[
                    { key: "IN_STOCK", label: "In Stock" },
                    { key: "LOW_STOCK", label: "Low Stock" },
                    { key: "OUT_OF_STOCK", label: "Out of Stock" },
                  ].map((stock) => {
                    const isSelected = draftFilters.stockLevels.includes(stock.key);
                    return (
                      <label
                        key={stock.key}
                        className="flex items-center space-x-3 cursor-pointer text-slate-700 hover:text-slate-900"
                      >
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => toggleFilter("stockLevels", stock.key)}
                          className="w-4 h-4 rounded border-slate-300 text-[#0284C7] focus:ring-sky-500 cursor-pointer"
                        />
                        <span>{stock.label}</span>
                      </label>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Modal Actions: Clear all, Cancel, Apply Filters */}
            <div className="px-6 py-4 border-t border-slate-200 bg-slate-50 flex items-center justify-between">
              <button
                type="button"
                onClick={handleClearAllModal}
                className="text-xs font-semibold text-rose-600 hover:text-rose-700 transition-colors"
              >
                Clear all
              </button>
              <div className="flex items-center space-x-2">
                <button
                  type="button"
                  onClick={() => setIsFilterModalOpen(false)}
                  className="px-4 py-2 border border-slate-300 rounded-lg text-sm font-semibold text-slate-700 hover:bg-slate-100 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleApplyFilterModal}
                  className="px-5 py-2 bg-[#0284C7] hover:bg-[#0369A1] text-white rounded-lg text-sm font-semibold shadow-sm transition-colors"
                >
                  Apply Filters
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ================= 8. DELETE CONFIRMATION MODAL ================= */}
      {deletingProduct && (
        <div
          className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto"
          onClick={() => setDeletingProduct(null)}
        >
          <div
            className="bg-white rounded-2xl max-w-md w-full p-6 sm:p-7 shadow-2xl border border-slate-200 space-y-5 animate-in fade-in zoom-in-95 duration-150 my-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-start space-x-4">
              <div className="w-12 h-12 rounded-xl bg-rose-50 border border-rose-100 text-rose-600 flex items-center justify-center shrink-0">
                <Trash2 className="w-6 h-6" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-bold text-slate-900">
                    Delete Product?
                  </h3>
                  <button
                    type="button"
                    onClick={() => setDeletingProduct(null)}
                    className="text-slate-400 hover:text-slate-600 p-1 rounded-lg -mr-1 -mt-1 hover:bg-slate-100 transition-colors"
                    title="Close"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
                <p className="text-sm text-slate-600 mt-2 leading-relaxed">
                  Are you sure you want to permanently delete{" "}
                  <span className="font-semibold text-slate-900 break-words">
                    "{deletingProduct.name}"
                  </span>
                  ?
                </p>
                <div className="mt-3 p-3 bg-amber-50/70 border border-amber-200/80 rounded-lg flex items-start space-x-2">
                  <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                  <p className="text-xs text-amber-800 leading-snug">
                    This action cannot be undone. The product will be permanently removed from your organization catalog and student view.
                  </p>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-end space-x-3 pt-3 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setDeletingProduct(null)}
                className="px-4 py-2.5 border border-slate-300 rounded-lg text-sm font-semibold text-slate-700 hover:bg-slate-50 transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmDelete}
                className="flex items-center space-x-1.5 px-5 py-2.5 bg-rose-600 hover:bg-rose-700 text-white rounded-lg text-sm font-semibold shadow-sm hover:shadow transition-all"
              >
                <Trash2 className="w-4 h-4" />
                <span>Delete Product</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ================= 9. PRODUCT DETAILS MODAL ================= */}
      {selectedProductDetails && (
        <ProductDetailsModal
          product={selectedProductDetails}
          onClose={() => setSelectedProductDetails(null)}
          onEditProduct={(productToEdit) => {
            setSelectedProductDetails(null);
            onEditProduct(productToEdit);
          }}
        />
      )}
    </div>
  );
}
