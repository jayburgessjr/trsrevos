"use client"

import type { ReactNode } from 'react'
import { useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import * as Icons from 'lucide-react'

import Header from '@/components/nav/Header'
import HamburgerDrawer from '@/components/nav/HamburgerDrawer'
import MobileBottomNav from '@/components/nav/MobileBottomNav'
import SearchOverlay from '@/components/nav/SearchOverlay'
import { MAIN_NAV, type NavItem } from '@/lib/navigation'
import { cn, isActivePath } from '@/lib/utils'

const FULL_SHELL_EXCLUSIONS = new Set(['/login'])

type AppShellProps = {
  children: ReactNode
}

/**
 * AppShell owns the global layout chrome for the mobile-first experience.
 * It renders a sticky header, optional hamburger drawer, a desktop sidebar,
 * and a fixed bottom navigation bar on handheld devices. The shell keeps
 * spacing fluid (no fixed widths) so content can adapt to any breakpoint.
 */
export default function AppShell({ children }: AppShellProps) {
  const pathname = usePathname()
  const [drawerOpen, setDrawerOpen] = useState(false)
  const [searchOpen, setSearchOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')

  useEffect(() => {
    // Close the drawer after a successful navigation to keep UX tight on mobile.
    setDrawerOpen(false)
    setSearchOpen(false)
  }, [pathname])

  useEffect(() => {
    if (!searchOpen) {
      setSearchQuery('')
    }
  }, [searchOpen])

  const shouldBypassShell = useMemo(() => {
    if (!pathname) return false
    if (pathname.startsWith('/share')) return true
    return Array.from(FULL_SHELL_EXCLUSIONS).some(
      (excluded) => pathname === excluded || pathname.startsWith(`${excluded}/`)
    )
  }, [pathname])

  if (shouldBypassShell) {
    return <>{children}</>
  }

  return (
    <div className="flex min-h-screen flex-col bg-white text-black">
      <Header
        onMenuToggle={() => setDrawerOpen(true)}
        onSearch={(term) => {
          setSearchOpen(true)
          setSearchQuery(term)
        }}
        onSearchOpen={() => setSearchOpen(true)}
        searchValue={searchQuery}
      />
      <HamburgerDrawer open={drawerOpen} onClose={() => setDrawerOpen(false)} />
      <SearchOverlay
        open={searchOpen}
        query={searchQuery}
        onQueryChange={setSearchQuery}
        onClose={() => setSearchOpen(false)}
      />
      <div className="flex flex-1">
        <aside className="sticky top-0 hidden h-[calc(100vh-3.5rem)] w-64 shrink-0 border-r border-gray-200 bg-white lg:block">
          <nav className="flex h-full flex-col gap-4 overflow-y-auto px-5 py-6 text-sm">
            <div className="text-xs font-semibold uppercase tracking-wide text-gray-500">Main</div>
            <ul className="space-y-1">
              {MAIN_NAV.map((item) => (
                <SidebarLink key={item.href} item={item} currentPath={pathname ?? ''} />
              ))}
            </ul>
          </nav>
        </aside>
        <main className="flex-1 overflow-x-hidden pb-24 lg:pb-8">
          {children}
        </main>
      </div>
      <MobileBottomNav currentPath={pathname ?? ''} className="lg:hidden" />
    </div>
  )
}

type SidebarLinkProps = {
  item: NavItem
  currentPath: string
}

function SidebarLink({ item, currentPath }: SidebarLinkProps) {
  const active = isActivePath(currentPath, item.href)
  const Icon = (Icons[item.icon as keyof typeof Icons] ?? Icons.Circle) as Icons.LucideIcon

  return (
    <li>
      <Link
        href={item.href}
        className={cn(
          'flex items-center gap-3 rounded-full px-4 py-2 text-sm transition-colors',
          active ? 'bg-gray-900 text-white' : 'text-gray-700 hover:bg-gray-100'
        )}
      >
        <Icon className="h-4 w-4" aria-hidden="true" />
        <span className="font-medium">{item.label}</span>
      </Link>
    </li>
  )
}
