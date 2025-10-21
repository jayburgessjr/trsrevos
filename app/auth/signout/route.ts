import { NextResponse } from "next/server"
import { cookies } from "next/headers"

import { createServerClient } from "@/lib/supabase/server"

export async function POST() {
  const supabase = createServerClient()

  // Sign out from Supabase
  const { error } = await supabase.auth.signOut()

  if (error) {
    console.error("Failed to sign out", error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  // Clear all auth cookies
  const cookieStore = await cookies()
  const allCookies = cookieStore.getAll()

  allCookies.forEach(cookie => {
    if (cookie.name.includes('sb-') || cookie.name.includes('auth')) {
      cookieStore.delete(cookie.name)
    }
  })

  return NextResponse.json({ success: true })
}
