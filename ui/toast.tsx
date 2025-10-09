'use client'

import * as React from 'react'
import { cn } from '@/lib/utils'

type ToastVariant = 'default' | 'success' | 'warning' | 'destructive'

export type Toast = {
  id: string
  title: string
  description?: string
  variant?: ToastVariant
}

type Listener = (toasts: Toast[]) => void

const listeners = new Set<Listener>()
let state: Toast[] = []

function emit() {
  for (const listener of listeners) {
    listener([...state])
  }
}

function removeToast(id: string) {
  state = state.filter((toast) => toast.id !== id)
  emit()
}

function enqueueToast(toast: Omit<Toast, 'id'> & { id?: string; duration?: number }) {
  const id = toast.id ?? (typeof crypto !== 'undefined' && 'randomUUID' in crypto ? crypto.randomUUID() : Math.random().toString(36).slice(2))
  const payload: Toast = { id, title: toast.title, description: toast.description, variant: toast.variant }
  state = [...state, payload]
  emit()
  const duration = toast.duration ?? 4000
  if (duration > 0) {
    setTimeout(() => removeToast(id), duration)
  }
  return id
}

export function useToast() {
  const [toasts, setToasts] = React.useState<Toast[]>(state)

  React.useEffect(() => {
    const listener: Listener = (items) => setToasts(items)
    listeners.add(listener)
    return () => {
      listeners.delete(listener)
    }
  }, [])

  const showToast = React.useCallback(
    (toast: Omit<Toast, 'id'> & { duration?: number }) => enqueueToast(toast),
    [],
  )

  const dismiss = React.useCallback((id: string) => removeToast(id), [])

  return { toasts, showToast, dismiss }
}

const variantStyles: Record<ToastVariant, string> = {
  default: 'bg-[color:var(--color-surface)] text-[color:var(--color-text)]',
  success: 'bg-[color:var(--color-positive)]/10 text-[color:var(--color-positive)]',
  warning: 'bg-[color:var(--color-caution)]/10 text-[color:var(--color-caution)]',
  destructive: 'bg-[color:var(--color-critical)]/10 text-[color:var(--color-critical)]',
}

export function ToastViewport({ className }: { className?: string }) {
  const { toasts, dismiss } = useToast()

  return (
    <div className={cn('fixed bottom-6 right-6 flex w-80 flex-col gap-3', className)}>
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className={cn('rounded-lg border border-[color:var(--color-outline)] p-4 shadow-md', variantStyles[toast.variant ?? 'default'])}
        >
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="text-sm font-semibold">{toast.title}</p>
              {toast.description ? (
                <p className="mt-1 text-xs text-[color:var(--color-text-muted)]">{toast.description}</p>
              ) : null}
            </div>
            <button
              type="button"
              className="text-xs text-[color:var(--color-text-muted)] hover:text-[color:var(--color-text)]"
              onClick={() => dismiss(toast.id)}
            >
              Close
            </button>
          </div>
        </div>
      ))}
    </div>
  )
}

export function showToast(toast: Omit<Toast, 'id'> & { id?: string; duration?: number }) {
  return enqueueToast(toast)
}

export function dismissToast(id: string) {
  removeToast(id)
}
