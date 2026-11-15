import { badgeTone } from "../../../data/exportDatasets";

export default function DatasetOption({ dataset, data, checked, onToggle }) {
  const badgeText =
    typeof dataset.badge.text === "function"
      ? dataset.badge.text(data)
      : dataset.badge.text;

  return (
    <label
      className={`group relative flex items-start gap-3 p-3.5 rounded-xl border cursor-pointer transition-all ${
        checked
          ? "border-sky-200 bg-sky-50/30 hover:bg-sky-50/60"
          : "border-slate-200 hover:border-slate-300 hover:bg-slate-50/70"
      }`}
    >
      <input
        type="checkbox"
        checked={checked}
        onChange={() => onToggle(dataset.id)}
        className="mt-0.5 w-4 h-4 text-[#0091FF] rounded border-slate-300 focus:ring-[#0091FF] focus:ring-offset-0"
      />
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between gap-2">
          <span
            className={`text-xs font-bold transition-colors ${
              checked
                ? "text-slate-900 group-hover:text-[#0091FF]"
                : "text-slate-800 group-hover:text-slate-900"
            }`}
          >
            {dataset.title}
          </span>
          <span
            className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-semibold ${badgeTone[dataset.badge.tone]}`}
          >
            {badgeText}
          </span>
        </div>
        <p className="text-[11px] text-slate-500 mt-0.5 leading-snug">
          {dataset.description}
        </p>
      </div>
    </label>
  );
}
