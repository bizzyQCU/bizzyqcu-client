# Analytics Components

This directory contains all components for the BizzyQCU Seller Portal Reports & Analytics page.

## Components Overview

### PageHeader
Top section with title, description, and action buttons (Refresh, Date Range, Export CSV).

**Props:**
- `period` (string): Current date range label
- `onRefresh` (function): Callback for refresh button
- `onExport` (function): Callback for CSV export

---

### KpiCard
Individual metric card displaying a KPI with trend indicator.

**Props:**
- `label` (string): Card label (e.g., "Gross Revenue")
- `icon` (ReactNode): SVG icon element
- `iconClass` (string): Tailwind classes for icon container
- `value` (string): Main metric value
- `valueClass` (string): Tailwind classes for value text
- `delta` (number): Percentage change
- `deltaNote` (string): Description of delta (e.g., "vs last month")
- `footerLabel` (string): Footer metric label
- `footerValue` (string): Footer metric value

---

### KpiRow
Container for all four KPI cards (3 metric cards + 1 critical stock card).

**Props:**
- `kpis` (object): KPI metrics data
- `critical` (object): Critical stock alert data

---

### CriticalStockCard
Special alert card for low-stock warnings.

**Props:**
- `productName` (string): Name of product with low stock
- `unitsLeft` (number): Remaining units
- `note` (string): Additional context

---

### WeeklySalesChart
Pure CSS bar chart showing weekly sales trajectory.

**Props:**
- `weeks` (array): Weekly sales data `[{ id, label, tag, revenue }, ...]`
- `projected` (number): Projected revenue for next period

**Features:**
- Proportional bar heights
- Peak week highlighting
- Hover states
- Responsive grid lines

---

### TopRevenueDrivers
List of top-performing products with metrics.

**Props:**
- `products` (array): Product performance data
- `totalRevenue` (number): Total revenue for share calculation

**Features:**
- Color-coded status dots
- Stock status badges
- Combined top 3 share calculation

---

### TrafficChannels
Traffic attribution visualization with progress bars.

**Props:**
- `traffic` (object): Traffic data with channels array and insight

**Features:**
- Percentage calculations
- Animated progress bars
- Insight box with contextual information

---

### PriorityActions
Action items requiring attention with severity-based styling.

**Props:**
- `actions` (array): Action items `[{ id, severity, title, body, cta, to, variant }, ...]`
- `nextReview` (string): Next review date

**Features:**
- Severity styling (urgent/info)
- Actionable CTAs with routing
- Audit verified badge

---

## Usage Example

```jsx
import {
  PageHeader,
  KpiRow,
  WeeklySalesChart,
  TopRevenueDrivers,
  TrafficChannels,
  PriorityActions
} from '../components/analytics'

function AnalyticsPage() {
  return (
    <main className="p-8 max-w-7xl mx-auto w-full flex flex-col gap-8">
      <PageHeader period={data.period.label} onRefresh={refresh} onExport={exportCSV} />
      <KpiRow kpis={data.kpis} critical={data.criticalStock} />
      
      <section className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <WeeklySalesChart weeks={data.weeklySales} projected={data.projectedNovember} />
        <TopRevenueDrivers products={data.topProducts} totalRevenue={data.kpis.grossRevenue} />
      </section>
      
      <section className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <TrafficChannels traffic={data.traffic} />
        <PriorityActions actions={data.actions} nextReview={data.nextReview} />
      </section>
    </main>
  )
}
```

---

## Styling Guidelines

All components use Tailwind CSS with the following conventions:

- **Cards**: `bg-white p-6 rounded-xl border border-slate-200 shadow-sm`
- **Primary button**: `bg-[#0091FF] hover:bg-[#0284C7] text-white`
- **Secondary button**: `bg-white hover:bg-slate-50 text-slate-700 border border-slate-200`
- **Positive badge**: `bg-emerald-50 text-emerald-600`
- **Warning**: `bg-amber-50 text-amber-800 border-amber-200`
- **Info**: `bg-sky-50 text-sky-900 border-sky-200`

---

## Accessibility

All components follow accessibility best practices:

- Icon-only buttons have `aria-label` attributes
- Chart bars have `role="img"` with descriptive `aria-label`
- Semantic HTML structure (header, section, nav)
- Color is not the only indicator (text labels included)
- Keyboard navigation support via React Router Links

---

## Responsive Design

Components adapt to screen sizes:

- **Mobile (< 640px)**: Single column
- **Tablet (640px - 1024px)**: 2-column KPIs, stacked charts
- **Desktop (1024px+)**: 4-column KPIs, side-by-side charts

Grid classes:
- KPI Row: `grid-cols-1 sm:grid-cols-2 lg:grid-cols-4`
- Chart Row: `grid-cols-1 lg:grid-cols-12` (7/12 + 5/12 split)
- Bottom Row: `grid-cols-1 lg:grid-cols-2`

---

## Data Requirements

See `../../data/analyticsMock.js` for the complete data structure.

Key data shape:
```javascript
{
  period: { label, start, end },
  kpis: { grossRevenue, netRevenue, completedOrders, ... },
  criticalStock: { productName, unitsLeft, note },
  weeklySales: [{ id, label, tag, revenue }, ...],
  topProducts: [{ id, name, sold, revenue, ... }, ...],
  traffic: { total, channels: [...], insight },
  actions: [{ id, severity, title, body, cta, to }, ...]
}
```

---

## Performance Notes

- Pure CSS bar chart (no canvas/SVG rendering overhead)
- No external chart libraries required
- All calculations done in render (minimal overhead)
- Components are memoization-ready if needed

---

## Future Enhancements

Potential improvements:
1. Add Recharts for interactive tooltips and axes
2. Implement date range picker component
3. Add drill-down modals for detailed views
4. Real-time data updates via WebSocket
5. More export formats (PDF, Excel)
6. Filtering and sorting capabilities
