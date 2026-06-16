import type { Prescription } from '../types/program'
import type { LoggedSet } from '../types/workout-log'
import { evaluateSet, formatPrescription, statusColor } from '../utils/prescription'

interface SetLoggerProps {
  prescription: Prescription
  sets: LoggedSet[]
  onChange: (sets: LoggedSet[]) => void
}

export function SetLogger({ prescription, sets, onChange }: SetLoggerProps) {
  const isHold = Boolean(prescription.duration_sec && !prescription.reps && !prescription.reps_min)
  const isDurationOnly = Boolean(prescription.duration_min && !prescription.sets)

  if (isDurationOnly) {
    const set = sets[0] ?? { completed: false }
    return (
      <div className="flex items-center gap-3">
        <label className="text-sm text-slate-400">Completed</label>
        <input
          type="checkbox"
          checked={set.completed}
          onChange={(e) => onChange([{ ...set, completed: e.target.checked }])}
          className="h-5 w-5 accent-accent"
        />
        <span className="text-sm">{formatPrescription(prescription)}</span>
      </div>
    )
  }

  return (
    <div className="space-y-2">
      <p className="text-xs text-slate-400">{formatPrescription(prescription)}</p>
      {sets.map((set, i) => {
        const status = evaluateSet(prescription, set)
        return (
          <div key={i} className="flex items-center gap-2 rounded-lg bg-surface p-2">
            <span className="w-8 text-xs text-slate-500">#{i + 1}</span>
            {isHold ? (
              <input
                type="number"
                min={0}
                placeholder="sec"
                value={set.duration_sec ?? ''}
                onChange={(e) => {
                  const next = [...sets]
                  next[i] = { ...set, duration_sec: Number(e.target.value) || undefined }
                  onChange(next)
                }}
                className="w-16 rounded bg-surface-overlay px-2 py-1.5 text-center text-sm"
              />
            ) : (
              <input
                type="number"
                min={0}
                placeholder="reps"
                value={set.reps ?? ''}
                onChange={(e) => {
                  const next = [...sets]
                  next[i] = { ...set, reps: Number(e.target.value) || undefined }
                  onChange(next)
                }}
                className="w-16 rounded bg-surface-overlay px-2 py-1.5 text-center text-sm"
              />
            )}
            <button
              type="button"
              onClick={() => {
                const next = [...sets]
                next[i] = { ...set, completed: !set.completed }
                onChange(next)
              }}
              className={`ml-auto rounded-lg px-3 py-1.5 text-xs font-medium ${
                set.completed ? 'bg-emerald-600/30 text-emerald-300' : 'bg-surface-overlay text-slate-400'
              }`}
            >
              {set.completed ? 'Done' : 'Mark'}
            </button>
            <span className={`text-xs ${statusColor(status)}`}>
              {status === 'met' ? '✓' : status === 'close' ? '~' : status === 'below' ? '↓' : ''}
            </span>
          </div>
        )
      })}
    </div>
  )
}
