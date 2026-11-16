import { Link } from "react-router-dom";
import { peso } from "../../../utils/format";

const toneClass = {
  amber: "bg-amber-100 text-amber-800",
  blue: "bg-blue-100 text-blue-800",
  emerald: "bg-emerald-100 text-emerald-800",
};

export default function TopRevenueDrivers({ products = [], totalRevenue = 0 }) {
  const safeProducts = Array.isArray(products) ? products : [];
  const topThreeRevenue = safeProducts.reduce((sum, p) => sum + (p.revenue || 0), 0);
  const topThreeShare = totalRevenue > 0 ? ((topThreeRevenue / totalRevenue) * 100).toFixed(1) : "0.0";

  return (
    <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm lg:col-span-5 flex flex-col">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-base font-bold text-slate-900">
            Top Revenue Drivers
          </h3>
          <p className="text-xs text-slate-500">
            Top-performing products by revenue
          </p>
        </div>
      </div>

      <div className="space-y-3.5 flex-1">
        {safeProducts.length > 0 ? (
          safeProducts.map((product) => (
            <div key={product.id} className="flex items-start gap-3">
              <div
                className={`w-2 h-2 rounded-full ${product.dot} mt-1.5 shrink-0`}
              />
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-semibold text-slate-900 truncate">
                      {product.name}
                    </div>
                    <div className="text-[11px] text-slate-500 mt-0.5">
                      {product.sold} {product.unit} sold • {product.marginPct}%
                      margin
                    </div>
                  </div>
                  <div className="text-right shrink-0">
                    <div className="text-sm font-bold text-slate-900">
                      {peso(product.revenue, 0)}
                    </div>
                    <span
                      className={`text-[10px] font-semibold px-1.5 py-0.5 rounded inline-block mt-1 ${toneClass[product.tone] || toneClass.blue}`}
                    >
                      {product.stockLabel}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="flex flex-col items-center justify-center py-8 text-center text-slate-400">
            <p className="text-xs">No product sales recorded for this period yet.</p>
          </div>
        )}
      </div>

      <div className="mt-4 pt-4 border-t border-slate-200 flex items-center justify-between text-xs">
        <div>
          <span className="text-slate-500">Combined Top 3 Share:</span>{" "}
          <span className="font-bold text-slate-900">{topThreeShare}%</span>
        </div>
        <Link
          to="/seller/org/products"
          className="text-[#0091FF] hover:text-[#0284C7] font-semibold hover:underline"
        >
          View All Products →
        </Link>
      </div>
    </div>
  );
}
