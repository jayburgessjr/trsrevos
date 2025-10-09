import './globals.css'
import type { Metadata } from 'next'
import Sidebar from '@/components/nav/Sidebar'
import Topbar from '@/components/nav/Topbar'
import CommandPalette from '@/components/nav/CommandPalette'
import AssistantBubble from '@/components/assistant/Bubble'

export const metadata: Metadata = {
  title: 'TRS RevenueOS',
  description: 'The daily source of truth for GTM, finance, and partner motions.',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  // TODO replace with real session role
  const role = 'SuperAdmin' as any

  return (
    <html lang="en">
      <body className="bg-gray-50 text-gray-900">
        <div className="flex min-h-screen">
          <Sidebar role={role} />
          <div className="flex flex-1 flex-col">
            <Topbar />
            <main className="flex-1">{children}</main>
          </div>
        </div>
        <CommandPalette />
        <AssistantBubble />
      </body>
    </html>
  )
}
