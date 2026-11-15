import { useEffect, useId, useRef, useState } from 'react';
import { CheckIcon, ChevronDownIcon } from './icons';

/**
 * Accessible custom select matching the Figma dropdowns.
 * options: [{ value, label, dot? }]  — `dot` is a Tailwind bg class for a coloured status dot.
 */
export default function FilterDropdown({
  value,
  options,
  onChange,
  ariaLabel,
  prefix,
  leadingIcon,
  className = '',
  menuClassName = '',
  align = 'left',
}) {
  const [open, setOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(0);
  const rootRef = useRef(null);
  const listRef = useRef(null);
  const listId = useId();

  const selected = options.find((o) => o.value === value) ?? options[0];

  useEffect(() => {
    if (!open) return undefined;
    const onPointer = (e) => {
      if (rootRef.current && !rootRef.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener('mousedown', onPointer);
    return () => document.removeEventListener('mousedown', onPointer);
  }, [open]);

  useEffect(() => {
    if (open) {
      setActiveIndex(Math.max(0, options.findIndex((o) => o.value === value)));
      listRef.current?.focus();
    }
  }, [open, options, value]);

  const choose = (opt) => { onChange(opt.value); setOpen(false); };

  const onListKeyDown = (e) => {
    if (e.key === 'ArrowDown')                 { e.preventDefault(); setActiveIndex((i) => (i + 1) % options.length); }
    else if (e.key === 'ArrowUp')              { e.preventDefault(); setActiveIndex((i) => (i - 1 + options.length) % options.length); }
    else if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); choose(options[activeIndex]); }
    else if (e.key === 'Escape' || e.key === 'Tab') { setOpen(false); }
  };

  return (
    <div ref={rootRef} className={`relative ${className}`}>
      <button
        type="button"
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-controls={listId}
        aria-label={ariaLabel}
        onClick={() => setOpen((o) => !o)}
        className={`flex h-[38px] w-full items-center gap-2 rounded-lg border bg-white px-3 text-left text-[12.5px] text-slate-800 transition
          ${open ? 'border-[#1a6fb5] ring-1 ring-[#1a6fb5]/20' : 'border-slate-200 hover:border-slate-300'}
          focus:outline-none focus-visible:border-[#1a6fb5] focus-visible:ring-2 focus-visible:ring-[#1a6fb5]/20`}
      >
        {leadingIcon}
        <span className="min-w-0 flex-1 truncate">
          {prefix && <span className="text-slate-500">{prefix} </span>}
          <span className={prefix ? 'font-medium text-slate-800' : ''}>{selected.label}</span>
        </span>
        <ChevronDownIcon className={`h-3.5 w-3.5 shrink-0 text-slate-500 transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>

      {open && (
        <ul
          ref={listRef}
          id={listId}
          role="listbox"
          tabIndex={-1}
          aria-label={ariaLabel}
          aria-activedescendant={`${listId}-${activeIndex}`}
          onKeyDown={onListKeyDown}
          className={`inv-dropdown-enter absolute z-30 mt-1.5 min-w-full overflow-hidden rounded-lg border border-slate-200 bg-white p-1 shadow-lg shadow-slate-900/10 focus:outline-none
            ${align === 'right' ? 'right-0' : 'left-0'} ${menuClassName}`}
        >
          {options.map((opt, i) => {
            const isSelected = opt.value === selected.value;
            const isActive = i === activeIndex;
            return (
              <li
                key={opt.value}
                id={`${listId}-${i}`}
                role="option"
                aria-selected={isSelected}
                onMouseEnter={() => setActiveIndex(i)}
                onClick={() => choose(opt)}
                className={`flex cursor-pointer items-center gap-2 whitespace-nowrap rounded-md px-2.5 py-[7px] text-[12px]
                  ${isSelected ? 'bg-blue-50 font-medium text-[#14456e]' : isActive ? 'bg-slate-50 text-slate-800' : 'text-slate-700'}`}
              >
                {opt.dot && <span className={`h-1.5 w-1.5 shrink-0 rounded-full ${opt.dot}`} />}
                <span className="flex-1">{opt.label}</span>
                {isSelected && <CheckIcon className="ml-4 h-3.5 w-3.5 text-[#1a6fb5]" />}
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
