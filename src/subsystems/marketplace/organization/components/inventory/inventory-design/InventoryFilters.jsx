import FilterDropdown from './FilterDropdown';
import { FilterLinesIcon, SearchIcon, XIcon } from './icons';
import { SORT_OPTIONS, STOCK_STATUS_OPTIONS } from '../inventory-functions/inventoryUtils';

/** Search box + category / stock-status / sort dropdowns. */
export default function InventoryFilters({
  search, onSearchChange,
  category, onCategoryChange, categories,
  stockStatus, onStockStatusChange,
  sortKey, onSortChange,
}) {
  const categoryOptions = [
    { value: 'all', label: 'All Categories' },
    ...categories.map((c) => ({ value: c, label: c })),
  ];

  return (
    <section
      aria-label="Filter inventory"
      className="flex flex-col gap-2 rounded-xl border border-slate-200 bg-white p-2.5 lg:flex-row lg:items-center"
    >
      <label className="relative flex-1">
        <span className="sr-only">Search products</span>
        <SearchIcon className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
        <input
          type="search"
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder="Search by product name, SKU, or category..."
          className="inv-search h-[38px] w-full rounded-lg border border-slate-200 bg-slate-50 pl-9 pr-8 text-[12.5px] text-slate-800 placeholder:text-slate-400 transition focus:border-[#1a6fb5] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#1a6fb5]/20"
        />
        {search && (
          <button type="button" onClick={() => onSearchChange('')} aria-label="Clear search"
            className="absolute right-2 top-1/2 -translate-y-1/2 rounded p-1 text-slate-400 hover:bg-slate-200 hover:text-slate-600">
            <XIcon className="h-3.5 w-3.5" />
          </button>
        )}
      </label>

      <div className="grid grid-cols-1 gap-2 sm:grid-cols-3 lg:flex lg:gap-2">
        <FilterDropdown ariaLabel="Filter by category"    value={category}    options={categoryOptions}    onChange={onCategoryChange}    className="lg:w-[150px]" />
        <FilterDropdown ariaLabel="Filter by stock status" value={stockStatus} options={STOCK_STATUS_OPTIONS} onChange={onStockStatusChange} className="lg:w-[160px]" menuClassName="w-[170px]" />
        <FilterDropdown ariaLabel="Sort products"          value={sortKey}     options={SORT_OPTIONS}        onChange={onSortChange}
          prefix="Sort:" leadingIcon={<FilterLinesIcon className="h-3.5 w-3.5 shrink-0 text-slate-500" />} className="lg:w-[200px]" align="right" />
      </div>
    </section>
  );
}
