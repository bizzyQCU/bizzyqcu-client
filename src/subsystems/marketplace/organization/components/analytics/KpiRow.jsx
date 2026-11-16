import KpiCard from "./KpiCard";
import CriticalStockCard from "./CriticalStockCard";
import { peso } from "../../../utils/format";

export default function KpiRow({ kpis, critical }) {
  const safeKpis = kpis || {};

  return (
    <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
      <KpiCard
        label="Gross Revenue"
        icon={
          <svg
            className="w-4 h-4 text-emerald-700"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
        }
        iconClass="bg-emerald-100"
        value={peso(safeKpis.grossRevenue ?? 0, 0)}
        delta={safeKpis.revenueChangePct ?? 0}
        deltaNote="vs previous period"
        footerLabel="Net Revenue"
        footerValue={peso(safeKpis.netRevenue ?? 0, 0)}
      />

      <KpiCard
        label="Completed Orders"
        icon={
          <svg
            className="w-4 h-4 text-blue-700"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
        }
        iconClass="bg-blue-100"
        value={(safeKpis.completedOrders ?? 0).toLocaleString()}
        delta={safeKpis.ordersChangePct ?? 0}
        deltaNote="fulfilled successfully"
        footerLabel="Avg. Order Value"
        footerValue={peso(safeKpis.avgOrderValue ?? 0)}
      />

      <KpiCard
        label="Conversion Rate"
        icon={
          <svg
            className="w-4 h-4 text-sky-700"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"
            />
          </svg>
        }
        iconClass="bg-sky-100"
        value={`${safeKpis.conversionRatePct ?? 0}%`}
        valueClass="text-[#0091FF]"
        delta={safeKpis.conversionChangePct ?? 0}
        deltaNote="visitor conversion rate"
        footerLabel="Unique Visitors"
        footerValue={(safeKpis.uniqueVisitors ?? 0).toLocaleString()}
      />

      <CriticalStockCard
        isCritical={critical?.isCritical}
        productName={critical?.productName || "All Products In Stock"}
        unitsLeft={critical?.unitsLeft ?? 0}
        note={critical?.note || "Healthy inventory levels"}
      />
    </section>
  );
}
