import { useState } from 'react';
import { MinusIcon, PlusIcon } from './icons';
import { MAX_STOCK, clampStock } from '../inventory-functions/inventoryUtils';

/**
 * Quick stepper: − [value] +
 * The number is also directly editable (commits on blur / Enter).
 * `changed` highlights the control when the value differs from saved stock.
 */
export default function StockStepper({ value, onChange, productName, changed = false, disabled = false }) {
  const [editing, setEditing] = useState(false);
  const [text, setText] = useState('');

  const commit = () => {
    setEditing(false);
    const next = clampStock(text);
    if (next !== value) onChange(next);
  };

  const isZero = value <= 0;

  return (
    <div
      className={`inline-flex h-[30px] items-center rounded-lg border transition
        ${changed ? 'border-[#1a6fb5] bg-blue-50 ring-2 ring-[#1a6fb5]/15' : 'border-transparent bg-slate-100'}`}
    >
      <button
        type="button"
        onClick={() => onChange(value - 1)}
        disabled={disabled || isZero}
        aria-label={`Decrease stock for ${productName}`}
        className="flex h-full w-7 items-center justify-center rounded-l-lg text-slate-700 transition hover:bg-slate-200 disabled:cursor-not-allowed disabled:text-slate-300 disabled:hover:bg-transparent"
      >
        <MinusIcon className="h-3 w-3" />
      </button>

      <input
        type="text"
        inputMode="numeric"
        value={editing ? text : String(value)}
        onFocus={(e) => { setText(String(value)); setEditing(true); e.target.select(); }}
        disabled={disabled}
        aria-label={`Stock quantity for ${productName}`}
        onChange={(e) => setText(e.target.value.replace(/[^\d]/g, '').slice(0, String(MAX_STOCK).length))}
        onBlur={commit}
        onKeyDown={(e) => {
          if (e.key === 'Enter') e.currentTarget.blur();
          if (e.key === 'ArrowUp' || e.key === 'ArrowDown') {
            e.preventDefault();
            const next = clampStock(clampStock(text) + (e.key === 'ArrowUp' ? 1 : -1));
            setText(String(next));
            onChange(next);
          }
        }}
        className={`h-full w-14 px-0 bg-transparent text-center text-[13px] font-semibold tabular-nums focus:outline-none
          ${isZero ? 'text-red-600' : 'text-slate-900'}`}
      />

      <button
        type="button"
        onClick={() => onChange(value + 1)}
        disabled={disabled || value >= MAX_STOCK}
        aria-label={`Increase stock for ${productName}`}
        className="flex h-full w-7 items-center justify-center rounded-r-lg text-slate-700 transition hover:bg-slate-200 disabled:cursor-not-allowed disabled:text-slate-300"
      >
        <PlusIcon className="h-3 w-3" />
      </button>
    </div>
  );
}
