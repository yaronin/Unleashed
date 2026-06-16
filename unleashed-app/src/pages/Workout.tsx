import { useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { ExerciseGif } from '../components/ExerciseGif'
import { RestTimer } from '../components/RestTimer'
import { SetLogger } from '../components/SetLogger'
import { useExercises, useProgram } from '../hooks/useProgram'
import { useSaveWorkoutLog } from '../hooks/useWorkoutLog'
import { createEmptySets } from '../utils/prescription'
import { getDay } from '../utils/program-nav'
import type { LoggedExercise } from '../types/workout-log'

export function Workout() {
  const { week: weekParam, dayIndex: dayParam } = useParams()
  const week = Number(weekParam)
  const dayIndex = Number(dayParam)
  const navigate = useNavigate()
  const program = useProgram()
  const { getExercise } = useExercises()

  const day = getDay(program, week, dayIndex)
  const [step, setStep] = useState(0)
  const [logged, setLogged] = useState<LoggedExercise[]>(() =>
    (day?.blocks ?? []).map((block) => ({
      exercise_id: block.exercise_id,
      prescribed: block.prescription,
      sets: createEmptySets(block.prescription),
      notes: '',
    })),
  )
  const saveWorkout = useSaveWorkoutLog()
  const [newPRMessages, setNewPRMessages] = useState<string[]>([])

  if (!day || !day.blocks.length) {
    return (
      <div className="text-center">
        <p className="text-slate-400">Nothing to log for this day.</p>
        <button type="button" onClick={() => navigate('/')} className="mt-4 text-accent">
          Back
        </button>
      </div>
    )
  }

  const current = day.blocks[step]
  const exercise = getExercise(current.exercise_id)
  const currentLog = logged[step]

  const updateCurrentLog = (patch: Partial<LoggedExercise>) => {
    setLogged((prev) => {
      const next = [...prev]
      next[step] = { ...next[step], ...patch }
      return next
    })
  }

  const handleFinish = async () => {
    const today = new Date().toISOString().slice(0, 10)
    try {
      const { newPRs } = await saveWorkout.mutateAsync({
        date: today,
        week,
        day_index: dayIndex,
        started_at: new Date().toISOString(),
        exercises: logged,
      })

      const messages = newPRs.map((pr) => {
        const name = getExercise(pr.exercise_id)?.name ?? pr.exercise_id
        return pr.metric === 'reps' ? `New PR: ${name} — ${pr.value} reps!` : `New PR: ${name} — ${pr.value}s!`
      })
      setNewPRMessages(messages)

      if (messages.length === 0) navigate('/')
    } catch {
      alert('Failed to save workout. Check your connection and try again.')
    }
  }

  if (newPRMessages.length > 0) {
    return (
      <div className="space-y-4 text-center">
        <h2 className="text-xl font-bold text-emerald-400">Workout Complete!</h2>
        {newPRMessages.map((m) => (
          <p key={m} className="text-accent">{m}</p>
        ))}
        <button
          type="button"
          onClick={() => navigate('/')}
          className="w-full rounded-xl bg-accent py-3 font-semibold text-white"
        >
          Done
        </button>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between text-sm text-slate-400">
        <span>
          Exercise {step + 1} / {day.blocks.length}
        </span>
        <button type="button" onClick={() => navigate('/')} className="text-slate-500">
          Cancel
        </button>
      </div>

      {exercise && (
        <>
          <h2 className="text-xl font-bold">{exercise.name}</h2>
          <ExerciseGif exercise={exercise} className="h-48 w-full" />
          {exercise.media?.instructions && (
            <ol className="list-inside list-decimal space-y-1 text-sm text-slate-400">
              {exercise.media.instructions.map((line, i) => (
                <li key={i}>{line}</li>
              ))}
            </ol>
          )}
        </>
      )}

      <SetLogger
        prescription={current.prescription}
        sets={currentLog.sets}
        onChange={(sets) => updateCurrentLog({ sets })}
      />

      {current.prescription.rest_sec && (
        <RestTimer seconds={current.prescription.rest_sec} />
      )}

      <textarea
        placeholder="Notes (optional)"
        value={currentLog.notes ?? ''}
        onChange={(e) => updateCurrentLog({ notes: e.target.value })}
        className="w-full rounded-lg bg-surface-raised p-3 text-sm placeholder:text-slate-500"
        rows={2}
      />

      <div className="flex gap-2">
        {step > 0 && (
          <button
            type="button"
            onClick={() => setStep((s) => s - 1)}
            className="flex-1 rounded-xl bg-surface-raised py-3 font-medium"
          >
            Previous
          </button>
        )}
        {step < day.blocks.length - 1 ? (
          <button
            type="button"
            onClick={() => setStep((s) => s + 1)}
            className="flex-1 rounded-xl bg-accent py-3 font-semibold text-white"
          >
            Next
          </button>
        ) : (
          <button
            type="button"
            onClick={handleFinish}
            disabled={saveWorkout.isPending}
            className="flex-1 rounded-xl bg-emerald-600 py-3 font-semibold text-white disabled:opacity-50"
          >
            {saveWorkout.isPending ? 'Saving…' : 'Finish Workout'}
          </button>
        )}
      </div>
    </div>
  )
}
