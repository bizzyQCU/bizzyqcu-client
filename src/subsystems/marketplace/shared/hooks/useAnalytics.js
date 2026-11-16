import { useEffect, useState, useCallback } from 'react'
import { getSellerAnalytics, getMyStore } from '../api'

const LOW_STOCK_THRESHOLD = 5

function formatBucketLabel(bucket, index) {
  if (!bucket) return `Period ${index + 1}`
  const d = new Date(bucket)
  if (Number.isNaN(d.getTime())) return String(bucket)
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
}

export function useAnalytics(range) {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const rangeKey = JSON.stringify(range)

  const load = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const [analyticsResult, storeResult] = await Promise.allSettled([
        getSellerAnalytics(range),
        getMyStore(),
      ])

      if (analyticsResult.status === 'rejected') {
        throw analyticsResult.reason
      }

      const response = analyticsResult.value
      const res = response?.data || response
      const store =
        storeResult.status === 'fulfilled'
          ? storeResult.value?.data || storeResult.value
          : null

      const orgName =
        res?.org?.name || store?.name || res?.store?.name || 'Organization Store'
      const orgLocation =
        res?.org?.location ||
        store?.pickupLocation ||
        res?.store?.pickupLocation ||
        'Campus Pickup Location'

      if (res?.kpis) {
        const criticalList = Array.isArray(res.criticalStock)
          ? res.criticalStock
          : Array.isArray(res.criticalStockList)
            ? res.criticalStockList
            : []

        const criticalStock =
          res.criticalStock && !Array.isArray(res.criticalStock)
            ? res.criticalStock
            : criticalList.length > 0
              ? {
                  isCritical: true,
                  productName: criticalList[0].name,
                  unitsLeft: criticalList[0].stockQuantity ?? 0,
                  note: `${criticalList.length} product(s) at or below ${LOW_STOCK_THRESHOLD} units`,
                }
              : {
                  isCritical: false,
                  productName: 'All Products In Stock',
                  unitsLeft: 0,
                  note: 'Healthy inventory levels',
                }

        const weeklySales =
          Array.isArray(res.weeklySales) && res.weeklySales.length > 0
            ? res.weeklySales
            : Array.isArray(res.chartSeries)
              ? res.chartSeries.map((point, index) => ({
                  id: String(point.bucket || `series-${index}`),
                  label: formatBucketLabel(point.bucket, index),
                  tag: `${Number(point.orderCount) || 0} orders`,
                  revenue: Number(point.revenue) || 0,
                }))
              : []

        const generatedActions = []
        if (criticalList.length > 0) {
          generatedActions.push({
            id: 'low-stock-action',
            severity: 'urgent',
            title: `Restock ${criticalList[0].name}`,
            body: `${criticalList[0].stockQuantity ?? 0} units remaining (${criticalList.length} low-stock item${criticalList.length === 1 ? '' : 's'}).`,
            cta: 'Manage Inventory',
            to: '/seller/org/inventory',
            variant: 'primary',
          })
        }
        if ((res.kpis.pendingOrders ?? 0) > 0) {
          generatedActions.push({
            id: 'pending-orders-action',
            severity: 'info',
            title: `${res.kpis.pendingOrders} Pending Order${res.kpis.pendingOrders === 1 ? '' : 's'}`,
            body: 'Review incoming student orders waiting for confirmation or fulfillment.',
            cta: 'Review Orders',
            to: '/seller/org/orders',
            variant: 'secondary',
          })
        }

        const totalRevenue =
          res.kpis.grossRevenue ?? res.kpis.totalRevenue ?? 0

        const transformedData = {
          org: { name: orgName, location: orgLocation },
          period: res.period || {
            label: `${range.start} – ${range.end}`,
            start: range.start,
            end: range.end,
          },
          kpis: {
            grossRevenue: totalRevenue,
            netRevenue: res.kpis.netRevenue ?? totalRevenue,
            revenueChangePct: res.kpis.revenueChangePct ?? 0,
            completedOrders: res.kpis.completedOrders ?? 0,
            ordersChangePct: res.kpis.ordersChangePct ?? 0,
            avgOrderValue:
              res.kpis.avgOrderValue ?? res.kpis.averageOrderValue ?? 0,
            conversionRatePct: res.kpis.conversionRatePct ?? 0,
            conversionChangePct: res.kpis.conversionChangePct ?? 0,
            uniqueVisitors: res.kpis.uniqueVisitors ?? 0,
            pendingOrders: res.kpis.pendingOrders ?? 0,
          },
          criticalStock,
          weeklySales,
          projectedNovember:
            res.projectedNovember ?? res.projectedRevenue ?? totalRevenue,
          topProducts: Array.isArray(res.topProducts)
            ? res.topProducts.map((product, index) => {
                const qty = product.stockQuantity
                const stockLabel =
                  product.stockLabel ||
                  (qty === undefined
                    ? 'Available'
                    : qty === 0
                      ? 'Out of stock'
                      : qty <= LOW_STOCK_THRESHOLD
                        ? `${qty} left (Low)`
                        : 'In stock')
                const tone =
                  product.tone ||
                  (qty !== undefined && qty <= LOW_STOCK_THRESHOLD
                    ? 'amber'
                    : index === 0
                      ? 'blue'
                      : 'emerald')

                return {
                  id: product.id || product.productId,
                  name: product.name,
                  unit: product.unit || 'units',
                  sold: product.sold ?? product.unitsSold ?? 0,
                  marginPct: product.marginPct ?? 40,
                  revenue: product.revenue ?? 0,
                  stockLabel,
                  tone,
                  dot:
                    product.dot ||
                    (index === 0
                      ? 'bg-[#0091FF]'
                      : index === 1
                        ? 'bg-cyan-500'
                        : 'bg-amber-400'),
                }
              })
            : [],
          traffic: res.traffic || {
            total: 0,
            channels: [],
            insight: 'No traffic channel data recorded for this period.',
          },
          actions:
            Array.isArray(res.actions) && res.actions.length > 0
              ? res.actions
              : generatedActions,
          nextReview: res.nextReview || new Date().toISOString().split('T')[0],
        }

        setData(transformedData)
      } else {
        const totalRevenue = res.sales?.totalRevenue ?? 0
        const completedOrders = res.sales?.completedOrders ?? 0
        const avgOrderValue =
          completedOrders > 0 ? totalRevenue / completedOrders : 0

        setData({
          org: { name: orgName, location: orgLocation },
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
          criticalStock:
            res.lowStock?.products?.length > 0
              ? {
                  isCritical: true,
                  productName: res.lowStock.products[0].name,
                  unitsLeft: res.lowStock.products[0].stockQuantity,
                  note: `Low stock alert (threshold: ${res.lowStock.threshold} units)`,
                }
              : {
                  isCritical: false,
                  productName: 'All Products In Stock',
                  unitsLeft: 0,
                  note: 'Healthy inventory levels',
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
            dot:
              index === 0
                ? 'bg-[#0091FF]'
                : index === 1
                  ? 'bg-cyan-500'
                  : 'bg-amber-400',
          })),
          traffic: {
            total: 0,
            channels: [],
            insight: 'No traffic channel data recorded for this period.',
          },
          actions: [],
          nextReview: new Date().toISOString().split('T')[0],
        })
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
