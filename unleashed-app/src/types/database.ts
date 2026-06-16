export interface Profile {
  id: string
  email: string
  role: 'user' | 'admin'
  is_active: boolean
  created_at: string
}

export interface DbUserState {
  user_id: string
  program_start_date: string
  current_week: number
  current_day_index: number
  total_workouts_completed: number
  advancement_mode: 'calendar' | 'completion'
}

export interface DbWorkoutLog {
  id: string
  user_id: string
  date: string
  week: number
  day_index: number
  started_at: string
  completed_at: string
  exercises: import('./workout-log').LoggedExercise[]
}

export interface DbPersonalRecord {
  id: string
  user_id: string
  exercise_id: string
  metric: 'reps' | 'duration_sec'
  value: number
  achieved_at: string
  workout_log_id: string | null
}

export interface ProfileWithState extends Profile {
  user_state: DbUserState | null
}
