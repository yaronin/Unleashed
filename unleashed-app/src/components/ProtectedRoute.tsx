import { Navigate, Outlet } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { supabaseConfigured } from '../lib/supabase'

export function ProtectedRoute() {
  const { session, loading } = useAuth()

  if (!supabaseConfigured) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-surface p-4">
        <div className="max-w-md rounded-xl bg-surface-raised p-6 text-center">
          <h2 className="text-lg font-bold text-red-400">Supabase not configured</h2>
          <p className="mt-2 text-sm text-slate-400">
            Set <code className="text-accent">VITE_SUPABASE_URL</code> and{' '}
            <code className="text-accent">VITE_SUPABASE_ANON_KEY</code> in your environment.
          </p>
        </div>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-surface">
        <p className="text-slate-400">Loading…</p>
      </div>
    )
  }

  if (!session) {
    return <Navigate to="/login" replace />
  }

  return <Outlet />
}
