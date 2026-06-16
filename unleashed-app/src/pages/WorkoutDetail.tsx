import { Link, useParams } from 'react-router-dom'
import { useExercises } from '../hooks/useProgram'
import { useWorkoutLog } from '../hooks/useWorkoutLog'
import { formatPrescription } from '../utils/prescription'

export function WorkoutDetail() {
  const { id } = useParams()
  const log = useWorkoutLog(id)
  const { getExercise } = useExercises()

  if (!log) return <p className="text-slate-400">Loading…</p>

  return (
    <div className="space-y-4">
      <Link to="/progress" className="text-sm text-accent">← Back to progress</Link>
      <h2 className="text-xl font-bold">
        Week {log.week} · Day {log.day_index}
      </h2>
      <p className="text-sm text-slate-400">{log.date}</p>

      <ul className="space-y-3">
        {log.exercises.map((ex) => {
          const meta = getExercise(ex.exercise_id)
          return (
            <li key={ex.exercise_id} className="rounded-xl bg-surface-raised p-3">
              <h3 className="font-semibold">{meta?.name ?? ex.exercise_id}</h3>
              <p className="text-xs text-slate-400">{formatPrescription(ex.prescribed)}</p>
              <ul className="mt-2 space-y-1">
                {ex.sets.map((set, i) => (
                  <li key={i} className="text-sm text-slate-300">
                    Set {i + 1}:{' '}
                    {set.reps != null ? `${set.reps} reps` : set.duration_sec != null ? `${set.duration_sec}s` : '—'}
                    {set.completed ? ' ✓' : ''}
                  </li>
                ))}
              </ul>
              {ex.notes && <p className="mt-1 text-xs italic text-slate-500">{ex.notes}</p>}
            </li>
          )
        })}
      </ul>
    </div>
  )
}
