import { Link } from 'react-router-dom'
import type { Exercise } from '../types/exercise'
import { CategoryBadge, ExerciseGif } from './ExerciseGif'

interface ExerciseCardProps {
  exercise: Exercise
  subtitle?: string
  to?: string
}

export function ExerciseCard({ exercise, subtitle, to }: ExerciseCardProps) {
  const content = (
    <div className="rounded-xl bg-surface-raised p-3 transition hover:bg-surface-overlay">
      <ExerciseGif exercise={exercise} className="mb-2 h-28 w-full" />
      <div className="flex items-start justify-between gap-2">
        <div>
          <h3 className="text-sm font-semibold leading-tight">{exercise.name}</h3>
          {subtitle && <p className="mt-0.5 text-xs text-slate-400">{subtitle}</p>}
        </div>
        <CategoryBadge category={exercise.category} />
      </div>
    </div>
  )

  if (to) return <Link to={to}>{content}</Link>
  return content
}
