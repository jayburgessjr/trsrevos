import './globals.css'
import type { Metadata } from 'next'
import { Suspense } from 'react'

import AppShell from '@/components/layout/AppShell'
import { ThemeProvider } from '@/lib/theme-provider'
import { RevosDataProvider } from '@/app/providers/RevosDataProvider'
import { NotificationsProvider } from '@/app/providers/NotificationsProvider'

export const metadata: Metadata = {
  title: 'TRS-RevOS',
  description:
    'The execution layer for The Revenue Scientists. Manage projects, automation, content, and connected finance workflows.',
}

type RootLayoutProps = {
  children: React.ReactNode
}

export default function RootLayout({ children }: RootLayoutProps) {
  return (
    <html lang="en" suppressHydrationWarning style={{ margin: 0, padding: 0, width: '100%' }}>
      <body className="min-h-screen bg-background text-foreground" style={{ margin: 0, padding: 0, width: '100%' }}>
        <ThemeProvider defaultTheme="system" storageKey="trs-theme">
          <RevosDataProvider>
            <NotificationsProvider>
              <Suspense fallback={<div className="min-h-screen bg-background" />}>
                <AppShell>{children}</AppShell>
              </Suspense>
            </NotificationsProvider>
          </RevosDataProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}
