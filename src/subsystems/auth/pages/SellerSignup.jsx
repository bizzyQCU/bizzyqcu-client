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
    accentRing: 'border-[#FFD444] hover:border-[#0284C7] bg-[#F4EB6C]/15',
    iconWrap: 'bg-[#FFD444]/25 border-[#FFD444] text-[#854D0E]',
    iconPath: ['M12 3L1 9l11 6 9-4.91V17h2V9L12 3z', 'M5 13.18v4L12 21l7-3.82v-4L12 17l-7-3.82z'],
    tags: [
      { text: 'OJT Endorsement Doc', cls: 'bg-[#FFD444]/25 text-[#854D0E] border-[#FFD444]/70' },
      { text: 'QCU Student ID', cls: 'bg-white text-slate-600 border-slate-200' },
      { text: 'Live Camera Selfie', cls: 'bg-white text-slate-600 border-slate-200' },
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
    accentRing: 'border-slate-200 hover:border-[#8ACFF8] bg-[#F8FAFC]',
    iconWrap: 'bg-[#8ACFF8]/25 border-[#8ACFF8] text-[#0369A1]',
    iconPath: ['M12 2a5 5 0 100 10 5 5 0 000-10zM4 20a8 8 0 0116 0H4z'],
    tags: [
      { text: 'Proof of Enrollment (COR)', cls: 'bg-sky-50 text-[#0369A1] border-[#8ACFF8]' },
      { text: 'QCU Student ID', cls: 'bg-white text-slate-600 border-slate-200' },
      { text: 'Live Camera Selfie', cls: 'bg-white text-slate-600 border-slate-200' },
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
    accentRing: 'border-slate-200 hover:border-[#8ACFF8] bg-[#F8FAFC]',
    iconWrap: 'bg-sky-100 border-[#8ACFF8] text-[#0284C7]',
    iconPath: [
      'M16 11c1.66 0 2.99-1.34 2.99-3S17.66 5 16 5s-3 1.34-3 3 1.34 3 3 3zm-8 0c1.66 0 2.99-1.34 2.99-3S9.66 5 8 5 5 6.34 5 8s1.34 3 3 3zm0 2c-2.33 0-7 1.17-7 3.5V19h14v-2.5c0-2.33-4.67-3.5-7-3.5zm8 0c-.29 0-.62.02-.97.05 1.16.84 1.97 1.97 1.97 3.45V19h6v-2.5c0-2.33-4.67-3.5-7-3.5z',
    ],
    tags: [
      { text: 'OSA Recognition Cert', cls: 'bg-sky-50 text-[#0369A1] border-[#8ACFF8]' },
      { text: 'Officer QCU ID', cls: 'bg-white text-slate-600 border-slate-200' },
      { text: 'Live Camera Selfie', cls: 'bg-white text-slate-600 border-slate-200' },
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
              <Icon name="auto_awesome" className="text-[#0284C7] text-[20px]" />
              <h1 id="seller-signup-title" className="text-2xl sm:text-[26px] font-extrabold tracking-tight text-slate-900">
                Register a Seller Account
              </h1>
              <Icon name="auto_awesome" className="text-[#0284C7] text-[20px]" />
            </div>
            <p className="text-xs sm:text-sm text-slate-600 mt-1.5">
              Only enrolled QCU students (<code className="text-[#0369A1] font-semibold">STUDENT</code>) may register as campus sellers. Select your seller category and upload your required endorsement document.
            </p>
            <p className="text-xs text-slate-500 mt-2">
              Already have a seller account?{' '}
              <Link className="text-[#0369A1] font-bold hover:text-[#0284C7] hover:underline" to="/seller-login-form">
                Seller Log in
              </Link>
              {' · '}
              Already have a buyer account?{' '}
              <Link className="text-[#0369A1] font-bold hover:text-[#0284C7] hover:underline" to="/account">
                Apply from Account Settings
              </Link>
            </p>

            <div className="inline-flex items-center gap-2 mt-4 px-3.5 py-1 rounded-full bg-[#F4EB6C]/45 border border-[#FFD444]">
              <span className="w-1.5 h-1.5 rounded-full bg-[#0284C7]" />
              <span className="text-[10px] font-extrabold tracking-wider uppercase text-slate-900">
                SELECT YOUR SELLER TYPE:
              </span>
            </div>
          </div>

          {/* Portal Cards */}
          <div className="relative grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            {sellerTypes.map((s) => (
              <div
                key={s.type}
                className={`group relative rounded-2xl border p-5 flex flex-col justify-between transition-all duration-200 hover:-translate-y-0.5 hover:shadow-[0_12px_24px_-4px_rgba(2,132,199,0.10)] ${s.accentRing}`}
              >
                {s.primary && (
                  <div className="absolute -top-2.5 right-3.5">
                    <span className="bg-[#FFD444] text-slate-900 border border-[#EFE768] text-[9px] font-black tracking-wider px-2.5 py-0.5 rounded-full uppercase shadow-sm">
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

                  <h2 className="text-sm font-bold text-slate-900">{s.title}</h2>
                  <p className="text-xs text-slate-600 leading-relaxed mt-1.5">{s.description}</p>

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
                      ? 'bg-[#0284C7] hover:bg-[#0369A1] text-white shadow-[0_8px_20px_-6px_rgba(2,132,199,0.45)]'
                      : 'bg-white hover:bg-sky-50 border-[1.5px] border-[#8ACFF8] hover:border-[#0284C7] text-[#0369A1]'
                  }`}
                >
                  <span>{s.cta}</span>
                </button>
              </div>
            ))}
          </div>

          {/* Footer info */}
          <div className="mt-auto pt-4">
            <div className="text-center border-t border-slate-200 pt-4">
              <p className="text-[11px] text-slate-500 max-w-xl mx-auto leading-relaxed">
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
