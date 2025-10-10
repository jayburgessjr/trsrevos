import { createClient, type SupabaseClient } from "@supabase/supabase-js"

import type { FeatureFlagAccessLevel, FeatureFlagRecord } from "./types"

function getServiceClient(): SupabaseClient {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const serviceRole = process.env.SUPABASE_SERVICE_ROLE_KEY

  if (!url || !serviceRole) {
    throw new Error("Supabase service role credentials are not configured")
  }

  return createClient(url, serviceRole, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  })
}

export function featureFlagServiceAvailable() {
  return Boolean(process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY)
}

export async function fetchFeatureFlags(): Promise<FeatureFlagRecord[]> {
  const client = getServiceClient()
  const { data, error } = await client
    .from("feature_flags")
    .select("id, name, description, is_enabled, access_level, updated_at")
    .order("name", { ascending: true })
  if (error) {
    throw error
  }
  return (data ?? []) as FeatureFlagRecord[]
}

export async function setFeatureFlagState(id: string, isEnabled: boolean): Promise<FeatureFlagRecord> {
  const client = getServiceClient()
  const { data, error } = await client
    .from("feature_flags")
    .update({ is_enabled: isEnabled, updated_at: new Date().toISOString() })
    .eq("id", id)
    .select("id, name, description, is_enabled, access_level, updated_at")
    .single()

  if (error) {
    throw error
  }

  return data as FeatureFlagRecord
}

export async function setFeatureFlagAccessLevel(
  id: string,
  accessLevel: FeatureFlagAccessLevel,
): Promise<FeatureFlagRecord> {
  const client = getServiceClient()
  const { data, error } = await client
    .from("feature_flags")
    .update({ access_level: accessLevel, updated_at: new Date().toISOString() })
    .eq("id", id)
    .select("id, name, description, is_enabled, access_level, updated_at")
    .single()

  if (error) {
    throw error
  }

  return data as FeatureFlagRecord
}
