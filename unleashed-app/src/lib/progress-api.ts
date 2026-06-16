import { supabase } from '../lib/supabase'
import type { DbPersonalRecord, DbUserState, DbWorkoutLog } from '../types/database'
import type { LoggedExercise, UserState, WorkoutLog } from '../types/workout-log'

export async function getUserState(userId: string): Promise<UserState | null> {
  const { data, error } = await supabase
    .from('user_state')
    .select('*')
    .eq('user_id', userId)
    .single()
  if (error || !data) return null
  return data as UserState
}

export async function saveUserState(state: UserState): Promise<void> {
  const { user_id, ...rest } = state
  const { error } = await supabase.from('user_state').update(rest).eq('user_id', user_id)
  if (error) throw error
}

export async function fetchWorkoutLogs(userId: string): Promise<WorkoutLog[]> {
  const { data, error } = await supabase
    .from('workout_logs')
    .select('*')
    .eq('user_id', userId)
    .order('date', { ascending: false })
  if (error) throw error
  return (data as DbWorkoutLog[]).map(rowToWorkoutLog)
}

export async function fetchWorkoutLog(id: string, userId: string): Promise<WorkoutLog | null> {
  const { data, error } = await supabase
    .from('workout_logs')
    .select('*')
    .eq('id', id)
    .eq('user_id', userId)
    .single()
  if (error || !data) return null
  return rowToWorkoutLog(data as DbWorkoutLog)
}

export async function insertWorkoutLog(
  userId: string,
  log: Omit<WorkoutLog, 'id' | 'completed_at'> & { id?: string; completed_at?: string },
): Promise<WorkoutLog> {
  const row = {
    id: log.id,
    user_id: userId,
    date: log.date,
    week: log.week,
    day_index: log.day_index,
    started_at: log.started_at,
    completed_at: log.completed_at ?? new Date().toISOString(),
    exercises: log.exercises,
  }
  const { data, error } = await supabase.from('workout_logs').insert(row).select().single()
  if (error) throw error
  return rowToWorkoutLog(data as DbWorkoutLog)
}

export async function fetchPersonalRecords(userId: string) {
  const { data, error } = await supabase
    .from('personal_records')
    .select('*')
    .eq('user_id', userId)
  if (error) throw error
  return (data as DbPersonalRecord[]).map((r) => ({
    id: r.id,
    exercise_id: r.exercise_id,
    value: Number(r.value),
    metric: r.metric,
    achieved_at: r.achieved_at,
    workout_log_id: r.workout_log_id ?? '',
  }))
}

export async function upsertPersonalRecord(
  userId: string,
  record: {
    exercise_id: string
    metric: 'reps' | 'duration_sec'
    value: number
    achieved_at: string
    workout_log_id: string
  },
): Promise<void> {
  const { error } = await supabase.from('personal_records').upsert(
    { user_id: userId, ...record },
    { onConflict: 'user_id,exercise_id,metric' },
  )
  if (error) throw error
}

export async function getPersonalRecord(
  userId: string,
  exerciseId: string,
  metric: 'reps' | 'duration_sec',
) {
  const { data } = await supabase
    .from('personal_records')
    .select('*')
    .eq('user_id', userId)
    .eq('exercise_id', exerciseId)
    .eq('metric', metric)
    .maybeSingle()
  if (!data) return null
  return { ...data, value: Number(data.value) } as DbPersonalRecord
}

export async function resetUserData(userId: string): Promise<void> {
  await supabase.from('workout_logs').delete().eq('user_id', userId)
  await supabase.from('personal_records').delete().eq('user_id', userId)
  await supabase
    .from('user_state')
    .update({
      program_start_date: new Date().toISOString().slice(0, 10),
      current_week: 1,
      current_day_index: 1,
      total_workouts_completed: 0,
      advancement_mode: 'calendar',
    })
    .eq('user_id', userId)
}

function rowToWorkoutLog(row: DbWorkoutLog): WorkoutLog {
  return {
    id: row.id,
    date: row.date,
    week: row.week,
    day_index: row.day_index,
    started_at: row.started_at,
    completed_at: row.completed_at,
    exercises: row.exercises as LoggedExercise[],
  }
}

export type { DbUserState }
