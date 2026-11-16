import { Link } from 'react-router-dom'
import { FadeUpLines } from '../components'

const badges = [
  {
    label: 'Run by QCU Students',
    path: 'M12 3L1 9l11 6 9-4.91V17h2V9L12 3zM5 13.18v4L12 21l7-3.82v-4L12 17l-7-3.82z',
  },
  {
    label: 'Every Shop Is a QCUian’s',
    path: 'M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4zm-2 16l-4-4 1.41-1.41L10 14.17l6.59-6.59L18 9l-8 8z',
  },
]

export default function LandingPage() {
  return (
    <>
      <main className="relative flex-1 min-h-0 flex items-center justify-center px-4 sm:px-6 py-6">
        {/* Subtle centered ambient spotlight behind hero text */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[320px] sm:w-[540px] h-[260px] sm:h-[340px] rounded-full bg-[#8ACFF8]/25 dark:bg-amber-500/[0.07] blur-[100px]"
        />

        <div className="relative z-10 max-w-4xl mx-auto text-center flex flex-col items-center">
          {/* Eyebrow Pill */}
          <div className="inline-flex items-center gap-2.5 px-4 py-1.5 rounded-full bg-[#F4EB6C]/45 border border-[#FFD444] dark:bg-amber-500/10 dark:border-amber-400/25 backdrop-blur-md shadow-sm mb-6 sm:mb-8">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#0284C7] dark:bg-amber-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-[#0284C7] dark:bg-amber-400" />
            </span>
            <p className="text-xs sm:text-sm font-bold tracking-wider uppercase text-slate-900 dark:text-amber-300">
              BizzyQCU <span className="text-[#0369A1] dark:text-amber-400/50 mx-1">·</span> Quezon City University
            </p>
          </div>

          {/* Hero Headline */}
          <div className="relative flex items-center justify-center px-2 sm:px-6">
            <h1 className="text-4xl sm:text-6xl md:text-7xl font-black tracking-tight uppercase leading-[1.08] shine-text select-none">
              BUY FROM A QCIAN.
              <span className="block mt-1 sm:mt-2">SELL AS A QCIAN.</span>
            </h1>
          </div>

          {/* Value Proposition */}
          <FadeUpLines
            text="BizzyQCU is the online marketplace where QCU student entrepreneurs list what they make and sell, and where classmates, friends, and the whole campus can find it in one place."
            className="mt-6 sm:mt-7 text-base sm:text-lg md:text-xl text-slate-600 dark:text-slate-200/90 leading-relaxed max-w-2xl mx-auto px-2 sm:px-4"
          />

          {/* Primary & Secondary CTAs */}
          <div className="mt-8 sm:mt-10 flex flex-col sm:flex-row items-center justify-center gap-3.5 sm:gap-4 w-full sm:w-auto px-4 sm:px-0">
            <Link
              to="/login"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2.5 bg-[#0284C7] hover:bg-[#0369A1] dark:bg-gradient-to-r dark:from-amber-400 dark:via-amber-500 dark:to-amber-600 dark:hover:from-amber-300 dark:hover:via-amber-400 dark:hover:to-amber-500 active:scale-[0.98] text-white dark:text-slate-950 font-black text-base sm:text-lg px-8 sm:px-9 py-3.5 sm:py-4 rounded-full shadow-[0_10px_24px_-6px_rgba(2,132,199,0.45)] dark:shadow-lg dark:shadow-amber-500/25 dark:hover:shadow-xl dark:hover:shadow-amber-500/40 dark:ring-1 dark:ring-inset dark:ring-amber-200/50 transition-all duration-200 group"
            >
              <span>Log in to Shop</span>
            </Link>

            <Link
              to="/seller-login-form"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2.5 bg-white hover:bg-sky-50 dark:bg-white/[0.06] dark:hover:bg-white/[0.12] active:scale-[0.98] text-[#0369A1] dark:text-white dark:hover:text-amber-300 font-bold text-base sm:text-lg px-7 sm:px-8 py-3.5 sm:py-4 rounded-full border-[1.5px] dark:border border-[#8ACFF8] hover:border-[#0284C7] dark:border-white/15 dark:hover:border-amber-400/50 dark:backdrop-blur-md shadow-sm transition-all duration-200 group"
            >
              <span>Open Your BizzyQCU Shop</span>
            </Link>
          </div>

          {/* Subtle Divider */}
          <div
            aria-hidden="true"
            className="mt-12 md:mt-14 mb-6 md:mb-8 h-px w-48 sm:w-64 bg-gradient-to-r from-transparent via-slate-200 dark:via-white/15 to-transparent"
          />

          {/* Trust Badges */}
          <section aria-label="Campus marketplace highlights" className="w-full px-2">
            <div className="max-w-3xl mx-auto flex flex-wrap items-center justify-center gap-3 sm:gap-4">
              {badges.map((b) => (
                <div
                  key={b.label}
                  className="flex items-center gap-3 pl-2.5 pr-4 py-2 sm:pl-3 sm:pr-5 sm:py-2.5 rounded-full bg-white/95 hover:bg-white dark:bg-slate-900/60 dark:hover:bg-slate-900/85 backdrop-blur-md border border-slate-200 hover:border-[#8ACFF8] dark:border-white/15 dark:hover:border-amber-400/40 shadow-[0_4px_12px_-2px_rgba(15,23,42,0.05)] dark:shadow-md dark:shadow-black/20 transition-all duration-200 group"
                >
                  <span className="flex items-center justify-center w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-[#8ACFF8]/25 border border-[#8ACFF8] text-[#0369A1] dark:bg-amber-400/15 dark:border-amber-400/30 dark:text-amber-400 group-hover:scale-110 group-hover:bg-[#FFD444]/35 group-hover:border-[#FFD444] dark:group-hover:bg-amber-400/25 dark:group-hover:border-amber-400/40 transition-all duration-200">
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                      <path d={b.path} />
                    </svg>
                  </span>
                  <span className="text-xs sm:text-sm font-bold tracking-wide text-slate-800 dark:text-white/95 whitespace-nowrap">
                    {b.label}
                  </span>
                </div>
              ))}
            </div>
          </section>
        </div>
      </main>

      {/* Anchor targets for navbar links */}
      <div id="products" />
      <div id="enterprises" />
      <div id="about" />
    </>
  )
}
