import './globals.css'
import React from 'react'

export const metadata = {
  title: 'TRS Internal SaaS',
  description: 'RevenueOS Copilot — governed by design'
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-gray-50 text-gray-900">
        <div className="flex h-screen">
          <aside className="w-64 bg-white border-r p-4 space-y-2">
            <h1 className="text-lg font-semibold">TRS Copilot</h1>
            <nav className="space-y-1 text-sm">
              <a className="block hover:bg-gray-100 rounded px-2 py-1" href="/deliverables">Deliverables</a>
              <a className="block hover:bg-gray-100 rounded px-2 py-1" href="/governance">Governance</a>
              <a className="block hover:bg-gray-100 rounded px-2 py-1" href="/agents">Agents</a>
              <a className="block hover:bg-gray-100 rounded px-2 py-1" href="/ai-engine">AI Engine</a>
              <a className="block hover:bg-gray-100 rounded px-2 py-1" href="/gap-map">Gap Map</a>
              <a className="block hover:bg-gray-100 rounded px-2 py-1" href="/exec-room">Executive Room</a>
              <a className="block hover:bg-gray-100 rounded px-2 py-1" href="/partner">Partner & Channel</a>
              <a className="block hover:bg-gray-100 rounded px-2 py-1" href="/kpis">KPIs & Alerts</a>
            </nav>
          </aside>
          <main className="flex-1 overflow-y-auto">
            <header className="sticky top-0 bg-white border-b px-4 py-2 flex items-center justify-between">
              <div className="text-sm">TRS Internal SaaS</div>
              <div>
                {/* TRS Score Chip */}
                <div id="trs-score" className="inline-flex items-center gap-2 rounded-full px-3 py-1 text-sm bg-gray-100">
                  <span className="font-medium">TRS Score:</span>
                  <span className="font-semibold" data-band="GREEN">72</span>
                  <span className="text-xs rounded px-2 py-0.5 bg-green-100 text-green-700">GREEN</span>
                </div>
              </div>
            </header>
            <div className="p-4">{children}</div>
          </main>
        </div>
      </body>
    </html>
  )
}
