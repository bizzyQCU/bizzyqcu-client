import Icon from "./Icon.jsx";

// Round selector: fills blue with a check when selected.
export default function SelectCircle({ checked, onToggle, label }) {
  return (
    <button
      type="button"
      role="checkbox"
      aria-checked={checked}
      aria-label={label}
      onClick={onToggle}
      className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full border-2 transition-all duration-200 active:scale-90 ${
        checked ? "border-[#0284C7] bg-[#0284C7] shadow-sm" : "border-slate-300 bg-white hover:border-sky-400"
      }`}
    >
      <Icon
        name="check"
        strokeWidth={3}
        className={`h-3.5 w-3.5 text-white transition-all duration-200 ${checked ? "scale-100 opacity-100" : "scale-50 opacity-0"}`}
      />
    </button>
  );
}
