import type { Exercise, ExerciseCategory } from '../types/exercise'

const CATEGORY_COLORS: Record<ExerciseCategory, string> = {
  pull: 'bg-blue-500/20 text-blue-300',
  push: 'bg-red-500/20 text-red-300',
  core: 'bg-yellow-500/20 text-yellow-300',
  legs: 'bg-green-500/20 text-green-300',
  skill: 'bg-purple-500/20 text-purple-300',
  hang: 'bg-cyan-500/20 text-cyan-300',
  conditioning: 'bg-orange-500/20 text-orange-300',
  recovery: 'bg-slate-500/20 text-slate-300',
  full_body: 'bg-pink-500/20 text-pink-300',
}

interface ExerciseGifProps {
  exercise: Exercise
  className?: string
}

export function ExerciseGif({ exercise, className = '' }: ExerciseGifProps) {
  const gifUrl = exercise.media?.gif_url

  if (gifUrl) {
    return (
      <img
        src={gifUrl}
        alt={exercise.name}
        className={`rounded-lg object-cover bg-surface-overlay ${className}`}
        loading="lazy"
      />
    )
  }

  return (
    <div
      className={`flex items-center justify-center rounded-lg bg-surface-overlay text-slate-500 ${className}`}
      aria-label={`No animation for ${exercise.name}`}
    >
      <span className="text-center text-xs px-2">{exercise.name}</span>
    </div>
  )
}

export function CategoryBadge({ category }: { category: ExerciseCategory }) {
  return (
    <span className={`rounded-full px-2 py-0.5 text-xs font-medium capitalize ${CATEGORY_COLORS[category]}`}>
      {category.replace('_', ' ')}
    </span>
  )
}
