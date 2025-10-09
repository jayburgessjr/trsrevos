"use client"

import { Suspense } from "react"
import { TopTabs } from "@/components/kit/TopTabs"
import GlobalSidebar from "@/components/nav/GlobalSidebar"
import GlobalHeader from "@/components/nav/GlobalHeader"

export default function AppShell({ children, showTabs = true }: { children: React.ReactNode; showTabs?: boolean }) {
  const TABS_H = 44

  return (
    <div className="w-full min-h-screen bg-white text-gray-900">
      <GlobalHeader />
      <div className="flex" style={{ height: "calc(100vh - 56px)" }}>
        <GlobalSidebar />
        <main className="flex-1 flex flex-col overflow-hidden" style={{ height: "calc(100vh - 56px)" }}>
          {showTabs && (
            <div className="px-3 border-b border-gray-200 flex items-center justify-between bg-white" style={{ height: TABS_H }}>
              <Suspense fallback={<div className="h-[44px]" />}>
                <TopTabs />
              </Suspense>
              <div className="text-xs text-gray-600">Pick a date</div>
            </div>
          )}
          <div className="flex-1 overflow-auto bg-gray-50">{children}</div>
        </main>
      </div>
    </div>
  )
}
