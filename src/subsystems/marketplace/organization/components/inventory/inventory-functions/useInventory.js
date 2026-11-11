import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  fetchInventory,
  updateProductStock,
  fetchCategories,
  fetchStoreInfo,
} from './inventoryService';
import {
  PAGE_SIZE,
  STOCK_STATUS,
  clampStock,
  computeSummary,
  filterProducts,
  sortProducts,
} from './inventoryUtils';

/**
 * All state + logic for the Inventory Management page.
 *
 * - `products`   : SAVED stock from the server. Stepper edits live in `drafts`
 *                  until confirmed, so rows don't jump while being adjusted.
 * - `categories` : string[] for the filter dropdown, loaded from the API.
 * - `storeInfo`  : { name, location } for the SellerTopBar, loaded from the API.
 *
 * Data comes from inventoryService.js which calls bizzyqcu-server.
 */
export default function useInventory() {
  const [products,   setProducts]   = useState([]);
  const [categories, setCategories] = useState([]);
  const [storeInfo,  setStoreInfo]  = useState({ name: '', location: '' });
  const [loading,    setLoading]    = useState(true);
  const [error,      setError]      = useState(null);

  const [search,      setSearch]      = useState('');
  const [category,    setCategory]    = useState('all');
  const [stockStatus, setStockStatus] = useState(STOCK_STATUS.ALL);
  const [sortKey,     setSortKey]     = useState('newest');
  const [page,        setPage]        = useState(1);

  const [drafts, setDrafts] = useState({});

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      // Load products, categories, and store info in parallel.
      const [fetchedProducts, fetchedCategories, fetchedStore] = await Promise.all([
        fetchInventory(),
        fetchCategories(),
        fetchStoreInfo(),
      ]);
      setProducts(fetchedProducts);
      setCategories(fetchedCategories);
      setStoreInfo(fetchedStore);
    } catch (err) {
      setError(err.apiMessage || err.message || 'Failed to load inventory.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  // Any filter change resets to page 1.
  useEffect(() => { setPage(1); }, [search, category, stockStatus, sortKey]);

  const summary = useMemo(() => computeSummary(products), [products]);

  const visible = useMemo(
    () => sortProducts(filterProducts(products, { search, category, stockStatus }), sortKey),
    [products, search, category, stockStatus, sortKey],
  );

  const totalPages  = Math.max(1, Math.ceil(visible.length / PAGE_SIZE));
  const currentPage = Math.min(page, totalPages);
  const pageItems   = visible.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);

  const setDraft = useCallback(
    (productId, value) => {
      const next = clampStock(value);
      setDrafts((prev) => {
        const saved = products.find((p) => p.id === productId)?.stock;
        const copy  = { ...prev };
        if (next === saved) delete copy[productId];
        else copy[productId] = next;
        return copy;
      });
    },
    [products],
  );

  const discardDraft = useCallback((productId) => {
    setDrafts((prev) => { const copy = { ...prev }; delete copy[productId]; return copy; });
  }, []);

  const saveStock = useCallback(async (productId, newStock) => {
    const updated = await updateProductStock(productId, newStock);
    setProducts((prev) => prev.map((p) => (p.id === productId ? { ...p, ...updated } : p)));
    setDrafts((prev)   => { const copy = { ...prev }; delete copy[productId]; return copy; });
    return updated;
  }, []);

  const resetFilters = useCallback(() => {
    setSearch('');
    setCategory('all');
    setStockStatus(STOCK_STATUS.ALL);
    setSortKey('newest');
  }, []);

  return {
    loading, error, reload: load, summary,
    // filters
    search, setSearch, category, setCategory,
    stockStatus, setStockStatus, sortKey, setSortKey, resetFilters,
    // pagination
    page: currentPage, setPage, totalPages,
    totalResults: visible.length, pageSize: PAGE_SIZE, pageItems,
    // stock editing
    drafts, setDraft, discardDraft, saveStock,
    // metadata from API
    categories,
    storeInfo,
  };
}
