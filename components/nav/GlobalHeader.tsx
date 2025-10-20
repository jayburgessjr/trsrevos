"use client"

import { useCallback, useState } from "react"
import { useRouter } from "next/navigation"
import { Bell, Search } from "lucide-react"

export default function GlobalHeader() {
  const router = useRouter()
  const [isSigningOut, setIsSigningOut] = useState(false)

  const handleSignOut = useCallback(async () => {
    setIsSigningOut(true)
    try {
      const response = await fetch("/auth/signout", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
      })

      if (!response.ok) {
        throw new Error("Failed to sign out")
      }

      router.replace("/login")
    } catch (error) {
      console.error("Failed to sign out", error)
    } finally {
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
