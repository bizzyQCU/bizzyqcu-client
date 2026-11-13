import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Icon from '../../../components/Icon.jsx'

const initial = [
  { id: 1, text: 'Maria Santos is on the way to Tech Bldg Room 402.', time: '10:32 AM', to: '/messages' },
  { id: 2, text: 'Your order #BZ-2024-0891 is now Preparing.', time: '10:28 AM', to: '/orders/0891' },
  { id: 3, text: 'Kevin Cruz replied about your calculator.', time: 'Yesterday', to: '/messages' },
]

export default function NotificationsPage() {
  const navigate = useNavigate()
  const [readIds, setReadIds] = useState([])
  const unread = initial.filter((n) => !readIds.includes(n.id)).length

  return (
    <div className="mx-auto max-w-2xl space-y-4">
      <div className="flex items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight text-slate-900">Notifications</h1>
          <p className="mt-1 text-xs text-slate-500">{unread} unread</p>
        </div>
        <button type="button" disabled={unread === 0} onClick={() => setReadIds(initial.map((n) => n.id))} className="rounded-full px-3 py-1.5 text-xs font-semibold text-sky-600 hover:bg-sky-50 disabled:opacity-40">
          Mark all as read
        </button>
      </div>
      <ul className="space-y-2">
        {initial.map((n) => {
          const read = readIds.includes(n.id)
          return (
            <li key={n.id}>
              <button
                type="button"
                onClick={() => {
                  setReadIds((ids) => (ids.includes(n.id) ? ids : [...ids, n.id]))
                  navigate(n.to)
                }}
                className="flex w-full items-start gap-3 rounded-2xl border border-slate-200 bg-white p-4 text-left shadow-sm"
              >
                <span className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full ${read ? 'bg-slate-100 text-slate-400' : 'bg-sky-100 text-sky-600'}`}>
                  <Icon name="bell" className="h-4 w-4" />
                </span>
                <span className="min-w-0 flex-1">
                  <span className={`block text-sm ${read ? 'text-slate-500' : 'font-semibold text-slate-900'}`}>{n.text}</span>
                  <span className="mt-1 block text-[11px] text-slate-400">{n.time}</span>
                </span>
                {!read && <span className="mt-2 h-2 w-2 shrink-0 rounded-full bg-sky-500" />}
              </button>
            </li>
          )
        })}
      </ul>
    </div>
  )
}
