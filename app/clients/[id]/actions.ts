"use server";

import { revalidatePath } from "next/cache";

import { createServerClient } from "@/lib/supabase/server";

export async function ensureOnboarding(clientId: string) {
  const supabase = createServerClient()
  const { error } = await supabase.rpc("rpc_ensure_client_onboarding", {
    p_client_id: clientId,
  })

  if (error) {
    throw error
  }

  revalidatePath(`/clients/${clientId}`)
}

export async function setClientPhase(
  clientId: string,
  phase: "Onboarding" | "Active"
) {
  const supabase = createServerClient()
  const { error } = await supabase
    .from("clients")
    .update({ phase, updated_at: new Date().toISOString() })
    .eq("id", clientId)

  if (error) {
    throw error
  }

  revalidatePath(`/clients/${clientId}`)
  revalidatePath("/clients")
}
