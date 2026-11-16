import { useEffect, useState } from "react";
import { getSalesAnalytics } from "../api";

export default function AnalyticsTab() {
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    getSalesAnalytics()
      .then((res) => {
        if (res.success || res.summary) {
          setData(res.data || res);
        } else {
          setError("Failed to load sales analytics");
        }
      })
      .catch((err) => {
        setError(err.response?.data?.message || err.message || "Failed to load sales data");
      });
  }, []);

  if (error) return (
    <div className="bg-red-950/30 border border-red-500/30 p-4 rounded-xl text-red-400 text-sm">
      Error loading analytics: {error}
    </div>
  );

  if (!data || !data.summary) return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      {[1, 2, 3].map((n) => (
        <div key={n} className="bg-[#1E293B] p-6 rounded-xl border border-gray-700 animate-pulse h-28"></div>
      ))}
    </div>
  );

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-[#1E293B] p-6 rounded-xl border border-gray-700 shadow-lg relative overflow-hidden">
          <div className="absolute top-0 right-0 w-24 h-24 bg-amber-500/10 rounded-full blur-xl pointer-events-none"></div>
          <h3 className="text-gray-400 text-xs font-semibold uppercase tracking-wider">Total Platform Revenue</h3>
          <p className="text-3xl font-extrabold text-amber-400 mt-2">
            ₱{Number(data.summary.totalRevenue || 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}
          </p>
          <span className="text-xs text-slate-500 mt-1 block">From settled customer payments</span>
        </div>

        <div className="bg-[#1E293B] p-6 rounded-xl border border-gray-700 shadow-lg">
          <h3 className="text-gray-400 text-xs font-semibold uppercase tracking-wider">Completed Orders</h3>
          <p className="text-3xl font-extrabold text-white mt-2">{data.summary.orderCount || 0}</p>
          <span className="text-xs text-slate-500 mt-1 block">Delivered or picked up successfully</span>
        </div>

        <div className="bg-[#1E293B] p-6 rounded-xl border border-gray-700 shadow-lg">
          <h3 className="text-gray-400 text-xs font-semibold uppercase tracking-wider">Average Order Value</h3>
          <p className="text-3xl font-extrabold text-white mt-2">
            ₱{Number(data.summary.averageOrderValue || 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}
          </p>
          <span className="text-xs text-slate-500 mt-1 block">Per completed transaction</span>
        </div>
      </div>
    </div>
  );
}
