// lib/queries.ts
import { getServerSupabase } from "@/lib/supabase";
import type { VwClientOverview, VwPipelineForecast } from "@/lib/types";

export async function listClientOverview(): Promise<VwClientOverview[]> {
  if (
    !process.env.NEXT_PUBLIC_SUPABASE_URL ||
    !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  ) {
    return [];
  }
  const sb = getServerSupabase();
  const { data, error } = await sb
    .from("vw_client_overview")
    .select("*")
    .order("client_name");
  if (error) throw error;
  return data ?? [];
}

export async function getPipelineForecast(): Promise<VwPipelineForecast[]> {
  if (
    !process.env.NEXT_PUBLIC_SUPABASE_URL ||
    !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  ) {
    return [];
  }
  const sb = getServerSupabase();
  const { data, error } = await sb.from("vw_pipeline_forecast").select("*");
  if (error) throw error;
  return data ?? [];
}
