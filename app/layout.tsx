import './globals.css'
import type { Metadata } from 'next'
import { Suspense } from 'react'
import AppShell from '@/components/layout/AppShell'
import Rosie from '@/components/assistant/Rosie'
import { ThemeProvider } from '@/lib/theme-provider'

export const metadata: Metadata = {
  title: 'TRS RevenueOS',
  description: 'The daily source of truth for GTM, finance, and partner motions.',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="min-h-screen bg-white text-gray-900 dark:bg-gray-950 dark:text-gray-100">
        <ThemeProvider defaultTheme="light" storageKey="trs-theme">
          <Suspense fallback={<div className="min-h-screen bg-white dark:bg-gray-950" />}>
            <AppShell>{children}</AppShell>
          </Suspense>
          <Rosie />
        </ThemeProvider>
      </body>
    </html>
  )
}
