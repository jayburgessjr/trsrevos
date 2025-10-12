"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { createServerClient } from "@/lib/supabase/server";

export async function markClosedWon({
  pipelineId,
  opportunityId,
}: {
  pipelineId?: string
  opportunityId?: string
}) {
  const supabase = createServerClient()
  const { data, error } = await supabase.rpc("rpc_convert_won_to_client", {
    p_pipeline_id: pipelineId ?? null,
    p_opportunity_id: opportunityId ?? null,
  })

  if (error) {
    throw error
  }

  if (data) {
    revalidatePath("/clients")
    revalidatePath(`/clients/${data}`)
  }

  redirect(`/clients/${data}`)
}
