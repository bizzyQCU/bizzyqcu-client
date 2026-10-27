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

function Arrow({ className = 'w-4 h-4' }) {
  return (
    <svg
      className={`${className} transition-transform duration-300 group-hover:translate-x-1 stroke-current`}
      fill="none"
      strokeWidth="2.25"
      strokeLinecap="round"
      strokeLinejoin="round"
      viewBox="0 0 24 24"
      aria-hidden="true"
    >
      <line x1="5" x2="19" y1="12" y2="12" />
      <polyline points="12 5 19 12 12 19" />
    </svg>
  )
}

export default function LandingPage() {
  return (
    <>
      <main className="relative flex-grow flex items-center justify-center px-4 sm:px-6 py-12 md:py-20">
        {/* Subtle centered ambient spotlight behind hero text */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[320px] sm:w-[540px] h-[260px] sm:h-[340px] rounded-full bg-amber-500/[0.07] blur-[100px]"
        />

        <div className="relative z-10 max-w-4xl mx-auto text-center flex flex-col items-center">
          {/* Eyebrow Pill */}
          <div className="inline-flex items-center gap-2.5 px-4 py-1.5 rounded-full bg-amber-500/10 border border-amber-400/25 backdrop-blur-md shadow-sm mb-6 sm:mb-8">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-amber-400" />
            </span>
            <p className="text-xs sm:text-sm font-bold tracking-wider uppercase text-amber-300">
              BizzyQCU <span className="text-amber-400/50 mx-1">·</span> Quezon City University
            </p>
          </div>

          {/* Hero Headline */}
          <div className="relative flex items-center justify-center px-2 sm:px-6">
            <h1 className="text-4xl sm:text-6xl md:text-7xl font-black tracking-tight uppercase leading-[1.08] shine-text select-none">
              BUY FROM A QCUIAN.
              <span className="block mt-1 sm:mt-2">SELL AS A QCUIAN.</span>
            </h1>
          </div>

          {/* Value Proposition */}
          <FadeUpLines
            text="BizzyQCU is the online marketplace where QCU student entrepreneurs list what they make and sell, and where classmates, friends, and the whole campus can find it in one place."
            className="mt-6 sm:mt-7 text-base sm:text-lg md:text-xl text-slate-200/90 leading-relaxed max-w-2xl mx-auto px-2 sm:px-4"
          />

          {/* Primary & Secondary CTAs */}
          <div className="mt-8 sm:mt-10 flex flex-col sm:flex-row items-center justify-center gap-3.5 sm:gap-4 w-full sm:w-auto px-4 sm:px-0">
            <Link
              to="/login"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2.5 bg-gradient-to-r from-amber-400 via-amber-500 to-amber-600 hover:from-amber-300 hover:via-amber-400 hover:to-amber-500 active:scale-[0.98] text-slate-950 font-black text-base sm:text-lg px-8 sm:px-9 py-3.5 sm:py-4 rounded-full shadow-lg shadow-amber-500/25 hover:shadow-xl hover:shadow-amber-500/40 ring-1 ring-inset ring-amber-200/50 transition-all duration-200 group"
            >
              <span>Log in to Shop</span>
              <Arrow className="w-4 h-4 sm:w-5 sm:h-5" />
            </Link>

            <Link
              to="/seller-register"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2.5 bg-white/[0.06] hover:bg-white/[0.12] active:scale-[0.98] text-white hover:text-amber-300 font-bold text-base sm:text-lg px-7 sm:px-8 py-3.5 sm:py-4 rounded-full border border-white/15 hover:border-amber-400/50 backdrop-blur-md shadow-sm transition-all duration-200 group"
            >
              <span>Open Your BizzyQCU Shop</span>
              <Arrow className="w-4 h-4 sm:w-5 sm:h-5 text-amber-400" />
            </Link>
          </div>

          {/* Subtle Divider */}
          <div
            aria-hidden="true"
            className="mt-12 md:mt-14 mb-6 md:mb-8 h-px w-48 sm:w-64 bg-gradient-to-r from-transparent via-white/15 to-transparent"
          />

          {/* Trust Badges */}
          <section aria-label="Campus marketplace highlights" className="w-full px-2">
            <div className="max-w-3xl mx-auto flex flex-wrap items-center justify-center gap-3 sm:gap-4">
              {badges.map((b) => (
                <div
                  key={b.label}
                  className="flex items-center gap-3 pl-2.5 pr-4 py-2 sm:pl-3 sm:pr-5 sm:py-2.5 rounded-full bg-slate-900/60 hover:bg-slate-900/85 backdrop-blur-md border border-white/15 hover:border-amber-400/40 shadow-md shadow-black/20 transition-all duration-200 group"
                >
                  <span className="flex items-center justify-center w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-amber-400/15 border border-amber-400/30 text-amber-400 group-hover:scale-110 group-hover:bg-amber-400/25 transition-all duration-200">
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                      <path d={b.path} />
                    </svg>
                  </span>
                  <span className="text-xs sm:text-sm font-bold tracking-wide text-white/95 whitespace-nowrap">
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
