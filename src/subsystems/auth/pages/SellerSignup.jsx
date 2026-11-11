import { Link, useNavigate } from 'react-router-dom'
import { AuthCard, Icon, TrustBadges } from '../components/AuthUI.jsx'

const sellerTypes = [
  {
    type: 'enterprise',
    sellerType: 'STUDENT_ENTERPRISE',
    route: '/seller-signup/enterprise',
    title: 'Student Enterprise',
    description:
      'For BS Entrepreneurship students running academic enterprises, Business Implementation, or OJT ventures.',
    badge: 'STUDENT_ENTERPRISE',
    primary: true,
    accentRing: 'border-amber-400/35 hover:border-amber-400/70 bg-amber-500/[0.05]',
    iconWrap: 'bg-amber-400/15 border-amber-400/30 text-amber-400',
    iconPath: ['M12 3L1 9l11 6 9-4.91V17h2V9L12 3z', 'M5 13.18v4L12 21l7-3.82v-4L12 17l-7-3.82z'],
    tags: [
      { text: 'OJT Endorsement Doc', cls: 'bg-amber-400/15 text-amber-300 border-amber-400/30' },
      { text: 'QCU Student ID', cls: 'bg-white/[0.06] text-slate-300 border-white/10' },
      { text: 'Live Camera Selfie', cls: 'bg-white/[0.06] text-slate-300 border-white/10' },
    ],
    cta: 'Register as Student Enterprise',
  },
  {
    type: 'individual',
    sellerType: 'INDEPENDENT_SELLER',
    route: '/seller-signup/individual',
    title: 'Independent Seller',
    description:
      'For enrolled QCU students selling handmade crafts, food, pre-loved goods, or peer services on their own.',
    badge: 'INDEPENDENT_SELLER',
    accentRing: 'border-white/10 hover:border-sky-400/50 bg-white/[0.03]',
    iconWrap: 'bg-sky-400/15 border-sky-400/30 text-sky-400',
    iconPath: ['M12 2a5 5 0 100 10 5 5 0 000-10zM4 20a8 8 0 0116 0H4z'],
    tags: [
      { text: 'Proof of Enrollment (COR)', cls: 'bg-sky-400/15 text-sky-300 border-sky-400/30' },
      { text: 'QCU Student ID', cls: 'bg-white/[0.06] text-slate-300 border-white/10' },
      { text: 'Live Camera Selfie', cls: 'bg-white/[0.06] text-slate-300 border-white/10' },
    ],
    cta: 'Register as Independent Seller',
  },
  {
    type: 'organization',
    sellerType: 'RECOGNIZED_ORGANIZATION',
    route: '/seller-signup/organization',
    title: 'Recognized Organization',
    description:
      'For accredited QCU student organizations, clubs, and councils selling official merchandise or event items.',
    badge: 'RECOGNIZED_ORGANIZATION',
    accentRing: 'border-white/10 hover:border-purple-400/50 bg-white/[0.03]',
    iconWrap: 'bg-purple-400/15 border-purple-400/30 text-purple-400',
    iconPath: [
      'M16 11c1.66 0 2.99-1.34 2.99-3S17.66 5 16 5s-3 1.34-3 3 1.34 3 3 3zm-8 0c1.66 0 2.99-1.34 2.99-3S9.66 5 8 5 5 6.34 5 8s1.34 3 3 3zm0 2c-2.33 0-7 1.17-7 3.5V19h14v-2.5c0-2.33-4.67-3.5-7-3.5zm8 0c-.29 0-.62.02-.97.05 1.16.84 1.97 1.97 1.97 3.45V19h6v-2.5c0-2.33-4.67-3.5-7-3.5z',
    ],
    tags: [
      { text: 'OSA Recognition Cert', cls: 'bg-purple-400/15 text-purple-300 border-purple-400/30' },
      { text: 'Officer QCU ID', cls: 'bg-white/[0.06] text-slate-300 border-white/10' },
      { text: 'Live Camera Selfie', cls: 'bg-white/[0.06] text-slate-300 border-white/10' },
    ],
    cta: 'Register as Organization',
  },
]

export default function SellerSignup() {
  const navigate = useNavigate()

  const closeModal = () => {
    if (window.history.state && window.history.state.idx > 0) navigate(-1)
    else navigate('/seller-login-form')
  }

  return (
    <main className="flex-1 min-h-0 flex flex-col items-center justify-center px-4 sm:px-6 pt-20 pb-2 lg:py-4">
      <section className="w-full max-w-[840px]" aria-labelledby="seller-signup-title">
        <AuthCard onClose={closeModal} closeLabel="Close">
          {/* Header */}
          <div className="relative text-center max-w-xl mx-auto mb-6">
            <div className="flex items-center justify-center gap-2">
              <Icon name="auto_awesome" className="text-amber-400 text-[20px]" />
              <h1 id="seller-signup-title" className="text-2xl sm:text-[26px] font-extrabold tracking-tight text-white">
                Register a Seller Account
              </h1>
              <Icon name="auto_awesome" className="text-amber-400 text-[20px]" />
            </div>
            <p className="text-xs sm:text-sm text-slate-400 mt-1.5">
              Only enrolled QCU students (<code className="text-amber-300">STUDENT</code>) may register as campus sellers. Select your seller category and upload your required endorsement document.
            </p>
            <p className="text-xs text-slate-400 mt-2">
              Already have a seller account?{' '}
              <Link className="text-amber-300 font-bold hover:text-amber-200 hover:underline" to="/seller-login-form">
                Seller Log in
              </Link>
              {' · '}
              Already have a buyer account?{' '}
              <Link className="text-amber-300 font-bold hover:text-amber-200 hover:underline" to="/account">
                Apply from Account Settings
              </Link>
            </p>

            <div className="inline-flex items-center gap-2 mt-4 px-3.5 py-1 rounded-full bg-amber-500/10 border border-amber-400/25">
              <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
              <span className="text-[10px] font-extrabold tracking-wider uppercase text-amber-300">
                SELECT YOUR SELLER TYPE:
              </span>
            </div>
          </div>

          {/* Portal Cards */}
          <div className="relative grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            {sellerTypes.map((s) => (
              <div
                key={s.type}
                className={`group relative rounded-2xl border p-5 flex flex-col justify-between transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lg hover:shadow-black/30 ${s.accentRing}`}
              >
                {s.primary && (
                  <div className="absolute -top-2.5 right-3.5">
                    <span className="bg-gradient-to-r from-amber-400 to-amber-500 text-slate-950 text-[9px] font-black tracking-wider px-2.5 py-0.5 rounded-full uppercase shadow-sm shadow-amber-500/30">
                      CURRICULUM
                    </span>
                  </div>
                )}

                <div>
                  <div className={`w-11 h-11 rounded-xl border ${s.iconWrap} flex items-center justify-center mb-3.5 transition-transform duration-200 group-hover:scale-105`}>
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                      {s.iconPath.map((d) => (
                        <path key={d} d={d} />
                      ))}
                    </svg>
                  </div>

                  <h2 className="text-sm font-bold text-white">{s.title}</h2>
                  <p className="text-xs text-slate-400 leading-relaxed mt-1.5">{s.description}</p>

                  <p className="mt-3 text-[10px] font-bold uppercase tracking-wider text-slate-500">
                    Required Verification:
                  </p>
                  <div className="flex flex-wrap gap-1.5 mt-1.5">
                    {s.tags.map((t) => (
                      <span
                        key={t.text}
                        className={`border ${t.cls} text-[10px] font-semibold px-2.5 py-0.5 rounded-md`}
                      >
                        {t.text}
                      </span>
                    ))}
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => navigate(s.route)}
                  className={`w-full text-xs font-extrabold py-2.5 px-3.5 rounded-xl flex items-center justify-center gap-1.5 transition-all duration-200 mt-5 active:scale-[0.98] ${
                    s.primary
                      ? 'bg-gradient-to-r from-amber-400 via-amber-500 to-amber-600 hover:from-amber-300 hover:via-amber-400 hover:to-amber-500 text-slate-950 ring-1 ring-inset ring-amber-200/50 shadow-md shadow-amber-500/25'
                      : 'bg-white/[0.05] hover:bg-white/[0.1] border border-white/15 hover:border-amber-400/40 text-white hover:text-amber-300'
                  }`}
                >
                  <span>{s.cta}</span>
                </button>
              </div>
            ))}
          </div>

          {/* Footer info */}
          <div className="mt-auto pt-4">
            <div className="text-center border-t border-white/10 pt-4">
              <p className="text-[11px] text-slate-400 max-w-xl mx-auto leading-relaxed">
                Both your QCU ID and your seller supporting document must be verified by an administrator before your store can open on the marketplace.
              </p>
            </div>
          </div>
        </AuthCard>

        <TrustBadges items={['Official QCU Seller Portal', 'RA 10173 Data Privacy Protected']} />
      </section>
    </main>
  )
}
