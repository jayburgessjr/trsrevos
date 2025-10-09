import './globals.css'
import type { Metadata } from 'next'
import * as React from 'react'
import { AppShell, NavItem } from './_components/app-shell'
import { CommandPaletteProvider } from '@/ui/command-palette'
import { ToastViewport } from '@/ui/toast'
import { getSession } from '@/lib/session'

export const metadata: Metadata = {
  title: 'TRS RevenueOS',
  description: 'The daily source of truth for GTM, finance, and partner motions.',
}

const navigation: NavItem[] = [
  { href: '/', label: 'Morning briefing' },
  { href: '/pipeline', label: 'Pipeline' },
  { href: '/projects', label: 'Projects' },
  { href: '/content', label: 'Content' },
  { href: '/finance', label: 'Finance' },
  { href: '/partners', label: 'Partners' },
  { href: '/clients', label: 'Clients' },
  { href: '/admin/flags', label: 'Feature flags', badge: 'ops' },
]

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const session = await getSession()
  const user = session.user

  return (
    <html lang="en">
      <body className="antialiased">
        <CommandPaletteProvider>
          <AppShell navItems={navigation} user={user}>
            {children}
          </AppShell>
          <ToastViewport />
        </CommandPaletteProvider>
      </body>
    </html>
  )
}
