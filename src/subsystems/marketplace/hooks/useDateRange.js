import { useState, useCallback } from 'react'
import { daysInclusive } from '../utils/dates'

export function useDateRange(initial) {
  // initial = { start: Date, end: Date, compare: boolean, presetId: string }
  const [applied, setApplied] = useState(initial)
  return { applied, apply: setApplied }
}

export function useDraftRange(applied) {
  const [draft, setDraft] = useState(applied)
  const [viewMonth, setViewMonth] = useState(
    new Date(applied.start.getFullYear(), applied.start.getMonth(), 1)
  )

  const pickPreset = useCallback((p) => {
    setDraft((d) => ({ ...d, ...p.range, presetId: p.id }))
    setViewMonth(new Date(p.range.start.getFullYear(), p.range.start.getMonth(), 1))
  }, [])

  /** Two-click selection: first click sets start, second sets end (swapping if earlier). */
  const pickDay = useCallback((date) => {
    setDraft((d) => {
      if (!d.start || d.end) return { ...d, start: date, end: null, presetId: 'custom' }
      return date < d.start
        ? { ...d, start: date, end: d.start, presetId: 'custom' }
        : { ...d, end: date, presetId: 'custom' }
    })
  }, [])

  const days = draft.start && draft.end ? daysInclusive(draft.start, draft.end) : null
  return { draft, setDraft, viewMonth, setViewMonth, pickPreset, pickDay, days }
}
