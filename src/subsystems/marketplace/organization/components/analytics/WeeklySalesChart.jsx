import { peso } from "../../../utils/format";

const MAX_BAR_PX = 125;
const barStyles = [
  "bg-slate-200 hover:bg-slate-300",
  "bg-sky-300 hover:bg-sky-400",
  "bg-sky-400 hover:bg-sky-500",
];

export default function WeeklySalesChart({ weeks, projected }) {
  const peak = weeks.reduce(
    (best, w) => (w.revenue > best.revenue ? w : best),
    weeks[0],
  );

  return (
    <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm lg:col-span-7 flex flex-col justify-between">
      <div>
        <div className="flex items-center justify-between mb-1">
          <div>
            <h3 className="text-base font-bold text-slate-900">
              Weekly Sales Trajectory
            </h3>
            <p className="text-xs text-slate-500">
              October 2024 surge patterns culminating in Tech Summit peak
            </p>
          </div>
          <div className="text-right">
            <span className="text-xs font-bold text-slate-800">
              Peak: Week {weeks.indexOf(peak) + 1}
            </span>
            <span className="block text-[11px] text-emerald-600 font-bold">
              {peso(peak.revenue)}
            </span>
          </div>
        </div>

        <div className="mt-6 mb-4 h-44 w-full relative flex items-end">
          {/* gridlines */}
          <div className="absolute inset-0 flex flex-col justify-between pointer-events-none opacity-25">
            <div className="border-b border-dashed border-slate-300 w-full" />
            <div className="border-b border-dashed border-slate-300 w-full" />
            <div className="border-b border-dashed border-slate-300 w-full" />
            <div className="border-b border-slate-200 w-full" />
          </div>

          <div className="relative w-full h-full flex items-end justify-between px-6 z-10">
            {weeks.map((w, i) => {
              const isPeak = w === peak;
              const height = Math.round(
                (w.revenue / peak.revenue) * MAX_BAR_PX,
              );
              return (
                <div
                  key={w.id}
                  className="flex flex-col items-center gap-2 group"
                >
                  <div
                    className={`text-[10px] font-semibold transition-opacity ${
                      isPeak
                        ? "text-[#0091FF] font-bold"
                        : "text-slate-500 opacity-0 group-hover:opacity-100"
                    }`}
                  >
                    {isPeak ? "★ " : ""}
                    {peso(w.revenue, 0)}
                  </div>
                  <div
                    className={`w-10 rounded-t transition-all ${
                      isPeak
                        ? "bg-[#0091FF] hover:bg-[#0284C7] shadow-md ring-2 ring-sky-100"
                        : barStyles[i % barStyles.length]
                    }`}
                    style={{ height: `${height}px` }}
                    role="img"
                    aria-label={`${w.label}: ${peso(w.revenue)}`}
                  />
                  <div className="text-center">
                    <span
                      className={`text-[11px] block ${
                        isPeak
                          ? "font-bold text-slate-900"
                          : "font-semibold text-slate-700"
                      }`}
                    >
                      {w.label}
                    </span>
                    <span
                      className={`text-[10px] ${
                        isPeak
                          ? "font-semibold text-[#0091FF]"
                          : "text-slate-400"
                      }`}
                    >
                      {w.tag}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      <div className="bg-slate-50 p-3 rounded-lg border border-slate-100 flex items-center justify-between text-xs">
        <span className="text-slate-600">
          Projected November Momentum:{" "}
          <strong className="text-slate-900">{peso(projected, 0)}+</strong>
        </span>
        <span className="text-emerald-700 font-semibold bg-emerald-100 px-2 py-0.5 rounded">
          Bullish Demand
        </span>
      </div>
    </div>
  );
}
