import './globals.css'
import type { Metadata } from 'next'
import { Suspense } from 'react'

import AppShell from '@/components/layout/AppShell'
import { ThemeProvider } from '@/lib/theme-provider'
import { RevosDataProvider } from '@/app/providers/RevosDataProvider'

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
    <html lang="en" suppressHydrationWarning>
      <body className="min-h-screen bg-[#f6f7f5] text-slate-900">
        <ThemeProvider defaultTheme="light" storageKey="trs-theme">
          <RevosDataProvider>
            <Suspense fallback={<div className="min-h-screen bg-white" />}> 
              <AppShell>{children}</AppShell>
            </Suspense>
          </RevosDataProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}
