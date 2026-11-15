# 📅 Date Range Modal - Quick Guide

## Access

Navigate to `/seller/analytics` and click the date button in the page header.

Currently shows: **"Oct 1 – Oct 31, 2024"**

---

## What's New

✅ **Fully functional date range picker modal**  
✅ **Quick presets** (Today, This Week, This Month, etc.)  
✅ **Academic calendar integration** (Terms, Tech Summit, Midterms)  
✅ **Interactive calendar** with two-click selection  
✅ **Compare mode** for period-over-period analysis  
✅ **Event indicators** on calendar dates  

---

## How to Use

### Open Modal
Click the date button in the analytics page header.

### Select a Date Range

**Option 1: Use a Preset**
- Click any preset from the left panel
- Range is selected instantly
- Calendar jumps to that month

**Option 2: Click Calendar Days**
1. Click first date → sets start
2. Click second date → sets end
3. (If second is earlier, automatically swaps)

**Option 3: Try Tech Summit**
- Click "Tech Summit" preset
- Selects Oct 22-28, 2024
- See amber dots on those dates in calendar

### Compare with Previous Period
- Toggle "Compare to previous period" checkbox
- See the equal-length comparison range below
- Example: Oct 1-31 (31 days) → compares to Aug 31 - Sep 30 (31 days)

### Apply or Cancel
- **Apply Date Filter**: Commits selection, closes modal, refreshes data
- **Cancel**: Discards changes, keeps previous selection
- **Escape key**: Same as Cancel
- **Click outside**: Same as Cancel

---

## Quick Presets Available

### Quick
- **Today** - Current day only
- **This Week** - Sunday to today
- **Last 7 Days** - Rolling 7-day window
- **This Month** - October 2024 (full month)
- **Last Month** - September 2024 (full month)

### Academic
- **1st Semester AY 2024–2025** - Full term (Aug-Dec)
- **Tech Summit** - Oct 22-28, 2024
- **Midterm Exam Period** - Nov 6-12, 2024
- **Custom Range...** - Manual calendar selection

---

## Calendar Features

### Selection Behavior
- **Blue background** = dates in range
- **White with blue ring** = start/end dates
- **Rounded corners** = at week boundaries for visual clarity
- **Amber dots** = campus events (Tech Summit, Midterms)

### Navigation
- **‹ › arrows** - Previous/next month
- **Grayed dates** - Adjacent month (not selectable)
- **Bold dates** - Event dates

### Footer Info
- Event badge: "Oct 22–28: Tech Summit"
- Booth hours: "8:00 AM – 6:00 PM"

---

## Files & Components

### Main Components
- `DateRangeModal.jsx` - Main modal container
- `PresetList.jsx` - Left panel with presets
- `RangeCalendar.jsx` - Interactive calendar
- `DateField.jsx` - Date input displays

### Data Files
- `academicCalendar.js` - Terms & events
- `datePresets.js` - Quick preset definitions

### Utilities
- `dates.js` - Date manipulation functions
- `useDateRange.js` - State management hook

---

## Customization

### Add New Academic Event

Edit `src/subsystems/marketplace/data/academicCalendar.js`:

```javascript
export const events = [
  // Existing events...
  { 
    id: 'finals', 
    label: 'Finals Week', 
    start: new Date(2024, 11, 15),  // Dec 15
    end: new Date(2024, 11, 20),    // Dec 20
    badge: 'Dec 15–20', 
    tone: 'indigo'  // or 'amber', 'slate'
  },
]
```

### Change Demo Date

Edit `DateRangeModal.jsx`, line with `today={...}`:

```javascript
// Current (frozen October):
today={new Date(2024, 9, 31)}

// Change to live date:
today={new Date()}
```

---

## Technical Details

### State Flow
```
useDateRange
  ↓
  applied state (what page uses)
  ↓
  modal opens → useDraftRange
  ↓
  draft state (what user edits)
  ↓
  user clicks Apply → onApply(draft)
  ↓
  applied state updates → page refreshes
```

### Date Format
All dates use JavaScript `Date` objects normalized to midnight:
- Internal: `new Date(2024, 9, 1)` (Oct 1, 2024 at 00:00:00)
- Display: `"Oct 1, 2024"`
- Range: `"Oct 1 – Oct 31, 2024"`

### Compare Calculation
Equal-length period immediately before selection:
```
Selected: Oct 1-31 (31 days)
Previous: Aug 31 - Sep 30 (31 days)
          ↑ ends day before start
          ↑ same length as selected
```

---

## Keyboard Shortcuts

### Currently Working
- **Escape** - Close modal
- **Tab** - Navigate between elements
- **Enter** - Apply (when Apply button focused)
- **Space** - Toggle compare checkbox

### Coming Soon
- **Arrow keys** - Navigate calendar dates
- **T** - Today preset
- **W** - This Week preset
- **M** - This Month preset

---

## Troubleshooting

### Modal doesn't open
- Check console for errors
- Verify date button has onClick handler
- Check modalOpen state is toggling

### Presets don't work
- Verify `academicCalendar.js` dates are valid
- Check `datePresets.js` is importing correctly
- Look for date format issues (month is 0-indexed)

### Calendar looks wrong
- October 2024 starts on Tuesday (the 1st)
- Week starts on Sunday (US format)
- Should have 5 weeks of visible days

### Compare period calculation wrong
- Should be equal length (31 days → 31 days)
- Should end the day before start
- Aug 31 - Sep 30 is correct for Oct 1-31

---

## Future Enhancements

Planned improvements:
- [ ] Focus trap inside modal
- [ ] Arrow key calendar navigation
- [ ] URL persistence (`?from=...&to=...`)
- [ ] Mobile swipe gestures
- [ ] Preset favorites
- [ ] Multi-range comparison
- [ ] Export date settings

---

## 🎯 Try It Now!

1. Go to `/seller/analytics`
2. Click the date button showing "Oct 1 – Oct 31, 2024"
3. Modal opens with calendar and presets
4. Click "Tech Summit" preset
5. See Oct 22-28 selected with amber event dots
6. Toggle "Compare to previous period"
7. Click "Apply Date Filter"
8. Page refreshes (mock data doesn't change yet)

---

## 📚 More Info

- **Full Documentation:** `components/date-range/README.md`
- **Date Utilities:** `utils/dates.js`
- **Academic Calendar:** `data/academicCalendar.js`
- **Analytics Guide:** `ANALYTICS_GUIDE.md`

---

**Status: ✅ Fully Implemented & Working**

The date range modal is production-ready!
