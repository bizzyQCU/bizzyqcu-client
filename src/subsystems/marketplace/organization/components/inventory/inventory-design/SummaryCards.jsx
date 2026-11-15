import { AlertTriangleIcon, ArchiveIcon, BoxIcon, CircleCheckIcon } from './icons';

export function SummaryCard({ label, value, caption, Icon, iconWrap, valueClass, barClass, percent }) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white px-4 pb-4 pt-3.5 shadow-[0_1px_2px_rgba(15,23,42,0.04)]">
      <div className="flex items-start justify-between">
        <p className="text-[10.5px] font-semibold uppercase tracking-wide text-slate-700">{label}</p>
        <span className={`flex h-6 w-6 items-center justify-center rounded-md ${iconWrap}`}>
          <Icon className="h-3.5 w-3.5" />
        </span>
      </div>
      <div className="mt-1 flex items-baseline gap-2.5">
        <span className={`text-2xl font-bold leading-none ${valueClass}`}>{value}</span>
        <span className="text-[11px] text-slate-500">{caption}</span>
      </div>
      <div className="mt-3 h-1 w-full overflow-hidden rounded-full bg-slate-100"
        role="progressbar" aria-valuemin={0} aria-valuemax={100} aria-valuenow={percent} aria-label={`${label} share`}>
        <div className={`h-full rounded-full transition-all duration-500 ${barClass}`} style={{ width: `${percent}%` }} />
      </div>
    </div>
  );
}

export default function SummaryCards({ summary }) {
  const cards = [
    { label: 'Total Products', value: summary.total,   caption: `Across ${summary.categories} ${summary.categories === 1 ? 'category' : 'categories'}`, Icon: BoxIcon,          iconWrap: 'bg-blue-50 text-[#1a6fb5]',   valueClass: 'text-slate-900', barClass: 'bg-[#1a6fb5]',  percent: summary.total ? 100 : 0 },
    { label: 'In Stock',       value: summary.inStock, caption: 'Above 5 units',      Icon: CircleCheckIcon, iconWrap: 'bg-green-50 text-green-600',   valueClass: 'text-slate-900', barClass: 'bg-green-600', percent: summary.inStockPct },
    { label: 'Low Stock',      value: summary.low,     caption: '1–5 units left',     Icon: AlertTriangleIcon, iconWrap: 'bg-amber-50 text-amber-600', valueClass: 'text-amber-700', barClass: 'bg-amber-500', percent: summary.lowPct     },
    { label: 'Out of Stock',   value: summary.out,     caption: 'Needs replenishing', Icon: ArchiveIcon,     iconWrap: 'bg-red-50 text-red-600',       valueClass: 'text-red-600',   barClass: 'bg-red-600',   percent: summary.outPct     },
  ];

  return (
    <section aria-label="Inventory summary" className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
      {cards.map((c) => <SummaryCard key={c.label} {...c} />)}
    </section>
  );
}
