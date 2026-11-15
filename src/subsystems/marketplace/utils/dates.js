// Date utilities for analytics date range picker

export const startOfDay = (d) => new Date(d.getFullYear(), d.getMonth(), d.getDate())

export const addDays = (d, n) => startOfDay(new Date(d.getFullYear(), d.getMonth(), d.getDate() + n))

export const isSameDay = (a, b) => !!a && !!b && a.getTime() === b.getTime()

export const isBetween = (d, a, b) => !!a && !!b && d >= a && d <= b

/** Inclusive day count: Oct 1 → Oct 31 = 31 */
export const daysInclusive = (a, b) => Math.round((startOfDay(b) - startOfDay(a)) / 86400000) + 1

export const fmt = (d) =>
  d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) // "Oct 1, 2024"

export const fmtRange = (a, b) => `${fmt(a)} – ${fmt(b)}`

export const monthLabel = (d) =>
  d.toLocaleDateString('en-US', { month: 'long', year: 'numeric' }) // "October 2024"

/** Equal-length period immediately before [start, end] */
export function previousPeriod(start, end) {
  const len = daysInclusive(start, end)
  const prevEnd = addDays(start, -1)
  const prevStart = addDays(prevEnd, -(len - 1))
  return { start: prevStart, end: prevEnd }
}

/** Cells for a Sunday-first month grid, padded with adjacent-month days. */
export function buildMonthGrid(year, month) {
  const first = new Date(year, month, 1)
  const lead = first.getDay()
  const total = Math.ceil((lead + new Date(year, month + 1, 0).getDate()) / 7) * 7
  return Array.from({ length: total }, (_, i) => {
    const date = new Date(year, month, 1 - lead + i)
    return { date, inMonth: date.getMonth() === month }
  })
}


export const toISODate = (d) =>
  `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
