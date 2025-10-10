export type IntegrationSettings = {
  openaiApiKey: string
  googleApiKey: string
  supabaseUrl: string
  supabaseAnonKey: string
  emailService: string
  calendarSyncEnabled: boolean
}

export type FeatureFlagAccessLevel = "Admin" | "Director" | "SuperAdmin"

export type FeatureFlagRecord = {
  id: string
  name: string
  description: string | null
  is_enabled: boolean
  access_level: FeatureFlagAccessLevel
  updated_at: string | null
}
