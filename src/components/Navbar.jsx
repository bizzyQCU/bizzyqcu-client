import { useState, useEffect } from 'react'
import { Link, NavLink, useNavigate } from 'react-router-dom'
import { useAuth } from '../hooks'
import Logo from './Logo.jsx'

export default function Navbar() {
  const navigate = useNavigate()
  const { user, isAdmin, logout } = useAuth()
  const [cartCount, setCartCount] = useState(0)

  // Sync cart count
  useEffect(() => {
    const updateCount = () => {
      try {
        const saved = JSON.parse(localStorage.getItem('bizzyqcu_cart') || '[]')
        setCartCount(saved.reduce((sum, item) => sum + (item.quantity || 1), 0))
      } catch {
        setCartCount(0)
      }
    }
    updateCount()
    window.addEventListener('storage', updateCount)
    return () => window.removeEventListener('storage', updateCount)
  }, [])

  return (
    <header className="w-full pt-4 md:pt-6 px-4 sm:px-6 lg:px-10 z-50">
      <nav className="max-w-7xl mx-auto bg-white/95 backdrop-blur-md rounded-2xl md:rounded-full px-5 py-2.5 sm:px-8 sm:py-3 shadow-lg shadow-black/10 flex items-center justify-between transition-all duration-200">
        <Link to="/" className="flex items-center gap-2.5 group" aria-label="BizzyQCU home">
          <Logo />
        </Link>

        {/* Navigation Links */}
        <div className="hidden md:flex items-center space-x-6 lg:space-x-8 text-xs sm:text-sm font-extrabold tracking-wider">
          <NavLink
            to="/"
            end
            className={({ isActive }) =>
              `transition-colors hover:text-[#10439F] ${
                isActive ? 'text-[#10439F] border-b-2 border-[#10439F] pb-0.5' : 'text-slate-700'
              }`
            }
          >
            HOME
          </NavLink>

          <NavLink
            to="/marketplace"
            className={({ isActive }) =>
              `transition-colors hover:text-[#10439F] ${
                isActive ? 'text-[#10439F] border-b-2 border-[#10439F] pb-0.5' : 'text-slate-700'
              }`
            }
          >
            MARKETPLACE
          </NavLink>

          {user && (
            <NavLink
              to="/orders"
              className={({ isActive }) =>
                `transition-colors hover:text-[#10439F] ${
                  isActive ? 'text-[#10439F] border-b-2 border-[#10439F] pb-0.5' : 'text-slate-700'
                }`
              }
            >
              MY ORDERS
            </NavLink>
          )}

          {/* CONTACT ADMIN (Visible to all students, customers, and sellers) */}
          <NavLink
            to="/contact-admin"
            className={({ isActive }) =>
              `transition-colors flex items-center gap-1.5 ${
                isActive
                  ? 'text-amber-600 border-b-2 border-amber-600 pb-0.5'
                  : 'text-amber-600 hover:text-amber-700 font-bold'
              }`
            }
          >
            <span>🛡️</span>
            <span>CONTACT ADMIN</span>
          </NavLink>

          {isAdmin && (
            <NavLink
              to="/admin"
              className={({ isActive }) =>
                `transition-colors hover:text-[#10439F] ${
                  isActive ? 'text-[#10439F] border-b-2 border-[#10439F] pb-0.5' : 'text-slate-900 font-black'
                }`
              }
            >
              ADMIN PORTAL
            </NavLink>
          )}
        </div>

        {/* Right Action Icons & Auth Profile */}
        <div className="flex items-center space-x-3 sm:space-x-4">
          {/* Cart Icon */}
          <button
            type="button"
            aria-label="Cart"
            onClick={() => navigate('/cart')}
            className="relative p-2 text-[#103D84] hover:text-amber-500 transition-colors"
          >
            <svg
              className="w-6 h-6 stroke-current"
              fill="none"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2.2"
              viewBox="0 0 24 24"
            >
              <circle cx="9" cy="21" r="1" />
              <circle cx="20" cy="21" r="1" />
              <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" />
            </svg>
            {cartCount > 0 && (
              <span className="absolute top-1 right-0.5 bg-[#E88E0E] text-white text-[10px] font-black w-4 h-4 rounded-full flex items-center justify-center border border-white">
                {cartCount}
              </span>
            )}
          </button>

          {/* User Status / Login Button */}
          {user ? (
            <div className="flex items-center gap-2">
              <div className="hidden sm:block text-right">
                <div className="text-xs font-bold text-slate-800 line-clamp-1">{user.fullName}</div>
                <div className="text-[10px] font-mono text-slate-500">{user.qcuIdNumber || user.role}</div>
              </div>
              <button
                type="button"
                onClick={logout}
                title="Sign Out"
                className="px-3 py-1.5 rounded-full text-xs font-bold text-slate-700 hover:text-rose-600 hover:bg-rose-50 border border-slate-200 transition-colors"
              >
                Sign Out
              </button>
            </div>
          ) : (
            <Link
              to="/login"
              className="px-4 py-1.5 rounded-full bg-[#10439F] hover:bg-[#0c347d] text-white text-xs font-extrabold shadow-sm transition-colors"
            >
              Log In
            </Link>
          )}
        </div>
      </nav>
    </header>
  )
}
