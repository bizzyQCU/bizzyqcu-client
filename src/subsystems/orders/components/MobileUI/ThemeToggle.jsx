export default function ThemeToggle({ theme, onToggle }) {
  const dark = theme === 'dark'
  return (
    <button
      type="button"
      onClick={onToggle}
      aria-label={dark ? 'Switch to light mode' : 'Switch to dark mode'}
      className={`relative inline-flex h-7 w-14 shrink-0 items-center rounded-full border-2 transition-colors duration-300 ${
        dark ? 'border-slate-600 bg-[#1A2540]' : 'border-white bg-sky-300'
      }`}
    >
      <span
        className={`absolute left-0.5 flex h-5 w-5 items-center justify-center rounded-full shadow transition-transform duration-300 ${
          dark ? 'translate-x-[1.6rem] bg-[#F1F5F9]' : 'translate-x-0 bg-[#FFF3B0]'
        }`}
      >
        {dark ? (
          <svg viewBox="0 0 24 24" className="h-3.5 w-3.5 text-[#1A2540]" fill="currentColor" aria-hidden="true">
            <path d="M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8z" />
          </svg>
        ) : (
          <svg viewBox="0 0 24 24" className="h-3.5 w-3.5 text-amber-500" fill="currentColor" aria-hidden="true">
            <circle cx="12" cy="12" r="4.5" />
            <path d="M12 1.5v3M12 19.5v3M1.5 12h3M19.5 12h3M4.6 4.6l2.1 2.1M17.3 17.3l2.1 2.1M4.6 19.4l2.1-2.1M17.3 6.7l2.1-2.1" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
          </svg>
        )}
      </span>
    </button>
  )
}
