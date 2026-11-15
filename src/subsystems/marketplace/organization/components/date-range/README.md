# Date Range Picker Components

Modal-based date range picker for the BizzyQCU Seller Portal analytics page.

## Components

### DateRangeModal
Main modal component that orchestrates the date selection experience.

**Props:**
- `open` (boolean): Whether the modal is visible
- `applied` (object): Current applied date range `{ start: Date, end: Date, compare: boolean, presetId: string }`
- `onApply` (function): Callback when user applies the date filter
- `onClose` (function): Callback to close the modal

**Features:**
- Two-pane layout: presets (left) and calendar (right)
- Escape key to close
- Click backdrop to close
- Body scroll lock while open
- Live range summary in footer
- Event overlap detection

---

### PresetList
Left pane showing quick presets and academic calendar events.

**Props:**
- `activeId` (string): Currently active preset ID
- `onPick` (function): Callback when preset is clicked
- `onCustom` (function): Callback when "Custom Range..." is clicked
- `today` (Date): Reference date for relative presets

**Presets:**
- Today
- This Week
- Last 7 Days
- This Month
- Last Month
- 1st Semester AY 2024-2025
- Tech Summit (Oct 22-28)
- Midterm Exam Period (Nov 6-12)
- Custom Range...

---

### RangeCalendar
Interactive month calendar with date range selection.

**Props:**
- `viewMonth` (Date): Month to display
- `onMonthChange` (function): Callback to change month
- `start` (Date): Range start date
- `end` (Date): Range end date
- `onPick` (function): Callback when day is clicked
- `events` (array): Campus events to highlight
- `boothHours` (string): Booth operating hours

**Features:**
- Two-click selection: first click sets start, second sets end
- Automatic swap if second date is earlier
- Range highlighting with rounded corners at week boundaries
- Event indicators (amber dots)
- Month navigation (previous/next)
- Sunday-first week layout

---

### DateField
Read-only date input field with label and optional badge.

**Props:**
- `label` (string): Field label
- `dotClass` (string): Tailwind class for color dot
- `value` (Date): Selected date
- `active` (boolean): Whether field is active/focused
- `badge` (string): Optional badge text (e.g., "31 days selected")

---

## Data Files

### academicCalendar.js
- Academic terms (semesters)
- Campus events (Tech Summit, Midterm exams)
- Booth operating hours

### datePresets.js
- Quick presets generator (Today, This Week, etc.)
- Academic presets (terms + events)

---

## Utilities

### dates.js
Date manipulation utilities:

- `startOfDay(date)` - Normalize to midnight
- `addDays(date, n)` - Add/subtract days
- `isSameDay(a, b)` - Compare dates
- `isBetween(date, start, end)` - Check if date is in range
- `daysInclusive(start, end)` - Count days in range (inclusive)
- `fmt(date)` - Format as "Oct 1, 2024"
- `fmtRange(start, end)` - Format range "Oct 1 – Oct 31, 2024"
- `monthLabel(date)` - Format as "October 2024"
- `previousPeriod(start, end)` - Calculate equal-length previous period
- `buildMonthGrid(year, month)` - Generate calendar grid with padding

---

## Hooks

### useDateRange
Manages applied date range state (what the page uses).

```javascript
const { applied, apply } = useDateRange(initialRange)
```

### useDraftRange
Manages draft state inside the modal (what user is editing).

```javascript
const { 
  draft, 
  setDraft, 
  viewMonth, 
  setViewMonth, 
  pickPreset, 
  pickDay, 
  days 
} = useDraftRange(applied)
```

---

## Usage Example

```jsx
import { useState } from 'react'
import { useDateRange } from '../hooks/useDateRange'
import { fmtRange } from '../utils/dates'
import DateRangeModal from '../components/date-range/DateRangeModal'

function AnalyticsPage() {
  const { applied, apply } = useDateRange({
    start: new Date(2024, 9, 1),
    end: new Date(2024, 9, 31),
    compare: true,
    presetId: 'this-month',
  })
  
  const [modalOpen, setModalOpen] = useState(false)

  return (
    <main>
      <button onClick={() => setModalOpen(true)}>
        {fmtRange(applied.start, applied.end)}
      </button>

      {modalOpen && (
        <DateRangeModal
          open
          applied={applied}
          onApply={apply}
          onClose={() => setModalOpen(false)}
        />
      )}
    </main>
  )
}
```

---

## Behavior

### Selection Flow
1. User clicks date button in page header
2. Modal opens showing current range
3. User can:
   - Click a preset (instant selection)
   - Click calendar days (two-click: start, then end)
   - Toggle "Compare to previous period"
4. Footer shows live summary
5. Click "Apply Date Filter" to commit
6. Modal closes and page refreshes with new data

### Two-Click Calendar Selection
- **First click:** Sets start date, clears end date
- **Second click:** Sets end date
- **Earlier date:** Automatically swaps (becomes new start)
- **Manual edit:** Switches active preset to "Custom Range..."

### Compare Mode
When enabled, calculates equal-length period immediately before selected range:
- Selected: Oct 1-31 (31 days)
- Previous: Aug 31 - Sep 30 (31 days)

---

## Styling

Uses Tailwind CSS with custom colors:
- Primary: `#0091FF` (sky blue)
- Range highlight: `sky-100`
- Start/end dates: `#0091FF` background
- Event indicators: `amber-500` dots
- Active preset: Sky blue background with border

---

## Accessibility

- ✅ `role="dialog"` and `aria-modal="true"`
- ✅ `aria-labelledby` for modal title
- ✅ `aria-haspopup="dialog"` on trigger button
- ✅ Escape key closes modal
- ✅ Focus management (auto-focus on open)
- ✅ Body scroll lock while open
- ✅ Full date `aria-label` on calendar days
- ✅ `aria-pressed` on selected dates
- 🔄 **TODO:** Focus trap inside modal
- 🔄 **TODO:** Arrow key navigation in calendar

---

## Known Limitations

1. **No keyboard navigation** in calendar (arrow keys)
2. **No focus trap** (Tab can escape modal)
3. **Mobile optimization** needs improvement
4. **Time zone handling** uses local time only
5. **No URL persistence** (refresh loses selection)

---

## Future Enhancements

- [ ] Arrow key navigation (←→↑↓) in calendar
- [ ] Focus trap with Tab/Shift+Tab
- [ ] Mobile-responsive improvements
- [ ] URL parameter sync (`?from=2024-10-01&to=2024-10-31`)
- [ ] Preset favorites/bookmarks
- [ ] Custom event creation
- [ ] Multi-range selection
- [ ] Keyboard shortcuts (T for today, W for this week, etc.)
