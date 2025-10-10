"use client"

import { useCallback, useMemo, useState } from "react"
import { useRouter } from "next/navigation"
import { Bell, Search } from "lucide-react"

import { createClient } from "@/lib/supabase/client"

export default function GlobalHeader() {
  const router = useRouter()
  const supabase = useMemo(() => createClient(), [])
  const [isSigningOut, setIsSigningOut] = useState(false)

  const handleSignOut = useCallback(async () => {
    try {
      setIsSigningOut(true)
      const { error } = await supabase.auth.signOut()
      if (error) {
        throw error
      }
      router.replace("/login")
    } catch (error) {
      console.error("Failed to sign out", error)
      setIsSigningOut(false)
    }
  }, [router, supabase])

  return (
    <header className="border-b border-gray-200 bg-white">
      <div className="flex h-14 w-full items-center justify-between px-3">
        <div className="flex items-center gap-3">
          <span className="text-sm font-semibold uppercase tracking-wide text-gray-500">TRS</span>
          <span className="text-base font-semibold text-black">Control Center</span>
        </div>
        <div className="flex items-center gap-2 text-sm">
          <div className="flex h-9 w-64 items-center gap-2 rounded-md border border-gray-200 bg-white px-3 text-sm">
            <Search size={16} className="text-gray-500" />
            <input
              placeholder="Search"
              className="h-full flex-1 border-none bg-transparent text-sm text-gray-700 outline-none placeholder:text-gray-500"
            />
          </div>
          <button className="flex h-9 w-9 items-center justify-center rounded-md border border-gray-200 text-gray-600 hover:bg-gray-50">
            <Bell size={16} />
          </button>
          <div className="h-9 w-9 rounded-full border border-gray-200 bg-white" />
          <button
            onClick={handleSignOut}
            disabled={isSigningOut}
            className="flex h-9 items-center justify-center rounded-md border border-gray-200 px-3 text-sm font-medium text-gray-600 transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isSigningOut ? "Logging out…" : "Log out"}
          </button>
        </div>
      </div>
    </header>
  )
}
