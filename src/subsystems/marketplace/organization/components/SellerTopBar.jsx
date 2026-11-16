import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { MessageSquare, Bell, User } from 'lucide-react'
import { getMyStore } from '../../api'

export default function SellerTopBar({ storeName, storeLocation, onMessagesClick }) {
  const navigate = useNavigate()
  const [fetchedStore, setFetchedStore] = useState({ name: '', pickupLocation: '' })

  useEffect(() => {
    if (storeName && storeLocation) return undefined
    let active = true

    getMyStore()
      .then((res) => {
        if (!active) return
        const store = res?.data || res
        if (store) {
          setFetchedStore({
            name: store.name || '',
            pickupLocation: store.pickupLocation || '',
          })
        }
      })
      .catch(() => {
        // Seller may not have created a store yet; fallback labels apply cleanly.
      })

    return () => {
      active = false
    }
  }, [storeName, storeLocation])

  const displayName = storeName || fetchedStore.name || 'Organization Store'
  const displayLocation =
    storeLocation || fetchedStore.pickupLocation || 'Campus Pickup Location'

  const handleMessages = () => {
    if (onMessagesClick) {
      onMessagesClick()
    } else {
      navigate('/seller/org/messages')
    }
  }

  return (
    <header className="h-16 bg-white border-b border-slate-200 px-8 flex items-center justify-between sticky top-0 z-20">
      <div className="min-w-0">
        <h2 className="font-bold text-slate-900 text-base truncate">{displayName}</h2>
        <p className="text-xs text-slate-500 truncate">{displayLocation}</p>
      </div>
      <div className="flex items-center space-x-4 shrink-0">
        <button
          type="button"
          onClick={handleMessages}
          className="p-2 text-slate-500 hover:text-slate-700 hover:bg-slate-100 rounded-full transition-colors"
          aria-label="Messages"
          title="Messages"
        >
          <MessageSquare className="w-5 h-5" />
        </button>

        <button
          type="button"
          onClick={() => navigate('/seller/org/orders')}
          className="p-2 text-slate-500 hover:text-slate-700 hover:bg-slate-100 rounded-full transition-colors relative"
          aria-label="Notifications"
          title="Orders & Notifications"
        >
          <Bell className="w-5 h-5" />
        </button>

        <button
          type="button"
          onClick={() => navigate('/seller/org/settings')}
          className="w-8 h-8 rounded-full bg-[#0284C7] text-white flex items-center justify-center cursor-pointer hover:bg-[#0369A1] transition-colors"
          aria-label="Account Settings"
          title="Account Settings"
        >
          <User className="w-5 h-5" />
        </button>
      </div>
    </header>
  )
}
