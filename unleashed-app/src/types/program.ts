export interface Prescription {
  sets?: number
  reps?: number | string
  reps_min?: number
  reps_max?: number
  duration_sec?: number
  duration_min?: number
  rest_sec?: number
}

export type DayType = 'workout' | 'rest' | 'cardio' | 'recovery'

export interface ProgramBlock {
  exercise_id: string
  prescription: Prescription
  notes?: string
}

export interface ProgramDay {
  day_index: number
  label: string
  type: DayType
  blocks: ProgramBlock[]
}

export interface ProgramWeek {
  week: number
  days: ProgramDay[]
}

export interface ProgramData {
  program_name: string
  author: string
  total_weeks: number
  schedule: ProgramWeek[]
}
