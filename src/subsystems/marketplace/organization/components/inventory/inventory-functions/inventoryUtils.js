/** Pure helpers for the Inventory Management page (no React). */

export const LOW_STOCK_MAX = 5; // 1–5 units = low stock
export const PAGE_SIZE = 6;
export const MAX_STOCK = 9999;

export const STOCK_STATUS = {
  ALL: 'all',
  IN:  'in',
  LOW: 'low',
  OUT: 'out',
};

export const STOCK_STATUS_OPTIONS = [
  { value: STOCK_STATUS.ALL, label: 'All Stock Status', dot: 'bg-slate-300' },
  { value: STOCK_STATUS.IN,  label: 'In Stock (6+)',    dot: 'bg-green-500' },
  { value: STOCK_STATUS.LOW, label: 'Low Stock (1–5)',  dot: 'bg-amber-500' },
  { value: STOCK_STATUS.OUT, label: 'Out of Stock (0)', dot: 'bg-red-500'   },
];

export const SORT_OPTIONS = [
  { value: 'newest',     label: 'Newest First'  },
  { value: 'name-asc',   label: 'Name A–Z'       },
  { value: 'stock-asc',  label: 'Stock Low–High' },
  { value: 'stock-desc', label: 'Stock High–Low' },
  { value: 'price-desc', label: 'Price High–Low' },
];

export function getStockStatus(stock) {
  if (stock <= 0)             return STOCK_STATUS.OUT;
  if (stock <= LOW_STOCK_MAX) return STOCK_STATUS.LOW;
  return STOCK_STATUS.IN;
}

export const STOCK_STATUS_LABEL = {
  [STOCK_STATUS.IN]:  'In Stock',
  [STOCK_STATUS.LOW]: 'Low Stock',
  [STOCK_STATUS.OUT]: 'Out of Stock',
};

const pesoFormatter = new Intl.NumberFormat('en-PH', {
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

export function formatPeso(amount) {
  return `₱${pesoFormatter.format(amount)}`;
}

export function clampStock(value) {
  const n = Number.parseInt(value, 10);
  if (Number.isNaN(n)) return 0;
  return Math.min(MAX_STOCK, Math.max(0, n));
}

/** Search + category + stock-status filtering. */
export function filterProducts(products, { search, category, stockStatus }) {
  const q = search.trim().toLowerCase();
  return products.filter((p) => {
    if (category !== 'all' && p.category !== category)                               return false;
    if (stockStatus !== STOCK_STATUS.ALL && getStockStatus(p.stock) !== stockStatus) return false;
    if (!q) return true;
    return (
      p.name.toLowerCase().includes(q)     ||
      p.sku.toLowerCase().includes(q)      ||
      p.category.toLowerCase().includes(q)
    );
  });
}

export function sortProducts(products, sortKey) {
  const list = [...products];
  switch (sortKey) {
    case 'name-asc':   return list.sort((a, b) => a.name.localeCompare(b.name));
    case 'stock-asc':  return list.sort((a, b) => a.stock - b.stock  || a.name.localeCompare(b.name));
    case 'stock-desc': return list.sort((a, b) => b.stock - a.stock  || a.name.localeCompare(b.name));
    case 'price-desc': return list.sort((a, b) => b.price - a.price  || a.name.localeCompare(b.name));
    case 'newest':
    default:           return list.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  }
}

/** Numbers that drive the four summary cards. */
export function computeSummary(products) {
  const total = products.length;
  let inStock = 0, low = 0, out = 0;
  products.forEach((p) => {
    const s = getStockStatus(p.stock);
    if (s === STOCK_STATUS.IN)       inStock += 1;
    else if (s === STOCK_STATUS.LOW) low     += 1;
    else                             out     += 1;
  });
  const categories = new Set(products.map((p) => p.category)).size;
  const pct = (n) => (total ? Math.round((n / total) * 100) : 0);
  return { total, categories, inStock, low, out, inStockPct: pct(inStock), lowPct: pct(low), outPct: pct(out) };
}
