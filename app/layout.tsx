import './globals.css'
import React from 'react'

export const metadata = {
  title: 'TRS Internal SaaS',
  description: 'RevenueOS Copilot — static scaffold preview'
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-gray-50 text-gray-900">
        <div className="flex h-screen">
          <aside className="hidden w-60 border-r bg-white p-4 text-sm md:block">
            <p className="font-semibold">TRS Copilot</p>
            <p className="mt-2 text-xs text-gray-500">
              Dummy navigation placeholder for future modules.
            </p>
          </aside>
          <main className="flex-1 overflow-y-auto">
            <header className="sticky top-0 flex flex-wrap items-center justify-between gap-3 border-b bg-white px-4 py-3 text-sm">
              <div>
                <p className="font-medium">TRS Internal SaaS</p>
                <p className="text-xs text-gray-500">
                  Static preview using mocked data and scaffolding.
                </p>
              </div>
              <div className="flex items-center gap-2">
                <span className="rounded-full bg-yellow-100 px-3 py-1 text-xs font-semibold text-yellow-700">
                  TRS Score: 68
                </span>
                <button
                  type="button"
                  className="rounded border border-gray-200 px-3 py-1 text-xs font-medium text-gray-700 hover:bg-gray-100"
                >
                  Placeholder Action
                </button>
              </div>
            </header>
            <div className="p-4">{children}</div>
          </main>
        </div>
      </body>
    </html>
  )
}
