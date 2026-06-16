import type { Prescription } from './program'

export interface LoggedSet {
  reps?: number
  duration_sec?: number
  completed: boolean
}

export interface LoggedExercise {
  exercise_id: string
  prescribed: Prescription
  sets: LoggedSet[]
  notes?: string
}

export interface WorkoutLog {
  id: string
  date: string
  week: number
  day_index: number
  started_at: string
  completed_at: string
  exercises: LoggedExercise[]
}

export interface UserState {
  user_id: string
  program_start_date: string
  current_week: number
  current_day_index: number
  total_workouts_completed: number
  advancement_mode: 'calendar' | 'completion'
}

export interface PersonalRecord {
  id?: string
  exercise_id: string
  value: number
  metric: 'reps' | 'duration_sec'
  achieved_at: string
  workout_log_id: string
}

export type NewPR = Omit<PersonalRecord, 'id'>
