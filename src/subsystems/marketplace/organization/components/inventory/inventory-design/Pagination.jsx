import { ChevronLeftIcon, ChevronRightIcon } from './icons';

function getPageList(current, total) {
  if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1);
  const pages = new Set([1, total, current - 1, current, current + 1]);
  const sorted = [...pages].filter((p) => p >= 1 && p <= total).sort((a, b) => a - b);
  const out = [];
  sorted.forEach((p, i) => {
    if (i > 0 && p - sorted[i - 1] > 1) out.push(`gap-${p}`);
    out.push(p);
  });
  return out;
}

export default function Pagination({ page, totalPages, totalResults, pageSize, onPageChange }) {
  const from = totalResults === 0 ? 0 : (page - 1) * pageSize + 1;
  const to = Math.min(page * pageSize, totalResults);

  return (
    <div className="flex flex-col items-center justify-between gap-3 border-t border-slate-200 px-4 py-3 sm:flex-row sm:px-5">
      <p className="text-[11.5px] text-slate-600" aria-live="polite">
        Showing <span className="font-semibold text-slate-900">{from}</span> to{' '}
        <span className="font-semibold text-slate-900">{to}</span> of{' '}
        <span className="font-semibold text-slate-900">{totalResults}</span> products
      </p>
      <nav aria-label="Pagination" className="flex items-center gap-1">
        <button type="button" onClick={() => onPageChange(page - 1)} disabled={page <= 1}
          className="flex items-center gap-0.5 rounded-md px-2 py-1 text-[11.5px] font-medium text-slate-700 transition hover:bg-slate-100 disabled:cursor-not-allowed disabled:text-slate-400 disabled:hover:bg-transparent">
          <ChevronLeftIcon className="h-3 w-3" /> Previous
        </button>
        {getPageList(page, totalPages).map((p) =>
          typeof p === 'string' ? (
            <span key={p} className="px-1 text-[11.5px] text-slate-400">…</span>
          ) : (
            <button key={p} type="button" onClick={() => onPageChange(p)} aria-current={p === page ? 'page' : undefined}
              className={`h-[26px] min-w-[26px] rounded-md px-1.5 text-[11.5px] font-medium transition
                ${p === page ? 'bg-[#1a6fb5] text-white shadow-sm' : 'text-slate-700 hover:bg-slate-100'}`}>
              {p}
            </button>
          )
        )}
        <button type="button" onClick={() => onPageChange(page + 1)} disabled={page >= totalPages}
          className="flex items-center gap-0.5 rounded-md px-2 py-1 text-[11.5px] font-medium text-slate-800 transition hover:bg-slate-100 disabled:cursor-not-allowed disabled:text-slate-400 disabled:hover:bg-transparent">
          Next <ChevronRightIcon className="h-3 w-3" />
        </button>
      </nav>
    </div>
  );
}
