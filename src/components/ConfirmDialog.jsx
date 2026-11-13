import Icon from "./Icon.jsx";
import ModalShell from "./ModalShell.jsx";

// Confirmation dialog: centred icon, bold title, muted message, two equal buttons.
export default function ConfirmDialog({ open, title, message, confirmLabel = "Confirm", cancelLabel = "Cancel", tone = "primary", onConfirm, onCancel }) {
  const danger = tone === "danger";

  return (
    <ModalShell
      open={open}
      onClose={onCancel}
      label={title}
      panelClassName="w-full max-w-[380px] rounded-[22px] bg-white px-6 pb-6 pt-7 text-center shadow-[0_24px_60px_-12px_rgba(16,24,40,0.28)]"
    >
      <div className={`mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full ${danger ? "bg-rose-50 text-[#D92D20]" : "bg-sky-50 text-[#0284C7]"}`}>
        <Icon name={danger ? "trash" : "info"} className="h-5 w-5" strokeWidth={2} />
      </div>

      <h2 className="text-[17px] font-semibold tracking-tight text-slate-900">{title}</h2>
      {message && <p className="mx-auto mt-2 max-w-[280px] text-[13px] leading-relaxed text-slate-500">{message}</p>}

      <div className="mt-6 grid grid-cols-2 gap-3">
        <button
          type="button"
          onClick={onCancel}
          className="rounded-xl bg-slate-100 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-200 active:scale-[0.98]"
        >
          {cancelLabel}
        </button>
        <button
          type="button"
          autoFocus
          onClick={onConfirm}
          className={`rounded-xl py-3 text-sm font-semibold text-white transition active:scale-[0.98] ${
            danger
              ? "bg-[#D92D20] shadow-[0_8px_20px_-6px_rgba(217,45,32,0.5)] hover:bg-[#B42318]"
              : "bg-[#0284C7] shadow-[0_8px_20px_-6px_rgba(2,132,199,0.5)] hover:bg-[#0369A1]"
          }`}
        >
          {confirmLabel}
        </button>
      </div>
    </ModalShell>
  );
}
