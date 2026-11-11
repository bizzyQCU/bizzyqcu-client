/**
 * Inventory service — API boundary for the Inventory Management page.
 * ------------------------------------------------------------------
 * Connected to bizzyqcu-server via marketplace/api.js.
 *
 * Backend endpoints used:
 *   GET   /marketplace/seller/products        → fetchInventory()
 *   PATCH /marketplace/products/:id/stock     → updateProductStock()
 *   GET   /marketplace/seller/dashboard       → fetchDashboardSummary()
 *   GET   /marketplace/categories             → fetchCategories()
 *   GET   /marketplace/stores/me              → fetchStoreInfo()
 */
import {
  getSellerProducts,
  setProductStock,
  getSellerDashboard,
  getCategories,
  getMyStore,
} from '../../../../api';

// ---------------------------------------------------------------------------
// Field normalisation
// ---------------------------------------------------------------------------
// The backend Product shape differs from what the UI components expect.
// All mapping is done here so no component needs to change.
//
// Backend            → UI
// stockQuantity      → stock
// approvalStatus     → verification  ('VERIFIED'→'approved', 'PENDING'→'pending', 'REJECTED'→'rejected')
// rejectionReason    → rejectionNote
// category { name }  → category (plain string)
// price (Decimal)    → price (number)
// (no sku field)     → sku: undefined  (InventoryRow renders blank gracefully)

const APPROVAL_MAP = {
  VERIFIED: 'approved',
  PENDING:  'pending',
  REJECTED: 'rejected',
};

function normaliseProduct(p) {
  return {
    id:             p.id,
    name:           p.name,
    sku:            p.sku ?? undefined,          // not in schema — renders blank
    category:       p.category?.name ?? p.category ?? '',
    price:          Number(p.price),
    stock:          p.stockQuantity ?? 0,
    verification:   APPROVAL_MAP[p.approvalStatus] ?? 'pending',
    rejectionNote:  p.rejectionReason ?? undefined,
    createdAt:      p.createdAt,
  };
}

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

/**
 * Fetch all products from the seller's store.
 * Pages through the backend if there are more than the default limit (20).
 * Returns a flat array of normalised products for the client-side filter/sort/paginate.
 *
 * @returns {Promise<object[]>}
 */
export async function fetchInventory() {
  // First page — backend default limit is 20, max per page is 100.
  // We use limit=100 to minimise round-trips for typical store sizes.
  const first = await getSellerProducts({ page: 1, limit: 100 });
  const { items, pagination } = first;

  if (pagination.totalPages <= 1) {
    return items.map(normaliseProduct);
  }

  // Fetch remaining pages in parallel.
  const remaining = await Promise.all(
    Array.from({ length: pagination.totalPages - 1 }, (_, i) =>
      getSellerProducts({ page: i + 2, limit: 100 }),
    ),
  );

  return [
    ...items,
    ...remaining.flatMap((r) => r.items),
  ].map(normaliseProduct);
}

/**
 * Update stock for one product.
 * Sends PATCH /marketplace/products/:id/stock and returns the normalised product.
 *
 * @param {string} productId
 * @param {number} newStock   integer ≥ 0, ≤ 9999
 * @returns {Promise<object>}
 */
export async function updateProductStock(productId, newStock) {
  const response = await setProductStock(productId, newStock);
  // Backend returns { success, message, data: { id, name, stockQuantity, isAvailable } }
  const updated = response.data ?? response;
  return {
    id:    updated.id,
    name:  updated.name,
    stock: updated.stockQuantity ?? newStock,
  };
}

/**
 * Fetch the seller dashboard summary.
 * Used to supplement the summary cards with real low-stock and approval counts.
 *
 * @returns {Promise<object>} raw dashboard data from the server
 */
export async function fetchDashboardSummary() {
  const response = await getSellerDashboard();
  return response.data ?? response;
}

/**
 * Fetch the list of product categories for the filter dropdown.
 * Returns a plain string array matching what InventoryFilters expects.
 *
 * @returns {Promise<string[]>}
 */
export async function fetchCategories() {
  const response = await getCategories();
  const data = response.data ?? [];
  return data.map((c) => c.name);
}

/**
 * Fetch the seller's store name and location for the top bar.
 *
 * @returns {Promise<{ name: string, location: string }>}
 */
export async function fetchStoreInfo() {
  try {
    const response = await getMyStore();
    const store = response.data ?? response;
    return {
      name:     store.name     ?? '',
      location: store.pickupLocation ?? '',
    };
  } catch {
    return { name: '', location: '' };
  }
}
