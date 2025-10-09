"use client"

import { Suspense } from "react"
import { usePathname, useRouter, useSearchParams } from "next/navigation"
import { TopTabs } from "@/components/kit/TopTabs"
import GlobalSidebar from "@/components/nav/GlobalSidebar"
import GlobalHeader from "@/components/nav/GlobalHeader"
import { resolveTabs } from "@/lib/tabs"
import AppFooter from "@/components/layout/AppFooter"
import ChatWidget from "@/components/layout/ChatWidget"

export default function AppShell({ children, showTabs = true }: { children: React.ReactNode; showTabs?: boolean }) {
  const TABS_H = 44
  const pathname = usePathname()
  const router = useRouter()
  const searchParams = useSearchParams()

  const tabs = resolveTabs(pathname)
  const activeTab = (() => {
    const current = searchParams.get("tab") || tabs[0]
    return tabs.includes(current) ? current : tabs[0]
  })()
  const tabsVisible = showTabs && !["/", "/morning"].includes(pathname)

  const handleTabChange = (next: string) => {
    const params = new URLSearchParams(searchParams.toString())
    params.set("tab", next)
    router.replace(`${pathname}?${params.toString()}`, { scroll: false })
  }

  return (
    <div className="relative w-full min-h-screen bg-white text-gray-900">
      <GlobalHeader />
      <div className="flex" style={{ height: "calc(100vh - 56px)" }}>
        <GlobalSidebar />
        <main className="flex-1 flex flex-col overflow-hidden" style={{ height: "calc(100vh - 56px)" }}>
          {tabsVisible && (
            <div className="px-3 border-b border-gray-200 flex items-center justify-between bg-white" style={{ height: TABS_H }}>
              <Suspense fallback={<div className="h-[44px]" />}>
                <TopTabs value={activeTab} onChange={handleTabChange} />
              </Suspense>
              <div className="text-xs text-gray-600">Pick a date</div>
            </div>
          )}
          <div className="flex-1 overflow-auto bg-white">{children}</div>
          <AppFooter />
        </main>
      </div>
      <ChatWidget />
    </div>
  )
}
