import { quickPresets, academicPresets } from "../../../data/datePresets";

const badgeTone = {
  slate: "bg-slate-200 text-slate-700",
  amber: "bg-amber-100 text-amber-800 border border-amber-200",
  indigo: "bg-indigo-50 text-indigo-700 border border-indigo-100",
};

const idle = "text-slate-600 hover:bg-slate-200/60 hover:text-slate-900";
const on = "font-bold text-[#0091FF] bg-sky-50 border border-sky-200";

export default function PresetList({ activeId, onPick, onCustom, today }) {
  return (
    <div className="w-full md:w-64 bg-slate-50/70 border-b md:border-b-0 md:border-r border-slate-200 p-4 flex flex-col justify-between shrink-0">
      <div className="space-y-1">
        <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider px-2.5 py-1 mb-1">
          Academic &amp; Quick Presets
        </div>

        {quickPresets(today).map((p) => (
          <button
            key={p.id}
            type="button"
            onClick={() => onPick(p)}
            className={`w-full text-left px-3 py-2 rounded-lg text-xs font-medium flex items-center justify-between transition-colors ${
              activeId === p.id ? on : idle
            }`}
          >
            <span>{p.label}</span>
            {activeId === p.id && (
              <span className="w-2 h-2 rounded-full bg-[#0091FF]" />
            )}
          </button>
        ))}

        <div className="pt-2 border-t border-slate-200/80 my-2" />

        {academicPresets.map((p) => (
          <button
            key={p.id}
            type="button"
            onClick={() => onPick(p)}
            className={`w-full text-left px-3 py-2 rounded-lg text-xs font-medium flex items-center justify-between transition-colors ${
              activeId === p.id ? on : "text-slate-700 hover:bg-slate-200/60"
            }`}
          >
            <span>{p.label}</span>
            <span
              className={`text-[9.5px] font-bold px-1.5 py-0.5 rounded ${badgeTone[p.tone]}`}
            >
              {p.badge}
            </span>
          </button>
        ))}

        <button
          type="button"
          onClick={onCustom}
          className={`w-full text-left px-3 py-2 rounded-lg text-xs font-medium transition-colors ${
            activeId === "custom" ? on : idle
          }`}
        >
          Custom Range...
        </button>
      </div>

      <div className="p-3 bg-gradient-to-b from-blue-50/70 to-sky-50/50 rounded-xl border border-sky-100 mt-3">
        <div className="text-[11px] font-semibold text-slate-800 flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-[#0091FF]" /> QCU Academic
          Calendar
        </div>
        <div className="text-[10px] text-slate-500 mt-1 leading-snug">
          AY 2026–2027 1st Term. Tech Summit 2026 scheduled for Nov 20–26.
        </div>
      </div>
    </div>
  );
}
