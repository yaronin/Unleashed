import { useMemo } from 'react'
import { differenceInCalendarDays, parseISO, startOfWeek, endOfWeek, isWithinInterval } from 'date-fns'
import type { ExerciseCategory } from '../types/exercise'
import type { PersonalRecord, WorkoutLog } from '../types/workout-log'
import { bestSetValue } from '../utils/prescription'
import { useExercises } from './useProgram'
import { usePersonalRecordsQuery, useUserState, useWorkoutLogs } from './useWorkoutLog'

export function usePersonalRecords() {
  return usePersonalRecordsQuery()
}

export function useExerciseTrend(exerciseId: string) {
  const logs = useWorkoutLogs()

  return useMemo(() => {
    const points: { date: string; reps?: number; duration_sec?: number }[] = []
    for (const log of logs) {
      const ex = log.exercises.find((e) => e.exercise_id === exerciseId)
      if (!ex) continue
      const best = bestSetValue(ex.sets)
      if (best.reps != null || best.duration_sec != null) {
        points.push({ date: log.date, ...best })
      }
    }
    return points.sort((a, b) => a.date.localeCompare(b.date))
  }, [logs, exerciseId])
}

export function useProgressStats() {
  const logs = useWorkoutLogs()
  const state = useUserState()
  const { getExercise } = useExercises()

  return useMemo(() => {
    const now = new Date()
    const weekStart = startOfWeek(now, { weekStartsOn: 1 })
    const weekEnd = endOfWeek(now, { weekStartsOn: 1 })

    const thisWeekLogs = logs.filter((l) =>
      isWithinInterval(parseISO(l.date), { start: weekStart, end: weekEnd }),
    )

    const streak = computeStreak(logs)
    const volumeByCategory = computeVolumeByCategory(logs, getExercise)

    return {
      totalWorkouts: logs.length,
      thisWeekCount: thisWeekLogs.length,
      streak,
      currentWeek: state?.current_week ?? 1,
      volumeByCategory,
    }
  }, [logs, state, getExercise])
}

function computeStreak(logs: WorkoutLog[]): number {
  if (!logs.length) return 0
  const dates = [...new Set(logs.map((l) => l.date))].sort().reverse()
  let streak = 0
  let expected = new Date()

  for (const dateStr of dates) {
    const d = parseISO(dateStr)
    const diff = differenceInCalendarDays(expected, d)
    if (diff === 0 || (streak === 0 && diff <= 1)) {
      streak++
      expected = new Date(d)
      expected.setDate(expected.getDate() - 1)
    } else if (streak > 0) {
      break
    }
  }
  return streak
}

function computeVolumeByCategory(
  logs: WorkoutLog[],
  getExercise: (id: string) => { category: ExerciseCategory } | undefined,
): Record<string, number> {
  const volume: Record<string, number> = {}
  const now = new Date()
  const weekStart = startOfWeek(now, { weekStartsOn: 1 })
  const weekEnd = endOfWeek(now, { weekStartsOn: 1 })

  for (const log of logs) {
    if (!isWithinInterval(parseISO(log.date), { start: weekStart, end: weekEnd })) continue
    for (const ex of log.exercises) {
      const meta = getExercise(ex.exercise_id)
      const cat = meta?.category ?? 'other'
      const completedSets = ex.sets.filter((s) => s.completed).length
      volume[cat] = (volume[cat] ?? 0) + completedSets
    }
  }
  return volume
}

export function formatPR(pr: PersonalRecord, exerciseName: string): string {
  if (pr.metric === 'reps') return `${exerciseName}: ${pr.value} reps`
  return `${exerciseName}: ${pr.value}s hold`
}
