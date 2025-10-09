'use client'

import * as React from 'react'
import { Button } from '@/ui/button'
import { showToast } from '@/ui/toast'

function formatTime(seconds: number) {
  const minutes = Math.floor(seconds / 60)
  const remaining = seconds % 60
  return `${minutes.toString().padStart(2, '0')}:${remaining.toString().padStart(2, '0')}`
}

type FocusTimerProps = {
  durationMinutes?: number
}

export function FocusTimer({ durationMinutes = 50 }: FocusTimerProps) {
  const [secondsLeft, setSecondsLeft] = React.useState(durationMinutes * 60)
  const [running, setRunning] = React.useState(false)
  const intervalRef = React.useRef<NodeJS.Timeout | null>(null)

  const stop = React.useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current)
      intervalRef.current = null
    }
    setRunning(false)
  }, [])

  const start = React.useCallback(() => {
    if (running) return
    showToast({ title: 'Focus mode armed', description: `Block set for ${durationMinutes} minutes.` })
    setRunning(true)
    intervalRef.current = setInterval(() => {
      setSecondsLeft((prev) => {
        if (prev <= 1) {
          stop()
          showToast({ title: 'Focus block complete', description: 'Time to reset or reflect.' })
          return durationMinutes * 60
        }
        return prev - 1
      })
    }, 1000)
  }, [durationMinutes, running, stop])

  const reset = React.useCallback(() => {
    stop()
    setSecondsLeft(durationMinutes * 60)
  }, [durationMinutes, stop])

  React.useEffect(() => {
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current)
    }
  }, [])

  return (
    <div className="flex w-full flex-col gap-3 rounded-xl border border-[color:var(--color-outline)] bg-[color:var(--color-surface)] p-4 shadow-sm">
      <div className="flex items-baseline justify-between">
        <p className="text-xs font-semibold uppercase tracking-wide text-[color:var(--color-text-muted)]">Focus timer</p>
        <span className="text-sm text-[color:var(--color-text-muted)]">{durationMinutes} minute sprint</span>
      </div>
      <p className="text-4xl font-semibold text-[color:var(--color-text)]">{formatTime(secondsLeft)}</p>
      <div className="flex gap-2">
        <Button onClick={running ? stop : start} variant="primary" size="md">
          {running ? 'Pause' : 'Start'}
        </Button>
        <Button onClick={reset} variant="secondary" size="md">
          Reset
        </Button>
      </div>
    </div>
  )
}
