'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import * as React from 'react'
import { Badge } from '@/ui/badge'
import { Button } from '@/ui/button'
import { CommandPaletteTrigger, useCommandPalette } from '@/ui/command-palette'
import { Sheet, SheetContent, SheetTrigger } from '@/ui/sheet'
import { cn } from '@/lib/utils'

export type NavItem = {
  href: string
  label: string
  badge?: string
}

export type SessionUser = {
  id: string
  name: string
  role: string
}

type AppShellProps = {
  children: React.ReactNode
  navItems: NavItem[]
  user: SessionUser
}

export function AppShell({ children, navItems, user }: AppShellProps) {
  const pathname = usePathname()
  const { openPalette } = useCommandPalette()
  const [sheetOpen, setSheetOpen] = React.useState(false)

  const navContent = (
    <nav className="space-y-2">
      {navItems.map((item) => {
        const active = pathname === item.href
        return (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              'flex items-center justify-between rounded-lg px-3 py-2 text-sm font-medium transition',
              active
                ? 'bg-[color:var(--color-surface-muted)] text-[color:var(--color-text)]'
                : 'text-[color:var(--color-text-muted)] hover:bg-[color:var(--color-surface-muted)] hover:text-[color:var(--color-text)]',
            )}
            onClick={() => setSheetOpen(false)}
          >
            <span>{item.label}</span>
            {item.badge ? <Badge variant="outline">{item.badge}</Badge> : null}
          </Link>
        )
      })}
    </nav>
  )

  const breadcrumbs = buildBreadcrumbs(pathname)

  return (
    <div className="flex min-h-screen bg-[color:var(--color-background)]">
      <aside className="hidden w-60 shrink-0 border-r border-[color:var(--color-outline)] bg-[color:var(--color-surface)] px-5 py-6 md:block">
        <div className="flex items-center justify-between">
          <Link href="/" className="text-sm font-semibold text-[color:var(--color-text)]">
            TRS RevenueOS
          </Link>
          <Badge variant="success">beta</Badge>
        </div>
        <p className="mt-3 text-xs text-[color:var(--color-text-muted)]">
          Daily operating canvas for GTM, finance, and partners.
        </p>
        <div className="mt-6 space-y-6">
          <div>
            <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-[color:var(--color-text-muted)]">Navigate</p>
            {navContent}
          </div>
        </div>
      </aside>
      <div className="flex min-h-screen flex-1 flex-col">
        <header className="sticky top-0 z-40 border-b border-[color:var(--color-outline)] bg-[color:var(--color-surface)]/90 backdrop-blur">
          <div className="flex items-center justify-between gap-4 px-6 py-4">
            <div className="flex items-center gap-3">
              <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
                <SheetTrigger>
                  <Button className="md:hidden" variant="outline" size="sm">
                    Menu
                  </Button>
                </SheetTrigger>
                <SheetContent side="left" className="w-[260px] border-r bg-[color:var(--color-surface)]">
                  <div className="space-y-6">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-semibold text-[color:var(--color-text)]">TRS RevenueOS</span>
                      <Badge variant="success">beta</Badge>
                    </div>
                    {navContent}
                  </div>
                </SheetContent>
              </Sheet>
              <div>
                <p className="text-sm font-semibold text-[color:var(--color-text)]">Good day, {user.name.split(' ')[0]}</p>
                <p className="text-xs text-[color:var(--color-text-muted)]">{user.role.toUpperCase()} OPERATIONS</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <CommandPaletteTrigger className="hidden sm:inline-flex" />
              <Button variant="outline" size="sm" onClick={openPalette} className="sm:hidden">
                Search
              </Button>
              <div className="flex items-center gap-2 rounded-full border border-[color:var(--color-outline)] px-3 py-1">
                <span className="h-2 w-2 rounded-full bg-[color:var(--color-positive)]" />
                <span className="text-xs font-medium text-[color:var(--color-text-muted)]">TRS Score 68</span>
              </div>
              <div className="hidden items-center gap-2 rounded-full border border-[color:var(--color-outline)] px-3 py-1 text-xs font-medium text-[color:var(--color-text-muted)] md:flex">
                {user.name}
              </div>
            </div>
          </div>
          <div className="border-t border-[color:var(--color-outline)] px-6 py-2">
            <nav className="flex items-center gap-2 text-xs text-[color:var(--color-text-muted)]">
              {breadcrumbs.map((crumb, index) => (
                <React.Fragment key={crumb.href}>
                  {index > 0 ? <span>/</span> : null}
                  <Link
                    href={crumb.href}
                    className={cn(
                      'hover:text-[color:var(--color-text)]',
                      crumb.active ? 'text-[color:var(--color-text)] font-medium' : '',
                    )}
                  >
                    {crumb.label}
                  </Link>
                </React.Fragment>
              ))}
            </nav>
          </div>
        </header>
        <main className="flex-1 bg-transparent">
          <div className="mx-auto flex w-full max-w-6xl flex-col gap-6 px-6 py-8">{children}</div>
        </main>
      </div>
    </div>
  )
}

type Breadcrumb = { href: string; label: string; active: boolean }

function buildBreadcrumbs(pathname: string): Breadcrumb[] {
  const segments = pathname.split('/').filter(Boolean)
  const crumbs: Breadcrumb[] = [
    { href: '/', label: 'Home', active: segments.length === 0 },
  ]
  if (segments.length === 0) return crumbs

  let href = ''
  segments.forEach((segment, index) => {
    href += `/${segment}`
    crumbs.push({
      href,
      label: segment.replace(/\[|\]/g, '').replace(/-/g, ' '),
      active: index === segments.length - 1,
    })
  })
  return crumbs
}
