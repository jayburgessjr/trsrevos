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
      <body className="min-h-screen bg-white text-black">
        <ThemeProvider defaultTheme="light" storageKey="trs-theme">
          <Suspense fallback={<div className="min-h-screen bg-white" />}>
            <AppShell>{children}</AppShell>
          </Suspense>
          <Rosie />
        </ThemeProvider>
      </body>
    </html>
  )
}
