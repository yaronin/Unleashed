import { useState } from 'react'
import { Link } from 'react-router-dom'
import { CategoryBadge, ExerciseGif } from '../components/ExerciseGif'
import { WeekNavigator } from '../components/WeekNavigator'
import { useExercises, useProgram } from '../hooks/useProgram'
import { useUpdateUserState, useUserState } from '../hooks/useWorkoutLog'
import { formatPrescription } from '../utils/prescription'
import { getCalendarWeek, getDay, getWeekDays } from '../utils/program-nav'

export function Home() {
  const program = useProgram()
  const { getExercise } = useExercises()
  const userState = useUserState()
  const updateState = useUpdateUserState()

  const defaultWeek = userState
    ? userState.advancement_mode === 'calendar'
      ? getCalendarWeek(userState, program.total_weeks)
      : userState.current_week
    : 1
  const defaultDay = userState?.current_day_index ?? 1

  const [week, setWeek] = useState(defaultWeek)
  const [dayIndex, setDayIndex] = useState(defaultDay)

  const day = getDay(program, week, dayIndex)
  const daysInWeek = getWeekDays(program, week).length

  const handleNavigate = async (w: number, d: number) => {
    setWeek(w)
    setDayIndex(d)
    await updateState.mutateAsync({ current_week: w, current_day_index: d })
  }

  if (!day) {
    return <p className="text-slate-400">No workout found for this day.</p>
  }

  const isRestDay = day.type === 'rest' || day.blocks.length === 0

  return (
    <div className="space-y-4">
      <WeekNavigator
        week={week}
        dayIndex={dayIndex}
        totalWeeks={program.total_weeks}
        daysInWeek={daysInWeek}
        onChange={handleNavigate}
      />

      <div className="rounded-xl bg-surface-raised p-4">
        <p className="text-xs uppercase tracking-wide text-slate-500">{day.type}</p>
        <h2 className="text-xl font-bold">{day.label}</h2>
        {userState && (
          <p className="mt-1 text-sm text-slate-400">
            {userState.total_workouts_completed} workouts completed
          </p>
        )}
      </div>

      {isRestDay ? (
        <div className="rounded-xl bg-surface-raised p-6 text-center">
          <p className="text-slate-300">Rest day — recover and come back stronger.</p>
        </div>
      ) : (
        <>
          <ul className="space-y-3">
            {day.blocks.map((block) => {
              const exercise = getExercise(block.exercise_id)
              if (!exercise) return null
              return (
                <li key={block.exercise_id} className="rounded-xl bg-surface-raised p-3">
                  <div className="flex gap-3">
                    <ExerciseGif exercise={exercise} className="h-20 w-20 shrink-0" />
                    <div className="min-w-0 flex-1">
                      <div className="flex items-start justify-between gap-2">
                        <h3 className="font-semibold leading-tight">{exercise.name}</h3>
                        <CategoryBadge category={exercise.category} />
                      </div>
                      <p className="mt-1 text-sm text-accent">{formatPrescription(block.prescription)}</p>
                      {block.notes && <p className="mt-0.5 text-xs text-slate-400">{block.notes}</p>}
                    </div>
                  </div>
                </li>
              )
            })}
          </ul>

          <Link
            to={`/workout/${week}/${dayIndex}`}
            className="block w-full rounded-xl bg-accent py-3.5 text-center font-semibold text-white transition hover:bg-accent-muted"
          >
            Start Workout
          </Link>
        </>
      )}
    </div>
  )
}
