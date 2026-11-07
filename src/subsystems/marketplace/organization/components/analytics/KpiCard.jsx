export default function KpiCard({ 
  label, 
  icon, 
  iconClass, 
  value, 
  valueClass = 'text-slate-900',
  delta, 
  deltaNote, 
  footerLabel, 
  footerValue 
}) {
  const isPositive = delta >= 0
  const deltaColor = isPositive ? 'text-emerald-600 bg-emerald-50' : 'text-rose-600 bg-rose-50'
  const deltaSymbol = isPositive ? '↑ +' : '↓ '

  return (
    <div className="bg-white p-5 rounded-xl border border-slate-200/90 shadow-sm flex flex-col justify-between">
      <div className="flex items-center justify-between">
        <span className="text-xs font-medium text-slate-500">{label}</span>
        <span className={`w-7 h-7 rounded-lg flex items-center justify-center ${iconClass}`}>
          {icon}
        </span>
      </div>
      <div className="mt-3">
        <div className={`text-2xl font-bold tracking-tight ${valueClass}`}>{value}</div>
        <div className="flex items-center gap-1.5 mt-1">
          <span className={`inline-flex items-center text-xs font-semibold px-1.5 py-0.5 rounded ${deltaColor}`}>
            {deltaSymbol}{Math.abs(delta)}%
          </span>
          <span className="text-[11px] text-slate-400">{deltaNote}</span>
        </div>
        <div className="mt-2 pt-2 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
          <span>{footerLabel}</span>
          <span className="font-semibold text-slate-800">{footerValue}</span>
        </div>
      </div>
    </div>
  )
}
