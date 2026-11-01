import { Link, NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom'
import Icon from '../../components/Icon.jsx'
import { useCart } from '../../lib/CartContext.jsx'
import useIsMobile from '../../hooks/useIsMobile.js'
import logo from '../../assets/bizzyqcu-logo.png'

const navClass = ({ isActive }) =>
  `relative pb-1 transition-colors hover:text-[#0284C7] ${
    isActive
      ? "text-[#0284C7] after:absolute after:bottom-0 after:left-0 after:right-0 after:h-[2.5px] after:rounded-full after:bg-[#FFD444] after:content-['']"
      : 'text-slate-600'
  }`

// Subsystem 3 shell, following the prototype: light canvas, floating header, and cart on phones.
export default function OrdersLayout() {
  const navigate = useNavigate()
  const { pathname } = useLocation()
  const { count } = useCart()
  const mobile = useIsMobile()
  const covered = /^\/(cart|messages)/.test(pathname)

  return (
    <div className="flex min-h-screen flex-col bg-[#F8FAFC] text-slate-800 antialiased">
      {mobile && !covered && (
        <header className="flex shrink-0 items-center justify-between border-b border-slate-200 bg-white px-4 py-2.5">
          <Link to="/marketplace" className="flex items-center gap-2">
            <img src={logo} alt="BizzyQCU logo" className="h-8 w-8 rounded-lg object-cover" />
            <span className="text-base font-bold tracking-tight text-slate-900">Bizzy<span className="text-[#F59E0B]">QCU</span></span>
          </Link>
          <button type="button" aria-label="Cart" onClick={() => navigate('/cart')} className="relative rounded-full p-2 text-slate-600">
            <Icon name="cart" className="h-5 w-5" strokeWidth={1.8} />
            {count > 0 && <span className="absolute right-0.5 top-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-[#0284C7] text-[10px] font-bold text-white ring-2 ring-white">{count}</span>}
          </button>
        </header>
      )}

      {!mobile && (
        <header className="z-40 flex shrink-0 justify-center px-4 pt-3">
          <div className="flex w-full max-w-7xl items-center justify-between rounded-full border border-slate-200/80 bg-white px-6 py-2.5 shadow-[0_4px_16px_-4px_rgba(15,23,42,0.08)]">
            <Link to="/marketplace" className="flex items-center gap-2.5">
              <img src={logo} alt="BizzyQCU logo" className="h-9 w-9 rounded-xl object-cover shadow-sm" />
              <span className="text-lg font-bold tracking-tight text-slate-900">Bizzy<span className="text-[#F59E0B]">QCU</span></span>
            </Link>
            <nav className="flex items-center gap-8 text-xs font-bold uppercase tracking-wider">
              <NavLink to="/marketplace" className={navClass}>Marketplace</NavLink>
              <NavLink to="/orders" className={navClass}>Orders</NavLink>
            </nav>
            <div className="flex items-center gap-5">
              <button type="button" aria-label="Cart" onClick={() => navigate('/cart')} className="relative p-1.5 text-slate-500 transition hover:text-slate-700">
                <Icon name="cart" className="h-5 w-5" strokeWidth={1.8} />
                {count > 0 && <span className="absolute right-0.5 top-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-[#0284C7] text-[10px] font-bold text-white ring-2 ring-white">{count}</span>}
              </button>
              <span className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-200 text-xs font-semibold text-slate-700">JB</span>
            </div>
          </div>
        </header>
      )}

      <main className="mx-auto flex w-full max-w-7xl flex-1 flex-col px-4 pb-28 pt-6 md:pb-12 sm:px-6 lg:px-8">
        <Outlet />
      </main>
    </div>
  )
}
