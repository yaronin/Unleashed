import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useAuth } from '../context/AuthContext'
import {
  fetchPersonalRecords,
  fetchWorkoutLog,
  fetchWorkoutLogs,
  getUserState,
  insertWorkoutLog,
  resetUserData,
  saveUserState,
} from '../lib/progress-api'
import type { UserState, WorkoutLog } from '../types/workout-log'
import { detectNewPRs } from '../utils/pr-detection'
import { getNextDayIndex } from '../utils/program-nav'
import programData from '../data/program.json'
import type { ProgramData } from '../types/program'
import { v4 as uuidv4 } from 'uuid'

const program = programData as ProgramData

const DEFAULT_FALLBACK: UserState = {
  user_id: '',
  program_start_date: new Date().toISOString().slice(0, 10),
  current_week: 1,
  current_day_index: 1,
  total_workouts_completed: 0,
  advancement_mode: 'calendar',
}

export function useUserState() {
  const { session } = useAuth()
  const userId = session?.user?.id

  const { data } = useQuery({
    queryKey: ['userState', userId],
    queryFn: () => getUserState(userId!),
    enabled: Boolean(userId),
  })

  return data ?? (userId ? { ...DEFAULT_FALLBACK, user_id: userId } : DEFAULT_FALLBACK)
}

export function useWorkoutLogs() {
  const { session } = useAuth()
  const userId = session?.user?.id

  const { data } = useQuery({
    queryKey: ['workoutLogs', userId],
    queryFn: () => fetchWorkoutLogs(userId!),
    enabled: Boolean(userId),
  })

  return data ?? []
}

export function useWorkoutLog(id: string | undefined) {
  const { session } = useAuth()
  const userId = session?.user?.id

  const { data } = useQuery({
    queryKey: ['workoutLog', id, userId],
    queryFn: () => fetchWorkoutLog(id!, userId!),
    enabled: Boolean(id && userId),
  })

  return data
}

export function useSaveWorkoutLog() {
  const { session } = useAuth()
  const queryClient = useQueryClient()
  const userId = session?.user?.id!

  return useMutation({
    mutationFn: async (log: Omit<WorkoutLog, 'id' | 'completed_at'> & { id?: string }) => {
      const completed = await insertWorkoutLog(userId, {
        ...log,
        id: log.id ?? uuidv4(),
        completed_at: new Date().toISOString(),
      })

      const newPRs = await detectNewPRs(userId, completed.exercises, completed.id, completed.date)

      const state = await getUserState(userId)
      if (state) {
        const next = getNextDayIndex(program, completed.week, completed.day_index)
        await saveUserState({
          ...state,
          current_week: next.week,
          current_day_index: next.day_index,
          total_workouts_completed: state.total_workouts_completed + 1,
        })
      }

      return { log: completed, newPRs }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['workoutLogs', userId] })
      queryClient.invalidateQueries({ queryKey: ['userState', userId] })
      queryClient.invalidateQueries({ queryKey: ['personalRecords', userId] })
    },
  })
}

export function useUpdateUserState() {
  const { session } = useAuth()
  const queryClient = useQueryClient()
  const userId = session?.user?.id!

  return useMutation({
    mutationFn: async (partial: Partial<UserState>) => {
      const current = await getUserState(userId)
      if (!current) throw new Error('User state not found')
      const updated = { ...current, ...partial, user_id: userId }
      await saveUserState(updated)
      return updated
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['userState', userId] })
    },
  })
}

export function useResetAllData() {
  const { session } = useAuth()
  const queryClient = useQueryClient()
  const userId = session?.user?.id!

  return useMutation({
    mutationFn: () => resetUserData(userId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['workoutLogs', userId] })
      queryClient.invalidateQueries({ queryKey: ['userState', userId] })
      queryClient.invalidateQueries({ queryKey: ['personalRecords', userId] })
    },
  })
}

// Legacy exports kept for type compatibility — use hooks above
export async function saveWorkoutLog(): Promise<never> {
  throw new Error('Use useSaveWorkoutLog mutation hook instead')
}

export async function updateUserState(): Promise<never> {
  throw new Error('Use useUpdateUserState mutation hook instead')
}

export async function resetAllData(): Promise<never> {
  throw new Error('Use useResetAllData mutation hook instead')
}

export function usePersonalRecordsQuery() {
  const { session } = useAuth()
  const userId = session?.user?.id

  const { data } = useQuery({
    queryKey: ['personalRecords', userId],
    queryFn: () => fetchPersonalRecords(userId!),
    enabled: Boolean(userId),
  })

  return data ?? []
}
