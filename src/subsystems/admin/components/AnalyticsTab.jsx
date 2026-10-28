import { useEffect, useState } from "react";

export default function AnalyticsTab() {
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    // We use standard fetch here because api.js is missing this function
    fetch("http://localhost:5000/api/v1/admin/analytics/sales")
      .then((res) => res.json())
      .then((res) => {
        if (res.success) setData(res.data);
        else setError("Failed to load data");
      })
      .catch((err) => setError(err.message));
  }, []);

  if (error) return <p className="text-red-500">Error: {error}</p>;
  if (!data) return <p className="text-gray-400 animate-pulse">Loading analytics...</p>;

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      <div className="bg-[#1E293B] p-6 rounded-xl border border-gray-700 shadow-lg">
        <h3 className="text-gray-400 text-sm">Total Revenue</h3>
        <p className="text-3xl font-bold text-yellow-500 mt-2">₱{data.summary.totalRevenue}</p>
      </div>
      <div className="bg-[#1E293B] p-6 rounded-xl border border-gray-700 shadow-lg">
        <h3 className="text-gray-400 text-sm">Completed Orders</h3>
        <p className="text-3xl font-bold text-white mt-2">{data.summary.orderCount}</p>
      </div>
      <div className="bg-[#1E293B] p-6 rounded-xl border border-gray-700 shadow-lg">
        <h3 className="text-gray-400 text-sm">Average Order Value</h3>
        <p className="text-3xl font-bold text-white mt-2">₱{data.summary.averageOrderValue}</p>
      </div>
    </div>
  );
}