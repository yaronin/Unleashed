import type { LoggedExercise, NewPR } from '../types/workout-log'
import { getPersonalRecord, upsertPersonalRecord } from '../lib/progress-api'
import { bestSetValue } from './prescription'

export async function detectNewPRs(
  userId: string,
  exercises: LoggedExercise[],
  workoutLogId: string,
  date: string,
): Promise<NewPR[]> {
  const newPRs: NewPR[] = []

  for (const ex of exercises) {
    const { reps, duration_sec } = bestSetValue(ex.sets)
    if (reps != null) {
      const existing = await getPersonalRecord(userId, ex.exercise_id, 'reps')
      if (!existing || reps > Number(existing.value)) {
        newPRs.push({
          exercise_id: ex.exercise_id,
          value: reps,
          metric: 'reps',
          achieved_at: date,
          workout_log_id: workoutLogId,
        })
      }
    }
    if (duration_sec != null) {
      const existing = await getPersonalRecord(userId, ex.exercise_id, 'duration_sec')
      if (!existing || duration_sec > Number(existing.value)) {
        newPRs.push({
          exercise_id: ex.exercise_id,
          value: duration_sec,
          metric: 'duration_sec',
          achieved_at: date,
          workout_log_id: workoutLogId,
        })
      }
    }
  }

  for (const pr of newPRs) {
    await upsertPersonalRecord(userId, pr)
  }

  return newPRs
}
