'use client'

import { useMemo } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import * as Icons from 'lucide-react'

import { useRevosData } from '@/app/providers/RevosDataProvider'
import { MAIN_NAV } from '@/lib/navigation'
import { cn } from '@/lib/utils'
import { Button } from '@/ui/button'
import GlobalSearch from '@/components/search/GlobalSearch'
import MobileBottomNav from '@/components/layout/MobileBottomNav'
import { PageContainer } from '@/components/layout/Page'

const containerClass = 'mx-auto w-full max-w-6xl px-4 sm:px-6 lg:px-8'

export default function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname() ?? '/'
  const router = useRouter()
  const { projects, documents, automationLogs } = useRevosData()

  const handleLogout = async () => {
    router.push('/login')
  }

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

  const isLoginPage = pathname === '/login'
  const isPublicFormPage = pathname.startsWith('/forms/')

  if (isLoginPage || isPublicFormPage) {
    return <>{children}</>
  }

  return (
    <div className="flex min-h-screen flex-col bg-background text-foreground">
      <div className="flex flex-1">
        <aside className="relative hidden w-64 flex-col border-r border-neutral-200 bg-white/80 backdrop-blur md:flex">
          <div className="flex h-16 items-center border-b border-neutral-200 px-6">
            <Link href="/" className="flex flex-col">
              <span className="text-xs font-semibold uppercase tracking-[0.3em] text-emerald-600">TRS</span>
              <span className="text-lg font-semibold text-slate-900">RevOS</span>
            </Link>
          </div>

          <nav className="flex-1 overflow-y-auto px-4 py-6">
            <ul className="space-y-1 text-sm">
              {MAIN_NAV.map((item) => {
                const Icon = (Icons[item.icon as keyof typeof Icons] ?? Icons.Circle) as Icons.LucideIcon
                const active = pathname === item.href

                return (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      className={cn(
                        'flex items-center gap-3 rounded-lg px-3 py-2 font-medium transition-colors',
                        active
                          ? 'bg-emerald-600 text-white shadow-md shadow-emerald-200/60'
                          : 'text-neutral-600 hover:bg-neutral-100 hover:text-slate-900',
                      )}
                    >
                      <Icon className="h-4 w-4" aria-hidden="true" />
                      <span>{item.label}</span>
                    </Link>
                  </li>
                )
              })}
            </ul>
          </nav>

          <div className="border-t border-neutral-200 px-6 py-6">
            <p className="text-xs font-semibold uppercase tracking-[0.3em] text-neutral-400">Snapshot</p>
            <dl className="mt-4 space-y-4 text-sm text-neutral-600">
              <div>
                <dt className="text-xs uppercase tracking-wide text-neutral-400">Active projects</dt>
                <dd className="mt-1 text-lg font-semibold text-slate-900">{kpis.activeProjects}</dd>
              </div>
              <div>
                <dt className="text-xs uppercase tracking-wide text-neutral-400">In-flight deliverables</dt>
                <dd className="mt-1 text-lg font-semibold text-slate-900">{kpis.deliverablesInProgress}</dd>
              </div>
              <div>
                <dt className="text-xs uppercase tracking-wide text-neutral-400">Automation hours</dt>
                <dd className="mt-1 text-lg font-semibold text-slate-900">{kpis.automationHours}</dd>
              </div>
            </dl>
          </div>
        </aside>

        <div className="flex flex-1 flex-col">
          <header className="sticky top-0 z-40 border-b border-neutral-200 bg-white/80 backdrop-blur">
            <div className={cn('flex h-16 items-center justify-between gap-4', containerClass)}>
              <div className="flex items-center gap-3">
                <Link href="/" className="flex flex-col">
                  <span className="text-xs font-semibold uppercase tracking-[0.3em] text-emerald-600">TRS</span>
                  <span className="text-base font-semibold text-slate-900">RevOS</span>
                </Link>
                <span className="hidden text-sm font-medium text-neutral-400 md:inline-flex">Execution Layer</span>
              </div>
              <div className="flex items-center gap-2 md:gap-3">
                <div className="hidden md:flex">
                  <GlobalSearch />
                </div>
                <Button
                  onClick={handleLogout}
                  variant="outline"
                  size="sm"
                  className="hidden border-neutral-200 text-slate-600 hover:bg-neutral-100 md:inline-flex"
                >
                  <Icons.LogOut className="mr-2 h-4 w-4" />
                  Logout
                </Button>
              </div>
            </div>
            <div className={cn('flex items-center justify-between gap-3 border-t border-neutral-200 py-3 md:hidden', containerClass)}>
              <GlobalSearch />
              <div className="flex items-center gap-2">
                <Button
                  onClick={handleLogout}
                  variant="ghost"
                  size="icon"
                  className="text-slate-500 hover:text-slate-900"
                >
                  <Icons.LogOut className="h-5 w-5" />
                  <span className="sr-only">Logout</span>
                </Button>
              </div>
            </div>
          </header>

          <main className="flex-1">
            <PageContainer className="pb-32 md:pb-12">{children}</PageContainer>
          </main>

          <MobileBottomNav />
        </div>
      </div>
    </div>
  )
}
