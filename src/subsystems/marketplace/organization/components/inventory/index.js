// ─── UI components (inventory-design) ────────────────────────────────────────
export { default as SummaryCards, SummaryCard } from './inventory-design/SummaryCards';
export { default as InventoryFilters }           from './inventory-design/InventoryFilters';
export { default as FilterDropdown }             from './inventory-design/FilterDropdown';
export { default as InventoryTable }             from './inventory-design/InventoryTable';
export { default as InventoryRow }               from './inventory-design/InventoryRow';
export { default as StockStepper }               from './inventory-design/StockStepper';
export { default as StatusBadge, StockLevelBadge } from './inventory-design/StatusBadge';
export { default as Pagination }                 from './inventory-design/Pagination';
export { default as ConfirmStockModal }          from './inventory-design/ConfirmStockModal';
export { default as Toast }                      from './inventory-design/Toast';

// ─── Functional logic (inventory-functions) ───────────────────────────────────
export { default as useInventory }   from './inventory-functions/useInventory';
export * from './inventory-functions/inventoryUtils';


