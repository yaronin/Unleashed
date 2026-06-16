export type ExerciseCategory =
  | 'pull'
  | 'push'
  | 'core'
  | 'legs'
  | 'skill'
  | 'hang'
  | 'conditioning'
  | 'recovery'
  | 'full_body'

export interface ExerciseMedia {
  source: 'exercises-dataset' | 'workoutx' | 'local' | 'pending'
  dataset_id?: string
  dataset_name?: string
  workoutx_id?: string
  gif_url: string | null
  thumbnail_url?: string | null
  match_confidence?: 'exact' | 'fuzzy' | 'manual'
  instructions?: string[]
}

export interface Exercise {
  id: string
  name: string
  category: ExerciseCategory
  media?: ExerciseMedia
}

export interface ExercisesData {
  program_name: string
  exercises: Exercise[]
}
