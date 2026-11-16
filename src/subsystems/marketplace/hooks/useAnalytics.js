import { useEffect, useState, useCallback } from 'react'
import { getSellerAnalytics } from '../api'

export function useAnalytics(range) {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  // Stringify range to avoid infinite loop from object reference changes
  const rangeKey = JSON.stringify(range)

  const load = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const response = await getSellerAnalytics(range)
      const res = response?.data || response

      // When the backend returns the structured analytics payload
      if (res?.kpis) {
        const transformedData = {
          org: res.org || {
            name: res.store?.name || 'My Store',
            location: res.store?.pickupLocation || res.store?.location || 'Campus Store',
          },
          period: res.period || {
            label: `${range.start} – ${range.end}`,
            start: range.start,
            end: range.end,
          },
          kpis: {
            grossRevenue: res.kpis.grossRevenue ?? res.kpis.totalRevenue ?? 0,
            netRevenue: res.kpis.netRevenue ?? res.kpis.totalRevenue ?? 0,
            revenueChangePct: res.kpis.revenueChangePct ?? 0,
            completedOrders: res.kpis.completedOrders ?? 0,
            ordersChangePct: res.kpis.ordersChangePct ?? 0,
            avgOrderValue: res.kpis.avgOrderValue ?? res.kpis.averageOrderValue ?? 0,
            conversionRatePct: res.kpis.conversionRatePct ?? 0,
            conversionChangePct: res.kpis.conversionChangePct ?? 0,
            uniqueVisitors: res.kpis.uniqueVisitors ?? 0,
          },
          criticalStock: res.criticalStock || (res.criticalStockList?.length > 0
            ? {
                productName: res.criticalStockList[0].name,
                unitsLeft: res.criticalStockList[0].stockQuantity,
                note: `Low stock alert`,
              }
            : {
                productName: "All Products In Stock",
                unitsLeft: 0,
                note: "Healthy inventory levels",
              }),
          weeklySales: Array.isArray(res.weeklySales) ? res.weeklySales : [],
          projectedNovember: res.projectedNovember ?? res.projectedRevenue ?? 0,
          topProducts: Array.isArray(res.topProducts)
            ? res.topProducts.map((product, index) => ({
                id: product.id || product.productId,
                name: product.name,
                unit: product.unit || 'units',
                sold: product.sold ?? product.unitsSold ?? 0,
                marginPct: product.marginPct ?? 40,
                revenue: product.revenue ?? 0,
                stockLabel: product.stockLabel || 'Available',
                tone: product.tone || (index === 0 ? 'blue' : index === 1 ? 'cyan' : 'emerald'),
                dot: product.dot || (index === 0 ? 'bg-[#0091FF]' : index === 1 ? 'bg-cyan-500' : 'bg-amber-400'),
              }))
            : [],
          traffic: res.traffic || {
            total: 0,
            channels: [],
            insight: 'No traffic data available',
          },
          actions: Array.isArray(res.actions) ? res.actions : [],
          nextReview: res.nextReview || new Date().toISOString().split('T')[0],
        }

        setData(transformedData)
      } else {
        // Fallback transformation for old dashboard payload format
        const totalRevenue = res.sales?.totalRevenue ?? 0
        const completedOrders = res.sales?.completedOrders ?? 0
        const avgOrderValue = completedOrders > 0 ? totalRevenue / completedOrders : 0

        const fallbackData = {
          org: {
            name: res.store?.name || 'My Store',
            location: res.store?.pickupLocation || res.store?.location || 'Store Location',
          },
          period: {
            label: `${range.start} – ${range.end}`,
            start: range.start,
            end: range.end,
          },
          kpis: {
            grossRevenue: totalRevenue,
            netRevenue: totalRevenue,
            revenueChangePct: 0,
            completedOrders,
            ordersChangePct: 0,
            avgOrderValue: parseFloat(avgOrderValue.toFixed(2)),
            conversionRatePct: 0,
            conversionChangePct: 0,
            uniqueVisitors: 0,
          },
          criticalStock: res.lowStock?.products?.length > 0
            ? {
                productName: res.lowStock.products[0].name,
                unitsLeft: res.lowStock.products[0].stockQuantity,
                note: `Low stock alert (threshold: ${res.lowStock.threshold} units)`,
              }
            : {
                productName: "All Products In Stock",
                unitsLeft: 0,
                note: "Healthy inventory levels",
              },
          weeklySales: [],
          projectedNovember: 0,
          topProducts: (res.topSelling || []).map((product, index) => ({
            id: product.productId,
            name: product.name,
            unit: 'units',
            sold: product.unitsSold,
            marginPct: 40,
            revenue: product.revenue,
            stockLabel: 'Available',
            tone: index === 0 ? 'blue' : index === 1 ? 'cyan' : 'emerald',
            dot: index === 0 ? 'bg-[#0091FF]' : index === 1 ? 'bg-cyan-500' : 'bg-amber-400',
          })),
          traffic: {
            total: 0,
            channels: [],
            insight: 'Traffic analytics not yet implemented',
          },
          actions: [],
          nextReview: new Date().toISOString().split('T')[0],
        }

        setData(fallbackData)
      }
    } catch (e) {
      console.error('Analytics API error:', e)
      setError(e)
    } finally {
      setLoading(false)
    }
  }, [rangeKey])

  useEffect(() => { 
    load() 
  }, [load])

  return { data, loading, error, refresh: load }
}
