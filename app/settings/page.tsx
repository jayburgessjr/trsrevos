import { SettingsTabs } from '@/components/settings/SettingsTabs'
import { readAgentBehavior, readAgentsConfig } from '@/lib/agents/storage'
import { featureFlagServiceAvailable, fetchFeatureFlags } from '@/lib/settings/feature-flags'
import { getIntegrationSettings } from '@/lib/settings/env'
import type { FeatureFlagRecord } from '@/lib/settings/types'
import { PageDescription, PageTitle } from '@/ui/page-header'

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
    <div className="mx-auto flex max-w-6xl flex-col gap-6 px-4 py-6">
      <header className="rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] px-6 py-5 shadow-sm">
        <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
          <div>
            <PageTitle className="text-2xl font-semibold text-[var(--color-text)]">
              Settings Control Center
            </PageTitle>
            <PageDescription className="text-sm text-gray-500">
              Govern every surface from a single pane — appearance, intelligence workers, integrations, and feature access.
            </PageDescription>
          </div>
          <div className="rounded-lg border border-[var(--color-border)] bg-[var(--color-bg)] px-4 py-2 text-xs font-semibold uppercase tracking-wide text-gray-500">
            Production Environment
          </div>
        </div>
      </header>

      <SettingsTabs
        agents={agents}
        behavior={behavior}
        integrations={integrations}
        featureFlags={featureFlags}
        featureFlagServiceAvailable={serviceAvailable}
        featureFlagError={featureFlagError}
      />
    </div>
  )
}
