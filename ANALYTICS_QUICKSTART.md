# 🚀 Analytics Quick Start

## Access the Page

Navigate to: **`http://localhost:5173/seller/analytics`**

(Or your dev server URL)

---

## ✅ What's Included

### Layout
- ✅ Sidebar with navigation
- ✅ Top bar with org info
- ✅ All analytics widgets

### Features
- ✅ 4 KPI cards (Revenue, Orders, Conversion, Stock Alert)
- ✅ Weekly sales chart (pure CSS)
- ✅ Top revenue drivers list
- ✅ Traffic channels breakdown
- ✅ Priority actions panel
- ✅ Refresh button
- ✅ CSV export

### Navigation
- All sidebar links work
- Active page highlights automatically
- Placeholder pages for other sections

---

## 📂 Key Files

| File | Purpose |
|------|---------|
| `pages/SellerAnalytics.jsx` | Main analytics page |
| `components/SellerSidebar.jsx` | Left navigation |
| `components/SellerTopBar.jsx` | Top bar |
| `components/analytics/*` | All analytics widgets |
| `data/analyticsMock.js` | Sample data |
| `hooks/useAnalytics.js` | Data fetching |

---

## 🔧 To Connect Real API

1. Open `src/subsystems/marketplace/hooks/useAnalytics.js`
2. Replace this:
```javascript
await new Promise(r => setTimeout(r, 300))
setData(analytics)
```
3. With your API:
```javascript
const response = await fetch('/api/analytics?start=...&end=...')
const data = await response.json()
setData(data)
```

See `INTEGRATION_CHECKLIST.md` for full details.

---

## 🎨 Customization

### Change Organization Name
Edit `components/SellerTopBar.jsx`:
```javascript
<h2>QCU Computer Society (QCS)</h2>  // Change this
```

### Change Logo
Edit `components/SellerSidebar.jsx`:
```jsx
<div className="...">B</div>  // Replace "B" with your logo
```

### Modify Colors
All colors use Tailwind classes. Main accent: `#0284C7`

---

## 🧪 Quick Test

1. Start dev server: `npm run dev`
2. Navigate to `/seller/analytics`
3. Check sidebar appears
4. Click "Refresh" button
5. Click "Export CSV" button
6. Try sidebar navigation

All should work! 🎉

---

## 📚 Full Documentation

- **Complete Guide:** `ANALYTICS_GUIDE.md`
- **API Integration:** `INTEGRATION_CHECKLIST.md`
- **Component Docs:** `src/subsystems/marketplace/components/analytics/README.md`

---

## 🆘 Troubleshooting

**Sidebar not showing?**
- Check you're on `/seller/analytics` route
- Look for console errors

**Data not loading?**
- Check `useAnalytics` hook is being called
- Verify mock data exists in `data/analyticsMock.js`

**Styles broken?**
- Ensure Tailwind is configured
- Check `index.css` imports Tailwind

**Navigation not working?**
- Verify React Router is configured
- Check `routes/index.jsx` for route definitions

---

## ✨ Status: READY TO USE

Everything is implemented and working with mock data.

Just connect your API and you're production-ready! 🚀
