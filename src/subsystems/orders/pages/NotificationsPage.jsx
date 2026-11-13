import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Icon from '../../../components/Icon.jsx'
import { useAuth } from '../../../hooks/useAuth'
import { getMyOrders } from '../api.js'

const STATUS_MESSAGES = {
  PENDING_PAYMENT: 'is waiting for payment',
  PENDING_CONFIRMATION: 'is waiting for seller confirmation',
  PREPARING: 'is now Preparing',
  READY_FOR_PICKUP: 'is Ready for pickup',
  OUT_FOR_DELIVERY: 'is Out for delivery',
  COMPLETED: 'has been Completed',
  CANCELLED: 'was Cancelled',
}

export default function NotificationsPage() {
  const navigate = useNavigate()
  const { isAuthenticated, loading: authLoading } = useAuth()
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [readIds, setReadIds] = useState([])

  useEffect(() => {
    if (authLoading) return
    if (!isAuthenticated) {
      setItems([])
      setLoading(false)
      return
    }
    let ignore = false
    setLoading(true)
    getMyOrders()
      .then((res) => {
        if (ignore) return
        const mapped = (res.data ?? []).map((order) => {
          const phrase = STATUS_MESSAGES[order.orderStatus] || `updated (${order.orderStatus})`
          return {
            id: order.id,
            text: `Order #${order.orderNumber} from ${order.store?.name || 'Seller'} ${phrase}.`,
            time: new Date(order.updatedAt || order.createdAt).toLocaleString(),
            to: `/orders/${order.id}`,
          }
        })
        setItems(mapped)
      })
      .catch(() => {
        if (!ignore) setItems([])
      })
      .finally(() => {
        if (!ignore) setLoading(false)
      })
    return () => {
      ignore = true
    }
  }, [isAuthenticated, authLoading])

  const unread = items.filter((n) => !readIds.includes(n.id)).length

  return (
    <div className="mx-auto max-w-2xl space-y-4">
      <div className="flex items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight text-slate-900">Notifications</h1>
          <p className="mt-1 text-xs text-slate-500">{unread} unread</p>
        </div>
        <button
          type="button"
          disabled={unread === 0}
          onClick={() => setReadIds(items.map((n) => n.id))}
          className="rounded-full px-3 py-1.5 text-xs font-semibold text-sky-600 hover:bg-sky-50 disabled:opacity-40"
        >
          Mark all as read
        </button>
      </div>

      {loading ? (
        <p className="py-10 text-center text-sm text-slate-500">Loading notifications…</p>
      ) : items.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-10 text-center text-sm text-slate-500">
          {isAuthenticated ? 'No notifications yet.' : 'Sign in to view your order notifications.'}
        </div>
      ) : (
        <ul className="space-y-2">
          {items.map((n) => {
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
      )}
    </div>
  )
}
