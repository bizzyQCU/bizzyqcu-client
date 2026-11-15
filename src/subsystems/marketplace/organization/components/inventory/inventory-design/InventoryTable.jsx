import InventoryRow from './InventoryRow';
import Pagination from './Pagination';
import { BoxIcon, SpinnerIcon } from './icons';

const HEADERS = [
  { label: 'Product & SKU',         className: 'pl-4 sm:pl-5 pr-3 w-[48%]'  },
  { label: 'Base Price',            className: 'px-3 w-[15%]'               },
  { label: 'Stock / Quick Stepper', className: 'px-3 w-[19%]'               },
  { label: 'Admin Verification',    className: 'pl-3 pr-4 sm:pr-5 w-[18%]'  },
];

export default function InventoryTable({ products, loading, error, onRetry, drafts, onDraftChange, onDiscard, onRequestSave, onClearFilters, pagination }) {
  return (
    <section aria-label="Inventory list" className="overflow-hidden rounded-xl border border-slate-200 bg-white">
      <div className="overflow-x-auto">
        <table className="w-full min-w-[760px] table-fixed border-collapse text-left">
          <thead className="bg-slate-50/60">
            <tr>
              {HEADERS.map((h) => (
                <th key={h.label} scope="col" className={`py-3 text-[10.5px] font-semibold uppercase tracking-wide text-slate-700 ${h.className}`}>
                  {h.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {loading && <StateRow><SpinnerIcon className="h-5 w-5 text-[#1a6fb5]" /><span>Loading inventory…</span></StateRow>}
            {!loading && error && (
              <StateRow>
                <span className="text-red-600">{error}</span>
                <button type="button" onClick={onRetry} className="font-medium text-[#1a6fb5] hover:underline">Try again</button>
              </StateRow>
            )}
            {!loading && !error && products.length === 0 && (
              <StateRow>
                <span className="flex h-10 w-10 items-center justify-center rounded-full bg-slate-100 text-slate-400"><BoxIcon className="h-5 w-5" /></span>
                <span className="font-medium text-slate-700">No products match your filters</span>
                <button type="button" onClick={onClearFilters} className="text-[12px] font-medium text-[#1a6fb5] hover:underline">Clear all filters</button>
              </StateRow>
            )}
            {!loading && !error && products.map((p) => (
              <InventoryRow key={p.id} product={p} draftValue={drafts[p.id]} onDraftChange={onDraftChange} onDiscard={onDiscard} onRequestSave={onRequestSave} />
            ))}
          </tbody>
        </table>
      </div>
      {!loading && !error && <Pagination {...pagination} />}
    </section>
  );
}

function StateRow({ children }) {
  return (
    <tr className="border-t border-slate-200">
      <td colSpan={4} className="px-5 py-14">
        <div className="flex flex-col items-center justify-center gap-2 text-[13px] text-slate-500">{children}</div>
      </td>
    </tr>
  );
}
