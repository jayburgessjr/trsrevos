'use client'

import * as React from 'react'
import { createPortal } from 'react-dom'
import { cn } from '@/lib/utils'

const DialogContext = React.createContext<{
  open: boolean
  setOpen: (value: boolean) => void
} | null>(null)

export function Dialog({
  children,
  open,
  onOpenChange,
}: {
  children: React.ReactNode
  open?: boolean
  onOpenChange?: (value: boolean) => void
}) {
  const [internalOpen, setInternalOpen] = React.useState(false)
  const isControlled = typeof open === 'boolean'
  const currentOpen = isControlled ? (open as boolean) : internalOpen
  const setOpen = React.useCallback(
    (value: boolean) => {
      if (!isControlled) {
        setInternalOpen(value)
      }
      onOpenChange?.(value)
    },
    [isControlled, onOpenChange],
  )

  return (
    <DialogContext.Provider value={{ open: currentOpen, setOpen }}>{children}</DialogContext.Provider>
  )
}

function useDialog(component: string) {
  const context = React.useContext(DialogContext)
  if (!context) throw new Error(`${component} must be used within <Dialog />`)
  return context
}

export function DialogTrigger({ children }: { children: React.ReactElement }) {
  const { setOpen } = useDialog('DialogTrigger')
  return React.cloneElement(children, {
    onClick: (event: React.MouseEvent) => {
      children.props.onClick?.(event)
      if (!event.defaultPrevented) {
        setOpen(true)
      }
    },
  })
}

export function DialogContent({
  className,
  children,
}: {
  className?: string
  children: React.ReactNode
}) {
  const { open, setOpen } = useDialog('DialogContent')
  const [mounted, setMounted] = React.useState(false)

  React.useEffect(() => {
    setMounted(true)
  }, [])

  React.useEffect(() => {
    const handleKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setOpen(false)
      }
    }
    if (open) {
      document.addEventListener('keydown', handleKey)
    }
    return () => document.removeEventListener('keydown', handleKey)
  }, [open, setOpen])

  if (!mounted) return null

  return createPortal(
    open ? (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
        <div className={cn('w-full max-w-md rounded-lg bg-[color:var(--color-surface)] p-6 shadow-xl', className)}>
          {children}
        </div>
      </div>
    ) : null,
    document.body,
  )
}

export function DialogHeader({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn('space-y-1', className)} {...props} />
}

export function DialogTitle({ className, ...props }: React.HTMLAttributes<HTMLHeadingElement>) {
  return <h2 className={cn('text-lg font-semibold text-[color:var(--color-text)]', className)} {...props} />
}

export function DialogDescription({ className, ...props }: React.HTMLAttributes<HTMLParagraphElement>) {
  return <p className={cn('text-sm text-[color:var(--color-text-muted)]', className)} {...props} />
}

export function DialogFooter({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn('mt-6 flex justify-end gap-2', className)} {...props} />
}

export function DialogClose({ children }: { children: React.ReactElement }) {
  const { setOpen } = useDialog('DialogClose')
  return React.cloneElement(children, {
    onClick: (event: React.MouseEvent) => {
      children.props.onClick?.(event)
      if (!event.defaultPrevented) {
        setOpen(false)
      }
    },
  })
}
