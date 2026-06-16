import { useMemo } from 'react'
import exercisesData from '../data/exercises.json'
import programData from '../data/program.json'
import type { Exercise, ExercisesData } from '../types/exercise'
import type { ProgramData } from '../types/program'

const exercises = exercisesData as ExercisesData
const program = programData as ProgramData

export function useProgram() {
  return useMemo(() => program, [])
}

export function useExercises() {
  const byId = useMemo(() => {
    const map = new Map<string, Exercise>()
    for (const ex of exercises.exercises) map.set(ex.id, ex)
    return map
  }, [])

  const getExercise = (id: string) => byId.get(id)

  return { exercises: exercises.exercises, getExercise, programName: exercises.program_name }
}

export function useExerciseMap() {
  const { getExercise } = useExercises()
  return getExercise
}
