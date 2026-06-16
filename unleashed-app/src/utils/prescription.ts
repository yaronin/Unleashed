import type { Prescription } from '../types/program'
import type { LoggedSet } from '../types/workout-log'

export function formatPrescription(p: Prescription): string {
  const parts: string[] = []

  if (p.sets) {
    if (p.reps_min != null && p.reps_max != null) {
      parts.push(`${p.sets} × ${p.reps_min}–${p.reps_max} reps`)
    } else if (p.reps != null) {
      parts.push(`${p.sets} × ${p.reps} reps`)
    } else if (p.duration_sec) {
      parts.push(`${p.sets} × ${p.duration_sec}s hold`)
    } else {
      parts.push(`${p.sets} sets`)
    }
  } else if (p.duration_min) {
    parts.push(`${p.duration_min} min`)
  } else if (p.duration_sec) {
    parts.push(`${p.duration_sec}s hold`)
  }

  if (p.rest_sec) parts.push(`${p.rest_sec}s rest`)
  return parts.join(' · ') || 'As prescribed'
}

export function createEmptySets(prescription: Prescription): LoggedSet[] {
  const count = prescription.sets ?? 1
  return Array.from({ length: count }, () => ({ completed: false }))
}

export type PerformanceStatus = 'met' | 'close' | 'below' | 'na'

export function evaluateSet(
  prescribed: Prescription,
  logged: LoggedSet,
): PerformanceStatus {
  if (!logged.completed) return 'na'

  if (prescribed.reps_min != null && logged.reps != null) {
    if (logged.reps >= prescribed.reps_min) return 'met'
    if (logged.reps >= prescribed.reps_min - 1) return 'close'
    return 'below'
  }

  if (typeof prescribed.reps === 'number' && logged.reps != null) {
    if (logged.reps >= prescribed.reps) return 'met'
    if (logged.reps >= prescribed.reps - 1) return 'close'
    return 'below'
  }

  if (prescribed.duration_sec && logged.duration_sec != null) {
    if (logged.duration_sec >= prescribed.duration_sec) return 'met'
    if (logged.duration_sec >= prescribed.duration_sec - 5) return 'close'
    return 'below'
  }

  return logged.completed ? 'met' : 'na'
}

export function statusColor(status: PerformanceStatus): string {
  switch (status) {
    case 'met':
      return 'text-emerald-400'
    case 'close':
      return 'text-amber-400'
    case 'below':
      return 'text-red-400'
    default:
      return 'text-slate-400'
  }
}

export function bestSetValue(sets: LoggedSet[]): { reps?: number; duration_sec?: number } {
  const reps = sets.map((s) => s.reps).filter((v): v is number => v != null)
  const durations = sets.map((s) => s.duration_sec).filter((v): v is number => v != null)
  return {
    reps: reps.length ? Math.max(...reps) : undefined,
    duration_sec: durations.length ? Math.max(...durations) : undefined,
  }
}
