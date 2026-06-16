import { useEffect, useState } from 'react'

interface RestTimerProps {
  seconds: number
  onComplete?: () => void
}

export function RestTimer({ seconds, onComplete }: RestTimerProps) {
  const [remaining, setRemaining] = useState(seconds)
  const [active, setActive] = useState(false)

  useEffect(() => {
    if (!active || remaining <= 0) return
    const t = setTimeout(() => setRemaining((r) => r - 1), 1000)
    return () => clearTimeout(t)
  }, [active, remaining])

  useEffect(() => {
    if (active && remaining === 0) {
      onComplete?.()
      setActive(false)
    }
  }, [remaining, active, onComplete])

  return (
    <div className="flex items-center gap-2">
      <button
        type="button"
        onClick={() => {
          setRemaining(seconds)
          setActive(true)
        }}
        className="rounded-lg bg-surface-overlay px-3 py-1.5 text-xs text-slate-300"
      >
        Rest {seconds}s
      </button>
      {active && (
        <span className="text-sm font-mono text-accent">
          {Math.floor(remaining / 60)}:{String(remaining % 60).padStart(2, '0')}
        </span>
      )}
    </div>
  )
}
