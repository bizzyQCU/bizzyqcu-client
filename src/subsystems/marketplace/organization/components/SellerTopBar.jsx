import { MessageSquare, Bell, User } from 'lucide-react'

export default function SellerTopBar({ onMessagesClick }) {
  return (
    <header className="h-16 bg-white border-b border-slate-200 px-8 flex items-center justify-between sticky top-0 z-20">
      <div>
        <h2 className="font-bold text-slate-900 text-base">
          QCU Computer Society (QCS)
        </h2>
        <p className="text-xs text-slate-500">
          AWS IK Building, Basement, Booth No. 3
        </p>
      </div>
      <div className="flex items-center space-x-4">
        {/* Messages Button */}
        <button
          onClick={onMessagesClick}
          className="p-2 text-slate-500 hover:text-slate-700 hover:bg-slate-100 rounded-full transition-colors"
          aria-label="Messages"
          title="Messages"
        >
          <MessageSquare className="w-5 h-5" />
        </button>
        
        {/* Notifications Button */}
        <button
          className="p-2 text-slate-500 hover:text-slate-700 hover:bg-slate-100 rounded-full transition-colors relative"
          aria-label="Notifications"
          title="Notifications"
        >
          <Bell className="w-5 h-5" />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-rose-500 rounded-full" />
        </button>
        
        {/* User Profile */}
        <div
          className="w-8 h-8 rounded-full bg-[#0284C7] text-white flex items-center justify-center cursor-pointer hover:bg-[#0369A1] transition-colors"
          title="Profile"
        >
          <User className="w-5 h-5" />
        </div>
      </div>
    </header>
  )
}
