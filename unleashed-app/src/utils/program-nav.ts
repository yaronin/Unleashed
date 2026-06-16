import { differenceInCalendarDays, parseISO } from 'date-fns'
import type { ProgramData, ProgramDay } from '../types/program'
import type { UserState } from '../types/workout-log'

export function getCalendarWeek(state: UserState, totalWeeks: number): number {
  const days = differenceInCalendarDays(new Date(), parseISO(state.program_start_date))
  const week = Math.floor(days / 7) + 1
  return Math.min(Math.max(week, 1), totalWeeks)
}

export function getWeekDays(program: ProgramData, week: number): ProgramDay[] {
  return program.schedule.find((w) => w.week === week)?.days ?? []
}

export function getDay(program: ProgramData, week: number, dayIndex: number): ProgramDay | undefined {
  return getWeekDays(program, week).find((d) => d.day_index === dayIndex)
}

export function getSuggestedDay(
  program: ProgramData,
  state: UserState,
): { week: number; day: ProgramDay } | null {
  const week =
    state.advancement_mode === 'calendar'
      ? getCalendarWeek(state, program.total_weeks)
      : state.current_week

  const day = getDay(program, week, state.current_day_index)
  if (!day) return null
  return { week, day }
}

export function getNextDayIndex(program: ProgramData, week: number, currentDayIndex: number): {
  week: number
  day_index: number
} {
  const days = getWeekDays(program, week)
  const currentIdx = days.findIndex((d) => d.day_index === currentDayIndex)
  if (currentIdx >= 0 && currentIdx < days.length - 1) {
    return { week, day_index: days[currentIdx + 1].day_index }
  }
  const nextWeek = Math.min(week + 1, program.total_weeks)
  const nextDays = getWeekDays(program, nextWeek)
  return { week: nextWeek, day_index: nextDays[0]?.day_index ?? 1 }
}
