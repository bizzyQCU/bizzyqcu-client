import { Link } from 'react-router-dom';

export default function CriticalStockCard({ productName, unitsLeft, note }) {
  return (
    <div className="bg-amber-50/50 p-5 rounded-xl border border-amber-200 shadow-sm">
      <div className="flex items-center justify-between">
        <span className="text-xs font-medium text-amber-800">Critical Stock Alert</span>
        <span className="w-7 h-7 bg-amber-100 rounded-lg flex items-center justify-center">
          <svg className="w-4 h-4 text-amber-700" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
        </span>
      </div>
      <div className="mt-3">
        <div className="text-base font-bold text-amber-900 tracking-tight">{productName}</div>
        <span className="inline-block mt-1 text-xs font-semibold text-amber-700 bg-amber-100 px-1.5 py-0.5 rounded">
          Only {unitsLeft} units remaining
        </span>
        <div className="mt-2 pt-2 border-t border-amber-200 flex items-center justify-between text-xs">
          <span className="text-amber-700">{note}</span>
          <Link 
            to="/seller/inventory" 
            className="font-semibold text-amber-900 hover:text-amber-800 hover:underline"
          >
            Restock Now →
          </Link>
        </div>
      </div>
    </div>
  );
}
