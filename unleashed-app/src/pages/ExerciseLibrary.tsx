import { useState } from 'react'
import { ExerciseCard } from '../components/ExerciseCard'
import { useExercises } from '../hooks/useProgram'
import type { ExerciseCategory } from '../types/exercise'

const CATEGORIES: (ExerciseCategory | 'all')[] = [
  'all', 'pull', 'push', 'core', 'legs', 'skill', 'hang', 'conditioning', 'recovery', 'full_body',
]

export function ExerciseLibrary() {
  const { exercises } = useExercises()
  const [filter, setFilter] = useState<ExerciseCategory | 'all'>('all')

  const filtered = filter === 'all' ? exercises : exercises.filter((e) => e.category === filter)

  return (
    <div className="space-y-4">
      <h2 className="text-lg font-bold">Exercise Library</h2>
      <p className="text-sm text-slate-400">{exercises.length} exercises in the program</p>

      <div className="flex flex-wrap gap-2">
        {CATEGORIES.map((cat) => (
          <button
            key={cat}
            type="button"
            onClick={() => setFilter(cat)}
            className={`rounded-full px-3 py-1 text-xs capitalize ${
              filter === cat ? 'bg-accent text-white' : 'bg-surface-raised text-slate-400'
            }`}
          >
            {cat === 'all' ? 'All' : cat.replace('_', ' ')}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-2 gap-3">
        {filtered.map((ex) => (
          <ExerciseCard
            key={ex.id}
            exercise={ex}
            to={`/progress?exercise=${ex.id}`}
            subtitle={ex.media?.gif_url ? ex.media.dataset_name ?? 'GIF available' : 'No GIF yet'}
          />
        ))}
      </div>
    </div>
  )
}
