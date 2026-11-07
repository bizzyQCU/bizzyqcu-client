import { useState } from 'react'
import { useAnalytics } from '../hooks/useAnalytics'
import { useDateRange } from '../hooks/useDateRange'
import { fmtRange } from '../utils/dates'
import SellerSidebar from '../components/SellerSidebar'
import SellerTopBar from '../components/SellerTopBar'
import PageHeader from '../components/analytics/PageHeader'
import KpiRow from '../components/analytics/KpiRow'
import WeeklySalesChart from '../components/analytics/WeeklySalesChart'
import TopRevenueDrivers from '../components/analytics/TopRevenueDrivers'
import TrafficChannels from '../components/analytics/TrafficChannels'
import PriorityActions from '../components/analytics/PriorityActions'
import DateRangeModal from '../components/date-range/DateRangeModal'
import ExportCsvModal from '../components/export/ExportCsvModal'

export default function SellerAnalytics() {
  const { applied, apply } = useDateRange({
    start: new Date(2026, 10, 1), // Nov 1, 2026
    end: new Date(2026, 10, 7),   // Nov 7, 2026
    compare: true,
    presetId: 'this-week',
  })
  
  const [dateModalOpen, setDateModalOpen] = useState(false)
  const [exportModalOpen, setExportModalOpen] = useState(false)
  
  // Convert dates for useAnalytics hook (keeping old format for now)
  const dateRange = {
    start: applied.start.toISOString().split('T')[0],
    end: applied.end.toISOString().split('T')[0]
  }
  
  const { data, loading, error, refresh } = useAnalytics(dateRange)

  // Remove old handleExport since we now open modal instead

  const handleMessagesClick = () => {
    // TODO: Open messages modal or navigate to messages page
    console.log('Messages clicked')
  }

  const modalOpen = dateModalOpen || exportModalOpen

  if (loading) {
    return (
      <div className="flex min-h-screen bg-[#F8FAFC]">
        <SellerSidebar />
        <div className="flex-1 flex flex-col min-w-0">
          <SellerTopBar onMessagesClick={handleMessagesClick} />
          <main className="p-8 max-w-7xl mx-auto w-full">
            <div className="flex items-center justify-center h-96">
              <div className="flex flex-col items-center gap-3">
                <div className="w-8 h-8 border-4 border-slate-200 border-t-[#0091FF] rounded-full animate-spin" />
                <span className="text-sm text-slate-500">Loading analytics...</span>
              </div>
            </div>
          </main>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex min-h-screen bg-[#F8FAFC]">
        <SellerSidebar />
        <div className="flex-1 flex flex-col min-w-0">
          <SellerTopBar onMessagesClick={handleMessagesClick} />
          <main className="p-8 max-w-7xl mx-auto w-full">
            <div className="bg-rose-50 border border-rose-200 rounded-xl p-6 text-center">
              <h3 className="text-lg font-bold text-rose-900 mb-2">Failed to load analytics</h3>
              <p className="text-sm text-rose-700 mb-4">{error.message}</p>
              <button 
                onClick={refresh}
                className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white text-sm font-semibold rounded-lg transition-colors"
              >
                Try Again
              </button>
            </div>
          </main>
        </div>
      </div>
    )
  }

  if (!data) return null

  return (
    <div className="flex min-h-screen bg-[#F8FAFC]">
      <SellerSidebar />
      <div className="flex-1 flex flex-col min-w-0">
        <SellerTopBar onMessagesClick={handleMessagesClick} />
        <main 
          inert={modalOpen ? '' : undefined}
          aria-hidden={modalOpen}
          className="p-8 max-w-7xl mx-auto w-full flex flex-col gap-8"
        >
          <PageHeader 
            period={fmtRange(applied.start, applied.end)}
            onRefresh={refresh}
            onExport={() => setExportModalOpen(true)}
            onOpenDatePicker={() => setDateModalOpen(true)}
          />
          
          <KpiRow 
            kpis={data.kpis} 
            critical={data.criticalStock} 
          />
          
          <section className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            <WeeklySalesChart 
              weeks={data.weeklySales} 
              projected={data.projectedNovember} 
            />
            <TopRevenueDrivers 
              products={data.topProducts} 
              totalRevenue={data.kpis.grossRevenue} 
            />
          </section>
          
          <section className="grid grid-cols-1 lg:grid-cols-2 gap-6 pb-8">
            <TrafficChannels traffic={data.traffic} />
            <PriorityActions 
              actions={data.actions} 
              nextReview={data.nextReview} 
            />
          </section>
        </main>
        
        {/* Date Range Modal */}
        {dateModalOpen && (
          <DateRangeModal
            open
            applied={applied}
            onApply={apply}
            onClose={() => setDateModalOpen(false)}
          />
        )}
        
        {/* Export CSV Modal */}
        {exportModalOpen && (
          <ExportCsvModal
            data={data}
            appliedRange={applied}
            org="QCU Computer Society (QCS)"
            user="Demo User"
            onClose={() => setExportModalOpen(false)}
          />
        )}
      </div>
    </div>
  )
}
