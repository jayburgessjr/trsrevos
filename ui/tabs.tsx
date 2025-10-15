'use client'

import * as React from 'react'
import { cn } from '@/lib/utils'

type TabsContextValue = {
  value: string
  setValue: (value: string) => void
}

const TabsContext = React.createContext<TabsContextValue | null>(null)

export function Tabs({
  defaultValue,
  value,
  onValueChange,
  children,
  className,
}: {
  defaultValue: string
  value?: string
  onValueChange?: (value: string) => void
  children: React.ReactNode
  className?: string
}) {
  const [internalValue, setInternalValue] = React.useState(defaultValue)
  const isControlled = typeof value === 'string'
  const currentValue = isControlled ? (value as string) : internalValue
  const setValue = React.useCallback(
    (next: string) => {
      if (!isControlled) {
        setInternalValue(next)
      }
      onValueChange?.(next)
    },
    [isControlled, onValueChange],
  )

  return (
    <TabsContext.Provider value={{ value: currentValue, setValue }}>
      <div className={cn('space-y-3', className)}>{children}</div>
    </TabsContext.Provider>
  )
}

function useTabs(component: string) {
  const context = React.useContext(TabsContext)
  if (!context) throw new Error(`${component} must be used within <Tabs />`)
  return context
}

export function TabsList({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      role="tablist"
      className={cn(
        'inline-flex items-center gap-1 rounded-full border border-[color:var(--color-outline)] bg-[color:var(--color-surface)] p-1',
        className,
      )}
      {...props}
    />
  )
}

export function TabsTrigger({
  value,
  className,
  children,
}: {
  value: string
  className?: string
  children: React.ReactNode
}) {
  const { value: activeValue, setValue } = useTabs('TabsTrigger')
  const active = activeValue === value
  return (
    <button
      type="button"
      role="tab"
      aria-selected={active}
      data-state={active ? 'active' : 'inactive'}
      onClick={() => setValue(value)}
      className={cn(
        'rounded-full px-3 py-1 text-sm font-medium transition',
        active
          ? 'bg-[color:var(--color-accent)] text-white shadow'
          : 'text-[color:var(--color-text-muted)] hover:text-[color:var(--color-text)]',
        className,
      )}
    >
      {children}
    </button>
  )
}

export function TabsContent({
  value,
  className,
  children,
}: {
  value: string
  className?: string
  children: React.ReactNode
}) {
  const { value: activeValue } = useTabs('TabsContent')
  if (activeValue !== value) return null
  return (
    <div
      role="tabpanel"
      data-state="active"
      className={cn('rounded-lg border border-dashed border-[color:var(--color-outline)] p-4', className)}
    >
      {children}
    </div>
  )
}
