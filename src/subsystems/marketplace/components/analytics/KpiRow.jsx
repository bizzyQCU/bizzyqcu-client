import KpiCard from './KpiCard'
import CriticalStockCard from './CriticalStockCard'
import { peso } from '../../utils/format'

export default function KpiRow({ kpis, critical }) {
  return (
    <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
      <KpiCard
        label="Gross Revenue"
        icon={
          <svg className="w-4 h-4 text-emerald-700" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        }
        iconClass="bg-emerald-100"
        value={peso(kpis.grossRevenue, 0)}
        delta={kpis.revenueChangePct}
        deltaNote="vs last month"
        footerLabel="Net Revenue"
        footerValue={peso(kpis.netRevenue, 0)}
      />

      <KpiCard
        label="Completed Orders"
        icon={
          <svg className="w-4 h-4 text-blue-700" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        }
        iconClass="bg-blue-100"
        value={kpis.completedOrders.toLocaleString()}
        delta={kpis.ordersChangePct}
        deltaNote="fulfilled successfully"
        footerLabel="Avg. Order Value"
        footerValue={peso(kpis.avgOrderValue)}
      />

      <KpiCard
        label="Conversion Rate"
        icon={
          <svg className="w-4 h-4 text-sky-700" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
          </svg>
        }
        iconClass="bg-sky-100"
        value={`${kpis.conversionRatePct}%`}
        valueClass="text-[#0091FF]"
        delta={kpis.conversionChangePct}
        deltaNote="above org average"
        footerLabel="Unique Visitors"
        footerValue={kpis.uniqueVisitors.toLocaleString()}
      />

      <CriticalStockCard
        productName={critical.productName}
        unitsLeft={critical.unitsLeft}
        note={critical.note}
      />
    </section>
  )
}
