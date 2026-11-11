import { CircleCheckIcon, CircleXIcon, ClockIcon } from './icons';

const VERIFICATION = {
  approved: { label: 'Approved',      Icon: CircleCheckIcon, className: 'border-sky-200 bg-sky-50 text-[#1a6fb5]'       },
  pending:  { label: 'Pending Review', Icon: ClockIcon,       className: 'border-amber-200 bg-amber-100 text-amber-800'  },
  rejected: { label: 'Rejected',      Icon: CircleXIcon,     className: 'border-red-200 bg-red-50 text-red-600'          },
};

/** Admin verification pill: Approved / Pending Review / Rejected (+ optional note). */
export default function StatusBadge({ status, note }) {
  const cfg = VERIFICATION[status] ?? VERIFICATION.pending;
  const { Icon } = cfg;
  return (
    <div className="flex flex-col items-start gap-1">
      <span className={`inline-flex items-center gap-1 rounded-full border px-2 py-[3px] text-[10.5px] font-medium ${cfg.className}`}>
        <Icon className="h-3 w-3" />
        {cfg.label}
      </span>
      {status === 'rejected' && note && (
        <span className="text-[10.5px] text-red-600">Note: {note}</span>
      )}
    </div>
  );
}

/** Small stock-level pill used inside the confirmation modal. */
export function StockLevelBadge({ status }) {
  const map = {
    in:  { label: 'In Stock',     dot: 'bg-green-500', cls: 'bg-green-50 text-green-700 border-green-200' },
    low: { label: 'Low Stock',    dot: 'bg-amber-500', cls: 'bg-amber-50 text-amber-800 border-amber-200' },
    out: { label: 'Out of Stock', dot: 'bg-red-500',   cls: 'bg-red-50 text-red-700 border-red-200'       },
  };
  const cfg = map[status];
  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full border px-2 py-0.5 text-[10.5px] font-medium ${cfg.cls}`}>
      <span className={`h-1.5 w-1.5 rounded-full ${cfg.dot}`} />
      {cfg.label}
    </span>
  );
}
