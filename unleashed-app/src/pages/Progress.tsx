import { useState } from 'react'
import { Link } from 'react-router-dom'
import { ProgressChart } from '../components/ProgressChart'
import { useExercises } from '../hooks/useProgram'
import {
  formatPR,
  useExerciseTrend,
  usePersonalRecords,
  useProgressStats,
} from '../hooks/useProgress'
import { useWorkoutLogs } from '../hooks/useWorkoutLog'

export function Progress() {
  const stats = useProgressStats()
  const logs = useWorkoutLogs()
  const prs = usePersonalRecords()
  const { exercises, getExercise } = useExercises()
  const [selectedExercise, setSelectedExercise] = useState(exercises[0]?.id ?? '')
  const trend = useExerciseTrend(selectedExercise)
  const selected = getExercise(selectedExercise)
  const metric = trend.some((t) => t.reps != null) ? 'reps' as const : 'duration_sec' as const

  return (
    <div className="space-y-6">
      <section>
        <h2 className="mb-3 text-lg font-bold">Overview</h2>
        <div className="grid grid-cols-2 gap-3">
          <StatCard label="Total workouts" value={stats.totalWorkouts} />
          <StatCard label="This week" value={stats.thisWeekCount} />
          <StatCard label="Streak" value={`${stats.streak} days`} />
          <StatCard label="Current week" value={stats.currentWeek} />
        </div>
      </section>

      {Object.keys(stats.volumeByCategory).length > 0 && (
        <section>
          <h2 className="mb-3 text-lg font-bold">Weekly volume (sets)</h2>
          <div className="space-y-2">
            {Object.entries(stats.volumeByCategory).map(([cat, count]) => (
              <div key={cat} className="flex items-center justify-between rounded-lg bg-surface-raised px-3 py-2">
                <span className="capitalize text-sm">{cat.replace('_', ' ')}</span>
                <span className="font-mono text-accent">{count}</span>
              </div>
            ))}
          </div>
        </section>
      )}

      <section>
        <h2 className="mb-3 text-lg font-bold">Exercise trend</h2>
        <select
          value={selectedExercise}
          onChange={(e) => setSelectedExercise(e.target.value)}
          className="mb-3 w-full rounded-lg bg-surface-raised px-3 py-2 text-sm"
        >
          {exercises.map((ex) => (
            <option key={ex.id} value={ex.id}>{ex.name}</option>
          ))}
        </select>
        {selected && <p className="mb-2 text-xs text-slate-400">{selected.name}</p>}
        <ProgressChart data={trend} metric={metric} />
      </section>

      <section>
        <h2 className="mb-3 text-lg font-bold">Personal records</h2>
        {prs.length === 0 ? (
          <p className="text-sm text-slate-500">Complete workouts to set PRs</p>
        ) : (
          <ul className="space-y-2">
            {prs.map((pr) => (
              <li key={`${pr.exercise_id}-${pr.metric}`} className="rounded-lg bg-surface-raised px-3 py-2 text-sm">
                {formatPR(pr, getExercise(pr.exercise_id)?.name ?? pr.exercise_id)}
                <span className="ml-2 text-xs text-slate-500">{pr.achieved_at}</span>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section>
        <h2 className="mb-3 text-lg font-bold">History</h2>
        {logs.length === 0 ? (
          <p className="text-sm text-slate-500">No workouts logged yet</p>
        ) : (
          <ul className="space-y-2">
            {logs.slice(0, 20).map((log) => (
              <li key={log.id}>
                <Link
                  to={`/history/${log.id}`}
                  className="flex items-center justify-between rounded-lg bg-surface-raised px-3 py-2 text-sm hover:bg-surface-overlay"
                >
                  <span>Week {log.week} · Day {log.day_index}</span>
                  <span className="text-slate-400">{log.date}</span>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  )
}

function StatCard({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="rounded-xl bg-surface-raised p-3">
      <p className="text-xs text-slate-400">{label}</p>
      <p className="text-2xl font-bold text-accent">{value}</p>
    </div>
  )
}
