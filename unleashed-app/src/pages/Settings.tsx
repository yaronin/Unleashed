import { useEffect, useState } from 'react'
import { useAuth } from '../context/AuthContext'
import { useProgram } from '../hooks/useProgram'
import { useResetAllData, useUpdateUserState, useUserState } from '../hooks/useWorkoutLog'
import type { UserState } from '../types/workout-log'

export function Settings() {
  const program = useProgram()
  const { profile, signOut } = useAuth()
  const serverState = useUserState()
  const updateState = useUpdateUserState()
  const resetData = useResetAllData()
  const [form, setForm] = useState<UserState | null>(null)
  const [saved, setSaved] = useState(false)

  useEffect(() => {
    if (serverState?.user_id) setForm(serverState)
  }, [serverState])

  if (!form) return <p className="text-slate-400">Loading settings…</p>

  const handleSave = async () => {
    await updateState.mutateAsync(form)
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  const handleReset = async () => {
    if (!confirm('Delete all your workout logs and progress? This cannot be undone.')) return
    await resetData.mutateAsync()
  }

  return (
    <div className="space-y-6">
      <h2 className="text-lg font-bold">Settings</h2>

      <section className="rounded-xl bg-surface-raised p-4 text-sm">
        <h3 className="font-medium">Account</h3>
        <p className="mt-1 text-slate-400">{profile?.email}</p>
        <button
          type="button"
          onClick={() => signOut()}
          className="mt-3 w-full rounded-lg border border-surface-overlay py-2 text-sm text-slate-300"
        >
          Sign out
        </button>
      </section>

      <section className="space-y-3 rounded-xl bg-surface-raised p-4">
        <h3 className="font-medium">Program</h3>
        <label className="block text-sm text-slate-400">Start date</label>
        <input
          type="date"
          value={form.program_start_date}
          onChange={(e) => setForm({ ...form, program_start_date: e.target.value })}
          className="w-full rounded-lg bg-surface px-3 py-2 text-sm"
        />

        <label className="block text-sm text-slate-400">Advancement mode</label>
        <select
          value={form.advancement_mode}
          onChange={(e) =>
            setForm({ ...form, advancement_mode: e.target.value as 'calendar' | 'completion' })
          }
          className="w-full rounded-lg bg-surface px-3 py-2 text-sm"
        >
          <option value="calendar">Calendar-based (auto week from start date)</option>
          <option value="completion">Completion-based (advance after finishing week)</option>
        </select>

        <button
          type="button"
          onClick={handleSave}
          className="w-full rounded-lg bg-accent py-2 text-sm font-medium text-white"
        >
          {saved ? 'Saved!' : 'Save settings'}
        </button>
      </section>

      <section className="rounded-xl bg-surface-raised p-4 text-sm text-slate-400">
        <p><strong className="text-slate-200">Program:</strong> {program.program_name}</p>
        <p><strong className="text-slate-200">Author:</strong> {program.author}</p>
        <p><strong className="text-slate-200">Duration:</strong> {program.total_weeks} weeks</p>
        <p className="mt-2 text-xs">
          Update <code className="text-accent">src/data/program.json</code> from the PDF when available.
        </p>
      </section>

      <section className="rounded-xl border border-red-500/30 p-4">
        <h3 className="font-medium text-red-400">Danger zone</h3>
        <p className="mt-1 text-sm text-slate-400">Delete all your cloud progress data.</p>
        <button
          type="button"
          onClick={handleReset}
          className="mt-3 w-full rounded-lg border border-red-500/50 py-2 text-sm text-red-400"
        >
          Reset all data
        </button>
      </section>

      <section className="rounded-xl bg-surface-raised p-4 text-sm text-slate-400">
        <h3 className="font-medium text-slate-200">Exercise GIFs</h3>
        <p className="mt-1">
          GIFs come from the free{' '}
          <a
            href="https://github.com/hasaneyldrm/exercises-dataset"
            className="text-accent underline"
            target="_blank"
            rel="noreferrer"
          >
            exercises-dataset
          </a>{' '}
          on GitHub (educational use). Re-run <code className="text-accent">npm run map-exercises</code>{' '}
          after editing the exercise list.
        </p>
      </section>
    </div>
  )
}
