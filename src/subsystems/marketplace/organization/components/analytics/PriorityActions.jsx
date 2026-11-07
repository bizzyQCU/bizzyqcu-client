import { Link } from 'react-router-dom'

const severityStyles = {
  urgent: {
    bg: 'bg-amber-50',
    border: 'border-amber-200',
    icon: 'text-amber-600',
    title: 'text-amber-900',
  },
  info: {
    bg: 'bg-sky-50',
    border: 'border-sky-200',
    icon: 'text-sky-600',
    title: 'text-sky-900',
  },
}

const variantStyles = {
  primary: 'bg-[#0091FF] hover:bg-[#0284C7] text-white',
  secondary: 'bg-white hover:bg-slate-50 text-slate-700 border border-slate-200',
}

export default function PriorityActions({ actions, nextReview }) {
  return (
    <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-base font-bold text-slate-900">Priority Actions</h3>
          <p className="text-xs text-slate-500">Inventory &amp; sales priorities requiring attention</p>
        </div>
        <span className="inline-flex items-center gap-1.5 text-[10px] font-semibold text-emerald-700 bg-emerald-100 px-2 py-1 rounded">
          <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          Audit Verified
        </span>
      </div>

      <div className="space-y-3">
        {actions.map((action) => {
          const style = severityStyles[action.severity]
          return (
            <div 
              key={action.id} 
              className={`${style.bg} ${style.border} border rounded-lg p-4`}
            >
              <div className="flex items-start gap-3">
                <svg className={`w-5 h-5 ${style.icon} shrink-0 mt-0.5`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
                <div className="flex-1">
                  <h4 className={`text-sm font-bold ${style.title}`}>{action.title}</h4>
                  <p className="text-xs text-slate-600 mt-1">{action.body}</p>
                  <Link 
                    to={action.to}
                    className={`inline-flex items-center gap-1.5 mt-3 px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors ${variantStyles[action.variant]}`}
                  >
                    {action.cta}
                    <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                    </svg>
                  </Link>
                </div>
              </div>
            </div>
          )
        })}
      </div>

      <div className="mt-4 pt-4 border-t border-slate-200 flex items-center justify-between text-xs">
        <span className="text-slate-500">
          Next executive review: <strong className="text-slate-900">{nextReview}</strong>
        </span>
        <button 
          type="button"
          className="text-[#0091FF] hover:text-[#0284C7] font-semibold hover:underline"
        >
          Generate Full Org Report →
        </button>
      </div>
    </div>
  )
}
