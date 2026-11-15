# Analytics API Integration Checklist

This checklist will help you connect the analytics dashboard to your backend API.

---

## 📋 Pre-Integration

- [ ] Review mock data structure in `data/analyticsMock.js`
- [ ] Verify backend API endpoint is ready
- [ ] Confirm authentication mechanism (JWT, session, etc.)
- [ ] Check API response format matches expected structure
- [ ] Test API endpoint with Postman/Insomnia

---

## 🔌 Step 1: Update the Data Hook

**File:** `hooks/useAnalytics.js`

### Current Code (Mock)
```javascript
const load = useCallback(async () => {
  setLoading(true)
  try {
    await new Promise(r => setTimeout(r, 300))
    setData(analytics)
    setError(null)
  } catch (e) {
    setError(e)
  } finally {
    setLoading(false)
  }
}, [range])
```

### Replace With (Real API)
```javascript
const load = useCallback(async () => {
  setLoading(true)
  try {
    const response = await fetch(
      `${import.meta.env.VITE_API_URL}/api/seller/analytics?start=${range.start}&end=${range.end}`,
      {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${getAuthToken()}`, // Your auth method
          'Content-Type': 'application/json',
        },
        credentials: 'include', // If using cookies
      }
    )

    if (!response.ok) {
      throw new Error(`API Error: ${response.status}`)
    }

    const data = await response.json()
    setData(data)
    setError(null)
  } catch (e) {
    console.error('Failed to load analytics:', e)
    setError(e)
  } finally {
    setLoading(false)
  }
}, [range])
```

**Checklist:**
- [ ] Replace API URL with your backend endpoint
- [ ] Add authentication headers
- [ ] Handle credentials (cookies vs tokens)
- [ ] Add proper error messages
- [ ] Test with real auth token

---

## 🔐 Step 2: Authentication

You'll need to provide the auth token. Common approaches:

### Option A: Context/Provider
```javascript
import { useAuth } from '../../auth/AuthContext'

export function useAnalytics(range) {
  const { token } = useAuth()
  // Use token in fetch headers
}
```

### Option B: localStorage
```javascript
const token = localStorage.getItem('authToken')
```

### Option C: Cookies (handled automatically)
```javascript
credentials: 'include'
```

**Checklist:**
- [ ] Decide auth strategy
- [ ] Import/access auth token
- [ ] Add token to request headers
- [ ] Handle expired token case
- [ ] Redirect to login on 401

---

## 🌍 Step 3: Environment Variables

**File:** `.env` (create if doesn't exist)

```env
VITE_API_URL=http://localhost:3000
# or
VITE_API_URL=https://api.bizzyqcu.com
```

**Checklist:**
- [ ] Create `.env` file in project root
- [ ] Add API URL
- [ ] Add `.env` to `.gitignore`
- [ ] Create `.env.example` for team
- [ ] Update for production environment

---

## 📊 Step 4: Verify API Response Format

Your backend must return data matching this structure:

```typescript
interface AnalyticsResponse {
  org: {
    name: string
    location: string
  }
  period: {
    label: string
    start: string  // ISO date
    end: string    // ISO date
  }
  kpis: {
    grossRevenue: number
    netRevenue: number
    revenueChangePct: number
    completedOrders: number
    ordersChangePct: number
    avgOrderValue: number
    conversionRatePct: number
    conversionChangePct: number
    uniqueVisitors: number
  }
  criticalStock: {
    productName: string
    unitsLeft: number
    note: string
  }
  weeklySales: Array<{
    id: string
    label: string
    tag: string
    revenue: number
  }>
  projectedNovember: number
  topProducts: Array<{
    id: string
    name: string
    unit: string
    sold: number
    marginPct: number
    revenue: number
    stockLabel: string
    tone: 'amber' | 'blue' | 'emerald'
    dot: string  // Tailwind class
  }>
  traffic: {
    total: number
    channels: Array<{
      id: string
      label: string
      visits: number
      color: string  // Tailwind class
      dot: string    // Tailwind class
    }>
    insight: string
  }
  actions: Array<{
    id: string
    severity: 'urgent' | 'info'
    title: string
    body: string
    cta: string
    to: string
    variant: 'primary' | 'secondary'
  }>
  nextReview: string
}
```

**Checklist:**
- [ ] Backend returns all required fields
- [ ] Data types match (number, string, array)
- [ ] Tailwind class fields are complete strings
- [ ] Dates are in ISO 8601 format
- [ ] Numbers are not strings
- [ ] Arrays are never null/undefined

---

## 🧪 Step 5: Test Integration

### Test Cases

1. **Happy Path**
   - [ ] Load page with valid auth
   - [ ] All data displays correctly
   - [ ] Numbers format properly (currency, percentages)
   - [ ] Charts render with correct heights

2. **Error Cases**
   - [ ] Handle 401 (unauthorized) → redirect to login
   - [ ] Handle 403 (forbidden) → show error message
   - [ ] Handle 404 (not found) → show "no data" message
   - [ ] Handle 500 (server error) → show retry button
   - [ ] Handle network timeout → show retry button

3. **Edge Cases**
   - [ ] No sales data for period → show empty state
   - [ ] Zero revenue → displays ₱0.00
   - [ ] Single product → TopRevenueDrivers still renders
   - [ ] Missing criticalStock → KpiRow still renders

4. **Refresh Button**
   - [ ] Click refresh → loading state appears
   - [ ] New data loads correctly
   - [ ] Error handling works on refresh

5. **Date Range**
   - [ ] Change date range → new data loads
   - [ ] Invalid range → show error
   - [ ] Future dates → handle gracefully

---

## 📤 Step 6: CSV Export Integration

If you want server-generated CSV:

```javascript
const handleExport = async () => {
  try {
    const response = await fetch(
      `${import.meta.env.VITE_API_URL}/api/seller/analytics/export?start=${range.start}&end=${range.end}`,
      {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      }
    )
    
    const blob = await response.blob()
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `analytics-${range.start}-${range.end}.csv`
    link.click()
    URL.revokeObjectURL(url)
  } catch (e) {
    console.error('Export failed:', e)
  }
}
```

**Checklist:**
- [ ] Backend has export endpoint
- [ ] Returns proper CSV MIME type
- [ ] Includes all relevant data
- [ ] Filename includes date range
- [ ] Error handling in place

---

## 🔄 Step 7: Date Range Picker

To implement the date range picker:

1. Install a date picker library:
```bash
npm install react-datepicker
```

2. Update `PageHeader.jsx`:
```javascript
import DatePicker from 'react-datepicker'
import 'react-datepicker/dist/react-datepicker.css'

<DatePicker
  selectsRange
  startDate={startDate}
  endDate={endDate}
  onChange={(update) => setDateRange(update)}
  className="px-3.5 py-2 text-xs font-semibold..."
/>
```

3. Pass date change handler to parent component

**Checklist:**
- [ ] Date picker library installed
- [ ] CSS imported
- [ ] onChange handler wired up
- [ ] Date format matches API expectations
- [ ] Min/max date restrictions applied

---

## 🚨 Step 8: Error Handling

Add specific error messages:

```javascript
const getErrorMessage = (error) => {
  if (error.message.includes('401')) {
    return 'Session expired. Please log in again.'
  }
  if (error.message.includes('403')) {
    return 'You do not have permission to view analytics.'
  }
  if (error.message.includes('404')) {
    return 'No analytics data found for this period.'
  }
  if (error.message.includes('500')) {
    return 'Server error. Please try again later.'
  }
  return 'Failed to load analytics. Please check your connection.'
}
```

**Checklist:**
- [ ] User-friendly error messages
- [ ] Different messages for different errors
- [ ] Retry button on recoverable errors
- [ ] Log detailed errors to console
- [ ] Consider error monitoring service (Sentry, etc.)

---

## ⚡ Step 9: Performance Optimization

### Caching
```javascript
import { useEffect, useState, useCallback } from 'react'

const CACHE_KEY = 'analytics-cache'
const CACHE_DURATION = 5 * 60 * 1000 // 5 minutes

const getCachedData = () => {
  const cached = sessionStorage.getItem(CACHE_KEY)
  if (!cached) return null
  
  const { data, timestamp } = JSON.parse(cached)
  if (Date.now() - timestamp > CACHE_DURATION) return null
  
  return data
}

const setCachedData = (data) => {
  sessionStorage.setItem(CACHE_KEY, JSON.stringify({
    data,
    timestamp: Date.now()
  }))
}
```

**Checklist:**
- [ ] Cache data in sessionStorage
- [ ] Set reasonable cache duration
- [ ] Clear cache on logout
- [ ] Invalidate cache on refresh
- [ ] Consider React Query for advanced caching

---

## 🔔 Step 10: Real-time Updates (Optional)

For live data updates:

```javascript
useEffect(() => {
  const interval = setInterval(() => {
    load() // Refresh data
  }, 30000) // Every 30 seconds

  return () => clearInterval(interval)
}, [load])
```

Or use WebSockets:

```javascript
useEffect(() => {
  const ws = new WebSocket('wss://api.bizzyqcu.com/analytics')
  
  ws.onmessage = (event) => {
    const newData = JSON.parse(event.data)
    setData(newData)
  }
  
  return () => ws.close()
}, [])
```

**Checklist:**
- [ ] Decide on polling vs WebSocket
- [ ] Set appropriate refresh interval
- [ ] Clean up on component unmount
- [ ] Handle connection errors
- [ ] Consider user preference (enable/disable)

---

## 🧹 Step 11: Cleanup & Polish

**Remove Mock Data:**
- [ ] Keep `analyticsMock.js` for tests (rename to `analyticsMock.test.js`)
- [ ] Or delete entirely if not needed

**Update Documentation:**
- [ ] Update README with real API info
- [ ] Document required env variables
- [ ] Add deployment instructions
- [ ] Update component comments

**Code Quality:**
- [ ] Add TypeScript types (if using TS)
- [ ] Add PropTypes (if using JS)
- [ ] Write unit tests for components
- [ ] Write integration tests for API calls
- [ ] Run linter and fix issues

---

## ✅ Final Verification

### Before Deploy

- [ ] All mock data replaced with real API
- [ ] Authentication working correctly
- [ ] All error cases handled
- [ ] Loading states display properly
- [ ] CSV export functional
- [ ] Date range picker working
- [ ] Tested on multiple browsers
- [ ] Tested on mobile devices
- [ ] Tested with real data
- [ ] No console errors
- [ ] Performance is acceptable
- [ ] Accessibility verified
- [ ] Security review complete

### After Deploy

- [ ] Monitor error logs
- [ ] Check analytics API performance
- [ ] Verify data accuracy
- [ ] Get user feedback
- [ ] Track usage metrics
- [ ] Plan improvements

---

## 📞 Common Issues & Solutions

### Issue: "Failed to fetch"
- **Cause:** CORS policy blocking request
- **Solution:** Configure backend CORS headers
```javascript
// Backend (Express example)
app.use(cors({
  origin: 'http://localhost:5173',
  credentials: true
}))
```

### Issue: "Unauthorized"
- **Cause:** Missing or invalid auth token
- **Solution:** Check token storage and expiration
- Verify token is included in headers
- Implement token refresh logic

### Issue: Data not displaying
- **Cause:** Response format mismatch
- **Solution:** Log API response and compare with expected structure
- Add data validation before setting state

### Issue: Chart heights wrong
- **Cause:** Non-numeric revenue values
- **Solution:** Ensure backend sends numbers, not strings
```javascript
// Add validation
const revenue = Number(data.revenue) || 0
```

### Issue: Infinite loading
- **Cause:** API call failing silently
- **Solution:** Check network tab, add console.error in catch block

---

## 🎯 Quick Start Command

Once everything is configured:

```bash
# 1. Set environment variables
echo "VITE_API_URL=http://localhost:3000" > .env

# 2. Start dev server
npm run dev

# 3. Navigate to analytics
# http://localhost:5173/seller/analytics
```

---

## 📚 Additional Resources

- [Vite Environment Variables](https://vitejs.dev/guide/env-and-mode.html)
- [Fetch API Documentation](https://developer.mozilla.org/en-US/docs/Web/API/Fetch_API)
- [React Query (for advanced data fetching)](https://tanstack.com/query/latest)
- [Axios (alternative to fetch)](https://axios-http.com/)

---

**Need Help?**
- Check browser console for errors
- Review network requests in DevTools
- Verify backend API is running
- Test API endpoint with curl/Postman first
- Check this checklist again

---

**Status Tracking:**

Date Started: _______________  
Date Completed: _______________  
Deployed By: _______________  
Notes: _______________
