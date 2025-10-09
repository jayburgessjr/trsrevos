'use client'

import * as React from 'react'
import { usePathname, useRouter } from 'next/navigation'
import { cn } from '@/lib/utils'
import { showToast } from '@/ui/toast'

export type Command = {
  id: string
  label: string
  group: 'Navigation' | 'Action'
  shortcut?: string
  run: () => void
}

type CommandPaletteContextValue = {
  open: boolean
  openPalette: () => void
  closePalette: () => void
}

const CommandPaletteContext = React.createContext<CommandPaletteContextValue | null>(null)

export function useCommandPalette() {
  const context = React.useContext(CommandPaletteContext)
  if (!context) throw new Error('useCommandPalette must be used within CommandPaletteProvider')
  return context
}

export function CommandPaletteProvider({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = React.useState(false)
  const router = useRouter()
  const pathname = usePathname()

  const commands = React.useMemo<Command[]>(() => {
    const navigate = (href: string) => () => {
      setOpen(false)
      if (pathname !== href) {
        router.push(href)
      }
    }
    return [
      { id: 'nav-home', label: 'Go to Home briefing', group: 'Navigation', shortcut: 'H', run: navigate('/') },
      { id: 'nav-pipeline', label: 'Review Pipeline', group: 'Navigation', shortcut: 'P', run: navigate('/pipeline') },
      { id: 'nav-projects', label: 'Projects Workspace', group: 'Navigation', shortcut: 'J', run: navigate('/projects') },
      { id: 'nav-content', label: 'Content Studio', group: 'Navigation', shortcut: 'C', run: navigate('/content') },
      { id: 'nav-finance', label: 'Finance Desk', group: 'Navigation', shortcut: 'F', run: navigate('/finance') },
      { id: 'nav-partners', label: 'Partner Network', group: 'Navigation', shortcut: 'R', run: navigate('/partners') },
      { id: 'nav-clients', label: 'Client Directory', group: 'Navigation', shortcut: 'L', run: navigate('/clients') },
      {
        id: 'action-compute',
        label: 'Compute Today plan',
        group: 'Action',
        shortcut: 'Shift+Enter',
        run: () => {
          showToast({ title: 'Compute Today plan', description: 'Server action stub invoked.' })
          setOpen(false)
        },
      },
      {
        id: 'action-lock',
        label: 'Lock Today plan',
        group: 'Action',
        shortcut: 'Shift+L',
        run: () => {
          showToast({ title: 'Lock plan', description: 'Lock flow stub ready.' })
          setOpen(false)
        },
      },
      {
        id: 'action-focus',
        label: 'Start Focus 50m session',
        group: 'Action',
        shortcut: 'Shift+F',
        run: () => {
          showToast({ title: 'Focus timer', description: 'Starting a 50 minute focus block soon.' })
          setOpen(false)
        },
      },
      {
        id: 'action-task',
        label: 'New Task',
        group: 'Action',
        run: () => {
          showToast({ title: 'New Task', description: 'Task creation placeholder.' })
          setOpen(false)
        },
      },
      {
        id: 'action-opportunity',
        label: 'New Opportunity',
        group: 'Action',
        run: () => {
          showToast({ title: 'New Opportunity', description: 'Opportunity creation placeholder.' })
          setOpen(false)
        },
      },
      {
        id: 'action-share',
        label: 'Share current page',
        group: 'Action',
        run: () => {
          showToast({ title: 'Share link', description: 'Share flow placeholder.' })
          setOpen(false)
        },
      },
    ]
  }, [pathname, router])

  const value = React.useMemo(
    () => ({
      open,
      openPalette: () => setOpen(true),
      closePalette: () => setOpen(false),
    }),
    [open],
  )

  return (
    <CommandPaletteContext.Provider value={value}>
      {children}
      <PaletteOverlay commands={commands} open={open} onOpenChange={setOpen} />
    </CommandPaletteContext.Provider>
  )
}

function PaletteOverlay({
  commands,
  open,
  onOpenChange,
}: {
  commands: Command[]
  open: boolean
  onOpenChange: (open: boolean) => void
}) {
  const [mounted, setMounted] = React.useState(false)
  const [query, setQuery] = React.useState('')
  const inputRef = React.useRef<HTMLInputElement>(null)

  React.useEffect(() => {
    setMounted(true)
  }, [])

  React.useEffect(() => {
    const handler = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === 'k') {
        event.preventDefault()
        onOpenChange(!open)
      }
      if (event.key === 'Escape') {
        onOpenChange(false)
      }
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [open, onOpenChange])

  React.useEffect(() => {
    if (open) {
      const timer = setTimeout(() => inputRef.current?.focus(), 20)
      return () => clearTimeout(timer)
    }
    return
  }, [open])

  const filtered = React.useMemo(() => {
    if (!query) return commands
    const lower = query.toLowerCase()
    return commands.filter((command) => command.label.toLowerCase().includes(lower))
  }, [commands, query])

  if (!mounted) return null

  return open ? (
    <div className="fixed inset-0 z-50 flex items-start justify-center bg-black/40 p-4">
      <div className="w-full max-w-xl rounded-xl border border-[color:var(--color-outline)] bg-[color:var(--color-surface)] p-4 shadow-xl">
        <input
          ref={inputRef}
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Search actions or navigation..."
          className="mb-3 w-full rounded-md border border-[color:var(--color-outline)] bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[color:var(--color-accent-muted)]"
        />
        <div className="max-h-72 space-y-2 overflow-y-auto pr-1">
          {filtered.length === 0 ? (
            <p className="px-2 py-6 text-center text-sm text-[color:var(--color-text-muted)]">No matches yet.</p>
          ) : (
            ['Navigation', 'Action'].map((group) => {
              const items = filtered.filter((item) => item.group === group)
              if (items.length === 0) return null
              return (
                <div key={group} className="space-y-1">
                  <p className="px-2 text-xs font-semibold uppercase text-[color:var(--color-text-muted)]">{group}</p>
                  <ul className="divide-y divide-[color:var(--color-outline)] overflow-hidden rounded-lg border border-[color:var(--color-outline)]">
                    {items.map((item) => (
                      <li key={item.id}>
                        <button
                          type="button"
                          className="flex w-full items-center justify-between gap-3 bg-[color:var(--color-surface)] px-3 py-2 text-left text-sm hover:bg-[color:var(--color-surface-muted)]"
                          onClick={() => {
                            item.run()
                            onOpenChange(false)
                          }}
                        >
                          <span>{item.label}</span>
                          {item.shortcut ? (
                            <span className="text-xs text-[color:var(--color-text-muted)]">{item.shortcut}</span>
                          ) : null}
                        </button>
                      </li>
                    ))}
                  </ul>
                </div>
              )
            })
          )}
        </div>
      </div>
    </div>
  ) : null
}

export function CommandPaletteTrigger({ className }: { className?: string }) {
  const { openPalette } = useCommandPalette()
  return (
    <button
      type="button"
      onClick={openPalette}
      className={cn(
        'inline-flex items-center gap-2 rounded-md border border-[color:var(--color-outline)] bg-white px-3 py-1.5 text-sm text-[color:var(--color-text-muted)] hover:text-[color:var(--color-text)]',
        className,
      )}
    >
      ⌘K
      <span className="text-xs text-[color:var(--color-text-muted)]">Command</span>
    </button>
  )
}
