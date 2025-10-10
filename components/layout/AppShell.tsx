"use client"

import { Suspense } from "react"
import { usePathname, useRouter, useSearchParams } from "next/navigation"
import { TopTabs } from "@/components/kit/TopTabs"
import GlobalHeader from "@/components/nav/GlobalHeader"
import AdminSidebar from "@/components/nav/AdminSidebar"
import { resolveTabs } from "@/lib/tabs"

const HEADER_HEIGHT = 56
const TABS_HEIGHT = 44

export default function AppShell({ children, showTabs = true }: { children: React.ReactNode; showTabs?: boolean }) {
  const pathname = usePathname()
  const router = useRouter()
  const searchParams = useSearchParams()

  const tabs = resolveTabs(pathname)
  const current = searchParams.get("tab") || tabs[0]
  const activeTab = tabs.includes(current) ? current : tabs[0]
  const tabsVisible = showTabs

  const handleTabChange = (next: string) => {
    const params = new URLSearchParams(searchParams.toString())
    params.set("tab", next)
    router.replace(`${pathname}?${params.toString()}`, { scroll: false })
  }

  return (
    <div className="w-full min-h-screen bg-white text-black">
      <GlobalHeader />
      <div className="flex" style={{ height: `calc(100vh - ${HEADER_HEIGHT}px)` }}>
        <AdminSidebar />
        <main className="flex-1 overflow-hidden">
          {tabsVisible && (
            <div
              className="flex items-center justify-between border-b border-gray-200 bg-white px-3"
              style={{ height: TABS_HEIGHT }}
            >
              <Suspense fallback={<div className="h-[44px]" />}>
                <TopTabs value={activeTab} onChange={handleTabChange} />
              </Suspense>
              <div className="text-xs text-gray-600">Pick a date</div>
            </div>
          )}
          <div className="h-full overflow-auto bg-white">{children}</div>
        </main>
      </div>
    </div>
  )
}
