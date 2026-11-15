import { Link, useLocation } from 'react-router-dom'
import {
  LayoutDashboard,
  Package,
  Boxes,
  ClipboardList,
  BarChart3,
  Settings,
  LogOut,
} from 'lucide-react'

const navigation = [
  { name: 'Dashboard', href: '/seller/dashboard', icon: LayoutDashboard },
  { name: 'Products', href: '/seller/products', icon: Package },
  { name: 'Inventory Management', href: '/seller/inventory', icon: Boxes },
  { name: 'Orders', href: '/seller/orders', icon: ClipboardList },
  { name: 'Reports & Analytics', href: '/seller/analytics', icon: BarChart3 },
]

export default function SellerSidebar() {
  const location = useLocation()

  const handleLogout = () => {
    // TODO: Add logout logic when auth is implemented
    console.log('Logout clicked')
  }

  return (
    <aside className="w-64 bg-[#0F172A] text-slate-300 flex flex-col justify-between shrink-0 min-h-screen">
      {/* Logo and Title */}
      <div>
        <div className="p-6 flex items-center space-x-3">
          <div className="w-9 h-9 bg-[#0284C7] rounded-lg flex items-center justify-center font-bold text-white text-xl">
            B
          </div>
          <div>
            <h1 className="font-bold text-white text-lg leading-none">
              Bizzy<span className="text-[#0284C7]">QCU</span>
            </h1>
            <span className="text-[10px] tracking-wider text-slate-400 font-semibold uppercase">
              Student Org Seller Portal
            </span>
          </div>
        </div>

        {/* Navigation */}
        <nav className="px-3 mt-4 space-y-1" aria-label="Main navigation">
          {navigation.map((item) => {
            const isActive = location.pathname === item.href
            const Icon = item.icon

            return (
              <Link
                key={item.name}
                to={item.href}
                className={`flex items-center space-x-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                  isActive
                    ? 'bg-[#0284C7] text-white shadow-sm'
                    : 'text-slate-400 hover:text-white hover:bg-slate-800'
                }`}
                aria-current={isActive ? 'page' : undefined}
              >
                <Icon className="w-5 h-5" />
                <span>{item.name}</span>
              </Link>
            )
          })}
        </nav>
      </div>

      {/* Footer */}
      <div className="p-3 border-t border-slate-800 space-y-1">
        <Link
          to="/seller/settings"
          className="flex items-center space-x-3 px-3 py-2.5 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white text-sm font-medium transition-colors"
        >
          <Settings className="w-5 h-5" />
          <span>Account Settings</span>
        </Link>
        <button
          onClick={handleLogout}
          className="w-full flex items-center space-x-3 px-3 py-2.5 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white text-sm font-medium transition-colors text-left"
        >
          <LogOut className="w-5 h-5" />
          <span>Log Out</span>
        </button>
      </div>
    </aside>
  )
}
