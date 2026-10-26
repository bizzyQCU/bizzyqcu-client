import { Link, NavLink, useNavigate } from 'react-router-dom'
import Logo from './Logo.jsx'

const CART_COUNT = 2

const hashLinks = [
  { label: 'PRODUCTS', to: '/#products' },
  { label: 'ENTERPRISES', to: '/#enterprises' },
  { label: 'ABOUT US', to: '/#about' },
]

export default function Navbar() {
  const navigate = useNavigate()

  return (
    <header className="w-full pt-4 md:pt-6 px-4 sm:px-6 lg:px-10 z-50">
      <nav className="max-w-7xl mx-auto bg-white/95 backdrop-blur-md rounded-2xl md:rounded-full px-5 py-2.5 sm:px-8 sm:py-3 shadow-lg shadow-black/10 flex items-center justify-between transition-all duration-200">
        <Link to="/" className="flex items-center gap-2.5 group" aria-label="BizzyQCU home">
          <Logo />
        </Link>

        <div className="hidden md:flex items-center space-x-7 lg:space-x-10 text-xs sm:text-sm font-extrabold tracking-wider">
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
          {hashLinks.map((l) => (
            <Link key={l.label} to={l.to} className="text-slate-700 hover:text-[#10439F] transition-colors">
              {l.label}
            </Link>
          ))}
        </div>

        <div className="flex items-center space-x-3 sm:space-x-4">
          <button
            type="button"
            aria-label="Cart"
            onClick={() => navigate('/#cart')}
            className="relative p-2 text-[#103D84] hover:text-amber-500 transition-colors"
          >
            <svg className="w-6 h-6 stroke-current" fill="none" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.2" viewBox="0 0 24 24">
              <circle cx="9" cy="21" r="1" />
              <circle cx="20" cy="21" r="1" />
              <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" />
            </svg>
            <span className="absolute top-1 right-0.5 bg-[#E88E0E] text-white text-[10px] font-black w-4 h-4 rounded-full flex items-center justify-center border border-white">
              {CART_COUNT}
            </span>
          </button>

          <button
            type="button"
            aria-label="Profile"
            onClick={() => navigate('/login')}
            className="text-[#103D84] hover:opacity-85 transition-opacity"
          >
            <svg className="w-8 h-8 fill-[#103D84]" viewBox="0 0 24 24">
              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 3c1.93 0 3.5 1.57 3.5 3.5S13.93 12 12 12s-3.5-1.57-3.5-3.5S10.07 5 12 5zm0 14.2c-2.5 0-4.71-1.28-6-3.22.03-1.99 4-3.08 6-3.08 1.99 0 5.97 1.09 6 3.08-1.29 1.94-3.5 3.22-6 3.22z" />
            </svg>
          </button>
        </div>
      </nav>
    </header>
  )
}
