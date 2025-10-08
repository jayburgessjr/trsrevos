import './globals.css'
import React from 'react'
import Link from 'next/link'

import { auth } from '@/auth'
import { ScoreChip } from '@/components/trs/score-chip'
import { type TrsRole } from '@/lib/auth/rbac'

export const metadata = {
  title: 'TRS Internal SaaS',
  description: 'RevenueOS Copilot — governed by design'
}



export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const session = await auth()
  const role: TrsRole = session?.user?.role ?? 'Viewer'


  return (
    <html lang="en">
      <body className="min-h-screen bg-gray-50 text-gray-900">
        <div className="flex h-screen">

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
