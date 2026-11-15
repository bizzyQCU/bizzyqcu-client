// Export dataset configurations

export const badgeTone = {
  emerald: 'bg-emerald-100 text-emerald-700 border border-emerald-200',
  blue: 'bg-blue-100 text-blue-700 border border-blue-200',
  amber: 'bg-amber-100 text-amber-800 border border-amber-300',
  slate: 'bg-slate-100 text-slate-600 border border-slate-200',
}

export const exportDatasets = [
  {
    id: 'sales',
    title: 'Sales Summary & Revenue',
    description: 'Gross revenue, net earnings, average order value, payment status',
    badge: { text: 'Recommended', tone: 'emerald' },
    defaultChecked: true,
    columns: ['Week', 'Event', 'Gross Revenue (PHP)'],
    sumColumns: ['Gross Revenue (PHP)'],
    toRows: (data) => data.weeklySales.map((w) => [w.label, w.tag, w.revenue]),
  },
  {
    id: 'orders',
    title: 'Order Transactions & Line Items',
    description: 'Student buyer names, student ID tags, items ordered, order dates, timestamps',
    badge: { text: (data) => `${data.kpis.completedOrders} Orders`, tone: 'blue' },
    defaultChecked: true,
    sensitive: true,
    columns: ['Order ID', 'Buyer Name', 'Item', 'Qty', 'Unit Price (PHP)', 'Line Total (PHP)', 'Status'],
    sumColumns: ['Qty', 'Line Total (PHP)'],
    toRows: (data) => {
      // Mock order data - replace with actual orders API data
      return Array.from({ length: data.kpis.completedOrders }, (_, i) => [
        `ORD-${String(i + 1).padStart(4, '0')}`,
        `Student ${i + 1}`,
        'Sample Product',
        1,
        411.4,
        411.4,
        'Completed'
      ])
    },
  },
  {
    id: 'inventory',
    title: 'Product Inventory & Stock Velocity',
    description: 'SKU codes, stock levels, velocity metrics, safety thresholds',
    badge: { text: 'Stock Alerts', tone: 'amber' },
    defaultChecked: true,
    columns: ['Product', 'Units Sold', 'Margin %', 'Revenue (PHP)', 'Stock Status'],
    sumColumns: ['Units Sold', 'Revenue (PHP)'],
    toRows: (data) => data.topProducts.map((p) => [p.name, p.sold, p.marginPct, p.revenue, p.stockLabel]),
  },
  {
    id: 'traffic',
    title: 'Buyer Traffic & Acquisition Channels',
    description: 'Campus QR codes, student org social links, booth walk-ins',
    badge: { text: 'Analytics Only', tone: 'slate' },
    defaultChecked: false,
    columns: ['Channel', 'Visits', 'Share %'],
    sumColumns: ['Visits'],
    toRows: (data) =>
      data.traffic.channels.map((c) => [c.label, c.visits, +((c.visits / data.traffic.total) * 100).toFixed(1)]),
  },
]
