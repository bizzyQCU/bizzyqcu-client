# BizzyQCU Analytics Feature Guide

## 📍 Quick Start

### Access the Analytics Page
Navigate to: **`/seller/analytics`**

The analytics page is now fully integrated into the BizzyQCU seller portal.

---

## 🗂️ Project Structure

```
src/subsystems/marketplace/
│
├── components/
│   └── analytics/               # All analytics UI components
│       ├── index.js             # Barrel export for clean imports
│       ├── README.md            # Component documentation
│       ├── PageHeader.jsx       # Top header with actions
│       ├── KpiCard.jsx          # Individual KPI card
│       ├── KpiRow.jsx           # Row of 4 KPI cards
│       ├── CriticalStockCard.jsx # Stock alert card
│       ├── WeeklySalesChart.jsx  # CSS bar chart
│       ├── TopRevenueDrivers.jsx # Product performance
│       ├── TrafficChannels.jsx   # Traffic attribution
│       └── PriorityActions.jsx   # Action items
│
├── data/
│   └── analyticsMock.js         # Mock data (replace with API)
│
├── hooks/
│   └── useAnalytics.js          # Data fetching hook
│
├── pages/
│   └── SellerAnalytics.jsx      # Main analytics page
│
└── utils/
    └── format.js                # Formatting helpers (peso, pct)
```

---

## 🚀 Features Implemented

### 1. Executive Dashboard
- **KPI Cards**: Revenue, Orders, Conversion Rate, Critical Stock
- **Weekly Sales Chart**: Visual bar chart with peak highlighting
- **Top Products**: Revenue drivers with margins and stock status
- **Traffic Attribution**: Channel breakdown with percentages
- **Priority Actions**: Urgent items requiring attention

### 2. Functional Features
- ✅ **Refresh Data**: Click refresh to reload analytics
- ✅ **Export CSV**: Download current data as CSV file
- ✅ **Date Range Picker**: Modal with presets and calendar ← NEW
- ✅ **Loading States**: Spinner while data loads
- ✅ **Error Handling**: Error message with retry option
- ✅ **Responsive Design**: Mobile, tablet, desktop layouts

### Date Range Features (NEW)
- ✅ **Quick Presets**: Today, This Week, Last 7 Days, This Month, Last Month
- ✅ **Academic Presets**: Semester terms, Tech Summit, Midterm exams
- ✅ **Interactive Calendar**: Two-click date selection with range highlighting
- ✅ **Compare Mode**: Toggle to compare with previous equal-length period
- ✅ **Event Indicators**: Campus events marked on calendar
- ✅ **Live Summary**: Real-time feedback on selected range

### 3. Interactive Elements
- Hover effects on chart bars
- Clickable action buttons route to relevant pages
- Restock links navigate to inventory page
- Product links navigate to products page

---

## 🎨 Design System

### Colors
| Color | Hex | Usage |
|-------|-----|-------|
| Accent | `#0091FF` | Primary actions, highlights |
| Accent Hover | `#0284C7` | Button hover states |
| Emerald | `emerald-*` | Positive trends, success |
| Amber | `amber-*` | Warnings, alerts |
| Slate | `slate-*` | Text, borders, backgrounds |

### Typography
- Font: System default (Plus Jakarta Sans from theme)
- Weights: 400 (normal), 500 (medium), 600 (semibold), 700 (bold)

### Spacing
- Page padding: `p-8`
- Card gap: `gap-6`
- Component gap: `gap-8`
- Max width: `max-w-7xl`

---

## 🔌 API Integration

### Current State (Mock Data)
The page currently uses mock data from `analyticsMock.js`.

### Connecting Real API

Edit `src/subsystems/marketplace/hooks/useAnalytics.js`:

```javascript
const load = useCallback(async () => {
  setLoading(true)
  try {
    // Replace this mock:
    // await new Promise(r => setTimeout(r, 300))
    // setData(analytics)
    
    // With your actual API:
    const response = await fetch(`/api/analytics?start=${range.start}&end=${range.end}`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    })
    
    if (!response.ok) throw new Error('Failed to fetch analytics')
    
    const data = await response.json()
    setData(data)
    setError(null)
  } catch (e) {
    setError(e)
  } finally {
    setLoading(false)
  }
}, [range])
```

### Expected API Response Format
```json
{
  "org": {
    "name": "QCU Computer Society (QCS)",
    "location": "AWS IK Building, Basement, Booth No. 3"
  },
  "period": {
    "label": "Oct 1 – Oct 31, 2024",
    "start": "2024-10-01",
    "end": "2024-10-31"
  },
  "kpis": {
    "grossRevenue": 58420,
    "netRevenue": 52150,
    "revenueChangePct": 14.2,
    "completedOrders": 142,
    "ordersChangePct": 8.5,
    "avgOrderValue": 411.4,
    "conversionRatePct": 7.7,
    "conversionChangePct": 0.8,
    "uniqueVisitors": 1840
  },
  "criticalStock": {
    "productName": "QCU CCS Official Org Hoodie",
    "unitsLeft": 8,
    "note": "High velocity line"
  },
  "weeklySales": [
    { "id": "w1", "label": "W1 (Oct 1-7)", "tag": "Enrollment", "revenue": 11400 }
  ],
  "projectedNovember": 62000,
  "topProducts": [
    {
      "id": "hoodie",
      "name": "QCU CCS Official Org Hoodie",
      "unit": "units",
      "sold": 54,
      "marginPct": 42.5,
      "revenue": 35100,
      "stockLabel": "8 left (Low)",
      "tone": "amber",
      "dot": "bg-[#0091FF]"
    }
  ],
  "traffic": {
    "total": 1840,
    "channels": [
      {
        "id": "qr",
        "label": "Campus QR Codes (Flyers & Booths)",
        "visits": 846,
        "color": "bg-[#0091FF]",
        "dot": "bg-[#0091FF]"
      }
    ],
    "insight": "Physical QR posters placed at IK Building basement & lobby."
  },
  "actions": [
    {
      "id": "restock",
      "severity": "urgent",
      "title": "Hoodie Re-order Required",
      "body": "Only 8 units in stock. Estimated stockout in 48 hours.",
      "cta": "Order Restock",
      "to": "/inventory",
      "variant": "primary"
    }
  ],
  "nextReview": "Nov 4, 2024"
}
```

---

## 🧪 Testing

### Manual Testing Checklist

1. **Load Page**
   - [ ] Navigate to `/seller/analytics`
   - [ ] Page loads without errors
   - [ ] All components render correctly

2. **Refresh Button**
   - [ ] Click refresh button
   - [ ] Loading state appears
   - [ ] Data reloads

3. **Export CSV**
   - [ ] Click "Export CSV" button
   - [ ] CSV file downloads
   - [ ] File contains correct data

4. **Responsive Design**
   - [ ] Test on mobile (< 640px)
   - [ ] Test on tablet (640px - 1024px)
   - [ ] Test on desktop (> 1024px)

5. **Navigation**
   - [ ] Click "Order Restock" → goes to inventory
   - [ ] Click "Manage Batch" → goes to orders
   - [ ] Click "View All Products" → goes to products

6. **Error Handling**
   - [ ] Simulate API failure
   - [ ] Error message displays
   - [ ] Retry button works

---

## 🎯 Routes

| Route | Component | Description |
|-------|-----------|-------------|
| `/seller/dashboard` | `SellerPlaceholder` | Dashboard overview (coming soon) |
| `/seller/products` | `SellerPlaceholder` | Products management (coming soon) |
| `/seller/inventory` | `SellerPlaceholder` | Inventory management (coming soon) |
| `/seller/analytics` | `SellerAnalytics` | Main analytics dashboard ✅ |
| `/seller/orders` | `SellerOrders` | Orders management ✅ |
| `/seller/messages` | `SellerMessages` | Messaging interface ✅ |
| `/seller/settings` | `SellerPlaceholder` | Account settings (coming soon) |

---

## 🛠️ Customization

### Adding New Metrics

1. Add data to `analyticsMock.js`
2. Create new component in `components/analytics/`
3. Import and place in `SellerAnalytics.jsx`

### Changing Colors

Edit Tailwind classes in components:
- Primary: `bg-[#0091FF]` → `bg-[YOUR_COLOR]`
- Ensure consistency across all components

### Modifying Layout

Edit grid classes in `SellerAnalytics.jsx`:
```jsx
// Current: 7/12 + 5/12 split
<section className="grid grid-cols-1 lg:grid-cols-12 gap-6">
  <WeeklySalesChart /> {/* lg:col-span-7 */}
  <TopRevenueDrivers /> {/* lg:col-span-5 */}
</section>

// Change to: 8/12 + 4/12 split
<WeeklySalesChart /> {/* lg:col-span-8 */}
<TopRevenueDrivers /> {/* lg:col-span-4 */}
```

---

## 📊 Data Calculations

### Conversion Rate
```
conversionRate = (completedOrders / uniqueVisitors) × 100
```

### Average Order Value
```
avgOrderValue = grossRevenue / completedOrders
```

### Top 3 Share
```
top3Share = (sum of top 3 products revenue / totalRevenue) × 100
```

### Channel Percentage
```
channelPct = (channelVisits / totalVisits) × 100
```

---

## 🐛 Troubleshooting

### Page Not Loading
- Check console for errors
- Verify route is registered in `routes/index.jsx`
- Ensure all imports are correct

### Styles Not Applied
- Check Tailwind config includes JSX files
- Verify class names are complete strings
- Run build to regenerate CSS

### Data Not Displaying
- Check `useAnalytics` hook is fetching data
- Verify data structure matches expected format
- Check browser console for errors

### CSV Export Not Working
- Check browser allows downloads
- Verify data is loaded before export
- Check console for errors

---

## 📝 Future Enhancements

### Short Term
- [ ] Implement date range picker
- [ ] Add real-time data refresh (polling/WebSocket)
- [ ] Add PDF export option
- [ ] Implement filters (category, date, product)

### Long Term
- [ ] Interactive chart library (Recharts/Chart.js)
- [ ] Drill-down modals for detailed views
- [ ] Comparison views (period over period)
- [ ] Custom dashboard builder
- [ ] Scheduled email reports

---

## 📚 Additional Resources

- [Tailwind CSS Documentation](https://tailwindcss.com)
- [React Router Documentation](https://reactrouter.com)
- [Vite Documentation](https://vitejs.dev)

---

## 🤝 Contributing

When adding new analytics features:
1. Follow existing component patterns
2. Update `analyticsMock.js` with sample data
3. Document props and usage
4. Test responsive behavior
5. Ensure accessibility standards

---

## ✅ Implementation Checklist

- [x] All components created
- [x] Mock data structure defined
- [x] Routing configured
- [x] Layout integration complete
- [x] Formatting utilities added
- [x] Data fetching hook implemented
- [x] Loading states handled
- [x] Error handling implemented
- [x] CSV export functional
- [x] Responsive design implemented
- [x] Documentation complete

**Status: ✅ READY FOR USE**

Replace mock data with real API and you're production-ready!
