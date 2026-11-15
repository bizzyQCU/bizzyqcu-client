import StockStepper from './StockStepper';
import StatusBadge from './StatusBadge';
import { UndoIcon } from './icons';
import { getCategoryStyle } from './categoryStyles';
import { STOCK_STATUS, formatPeso, getStockStatus } from '../inventory-functions/inventoryUtils';

const ROW_TINT = {
  [STOCK_STATUS.IN]:  'bg-white hover:bg-slate-50/70',
  [STOCK_STATUS.LOW]: 'bg-amber-50/80 hover:bg-amber-50',
  [STOCK_STATUS.OUT]: 'bg-red-50/80 hover:bg-red-50',
};

export default function InventoryRow({ product, draftValue, onDraftChange, onDiscard, onRequestSave }) {
  const { Icon, tile, icon, chip } = getCategoryStyle(product.category);
  const level = getStockStatus(product.stock);
  const proposed = draftValue ?? product.stock;
  const changed = draftValue !== undefined && draftValue !== product.stock;

  return (
    <tr className={`border-t border-slate-200 transition-colors ${ROW_TINT[level]}`}>
      <td className="py-3 pl-4 pr-3 sm:pl-5">
        <div className="flex items-center gap-3">
          <span className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border ${tile}`}>
            <Icon className={`h-[18px] w-[18px] ${icon}`} strokeWidth={1.75} />
          </span>
          <div className="min-w-0">
            <p className="truncate text-[13px] font-medium text-slate-900">{product.name}</p>
            <div className="mt-0.5 flex items-center gap-1.5">
              <span className="font-mono text-[10px] text-slate-500">{product.sku}</span>
              <span className={`rounded px-1.5 py-px text-[10px] font-medium ${chip}`}>{product.category}</span>
            </div>
          </div>
        </div>
      </td>
      <td className="whitespace-nowrap px-3 py-3 text-[13px] font-semibold text-slate-900">
        {formatPeso(product.price)}
      </td>
      <td className="px-3 py-3">
        <div className="flex flex-col items-start gap-1.5">
          <StockStepper value={proposed} onChange={(v) => onDraftChange(product.id, v)} productName={product.name} changed={changed} />
          {changed && (
            <div className="inv-fade-in flex items-center gap-1">
              <span className="text-[10px] text-slate-500">was {product.stock}</span>
              <button type="button" onClick={() => onRequestSave(product, proposed)}
                className="rounded-md bg-[#1a6fb5] px-2 py-0.5 text-[10.5px] font-medium text-white transition hover:bg-[#155d98] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#1a6fb5]/40">
                Save
              </button>
              <button type="button" onClick={() => onDiscard(product.id)}
                aria-label={`Undo stock change for ${product.name}`} title="Undo change"
                className="rounded-md p-1 text-slate-500 transition hover:bg-slate-200 hover:text-slate-700">
                <UndoIcon className="h-3 w-3" />
              </button>
            </div>
          )}
        </div>
      </td>
      <td className="py-3 pl-3 pr-4 sm:pr-5">
        <StatusBadge status={product.verification} note={product.rejectionNote} />
      </td>
    </tr>
  );
}
