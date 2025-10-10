"use client";

import './globals.css'
import type { Metadata } from 'next'
import { Suspense } from 'react'
import AppShell from '@/components/layout/AppShell'
import Rosie from '@/components/assistant/Rosie'
import { ThemeProvider } from '@/lib/theme-provider'
import { usePathname } from 'next/navigation';

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isLoginPage = pathname === '/login';

  return (
    <html lang="en" suppressHydrationWarning>
      <body className="min-h-screen bg-white text-black">
        <ThemeProvider defaultTheme="light" storageKey="trs-theme">
          <Suspense fallback={<div className="min-h-screen bg-white" />}>
            {isLoginPage ? (
              children
            ) : (
              <AppShell>{children}</AppShell>
            )}
          </Suspense>
          <Rosie />
        </ThemeProvider>
      </body>
    </html>
  )
}