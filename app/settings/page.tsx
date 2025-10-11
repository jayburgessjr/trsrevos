import { SettingsPageClient } from '@/components/settings/SettingsPageClient'
import { readAgentBehavior, readAgentsConfig } from '@/lib/agents/storage'
import { featureFlagServiceAvailable, fetchFeatureFlags } from '@/lib/settings/feature-flags'
import { getIntegrationSettings } from '@/lib/settings/env'
import type { FeatureFlagRecord } from '@/lib/settings/types'

export const revalidate = 0

export default async function SettingsPage() {
  const [agents, behavior, integrations] = await Promise.all([
    readAgentsConfig(),
    readAgentBehavior(),
    getIntegrationSettings(),
  ])

  const serviceAvailable = featureFlagServiceAvailable()
  let featureFlags: FeatureFlagRecord[] = []
  let featureFlagError: string | null = null

  if (serviceAvailable) {
    try {
      featureFlags = await fetchFeatureFlags()
    } catch (error) {
      featureFlagError = (error as Error).message
    }
  }

  return (
    <SettingsPageClient
      agents={agents}
      behavior={behavior}
      integrations={integrations}
      featureFlags={featureFlags}
      featureFlagServiceAvailable={serviceAvailable}
      featureFlagError={featureFlagError}
    />
  )
}
