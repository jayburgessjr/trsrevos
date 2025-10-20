import { NextResponse } from "next/server"

import { createServerClient } from "@/lib/supabase/server"

export async function POST() {
  const supabase = createServerClient()
  const { error } = await supabase.auth.signOut()

  if (error) {
    console.error("Failed to sign out", error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ success: true })
}
