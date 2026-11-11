import { useCallback, useState } from 'react';
import Sidebar from '../components/Sidebar';
import SellerTopBar from '../components/SellerTopBar';
import {
  ConfirmStockModal,
  InventoryFilters,
  InventoryTable,
  SummaryCards,
  Toast,
  useInventory,
} from '../components/inventory';
import '../components/inventory/inventory-design/inventory.css';

/**
 * Inventory Management page — Organisation Seller Portal.
 * Route: /seller/org/inventory  (src/routes/index.jsx)
 *
 * Data flow (all live — no mock data):
 *   useInventory → inventoryService → bizzyqcu-server
 *     GET  /marketplace/seller/products      → product list + normalisation
 *     PATCH /marketplace/products/:id/stock  → stock update
 *     GET  /marketplace/categories           → filter dropdown
 *     GET  /marketplace/stores/me            → top bar store name + location
 */
export default function Inventory() {
  const inv = useInventory();

  const [pending,   setPending]   = useState(null);
  const [saving,    setSaving]    = useState(false);
  const [saveError, setSaveError] = useState(null);
  const [toast,     setToast]     = useState(null);

  const requestSave = useCallback((product, proposedStock) => {
    setSaveError(null);
    setPending({ product, proposedStock });
  }, []);

  const closeModal = useCallback(() => {
    setPending(null);
    setSaveError(null);
  }, []);

  const confirmSave = async () => {
    if (!pending) return;
    setSaving(true);
    setSaveError(null);
    try {
      await inv.saveStock(pending.product.id, pending.proposedStock);
      setToast({
        type: 'success',
        message: `${pending.product.name} stock updated to ${pending.proposedStock}.`,
      });
      setPending(null);
    } catch (err) {
      setSaveError(
        err.apiMessage || err.message || 'Could not save the stock change. Please try again.',
      );
    } finally {
      setSaving(false);
    }
  };

  const closeToast = useCallback(() => setToast(null), []);

  return (
    <div className="flex h-screen bg-slate-100 font-sans text-slate-900 antialiased overflow-hidden">
      <Sidebar />

      <div className="flex min-w-0 flex-1 flex-col overflow-hidden">
        {/* Store name + location come from GET /marketplace/stores/me */}
        <SellerTopBar
          storeName={inv.storeInfo.name || undefined}
          storeLocation={inv.storeInfo.location || undefined}
        />

        <main className="flex-1 overflow-y-auto space-y-4 px-4 py-6 sm:px-6">
          <div>
            <h1 className="text-[22px] font-bold tracking-tight text-slate-900">
              Inventory Management
            </h1>
            <p className="mt-0.5 text-[12.5px] text-slate-500">
              Monitor product stock levels and adjust inventory quantities across your store.
            </p>
          </div>

          {/* Summary cards — computed from real product stockQuantity values */}
          <SummaryCards summary={inv.summary} />

          {/* Categories come from GET /marketplace/categories */}
          <InventoryFilters
            search={inv.search}           onSearchChange={inv.setSearch}
            category={inv.category}       onCategoryChange={inv.setCategory}
            categories={inv.categories}
            stockStatus={inv.stockStatus} onStockStatusChange={inv.setStockStatus}
            sortKey={inv.sortKey}         onSortChange={inv.setSortKey}
          />

          {/* Product rows come from GET /marketplace/seller/products */}
          <InventoryTable
            products={inv.pageItems}
            loading={inv.loading}
            error={inv.error}
            onRetry={inv.reload}
            drafts={inv.drafts}
            onDraftChange={inv.setDraft}
            onDiscard={inv.discardDraft}
            onRequestSave={requestSave}
            onClearFilters={inv.resetFilters}
            pagination={{
              page:         inv.page,
              totalPages:   inv.totalPages,
              totalResults: inv.totalResults,
              pageSize:     inv.pageSize,
              onPageChange: inv.setPage,
            }}
          />
        </main>
      </div>

      <ConfirmStockModal
        open={Boolean(pending)}
        product={pending?.product}
        proposedStock={pending?.proposedStock}
        saving={saving}
        error={saveError}
        onCancel={closeModal}
        onConfirm={confirmSave}
      />

      <Toast toast={toast} onClose={closeToast} />
    </div>
  );
}
