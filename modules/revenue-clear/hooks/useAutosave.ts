'use client'

import { useCallback, useRef, useState } from 'react'

import { StageStatus } from '../lib/types'

type SaveFn<T> = (value: T) => Promise<void>

export function useAutosave<T>(saveFn: SaveFn<T>, delay = 800) {
  const timerRef = useRef<NodeJS.Timeout | null>(null)
  const [status, setStatus] = useState<StageStatus>('idle')

  const scheduleSave = useCallback(
    (value: T) => {
      if (timerRef.current) {
        clearTimeout(timerRef.current)
      }

      timerRef.current = setTimeout(async () => {
        setStatus('saving')
        try {
          await saveFn(value)
          setStatus('saved')
        } catch (error) {
          console.error('Autosave failed', error)
          setStatus('error')
        }
      }, delay)
    },
    [delay, saveFn],
  )

  const saveImmediately = useCallback(
    async (value: T) => {
      if (timerRef.current) {
        clearTimeout(timerRef.current)
      }
      setStatus('saving')
      try {
        await saveFn(value)
        setStatus('saved')
      } catch (error) {
        console.error('Autosave flush failed', error)
        setStatus('error')
      }
    },
    [saveFn],
  )

  return {
    scheduleSave,
    saveImmediately,
    status,
    setStatus,
  }
}
