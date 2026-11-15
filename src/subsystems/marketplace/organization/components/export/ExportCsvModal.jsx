import { useEffect, useMemo, useState } from "react";
import { exportDatasets } from "../../../data/exportDatasets";
import { buildExport, downloadText, formatBytes } from "../../../utils/csv";
import { fmtRange, toISODate } from "../../../utils/dates";
import { events } from "../../../data/academicCalendar";
import { useScrollLock } from "../../../hooks/useScrollLock";
import DatasetOption from "./DatasetOption";
import DateRangeModal from "../date-range/DateRangeModal";

const FORMATS = {
  csv: {
    label: "Comma (, .csv)",
    delimiter: ",",
    ext: "csv",
    mime: "text/csv",
  },
  tsv: {
    label: "Tab (.tsv)",
    delimiter: "\t",
    ext: "tsv",
    mime: "text/tab-separated-values",
  },
};

export default function ExportCsvModal({
  data,
  appliedRange,
  org,
  user,
  onClose,
}) {
  useScrollLock(true);

  const [selected, setSelected] = useState(
    () =>
      new Set(exportDatasets.filter((d) => d.defaultChecked).map((d) => d.id)),
  );
  const [format, setFormat] = useState("csv");
  const [includeHeader, setIncludeHeader] = useState(true);
  const [includeTotals, setIncludeTotals] = useState(true);
  const [range, setRange] = useState({
    start: appliedRange.start,
    end: appliedRange.end,
    presetId: appliedRange.presetId,
  });
  const [pickingRange, setPickingRange] = useState(false);

  // Esc closes this modal only when the child date modal isn't open
  useEffect(() => {
    if (pickingRange) return;
    const onKey = (e) => {
      if (e.key === "Escape") {
        e.stopPropagation();
        onClose();
      }
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [pickingRange, onClose]);

  const chosen = exportDatasets.filter((d) => selected.has(d.id));
  const fmtCfg = FORMATS[format];

  const toggle = (id) =>
    setSelected((s) => {
      const n = new Set(s);
      n.has(id) ? n.delete(id) : n.add(id);
      return n;
    });
  const allSelected = selected.size === exportDatasets.length;

  const text = useMemo(
    () =>
      buildExport({
        datasets: chosen,
        data,
        delimiter: fmtCfg.delimiter,
        includeHeader,
        includeTotals,
        range,
        org,
        user,
      }),
    [chosen, data, fmtCfg, includeHeader, includeTotals, range, org, user],
  );
  const rowCount = chosen.reduce((n, d) => n + d.toRows(data).length, 0);
  const size = useMemo(() => new Blob([text]).size, [text]);

  const touchedEvents = events.filter(
    (e) => e.start <= range.end && e.end >= range.start,
  );

  const download = () => {
    const name = `bizzyqcu_${toISODate(range.start)}_to_${toISODate(range.end)}.${fmtCfg.ext}`;
    downloadText(text, name, fmtCfg.mime);
    onClose();
  };

  return (
    <>
      <div
        id="export-csv-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="modal-headline"
        onMouseDown={(e) => e.target === e.currentTarget && onClose()}
        className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-slate-950/65 backdrop-blur-[6px]"
      >
        <div className="bg-white rounded-2xl shadow-2xl border border-slate-200/90 w-full max-w-[620px] overflow-hidden flex flex-col">
          {/* Header */}
          <div className="px-6 py-5 border-b border-slate-100 flex items-start justify-between">
            <div className="flex items-start gap-3.5">
              <div className="w-10 h-10 rounded-xl bg-sky-50 text-[#0091FF] border border-sky-100 flex items-center justify-center shrink-0 shadow-sm mt-0.5">
                <svg
                  className="w-5 h-5"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
                  />
                </svg>
              </div>
              <div>
                <h3
                  id="modal-headline"
                  className="text-lg font-bold text-slate-900 tracking-tight"
                >
                  Export CSV Report
                </h3>
                <p className="text-xs text-slate-500 mt-0.5 leading-relaxed">
                  Customize and export verified sales, transaction records, and
                  inventory logs for student org auditing &amp; accounting.
                </p>
              </div>
            </div>
            <button
              type="button"
              aria-label="Close modal"
              onClick={onClose}
              className="text-slate-400 hover:text-slate-700 p-1.5 rounded-lg hover:bg-slate-100 transition-colors ml-2"
            >
              <svg
                className="w-5 h-5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>

          {/* Body */}
          <div className="p-6 space-y-6 max-h-[calc(85vh-130px)] overflow-y-auto">
            {/* 1. Datasets */}
            <section>
              <div className="flex items-center justify-between mb-2.5">
                <h4 className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
                  1. Select Datasets to Export
                </h4>
                <button
                  type="button"
                  onClick={() =>
                    setSelected(
                      allSelected
                        ? new Set()
                        : new Set(exportDatasets.map((d) => d.id)),
                    )
                  }
                  className="text-xs text-[#0091FF] font-semibold hover:text-[#0284C7] hover:underline"
                >
                  {allSelected ? "Clear All" : "Select All"}
                </button>
              </div>
              <div className="space-y-2.5">
                {exportDatasets.map((d) => (
                  <DatasetOption
                    key={d.id}
                    dataset={d}
                    data={data}
                    checked={selected.has(d.id)}
                    onToggle={toggle}
                  />
                ))}
              </div>
            </section>

            {/* 2. Date range */}
            <section>
              <h4 className="text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-2.5">
                2. Date Range Scope
              </h4>
              <div className="flex items-center justify-between p-3.5 rounded-xl border border-slate-200 bg-slate-50/70 hover:bg-slate-50 transition-colors">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-9 h-9 rounded-lg bg-white border border-slate-200 flex items-center justify-center shadow-sm shrink-0">
                    <svg
                      className="w-4 h-4 text-slate-600"
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
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-slate-900 tracking-tight">
                        {fmtRange(range.start, range.end)}
                      </span>
                      <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-medium bg-blue-50 text-blue-700 border border-blue-200">
                        Active
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-500 mt-0.5 truncate">
                      {rangeLabel(range)}
                      {touchedEvents.length > 0 &&
                        ` • ${touchedEvents.map((e) => e.label).join(", ")} included`}
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setPickingRange(true)}
                  className="shrink-0 text-xs font-semibold text-[#0091FF] hover:text-[#0284C7] px-3 py-1.5 rounded-lg border border-[#0091FF]/30 hover:border-[#0091FF] bg-white transition-all shadow-sm"
                >
                  Change
                </button>
              </div>
            </section>

            {/* 3. Format */}
            <section>
              <h4 className="text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-2.5">
                3. Export Configuration &amp; Formatting
              </h4>
              <div className="p-4 rounded-xl border border-slate-200 bg-white space-y-3.5">
                <fieldset className="flex items-center justify-between">
                  <legend className="sr-only">File delimiter</legend>
                  <span
                    className="text-xs font-semibold text-slate-700"
                    aria-hidden="true"
                  >
                    File Delimiter
                  </span>
                  <div className="flex items-center gap-3">
                    {Object.entries(FORMATS).map(([key, f]) => (
                      <label
                        key={key}
                        className={`inline-flex items-center gap-1.5 text-xs font-medium cursor-pointer ${
                          format === key
                            ? "text-slate-800"
                            : "text-slate-600 hover:text-slate-800"
                        }`}
                      >
                        <input
                          type="radio"
                          name="csv-delimiter"
                          value={key}
                          checked={format === key}
                          onChange={() => setFormat(key)}
                          className="w-3.5 h-3.5 text-[#0091FF] focus:ring-[#0091FF] focus:ring-offset-0"
                        />
                        <span>{f.label}</span>
                      </label>
                    ))}
                  </div>
                </fieldset>

                <ToggleRow
                  checked={includeHeader}
                  onChange={setIncludeHeader}
                  title="Include QCU Student Org officer signature & audit header"
                  hint="Adds student org name, timestamp, and verification block at top"
                />
                <ToggleRow
                  checked={includeTotals}
                  onChange={setIncludeTotals}
                  title="Include summary totals row"
                  hint="Calculates subtotal and grand total summary lines at the end"
                />
              </div>
            </section>
          </div>

          {/* Footer */}
          <div className="px-6 py-4 border-t border-slate-100 bg-slate-50/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3.5">
            <div className="flex items-center gap-2">
              <span
                className={`w-2 h-2 rounded-full ${chosen.length ? "bg-emerald-500 animate-pulse" : "bg-slate-300"}`}
              />
              <span className="text-xs text-slate-500">
                {chosen.length ? (
                  <>
                    Estimated file size:{" "}
                    <strong className="text-slate-800 font-semibold">
                      {formatBytes(size)}
                    </strong>{" "}
                    · approx. {rowCount} rows ready
                  </>
                ) : (
                  "Select at least one dataset to export"
                )}
              </span>
            </div>
            <div className="flex items-center gap-2.5 justify-end">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-xs font-semibold text-slate-700 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 hover:border-slate-300 shadow-sm transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={download}
                disabled={!chosen.length}
                className="inline-flex items-center gap-2 px-4 py-2 text-xs font-semibold text-white bg-[#0091FF] hover:bg-[#0284C7] active:bg-[#0369A1] rounded-lg shadow-sm transition-colors ring-2 ring-[#0091FF]/20 disabled:opacity-50 disabled:cursor-not-allowed"
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
                    d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
                  />
                </svg>
                <span>
                  Download {format === "csv" ? "CSV" : "TSV"} Report (.
                  {fmtCfg.ext})
                </span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Rendered after the export overlay, so with the same z-50 it stacks on top */}
      {pickingRange && (
        <DateRangeModal
          open
          applied={{ ...range, compare: false }}
          onApply={(r) =>
            setRange({ start: r.start, end: r.end, presetId: r.presetId })
          }
          onClose={() => setPickingRange(false)}
        />
      )}
    </>
  );
}

function ToggleRow({ checked, onChange, title, hint }) {
  return (
    <label className="pt-3 border-t border-slate-100 flex items-start justify-between gap-3 cursor-pointer">
      <span className="min-w-0">
        <span className="text-xs font-semibold text-slate-800 block">
          {title}
        </span>
        <span className="text-[11px] text-slate-500 leading-snug">{hint}</span>
      </span>
      <input
        type="checkbox"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        className="w-4 h-4 text-[#0091FF] rounded border-slate-300 focus:ring-[#0091FF] focus:ring-offset-0 mt-0.5"
      />
    </label>
  );
}

/** "Monthly Cycle" only when the range is exactly one calendar month */
function rangeLabel({ start, end }) {
  const isFullMonth =
    start.getDate() === 1 &&
    end.getMonth() === start.getMonth() &&
    end.getFullYear() === start.getFullYear() &&
    new Date(end.getFullYear(), end.getMonth() + 1, 0).getDate() ===
      end.getDate();
  return isFullMonth ? "Monthly Cycle" : "Custom Range";
}
