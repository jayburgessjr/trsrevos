"use client"

import { useCallback, useState } from "react"
import { useRouter } from "next/navigation"
import { Search } from "lucide-react"
import { createClient } from "@/lib/supabase/client"
import Notifications from "@/components/ui/notifications"

export default function GlobalHeader() {
  const router = useRouter()
  const [isSigningOut, setIsSigningOut] = useState(false)

  const handleSignOut = useCallback(async () => {
    setIsSigningOut(true)
    try {
      const supabase = createClient()

      // Sign out from Supabase
      const { error } = await supabase.auth.signOut()

      if (error) {
        throw error
      }

      // Force a hard navigation to login page to clear all state
      window.location.href = "/login"
    } catch (error) {
      console.error("Failed to sign out:", error)
      alert("Failed to log out. Please try again.")
      setIsSigningOut(false)
    }
  }, [router])

  return (
    <header className="border-b border-gray-200" style={{ backgroundColor: '#e87b28' }}>
      <div className="flex h-14 w-full items-center justify-between px-3">
        <div className="flex items-center gap-3">
          <h1 className="text-xl font-bold text-white">The Revenue Scientists</h1>

        </div>
        <div className="flex items-center gap-2 text-sm">
          <Notifications />
          <div className="flex h-9 w-64 items-center gap-2 rounded-md border border-gray-200 bg-white px-3 text-sm">
            <Search size={16} className="text-gray-500" />
            <input
              placeholder="Search"
              className="h-full flex-1 border-none bg-transparent text-sm text-gray-700 outline-none placeholder:text-gray-500"
            />
          </div>
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
