import { BookIcon, CpuIcon, CupIcon, NotebookIcon, ShirtIcon, TagIcon, BoxIcon } from './icons';

/**
 * Per-category visual tokens: thumbnail tile, icon colour and the
 * small category chip under each SKU (matches the Figma palette).
 */
export const CATEGORY_STYLES = {
  Apparel:     { Icon: ShirtIcon,    tile: 'bg-indigo-50 border-indigo-100',  icon: 'text-indigo-500', chip: 'bg-indigo-50 text-indigo-600'  },
  Accessories: { Icon: TagIcon,      tile: 'bg-emerald-50 border-emerald-100', icon: 'text-teal-500',   chip: 'bg-emerald-50 text-emerald-700' },
  Stationery:  { Icon: NotebookIcon, tile: 'bg-slate-100 border-slate-200',   icon: 'text-slate-500',  chip: 'bg-slate-100 text-slate-600'   },
  Drinkware:   { Icon: CupIcon,      tile: 'bg-sky-50 border-sky-100',        icon: 'text-sky-500',    chip: 'bg-sky-50 text-sky-700'        },
  Electronics: { Icon: CpuIcon,      tile: 'bg-violet-50 border-violet-100',  icon: 'text-violet-500', chip: 'bg-violet-50 text-violet-700'  },
  Books:       { Icon: BookIcon,     tile: 'bg-orange-50 border-orange-100',  icon: 'text-orange-500', chip: 'bg-orange-50 text-orange-700'  },
};

const FALLBACK = { Icon: BoxIcon, tile: 'bg-slate-100 border-slate-200', icon: 'text-slate-500', chip: 'bg-slate-100 text-slate-600' };

export const getCategoryStyle = (category) => CATEGORY_STYLES[category] ?? FALLBACK;
