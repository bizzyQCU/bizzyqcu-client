import React, { useState, useEffect } from 'react';
import { X, SlidersHorizontal } from 'lucide-react';

const CATEGORIES = [
  'Apparel & Uniforms',
  'Academic Stationery',
  'Food & Beverages',
  'Tech & Accessories',
  'Event Tickets & Merch',
];

const ORDER_STATUSES = [
  'Processing',
  'To Ship',
  'In Transit',
  'Out for Delivery',
  'Completed',
  'Cancelled',
];

const PAYMENT_STATUSES = ['Paid', 'Pending', 'Refunded'];

export default function FilterModal({ isOpen, onClose, onApply, initialFilters }) {
  const defaultFilters = {
    selectedCategories: [],
    selectedStatuses: [],
    selectedPaymentStatuses: [],
  };

  const [localFilters, setLocalFilters] = useState(defaultFilters);

  // Sync with initialFilters whenever modal opens
  useEffect(() => {
    if (isOpen) {
      setLocalFilters(initialFilters ?? defaultFilters);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  function toggle(key, value) {
    setLocalFilters((prev) => {
      const list = prev[key];
      return {
        ...prev,
        [key]: list.includes(value)
          ? list.filter((v) => v !== value)
          : [...list, value],
      };
    });
  }

  function clearAll() {
    setLocalFilters(defaultFilters);
  }

  function handleApply() {
    onApply(localFilters);
    onClose();
  }

  const totalActive =
    localFilters.selectedCategories.length +
    localFilters.selectedStatuses.length +
    localFilters.selectedPaymentStatuses.length;

  return (
    /* Backdrop */
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40"
      onMouseDown={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div className="bg-white w-full max-w-md rounded-2xl shadow-2xl flex flex-col max-h-[90vh]">

        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <SlidersHorizontal className="w-4 h-4 text-slate-500" />
            <h2 className="font-bold text-slate-900 text-base">Filter Orders</h2>
            {totalActive > 0 && (
              <span className="ml-1 inline-flex items-center justify-center w-5 h-5 rounded-full bg-[#0284C7] text-white text-[10px] font-bold">
                {totalActive}
              </span>
            )}
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-full transition-colors"
            aria-label="Close filter modal"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Body */}
        <div className="px-6 py-5 space-y-6 overflow-y-auto flex-1">

          {/* Product Category */}
          <section>
            <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-3">
              Product Category
            </p>
            <div className="space-y-2">
              {CATEGORIES.map((cat) => (
                <label key={cat} className="flex items-center space-x-3 cursor-pointer group">
                  <input
                    type="checkbox"
                    checked={localFilters.selectedCategories.includes(cat)}
                    onChange={() => toggle('selectedCategories', cat)}
                    className="w-4 h-4 rounded accent-[#0284C7] cursor-pointer"
                  />
                  <span className="text-sm text-slate-700 group-hover:text-slate-900">
                    {cat}
                  </span>
                </label>
              ))}
            </div>
          </section>

          <div className="border-t border-slate-100" />

          {/* Order Status */}
          <section>
            <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-3">
              Order Status
            </p>
            <div className="space-y-2">
              {ORDER_STATUSES.map((status) => (
                <label key={status} className="flex items-center space-x-3 cursor-pointer group">
                  <input
                    type="checkbox"
                    checked={localFilters.selectedStatuses.includes(status)}
                    onChange={() => toggle('selectedStatuses', status)}
                    className="w-4 h-4 rounded accent-[#0284C7] cursor-pointer"
                  />
                  <span className="text-sm text-slate-700 group-hover:text-slate-900">
                    {status}
                  </span>
                </label>
              ))}
            </div>
          </section>

          <div className="border-t border-slate-100" />

          {/* Payment Status */}
          <section>
            <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-3">
              Payment Status
            </p>
            <div className="space-y-2">
              {PAYMENT_STATUSES.map((status) => (
                <label key={status} className="flex items-center space-x-3 cursor-pointer group">
                  <input
                    type="checkbox"
                    checked={localFilters.selectedPaymentStatuses.includes(status)}
                    onChange={() => toggle('selectedPaymentStatuses', status)}
                    className="w-4 h-4 rounded accent-[#0284C7] cursor-pointer"
                  />
                  <span className="text-sm text-slate-700 group-hover:text-slate-900">
                    {status}
                  </span>
                </label>
              ))}
            </div>
          </section>

        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-slate-200 flex items-center justify-between">
          <button
            onClick={clearAll}
            className="text-sm text-slate-500 hover:text-slate-700 font-medium underline underline-offset-2 transition-colors"
          >
            Clear all
          </button>
          <div className="flex items-center space-x-3">
            <button
              onClick={onClose}
              className="px-4 py-2 border border-slate-300 rounded-lg text-slate-700 text-sm font-semibold hover:bg-slate-50 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleApply}
              className="px-4 py-2 bg-[#0284C7] hover:bg-[#0369A1] text-white rounded-lg text-sm font-semibold shadow-sm transition-colors"
            >
              Apply Filters{totalActive > 0 ? ` (${totalActive})` : ''}
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}
