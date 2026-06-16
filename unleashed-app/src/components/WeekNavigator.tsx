interface WeekNavigatorProps {
  week: number
  dayIndex: number
  totalWeeks: number
  daysInWeek: number
  onChange: (week: number, dayIndex: number) => void
}

export function WeekNavigator({ week, dayIndex, totalWeeks, daysInWeek, onChange }: WeekNavigatorProps) {
  return (
    <div className="flex items-center justify-between gap-2 rounded-xl bg-surface-raised p-3">
      <button
        type="button"
        onClick={() => {
          if (dayIndex > 1) onChange(week, dayIndex - 1)
          else if (week > 1) onChange(week - 1, daysInWeek)
        }}
        disabled={week === 1 && dayIndex === 1}
        className="rounded-lg bg-surface-overlay px-3 py-2 text-sm disabled:opacity-30"
      >
        ←
      </button>
      <div className="text-center">
        <p className="text-xs text-slate-400">Week {week} of {totalWeeks}</p>
        <p className="font-semibold">Day {dayIndex}</p>
      </div>
      <button
        type="button"
        onClick={() => {
          if (dayIndex < daysInWeek) onChange(week, dayIndex + 1)
          else if (week < totalWeeks) onChange(week + 1, 1)
        }}
        disabled={week === totalWeeks && dayIndex === daysInWeek}
        className="rounded-lg bg-surface-overlay px-3 py-2 text-sm disabled:opacity-30"
      >
        →
      </button>
    </div>
  )
}
