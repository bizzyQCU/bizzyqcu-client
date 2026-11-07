// Date range presets for analytics

import { startOfDay, addDays } from '../utils/dates'
import { terms, events } from './academicCalendar'

const startOfWeek = (t) => addDays(t, -t.getDay()) // Sunday-first, matches calendar

const monthRange = (t, offset = 0) => ({
  start: new Date(t.getFullYear(), t.getMonth() + offset, 1),
  end: new Date(t.getFullYear(), t.getMonth() + offset + 1, 0),
})

export const quickPresets = (today = startOfDay(new Date())) => [
  { 
    id: 'today', 
    label: 'Today', 
    range: { start: today, end: today } 
  },
  { 
    id: 'this-week', 
    label: 'This Week', 
    range: { start: startOfWeek(today), end: today } 
  },
  { 
    id: 'last-7', 
    label: 'Last 7 Days', 
    range: { start: addDays(today, -6), end: today } 
  },
  { 
    id: 'this-month', 
    label: `This Month (${today.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })})`, 
    range: monthRange(today) 
  },
  { 
    id: 'last-month', 
    label: `Last Month (${monthRange(today, -1).start.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })})`, 
    range: monthRange(today, -1) 
  },
]

export const academicPresets = [
  ...terms.map((t) => ({ 
    id: t.id, 
    label: t.label, 
    badge: 'Term', 
    tone: 'slate', 
    range: { start: t.start, end: t.end } 
  })),
  ...events.map((e) => ({ 
    id: e.id, 
    label: e.label, 
    badge: e.badge, 
    tone: e.tone, 
    range: { start: e.start, end: e.end } 
  })),
]
