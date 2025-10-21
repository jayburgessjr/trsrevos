'use client'

import { useMemo, useState } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import * as Icons from 'lucide-react'

import { useRevosData } from '@/app/providers/RevosDataProvider'
import { MAIN_NAV } from '@/lib/navigation'
import { cn } from '@/lib/utils'
import { Badge } from '@/ui/badge'
import { Button } from '@/ui/button'
import { ThemeToggle } from '@/components/ThemeToggle'
import GlobalSearch from '@/components/search/GlobalSearch'
import MobileBottomNav from '@/components/layout/MobileBottomNav'

export default function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname() ?? '/'
  const router = useRouter()
  const [mobileOpen, setMobileOpen] = useState(false)
  const { projects, documents, automationLogs } = useRevosData()

  const handleLogout = async () => {
    // Clear any auth tokens/session data
    // For now, just redirect to login
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

  // Don't show sidebar/header on login page or public forms
  const isLoginPage = pathname === '/login'
  const isPublicFormPage = pathname.startsWith('/forms/')

  if (isLoginPage || isPublicFormPage) {
    return <>{children}</>
  }

  return (
    <div className="flex min-h-screen bg-[#015e32] dark:bg-[#004d28] text-white" style={{ width: '100vw', margin: 0, padding: 0 }}>
      {/* Desktop Sidebar - hidden on mobile */}
      <aside
        className={cn(
          'hidden md:block fixed inset-y-0 z-40 w-64 border-r border-gray-700 dark:border-gray-700 bg-[#004d28] dark:bg-[#003320] px-4 py-6 shadow-lg md:static',
        )}
        style={{ left: 0, margin: 0 }}
      >
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-widest text-[#fd8216]">TRS</p>
            <p className="text-lg font-semibold text-white">RevOS</p>
          </div>
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
                  'flex items-center gap-3 rounded-lg px-3 py-2 font-medium transition-colors',
                  active ? 'bg-[#fd8216] text-white shadow-lg shadow-[#fd8216]/30' : 'text-white/80 hover:bg-[#015e32] hover:text-white',
                )}
              >
                <Icon className="h-4 w-4" aria-hidden="true" />
                <span>{item.label}</span>
              </Link>
            )
          })}
        </nav>
      </aside>

      <div className="flex w-full flex-1 flex-col">
        {/* Desktop Header - hidden on mobile */}
        <header className="hidden md:flex sticky top-0 z-30 items-center justify-between border-b border-gray-700 bg-[#004d28]/95 backdrop-blur px-6 py-4">
          <div className="flex items-center gap-3">
            <div>
              <p className="text-xs uppercase tracking-widest text-[#fd8216]">Execution Layer</p>
              <p className="text-base font-semibold text-white">TRS-RevOS</p>
            </div>
          </div>
          <div className="flex items-center gap-3 text-xs">
            <GlobalSearch />
            <Button
              onClick={handleLogout}
              variant="outline"
              size="sm"
              className="border-[#fd8216] text-white hover:bg-[#fd8216] hover:text-white"
            >
              <Icons.LogOut className="h-4 w-4 mr-2" />
              Logout
            </Button>
          </div>
        </header>

        {/* Mobile Header - only shown on mobile */}
        <header className="md:hidden sticky top-0 z-30 flex items-center justify-between border-b-2 border-[#fd8216] bg-[#004d28] backdrop-blur px-4 py-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-widest text-[#fd8216]">TRS</p>
            <p className="text-base font-semibold text-white">RevOS</p>
          </div>
          <div className="flex items-center gap-2">
            <GlobalSearch />
            <Button
              onClick={handleLogout}
              variant="ghost"
              size="sm"
              className="text-white hover:bg-[#fd8216] hover:text-white p-2"
            >
              <Icons.LogOut className="h-4 w-4" />
            </Button>
          </div>
        </header>

        {/* Main Content - extra padding on mobile for bottom nav */}
        <main className="flex-1 px-3 sm:px-4 md:px-6 pb-20 md:pb-8 pt-4 md:pt-8">{children}</main>

        {/* Mobile Bottom Navigation */}
        <MobileBottomNav />
      </div>
    </div>
  )
}
