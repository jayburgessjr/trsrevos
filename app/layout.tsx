import './globals.css'
import React from 'react'
import Link from 'next/link'

import { auth } from '@/auth'
import { ScoreChip } from '@/components/trs/score-chip'
import { canAccessModule, type TrsModule, type TrsRole } from '@/lib/auth/rbac'

export const metadata = {
  title: 'TRS Internal SaaS',
  description: 'RevenueOS Copilot — governed by design'
}

type NavItem = {
  label: string
  href: string
  module: TrsModule
}

const NAV_ITEMS: NavItem[] = [
  { label: 'Deliverables', href: '/deliverables', module: 'deliverables' },
  { label: 'Governance', href: '/governance', module: 'governance' },
  { label: 'Agents', href: '/agents', module: 'agents' },
  { label: 'AI Engine', href: '/ai-engine', module: 'ai-engine' },
  { label: 'Gap Map', href: '/gap-map', module: 'gap-map' },
  { label: 'Executive Room', href: '/exec-room', module: 'exec-room' },
  { label: 'Partner & Channel', href: '/partner', module: 'partner' },
  { label: 'KPIs & Alerts', href: '/kpis', module: 'kpis' }
]

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const session = await auth()
  const role: TrsRole = session?.user?.role ?? 'Viewer'
  const accessibleNav = NAV_ITEMS.filter((item) => canAccessModule(role, item.module))

  return (
    <html lang="en">
      <body className="min-h-screen bg-gray-50 text-gray-900">
        <div className="flex h-screen">
          <aside className="w-64 bg-white border-r p-4 space-y-2">
            <div className="flex items-center justify-between">
              <h1 className="text-lg font-semibold">TRS Copilot</h1>
              <span className="rounded-full bg-gray-100 px-2 py-0.5 text-[0.65rem] uppercase text-gray-600">
                {role}
              </span>
            </div>
            <nav className="space-y-1 text-sm" aria-label="Primary">
              {accessibleNav.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className="block rounded px-2 py-1 hover:bg-gray-100"
                >
                  {item.label}
                </Link>
              ))}
              {accessibleNav.length === 0 && (
                <p className="rounded bg-gray-50 px-2 py-1 text-xs text-gray-500">
                  No modules available for your role.
                </p>
              )}
            </nav>
          </aside>
          <main className="flex-1 overflow-y-auto">
            <header className="sticky top-0 flex items-center justify-between border-b bg-white px-4 py-2">
              <div className="flex flex-col text-sm">
                <span>TRS Internal SaaS</span>
                {session?.user?.email ? (
                  <span className="text-xs text-gray-500">{session.user.email}</span>
                ) : (
                  <span className="text-xs text-gray-500">Viewer mode</span>
                )}
              </div>
              <div className="flex items-center gap-3">
                <ScoreChip accountId="demo" />
                {session?.user ? (
                  <form action="/api/auth/signout" method="post">
                    <button
                      type="submit"
                      className="rounded border border-gray-200 px-3 py-1 text-xs font-medium text-gray-700 hover:bg-gray-100"
                    >
                      Sign out
                    </button>
                  </form>
                ) : (
                  <Link
                    href="/api/auth/signin"
                    className="rounded border border-gray-200 px-3 py-1 text-xs font-medium text-gray-700 hover:bg-gray-100"
                  >
                    Sign in
                  </Link>
                )}
              </div>
            </header>
            <div className="p-4">{children}</div>
          </main>
        </div>
      </body>
    </html>
  )
}
