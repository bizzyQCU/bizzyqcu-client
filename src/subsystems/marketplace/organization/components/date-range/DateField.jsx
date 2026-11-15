import { fmt } from "../../../utils/dates";

export default function DateField({
  label,
  dotClass,
  value,
  active = false,
  badge,
}) {
  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between">
        <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
          <span className={`w-2 h-2 rounded-full ${dotClass}`} />
          {label}
        </label>
        {badge && (
          <span className="text-[10px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
            {badge}
          </span>
        )}
      </div>
      <div className="relative flex items-center">
        <input
          readOnly
          type="text"
          value={value ? fmt(value) : ""}
          placeholder="Select a date"
          className={`w-full pl-3.5 pr-10 py-2.5 text-xs font-bold text-slate-800 bg-white rounded-lg shadow-sm cursor-default focus:outline-none focus:ring-2 focus:ring-sky-200 focus:border-[#0091FF] ${
            active
              ? "border border-[#0091FF] ring-2 ring-sky-100"
              : "border border-slate-300"
          }`}
        />
        <div className="absolute right-3 pointer-events-none text-[#0091FF]">
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
              d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
            />
          </svg>
        </div>
      </div>
    </div>
  );
}
