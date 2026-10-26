import { Link, useNavigate } from 'react-router-dom'

const sellerTypes = [
  {
    type: 'entrepreneur',
    title: 'Entrepreneurship Student',
    description: 'For Entrepreneurship majors running academic enterprises, Business Implementation, or OJT ventures.',
    badge: 'CURRICULUM',
    primary: true,
    iconBg: 'bg-amber-50',
    iconColor: 'text-amber-700',
    iconPath: ['M12 3L1 9l11 6 9-4.91V17h2V9L12 3z', 'M5 13.18v4L12 21l7-3.82v-4L12 17l-7-3.82z'],
    tags: [
      { text: 'OJT Endorsement', cls: 'bg-slate-100 text-slate-600' },
      { text: 'Business Plan', cls: 'bg-slate-100 text-slate-600' },
      { text: 'Student Venture', cls: 'bg-yellow-100 text-yellow-800 border border-yellow-200' },
    ],
    cta: 'Log In as Entrepreneur',
  },
  {
    type: 'individual',
    title: 'Individual Student',
    description: 'For student makers, crafters, pre-loved sellers, snack creators, or peer freelance service providers.',
    iconBg: 'bg-sky-50',
    iconColor: 'text-sky-600',
    iconPath: ['M12 2a5 5 0 100 10 5 5 0 000-10zM4 20a8 8 0 0116 0H4z'],
    tags: [
      { text: 'Valid QCU ID', cls: 'bg-slate-100 text-slate-600' },
      { text: 'COR Proof', cls: 'bg-slate-100 text-slate-600' },
      { text: 'Campus Pickup', cls: 'bg-cyan-50 text-cyan-700 border border-cyan-200' },
    ],
    cta: 'Log In as Individual',
  },
  {
    type: 'organization',
    title: 'Student Organization',
    description: 'For recognized university student organizations, clubs, college councils, merch drops & ticketing.',
    iconBg: 'bg-purple-50',
    iconColor: 'text-purple-600',
    iconPath: [
      'M16 11c1.66 0 2.99-1.34 2.99-3S17.66 5 16 5s-3 1.34-3 3 1.34 3 3 3zm-8 0c1.66 0 2.99-1.34 2.99-3S9.66 5 8 5 5 6.34 5 8s1.34 3 3 3zm0 2c-2.33 0-7 1.17-7 3.5V19h14v-2.5c0-2.33-4.67-3.5-7-3.5zm8 0c-.29 0-.62.02-.97.05 1.16.84 1.97 1.97 1.97 3.45V19h6v-2.5c0-2.33-4.67-3.5-7-3.5z',
    ],
    tags: [
      { text: 'OSA Recognition', cls: 'bg-slate-100 text-slate-600' },
      { text: 'Org Officer Lead', cls: 'bg-slate-100 text-slate-600' },
      { text: 'Fundraiser Mode', cls: 'bg-purple-50 text-purple-700 border border-purple-200' },
    ],
    cta: 'Log In as Organization',
  },
]

export default function SellerRegister() {
  const navigate = useNavigate()

  const closeModal = () => {
    // Go back if there is in-app history, otherwise go home.
    if (window.history.state && window.history.state.idx > 0) navigate(-1)
    else navigate('/')
  }

  return (
    <>
      <div className="fixed inset-0 -z-10 bg-[#0b1325]" />

      <main className="flex-grow flex items-center justify-center px-4 py-8">
        <div className="bg-white rounded-3xl w-full max-w-[760px] p-10 relative shadow-modal border border-slate-100 text-slate-900">
          <button
            type="button"
            aria-label="Close"
            onClick={closeModal}
            className="absolute top-6 right-6 w-7 h-7 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 hover:text-slate-700 flex items-center justify-center transition-all"
          >
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" viewBox="0 0 24 24">
              <line x1="18" x2="6" y1="6" y2="18" />
              <line x1="6" x2="18" y1="6" y2="18" />
            </svg>
          </button>

          <div className="text-center max-w-xl mx-auto mb-7">
            <h1 className="text-2xl font-extrabold text-slate-900 flex items-center justify-center gap-2">
              <span className="text-slate-400 text-sm">✦</span>
              <span>Log In to Seller Account</span>
              <span className="text-slate-400 text-sm">✦</span>
            </h1>
            <p className="text-xs text-slate-500 font-medium mt-2">
              Choose your seller portal to manage your store, inventory, and orders
            </p>
            <p className="text-[11px] font-medium text-slate-600 mt-2">
              Don't have a seller account yet?{' '}
              <Link className="text-sky-600 font-semibold hover:underline" to="/seller-signup">
                Sign up →
              </Link>
            </p>
            <div className="inline-block mt-4">
              <span className="bg-slate-100 text-slate-600 text-[9px] font-extrabold uppercase px-3 py-1.5 rounded-md">
                START SELLING AS A:
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
            {sellerTypes.map((s) => (
              <div
                key={s.type}
                className="relative bg-white rounded-xl border border-slate-200 p-4 pt-5 flex flex-col justify-between hover:shadow-md transition-shadow"
              >
                {s.badge && (
                  <div className="absolute -top-2.5 right-3">
                    <span className="bg-amber-500 text-slate-950 text-[8px] font-extrabold px-2 py-0.5 rounded uppercase">
                      {s.badge}
                    </span>
                  </div>
                )}
                <div>
                  <div className={`w-10 h-10 rounded-lg ${s.iconBg} flex items-center justify-center mb-3`}>
                    <svg className={`w-5 h-5 ${s.iconColor}`} fill="currentColor" viewBox="0 0 24 24">
                      {s.iconPath.map((d) => (
                        <path key={d} d={d} />
                      ))}
                    </svg>
                  </div>
                  <h2 className="text-[13px] font-bold text-slate-900">{s.title}</h2>
                  <p className="text-[10px] text-slate-500 mt-1.5">{s.description}</p>
                  <div className="flex flex-wrap gap-1.5 mt-3.5">
                    {s.tags.map((t) => (
                      <span key={t.text} className={`${t.cls} text-[8.5px] font-medium px-2 py-0.5 rounded`}>
                        {t.text}
                      </span>
                    ))}
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => navigate(`/seller-auth?type=${s.type}`)}
                  className={`w-full text-[11px] font-bold py-2 px-3 rounded-lg flex items-center justify-center gap-1.5 transition-colors mt-5 ${
                    s.primary
                      ? 'bg-amber-500 hover:bg-amber-600 text-slate-900 shadow-sm'
                      : 'bg-white hover:bg-slate-50 border border-slate-300 text-slate-700'
                  }`}
                >
                  <span>{s.cta}</span>
                  <span className="font-bold">→</span>
                </button>
              </div>
            ))}
          </div>

          <div className="text-center border-t border-slate-100 pt-5">
            <p className="text-[10px] text-slate-400 max-w-lg mx-auto">
              By proceeding, you agree to comply with the{' '}
              <a className="underline text-slate-500 hover:text-slate-700" href="#guidelines">
                QCU Campus Vendor Guidelines
              </a>{' '}
              and student marketplace honor code.
            </p>
          </div>
        </div>
      </main>
    </>
  )
}
