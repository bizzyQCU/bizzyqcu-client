import { lazy, Suspense } from 'react';

const BarChart = lazy(() => import('./BarChart.jsx'));

const sellerHighlights = [
  { icon: 'bar_chart', label: 'Real-Time Store Analytics' },
  { icon: 'storefront', label: 'Verified Seller Portal' },
];

export default function SellerShowcase({ badge = 'CAMPUS VENTURES' }) {
  return (
    <section className="hidden lg:flex flex-col items-center text-center" aria-label="Seller Portal Overview">
      <div className="inline-flex items-center gap-2.5 px-4 py-1.5 rounded-full bg-amber-500/10 border border-amber-400/25 backdrop-blur-md">
        <span className="relative flex h-2 w-2">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75" />
          <span className="relative inline-flex rounded-full h-2 w-2 bg-amber-400" />
        </span>
        <p className="text-xs font-bold tracking-wider uppercase text-amber-300">
          Seller Hub <span className="text-amber-400/50 mx-1">·</span> {badge}
        </p>
      </div>

      <h2 className="mt-4 text-4xl xl:text-[44px] font-black tracking-tight leading-[1.1] text-white">
        Grow your venture
        <span className="block shine-text">right on campus.</span>
      </h2>
      <p className="mt-3 max-w-md text-base text-slate-300/90 leading-relaxed">
        Track store sales, manage product inventory, and fulfill fellow QCUians&apos; orders in one place.
      </p>

      <div className="relative w-full max-w-[440px] aspect-[4/3]">
        <Suspense fallback={null}>
          <BarChart />
        </Suspense>
      </div>

      <ul className="flex flex-wrap items-center justify-center gap-3">
        {sellerHighlights.map((h) => (
          <li
            key={h.label}
            className="flex items-center gap-2 pl-2 pr-4 py-1.5 rounded-full bg-slate-900/60 backdrop-blur-md border border-white/10 hover:border-amber-400/40 transition-colors"
          >
            <span className="flex items-center justify-center w-7 h-7 rounded-full bg-amber-400/15 border border-amber-400/30 text-amber-400">
              <span className="material-symbols-outlined text-[16px]" aria-hidden="true">
                {h.icon}
              </span>
            </span>
            <span className="text-sm font-semibold text-white/90">{h.label}</span>
          </li>
        ))}
      </ul>
    </section>
  );
}

