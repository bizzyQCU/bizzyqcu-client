import { useMemo } from "react";
import {
  buildMonthGrid,
  isSameDay,
  isBetween,
  monthLabel,
} from "../../../utils/dates";

const DOW = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"];

export default function RangeCalendar({
  viewMonth,
  onMonthChange,
  start,
  end,
  onPick,
  events,
  boothHours,
}) {
  const cells = useMemo(
    () => buildMonthGrid(viewMonth.getFullYear(), viewMonth.getMonth()),
    [viewMonth],
  );

  const shift = (n) =>
    onMonthChange(
      new Date(viewMonth.getFullYear(), viewMonth.getMonth() + n, 1),
    );
  const eventOn = (date) => events.find((e) => isBetween(date, e.start, e.end));
  const shownEvents = events.filter(
    (e) => e.end >= cells[0].date && e.start <= cells[cells.length - 1].date,
  );

  return (
    <div className="border border-slate-200 rounded-xl p-4 bg-slate-50/40">
      <div className="flex items-center justify-between mb-3 px-1">
        <span className="text-sm font-bold text-slate-900 tracking-tight">
          {monthLabel(viewMonth)}
        </span>
        <div className="flex items-center gap-1">
          <button
            type="button"
            aria-label="Previous month"
            onClick={() => shift(-1)}
            className="p-1.5 rounded-md text-slate-500 hover:text-slate-800 hover:bg-slate-200/60 transition-colors"
          >
            <svg
              className="w-4 h-4"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M15 19l-7-7 7-7"
              />
            </svg>
          </button>
          <button
            type="button"
            aria-label="Next month"
            onClick={() => shift(1)}
            className="p-1.5 rounded-md text-slate-500 hover:text-slate-800 hover:bg-slate-200/60 transition-colors"
          >
            <svg
              className="w-4 h-4"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M9 5l7 7-7 7"
              />
            </svg>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-7 text-center text-[11px] font-bold text-slate-400 mb-2">
        {DOW.map((d) => (
          <div key={d} className="py-1">
            {d}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-7 gap-y-1 text-center text-xs font-semibold select-none">
        {cells.map(({ date, inMonth }) => {
          const isStart = isSameDay(date, start);
          const isEnd = isSameDay(date, end);
          const inRange = isBetween(date, start, end);
          const ev = inMonth && eventOn(date);
          const isDow0 = date.getDay() === 0;
          const isDow6 = date.getDay() === 6;

          let cls = "py-1.5 relative transition-colors ";
          if (!inMonth) cls += "text-slate-300 font-normal ";
          else if (isStart || isEnd)
            cls +=
              "bg-[#0091FF] text-white font-bold shadow-sm ring-2 ring-sky-300 cursor-pointer ";
          else if (inRange)
            cls +=
              "bg-sky-100 text-[#0091FF] hover:bg-sky-200/80 cursor-pointer ";
          else cls += "text-slate-700 hover:bg-slate-200/60 cursor-pointer ";

          // Rounded caps at range ends and at week boundaries
          if (inMonth && inRange) {
            if (isStart || isDow0) cls += "rounded-l-lg ";
            if (isEnd || isDow6) cls += "rounded-r-lg ";
          }
          if (ev && !isStart && !isEnd) cls += "font-bold ";

          return (
            <button
              key={date.toISOString()}
              type="button"
              disabled={!inMonth}
              aria-pressed={isStart || isEnd}
              aria-label={date.toDateString()}
              onClick={() => inMonth && onPick(date)}
              className={cls}
            >
              {date.getDate()}
              {ev && (
                <span className="absolute bottom-0.5 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-amber-500" />
              )}
            </button>
          );
        })}
      </div>

      <div className="mt-3 pt-2.5 border-t border-slate-200/70 flex items-center justify-between text-[10px] text-slate-500">
        <span className="flex items-center gap-1.5">
          {shownEvents[0] && (
            <>
              <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
              <span>
                {shownEvents[0].badge}: <strong>{shownEvents[0].label}</strong>
              </span>
            </>
          )}
        </span>
        <span className="text-slate-400">Campus Booth Hours: {boothHours}</span>
      </div>
    </div>
  );
}
