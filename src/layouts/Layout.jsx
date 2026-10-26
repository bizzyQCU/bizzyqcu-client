import { useEffect } from 'react'
import { Outlet, useLocation } from 'react-router-dom'
import Navbar from '../components/Navbar.jsx'
import Footer from '../components/Footer.jsx'

// Scrolls to #hash targets on route change, or to top when there's no hash.
function ScrollManager() {
  const { pathname, hash } = useLocation()

  useEffect(() => {
    if (hash) {
      const el = document.querySelector(hash)
      if (el) {
        el.scrollIntoView({ behavior: 'smooth' })
        return
      }
    }
    window.scrollTo({ top: 0 })
  }, [pathname, hash])

  return null
}

export default function Layout() {
  return (
    <div className="min-h-screen flex flex-col text-white overflow-x-hidden">
      <ScrollManager />
      <Navbar />
      <Outlet />
      <Footer />
    </div>
  )
}
