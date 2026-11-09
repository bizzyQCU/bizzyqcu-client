export default function TrafficChannels({ traffic }) {
  return (
    <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
      <div className="mb-4">
        <h3 className="text-base font-bold text-slate-900">Primary Traffic Channels</h3>
        <p className="text-xs text-slate-500">Attribution for {traffic.total.toLocaleString()} unique visits</p>
      </div>

      <div className="space-y-4">
        {traffic.channels.map((channel) => {
          const percentage = Math.round((channel.visits / traffic.total) * 100);
          return (
            <div key={channel.id}>
              <div className="flex items-center justify-between text-sm mb-1.5">
                <div className="flex items-center gap-2">
                  <div className={`w-2 h-2 rounded-full ${channel.dot}`} />
                  <span className="font-medium text-slate-700">{channel.label}</span>
                </div>
                <span className="font-semibold text-slate-900">
                  {percentage}% <span className="text-slate-500 font-normal">({channel.visits})</span>
                </span>
              </div>
              <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden">
                <div 
                  className={`h-full ${channel.color} transition-all duration-500`} 
                  style={{ width: `${percentage}%` }}
                />
              </div>
            </div>
          );
        })}
      </div>

      <div className="mt-4 pt-4 border-t border-slate-200 bg-sky-50 -mx-6 -mb-6 px-6 py-3 rounded-b-xl">
        <div className="flex items-start gap-2">
          <svg className="w-4 h-4 text-sky-600 shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <p className="text-xs text-sky-900">
            <strong className="font-semibold">Insight:</strong> {traffic.insight}
          </p>
        </div>
      </div>
    </div>
  );
}
