import { Navigate, useLocation } from 'react-router-dom'
import { useAuth } from '../../../hooks/useAuth'
import { Spinner } from './AuthUI.jsx'

/**
 * Guards routes that call `requireAuth` endpoints on the server.
 * Waits for the stored token to be checked (GET /auth/profile) before deciding.
 */
export default function RequireAuth({ children }) {
  const { isAuthenticated, loading } = useAuth()
  const location = useLocation()

  if (loading) {
    return (
      <main className="flex-grow flex items-center justify-center py-20 text-slate-300 gap-2">
        <Spinner />
        <span className="text-sm">Checking your session…</span>
      </main>
    )
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace state={{ from: location.pathname }} />
  }

  return children
}

