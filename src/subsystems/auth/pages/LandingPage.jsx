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
  {
    label: 'Your Money Stays in QCU',
    path: 'M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z',
  },
]

function Arrow({ className }) {
  return (
    <svg className={`${className} transition-transform group-hover:translate-x-1 stroke-current`} fill="none" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
      <line x1="5" x2="19" y1="12" y2="12" />
      <polyline points="12 5 19 12 12 19" />
    </svg>
  )
}

export default function LandingPage() {
  return (
    <>
      <main className="flex-grow flex items-center justify-center px-4 py-8 md:py-14">
        <div className="max-w-4xl mx-auto text-center">
          <p className="mb-4 text-sm sm:text-base font-bold text-amber-400">
            BizzyQCU · Quezon City University
          </p>

          <div className="relative flex items-center justify-center px-4 sm:px-8 py-2">
            <h1 className="text-4xl sm:text-6xl md:text-7xl font-black tracking-tight uppercase leading-tight shine-text">
              BUY FROM A QCUIAN.<br />SELL AS A QCUIAN.
            </h1>
          </div>

          <FadeUpLines
            text="BizzyQCU is the online marketplace where QCU student entrepreneurs list what they make and sell, and where classmates, friends, and the whole campus can find it in one place."
            className="mt-4 sm:mt-5 text-base sm:text-lg md:text-xl text-white/90 max-w-2xl mx-auto px-4"
          />

          <div className="mt-7 sm:mt-8 flex flex-col items-center gap-4">
            <Link
              to="/login"
              className="inline-flex items-center bg-gradient-to-r from-amber-400 via-amber-500 to-amber-600 hover:from-amber-300 hover:to-amber-500 active:scale-95 text-slate-900 font-black text-base sm:text-lg px-8 sm:px-10 py-3.5 sm:py-4 rounded-full shadow-lg shadow-amber-500/25 hover:shadow-amber-500/40 transition-all group"
            >
              <span>Log in to Shop</span>
              <Arrow className="w-5 h-5 ml-2.5" />
            </Link>

            <Link
              to="/seller-register"
              className="inline-flex items-center text-white/90 hover:text-amber-400 font-bold text-sm sm:text-base border-b-2 border-white/40 hover:border-amber-400 pb-0.5 transition-all group"
            >
              <span>Open Your BizzyQCU Shop</span>
              <Arrow className="w-4 h-4 ml-1.5" />
            </Link>
          </div>

          <section className="w-full pt-12 md:pt-16 px-4">
            <div className="max-w-4xl mx-auto flex flex-wrap items-center justify-center gap-3 sm:gap-4 md:gap-5">
              {badges.map((b) => (
                <div
                  key={b.label}
                  className="flex items-center gap-2.5 px-4 py-2 sm:px-5 sm:py-2.5 rounded-full bg-white/10 hover:bg-white/15 backdrop-blur-sm border border-white/20 shadow-sm transition-all group"
                >
                  <svg className="w-5 h-5 text-amber-400 group-hover:scale-110 transition-transform" fill="currentColor" viewBox="0 0 24 24">
                    <path d={b.path} />
                  </svg>
                  <span className="text-xs sm:text-sm font-bold text-white whitespace-nowrap">{b.label}</span>
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
