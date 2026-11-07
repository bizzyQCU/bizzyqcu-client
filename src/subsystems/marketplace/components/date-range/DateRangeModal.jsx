import { useEffect, useRef } from 'react'
import { useDraftRange } from '../../hooks/useDateRange'
import { useScrollLock } from '../../hooks/useScrollLock'
import { fmtRange, monthLabel, previousPeriod, fmt } from '../../utils/dates'
import { events, boothHours } from '../../data/academicCalendar'
import PresetList from './PresetList'
import RangeCalendar from './RangeCalendar'
import DateField from './DateField'

export default function DateRangeModal({ open, applied, onApply, onClose }) {
  const { draft, setDraft, viewMonth, setViewMonth, pickPreset, pickDay, days } = useDraftRange(applied)
  const dialogRef = useRef(null)

  // Use scroll lock hook
  useScrollLock(open)

  // Esc to close + focus management
  useEffect(() => {
    if (!open) return
    const onKey = (e) => {
      if (e.key === 'Escape') {
        e.stopPropagation()
        onClose()
      }
    }
    document.addEventListener('keydown', onKey)
    dialogRef.current?.focus()
    return () => {
      document.removeEventListener('keydown', onKey)
    }
  }, [open, onClose])

  if (!open) return null

  const complete = draft.start && draft.end
  const prev = complete ? previousPeriod(draft.start, draft.end) : null
  const overlapsEvent = complete && events.filter((e) => e.start <= draft.end && e.end >= draft.start)

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-slate-900/60 backdrop-blur-sm"
      onMouseDown={(e) => e.target === e.currentTarget && onClose()}
    >
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="date-modal-title"
        tabIndex={-1}
        className="bg-white rounded-2xl shadow-2xl border border-slate-200/90 w-full max-w-[880px] max-h-[95vh] overflow-y-auto flex flex-col outline-none"
      >
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-xl bg-sky-50 text-[#0091FF] border border-sky-100 flex items-center justify-center shrink-0 mt-0.5">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
            <div>
              <div className="flex items-center gap-2.5">
                <h3 id="date-modal-title" className="text-base sm:text-lg font-bold text-slate-900 tracking-tight">
                  Select Date Range
                </h3>
                <span className="inline-flex items-center gap-1 text-[11px] font-semibold bg-sky-50 text-[#0091FF] px-2.5 py-0.5 rounded-full border border-sky-200">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#0091FF]" />
                  {monthLabel(viewMonth)}
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                Filter sales metrics, order transactions, and stock reports by academic period or custom dates.
              </p>
            </div>
          </div>
          <button 
            type="button" 
            aria-label="Close modal" 
            onClick={onClose}
            className="text-slate-400 hover:text-slate-700 hover:bg-slate-100 p-2 rounded-lg transition-colors ml-3"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Body */}
        <div className="flex flex-col md:flex-row md:min-h-[440px]">
          <PresetList 
            activeId={draft.presetId} 
            onPick={pickPreset} 
            onCustom={() => setDraft((d) => ({ ...d, presetId: 'custom' }))} 
            today={new Date(2026, 10, 7)} // November 7, 2026
          />

          <div className="flex-1 p-6 flex flex-col justify-between bg-white">
            <div className="space-y-5">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <DateField 
                  label="Start Date" 
                  dotClass="bg-emerald-500" 
                  value={draft.start} 
                />
                <DateField 
                  label="End Date" 
                  dotClass="bg-[#0091FF]" 
                  value={draft.end} 
                  active
                  badge={days ? `${days} day${days > 1 ? 's' : ''} selected` : null} 
                />
              </div>

              <RangeCalendar
                viewMonth={viewMonth} 
                onMonthChange={setViewMonth}
                start={draft.start} 
                end={draft.end} 
                onPick={pickDay}
                events={events} 
                boothHours={boothHours}
              />

              <div className="flex items-center gap-2.5 px-1">
                <input 
                  id="compareToggle" 
                  type="checkbox" 
                  checked={draft.compare}
                  onChange={(e) => setDraft((d) => ({ ...d, compare: e.target.checked }))}
                  className="w-4 h-4 text-[#0091FF] border-slate-300 rounded focus:ring-[#0091FF] focus:ring-offset-0 cursor-pointer" 
                />
                <label 
                  htmlFor="compareToggle" 
                  className="text-xs text-slate-700 font-medium select-none cursor-pointer flex items-center gap-1.5"
                >
                  <span>Compare to previous period</span>
                  {prev && (
                    <span className="text-slate-400 font-normal">
                      ({fmt(prev.start)} – {fmt(prev.end)} • {days} days)
                    </span>
                  )}
                </label>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 bg-slate-50 border-t border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2 text-xs text-slate-600">
            <span className={`w-2.5 h-2.5 rounded-full ${complete ? 'bg-emerald-500 animate-pulse' : 'bg-slate-300'}`} />
            {complete ? (
              <span>
                Selected: <strong className="text-slate-900 font-bold">{fmtRange(draft.start, draft.end)}</strong> ({days} days)
                {overlapsEvent.length > 0 && (
                  <> • <span className="text-[#0091FF] font-semibold">{overlapsEvent.map((e) => e.label).join(', ')} included</span></>
                )}
              </span>
            ) : (
              <span>Pick an end date to complete the range</span>
            )}
          </div>
          <div className="flex items-center justify-end gap-2.5">
            <button 
              type="button" 
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-slate-600 bg-white border border-slate-200 rounded-lg hover:bg-slate-100 hover:text-slate-800 shadow-sm transition-colors"
            >
              Cancel
            </button>
            <button 
              type="button" 
              disabled={!complete} 
              onClick={() => { onApply(draft); onClose() }}
              className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-white bg-[#0091FF] hover:bg-[#0284C7] rounded-lg shadow-sm transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Apply Date Filter
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
