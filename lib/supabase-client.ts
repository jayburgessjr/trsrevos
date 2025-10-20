import { createClient, type SupabaseClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

let cachedClient: SupabaseClient | null = null

export const hasSupabaseCredentials = Boolean(supabaseUrl && supabaseAnonKey)

export function getSupabaseClient(): SupabaseClient | null {
  if (cachedClient) {
    return cachedClient
  }

  if (!supabaseUrl || !supabaseAnonKey) {
    return null
  }

  cachedClient = createClient(supabaseUrl, supabaseAnonKey)
  return cachedClient
}
