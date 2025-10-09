'use client'

import * as React from 'react'
import { createPortal } from 'react-dom'
import { cn } from '@/lib/utils'

const SheetContext = React.createContext<{
  open: boolean
  setOpen: (value: boolean) => void
} | null>(null)

export function Sheet({ children, open, onOpenChange }: {
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

  React.useEffect(() => {
    const handleKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setOpen(false)
      }
    }
    if (currentOpen) {
      document.addEventListener('keydown', handleKey)
    }
    return () => document.removeEventListener('keydown', handleKey)
  }, [currentOpen, setOpen])

  return (
    <SheetContext.Provider value={{ open: currentOpen, setOpen }}>{children}</SheetContext.Provider>
  )
}

function useSheetContext(component: string) {
  const context = React.useContext(SheetContext)
  if (!context) {
    throw new Error(`${component} must be used within a <Sheet />`)
  }
  return context
}

export function SheetTrigger({ children }: { children: React.ReactElement }) {
  const { setOpen } = useSheetContext('SheetTrigger')
  return React.cloneElement(children, {
    onClick: (event: React.MouseEvent) => {
      children.props.onClick?.(event)
      if (!event.defaultPrevented) {
        setOpen(true)
      }
    },
  })
}

export function SheetContent({
  side = 'right',
  className,
  children,
}: {
  side?: 'right' | 'left'
  className?: string
  children: React.ReactNode
}) {
  const { open, setOpen } = useSheetContext('SheetContent')
  const [mounted, setMounted] = React.useState(false)

  React.useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) return null

  return createPortal(
    open ? (
      <div className="fixed inset-0 z-50 flex">
        <div
          aria-hidden
          className="flex-1 bg-black/40"
          onClick={() => setOpen(false)}
        />
        <aside
          className={cn(
            'flex w-[320px] flex-col gap-4 border-l border-[color:var(--color-outline)] bg-[color:var(--color-surface)] p-6 shadow-xl transition-transform',
            side === 'left' ? 'border-l-0 border-r' : '',
            className,
          )}
        >
          {children}
        </aside>
      </div>
    ) : null,
    document.body,
  )
}

export function SheetHeader({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn('space-y-1', className)} {...props} />
}

export function SheetTitle({ className, ...props }: React.HTMLAttributes<HTMLHeadingElement>) {
  return <h2 className={cn('text-lg font-semibold text-[color:var(--color-text)]', className)} {...props} />
}

export function SheetDescription({ className, ...props }: React.HTMLAttributes<HTMLParagraphElement>) {
  return <p className={cn('text-sm text-[color:var(--color-text-muted)]', className)} {...props} />
}

export function SheetFooter({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn('mt-auto flex flex-col gap-2', className)} {...props} />
}

export function SheetClose({ children }: { children: React.ReactElement }) {
  const { setOpen } = useSheetContext('SheetClose')
  return React.cloneElement(children, {
    onClick: (event: React.MouseEvent) => {
      children.props.onClick?.(event)
      if (!event.defaultPrevented) {
        setOpen(false)
      }
    },
  })
}
