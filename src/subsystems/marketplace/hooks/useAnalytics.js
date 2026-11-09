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
      
      // Transform backend data to match the Analytics.jsx expected format
      const backendData = response.data
      
      // Calculate average order value
      const avgOrderValue = backendData.sales.completedOrders > 0 
        ? backendData.sales.totalRevenue / backendData.sales.completedOrders 
        : 0
      
      const transformedData = {
        org: {
          name: backendData.store.name,
          location: backendData.store.location || 'Store Location',
        },
        period: {
          label: `${range.start} – ${range.end}`,
          start: range.start,
          end: range.end,
        },
        kpis: {
          grossRevenue: backendData.sales.totalRevenue,
          netRevenue: backendData.sales.totalRevenue, // TODO: Calculate after expenses
          revenueChangePct: 0, // TODO: Implement historical comparison
          completedOrders: backendData.sales.completedOrders,
          ordersChangePct: 0, // TODO: Implement historical comparison
          avgOrderValue: parseFloat(avgOrderValue.toFixed(2)),
          conversionRatePct: 0, // TODO: Implement visitor tracking
          conversionChangePct: 0,
          uniqueVisitors: 0, // TODO: Implement visitor tracking
        },
        criticalStock: backendData.lowStock.products.length > 0
          ? {
              productName: backendData.lowStock.products[0].name,
              unitsLeft: backendData.lowStock.products[0].stockQuantity,
              note: `Low stock alert (threshold: ${backendData.lowStock.threshold} units)`,
            }
          : null,
        weeklySales: [], // TODO: Implement weekly aggregation in backend
        projectedNovember: 0, // TODO: Implement projection logic
        topProducts: backendData.topSelling.map((product, index) => ({
          id: product.productId,
          name: product.name,
          unit: 'units',
          sold: product.unitsSold,
          marginPct: 0, // TODO: Calculate margin from product data
          revenue: product.revenue,
          stockLabel: 'Available',
          tone: index === 0 ? 'blue' : index === 1 ? 'cyan' : 'emerald',
          dot: index === 0 ? 'bg-[#0091FF]' : index === 1 ? 'bg-cyan-500' : 'bg-amber-400'
        })),
        traffic: {
          total: 0, // TODO: Implement traffic tracking
          channels: [], // TODO: Implement channel attribution
          insight: 'Traffic analytics not yet implemented',
        },
        actions: [], // TODO: Implement action recommendations
        nextReview: new Date().toISOString().split('T')[0],
      }
      
      setData(transformedData)
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
