import { Link } from 'react-router-dom';

export default function CriticalStockCard({ isCritical, productName, unitsLeft, note }) {
  // If isCritical is explicitly provided, use it. Otherwise, infer:
  // if productName is specified and not "All Products In Stock", or unitsLeft > 0, it's critical.
  const critical = isCritical !== undefined
    ? Boolean(isCritical)
    : Boolean(unitsLeft > 0 || (unitsLeft === 0 && productName && productName !== 'All Products In Stock'));
  const isHealthy = !critical;

  return (
    <div className={`${isHealthy ? 'bg-emerald-50/50 border-emerald-200' : 'bg-amber-50/50 border-amber-200'} p-5 rounded-xl border shadow-sm`}>
      <div className="flex items-center justify-between">
        <span className={`text-xs font-medium ${isHealthy ? 'text-emerald-800' : 'text-amber-800'}`}>
          {isHealthy ? 'Inventory Health' : 'Critical Stock Alert'}
        </span>
        <span className={`w-7 h-7 ${isHealthy ? 'bg-emerald-100' : 'bg-amber-100'} rounded-lg flex items-center justify-center`}>
          <svg className={`w-4 h-4 ${isHealthy ? 'text-emerald-700' : 'text-amber-700'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            {isHealthy ? (
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            ) : (
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            )}
          </svg>
        </span>
      </div>
      <div className="mt-3">
        <div className={`text-base font-bold ${isHealthy ? 'text-emerald-900' : 'text-amber-900'} tracking-tight`}>
          {productName || (isHealthy ? 'All Products In Stock' : 'Low Stock Warning')}
        </div>
        <span className={`inline-block mt-1 text-xs font-semibold ${isHealthy ? 'text-emerald-700 bg-emerald-100' : 'text-amber-700 bg-amber-100'} px-1.5 py-0.5 rounded`}>
          {isHealthy ? 'No urgent stockouts' : unitsLeft === 0 ? 'Out of stock' : `Only ${unitsLeft} unit${unitsLeft === 1 ? '' : 's'} remaining`}
        </span>
        <div className={`mt-2 pt-2 border-t ${isHealthy ? 'border-emerald-200' : 'border-amber-200'} flex items-center justify-between text-xs`}>
          <span className={isHealthy ? 'text-emerald-700' : 'text-amber-700'}>{note || (isHealthy ? 'Healthy inventory levels' : 'Low stock')}</span>
          <Link 
            to="/seller/org/inventory" 
            className={`font-semibold ${isHealthy ? 'text-emerald-900 hover:text-emerald-800' : 'text-amber-900 hover:text-amber-800'} hover:underline`}
          >
            {isHealthy ? 'View Inventory →' : 'Restock Now →'}
          </Link>
        </div>
      </div>
    </div>
  );
}
