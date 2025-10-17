'use client'

import { useMemo, useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import * as Icons from 'lucide-react'

import { useRevosData } from '@/app/providers/RevosDataProvider'
import { MAIN_NAV } from '@/lib/navigation'
import { cn } from '@/lib/utils'
import { Badge } from '@/ui/badge'
import { Button } from '@/ui/button'
import { ThemeToggle } from '@/components/ThemeToggle'

export default function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname() ?? '/'
  const [mobileOpen, setMobileOpen] = useState(false)
  const { projects, documents, automationLogs } = useRevosData()

  const kpis = useMemo(() => {
    const activeProjects = projects.filter((project) => project.status === 'Active').length
    const deliverablesInProgress = documents.filter((doc) => doc.status !== 'Final').length
    const automationHours = (automationLogs.length * 1.5).toFixed(1)

    return {
      activeProjects,
      deliverablesInProgress,
      automationHours,
    }
  }, [projects, documents, automationLogs])

  // Don't show sidebar/header on login page
  const isLoginPage = pathname === '/login'

  if (isLoginPage) {
    return <>{children}</>
  }

  return (
    <div className="flex min-h-screen bg-[#f6f7f5] text-slate-900" style={{ width: '100vw', margin: 0, padding: 0 }}>
      <aside
        className={cn(
          'fixed inset-y-0 z-40 w-64 border-r border-slate-200 bg-white px-4 py-6 shadow-sm transition-transform duration-200 ease-in-out md:static md:translate-x-0',
          mobileOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0',
        )}
        style={{ left: 0, margin: 0 }}
      >
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-widest text-slate-500">TRS</p>
            <p className="text-lg font-semibold text-slate-900">RevOS</p>
          </div>
          <Button
            variant="ghost"
            size="icon"
            className="md:hidden"
            aria-label="Close navigation"
            onClick={() => setMobileOpen(false)}
          >
            <Icons.X className="h-5 w-5" />
          </Button>
        </div>
        <nav className="mt-6 space-y-1 text-sm">
          {MAIN_NAV.map((item) => {
            const Icon = (Icons[item.icon as keyof typeof Icons] ?? Icons.Circle) as Icons.LucideIcon
            const active = pathname === item.href
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  'flex items-center gap-3 rounded-lg px-3 py-2 font-medium text-slate-600 transition-colors',
                  active ? 'bg-slate-900 text-white shadow-sm' : 'hover:bg-slate-100',
                )}
                onClick={() => setMobileOpen(false)}
              >
                <Icon className="h-4 w-4" aria-hidden="true" />
                <span>{item.label}</span>
              </Link>
            )
          })}
        </nav>
        <div className="mt-8 rounded-lg bg-slate-50 p-4 text-xs text-slate-600">
          <p className="font-semibold text-slate-900">Automation Pulse</p>
          <p className="mt-1 leading-relaxed">
            {automationLogs.length} agent runs logged. {kpis.automationHours} hours saved.
          </p>
        </div>
      </aside>
      <div className="flex w-full flex-1 flex-col">
        <header className="sticky top-0 z-30 flex items-center justify-between border-b border-slate-200 bg-white/90 px-3 sm:px-4 md:px-6 py-3 md:py-4 backdrop-blur">
          <div className="flex items-center gap-2 md:gap-3">
            <Button
              variant="ghost"
              size="icon"
              className="md:hidden h-8 w-8"
              aria-label="Open navigation"
              onClick={() => setMobileOpen((value) => !value)}
            >
              <Icons.Menu className="h-4 w-4" />
            </Button>
            <div>
              <p className="text-[10px] sm:text-xs uppercase tracking-widest text-slate-500">Execution Layer</p>
              <p className="text-sm sm:text-base font-semibold text-slate-900">TRS-RevOS</p>
            </div>
          </div>
          <div className="flex items-center gap-2 text-xs">
            <Badge variant="outline" className="hidden sm:inline-flex border-emerald-500 text-emerald-700">
              Active Projects • {kpis.activeProjects}
            </Badge>
            <Badge variant="outline" className="hidden md:inline-flex border-orange-500 text-orange-600">
              Deliverables • {kpis.deliverablesInProgress}
            </Badge>
            <Badge variant="outline" className="hidden lg:inline-flex border-slate-400 text-slate-600">
              Automation Hours • {kpis.automationHours}
            </Badge>
            <ThemeToggle />
          </div>
        </header>
        <main className="flex-1 px-3 sm:px-4 md:px-6 pb-16 pt-6 md:pt-8 md:pb-8">{children}</main>
      </div>
    </div>
  )
}
