import { useEffect, useState } from "react";
import { getDemandAnalytics } from "../api";

export default function DemandTab() {
  const [data, setData] = useState(null);

  useEffect(() => {
    getDemandAnalytics().then((res) => {
      if (res.success) setData(res.data);
    });
  }, []);

  if (!data) return <p className="text-gray-400 animate-pulse">Loading demand trends...</p>;

  return (
    <div className="space-y-6">
      <div className="bg-[#1E293B] p-6 rounded-xl border border-gray-700 shadow-lg">
        <h3 className="text-xl font-bold text-yellow-500 mb-4">Top Categories on Campus</h3>
        <div className="space-y-3">
          {data.topCategories.map((cat, index) => (
            <div key={index} className="flex justify-between items-center bg-[#0B1120] p-3 rounded-lg">
              <span className="font-semibold">{cat.name}</span>
              <span className="text-gray-400">{cat.unitsSold} sold • ₱{cat.revenue}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="bg-[#1E293B] p-6 rounded-xl border border-gray-700 shadow-lg">
        <h3 className="text-xl font-bold text-yellow-500 mb-4">Orders by Campus Building</h3>
        <div className="grid grid-cols-2 gap-4">
          {data.ordersByCampusBuilding.slice(0, 6).map((bldg, index) => (
            <div key={index} className="bg-[#0B1120] p-3 rounded-lg flex justify-between">
              <span>{bldg.campusBuilding || "Unknown"}</span>
              <span className="text-yellow-500 font-bold">{bldg.orderCount} orders</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}