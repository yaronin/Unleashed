import { useQuery, useQueryClient } from '@tanstack/react-query'
import { useMemo, useState, type ReactNode } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { supabase } from '../lib/supabase'
import type { ProfileWithState } from '../types/database'

interface UserRow extends ProfileWithState {
  workout_count: number
}

async function fetchAdminData(): Promise<UserRow[]> {
  const { data: profiles, error: pErr } = await supabase
    .from('profiles')
    .select('*, user_state(*)')
    .order('created_at', { ascending: false })
  if (pErr) throw pErr

  const { data: logs, error: lErr } = await supabase.from('workout_logs').select('user_id')
  if (lErr) throw lErr

  const counts: Record<string, number> = {}
  for (const row of logs ?? []) {
    counts[row.user_id] = (counts[row.user_id] ?? 0) + 1
  }

  return (profiles as ProfileWithState[]).map((p) => ({
    ...p,
    workout_count: counts[p.id] ?? 0,
  }))
}

async function updateProfile(
  id: string,
  patch: { role?: 'user' | 'admin'; is_active?: boolean },
) {
  const { error } = await supabase.from('profiles').update(patch).eq('id', id)
  if (error) throw error
}

async function deleteUserViaEdge(userId: string, accessToken: string) {
  const url = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/admin-delete-user`
  const res = await fetch(url, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ userId }),
  })
  const json = await res.json()
  if (!res.ok) throw new Error(json.error ?? 'Delete failed')
}

export function Admin() {
  const { session } = useAuth()
  const queryClient = useQueryClient()
  const [actionError, setActionError] = useState<string | null>(null)

  const { data: users = [], isLoading, error } = useQuery({
    queryKey: ['adminUsers'],
    queryFn: fetchAdminData,
  })

  const stats = useMemo(() => {
    const active = users.filter((u) => u.is_active).length
    const totalWorkouts = users.reduce((s, u) => s + u.workout_count, 0)
    return { total: users.length, active, totalWorkouts }
  }, [users])

  const refresh = () => queryClient.invalidateQueries({ queryKey: ['adminUsers'] })

  const handleToggleActive = async (user: UserRow) => {
    setActionError(null)
    try {
      await updateProfile(user.id, { is_active: !user.is_active })
      await refresh()
    } catch (e) {
      setActionError(String(e))
    }
  }

  const handleToggleRole = async (user: UserRow) => {
    setActionError(null)
    const newRole = user.role === 'admin' ? 'user' : 'admin'
    if (!confirm(`Set ${user.email} role to ${newRole}?`)) return
    try {
      await updateProfile(user.id, { role: newRole })
      await refresh()
    } catch (e) {
      setActionError(String(e))
    }
  }

  const handleDelete = async (user: UserRow) => {
    if (!confirm(`Permanently delete ${user.email} and all their data?`)) return
    setActionError(null)
    try {
      const token = session?.access_token
      if (!token) throw new Error('Not authenticated')
      await deleteUserViaEdge(user.id, token)
      await refresh()
    } catch (e) {
      setActionError(String(e))
    }
  }

  if (isLoading) return <p className="text-slate-400">Loading users…</p>
  if (error) return <p className="text-red-400">Failed to load users: {String(error)}</p>

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-bold">Admin Dashboard</h2>
        <Link to="/" className="text-sm text-accent">
          Back to app
        </Link>
      </div>

      {actionError && (
        <div className="rounded-lg bg-red-500/20 px-3 py-2 text-sm text-red-300">{actionError}</div>
      )}

      <div className="grid grid-cols-3 gap-3">
        <StatCard label="Users" value={stats.total} />
        <StatCard label="Active" value={stats.active} />
        <StatCard label="Workouts" value={stats.totalWorkouts} />
      </div>

      <div className="overflow-x-auto rounded-xl bg-surface-raised">
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="border-b border-surface-overlay text-xs text-slate-400">
              <th className="p-3">Email</th>
              <th className="p-3">Role</th>
              <th className="p-3">Active</th>
              <th className="p-3">Workouts</th>
              <th className="p-3">Week</th>
              <th className="p-3">Joined</th>
              <th className="p-3">Actions</th>
            </tr>
          </thead>
          <tbody>
            {users.map((user) => (
              <tr key={user.id} className="border-b border-surface-overlay/50">
                <td className="p-3 font-medium">{user.email}</td>
                <td className="p-3 capitalize">{user.role}</td>
                <td className="p-3">
                  <span className={user.is_active ? 'text-emerald-400' : 'text-red-400'}>
                    {user.is_active ? 'Yes' : 'No'}
                  </span>
                </td>
                <td className="p-3">{user.workout_count}</td>
                <td className="p-3">{user.user_state?.current_week ?? '—'}</td>
                <td className="p-3 text-slate-400">
                  {new Date(user.created_at).toLocaleDateString()}
                </td>
                <td className="p-3">
                  <div className="flex flex-wrap gap-1">
                    <ActionBtn onClick={() => handleToggleActive(user)}>
                      {user.is_active ? 'Disable' : 'Enable'}
                    </ActionBtn>
                    <ActionBtn onClick={() => handleToggleRole(user)}>
                      {user.role === 'admin' ? 'Demote' : 'Make admin'}
                    </ActionBtn>
                    <ActionBtn onClick={() => handleDelete(user)} danger>
                      Delete
                    </ActionBtn>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

function StatCard({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-xl bg-surface-raised p-3">
      <p className="text-xs text-slate-400">{label}</p>
      <p className="text-2xl font-bold text-accent">{value}</p>
    </div>
  )
}

function ActionBtn({
  children,
  onClick,
  danger,
}: {
  children: ReactNode
  onClick: () => void
  danger?: boolean
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`rounded px-2 py-1 text-xs ${
        danger
          ? 'bg-red-500/20 text-red-300'
          : 'bg-surface-overlay text-slate-300 hover:text-white'
      }`}
    >
      {children}
    </button>
  )
}
