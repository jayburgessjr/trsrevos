"use client"

import { useState } from "react"

import { AgentManager } from "@/components/settings/AgentManager"
import { FeatureFlags } from "@/components/settings/FeatureFlags"
import { IntegrationsForm } from "@/components/settings/IntegrationsForm"
import { ThemeCard } from "@/components/settings/ThemeCard"
import { ToneManager } from "@/components/settings/ToneManager"
import { SyncStatus } from "@/components/hubspot/SyncStatus"
import type { AgentBehaviorMap, AgentDefinition } from "@/lib/agents/types"
import type { FeatureFlagRecord, IntegrationSettings } from "@/lib/settings/types"

const TABS = ["Appearance", "Agents", "Integrations", "HubSpot Sync", "Feature Flags", "Behavior"] as const

type TabName = (typeof TABS)[number]

type SettingsTabsProps = {
  agents: AgentDefinition[]
  behavior: AgentBehaviorMap
  integrations: IntegrationSettings
  featureFlags: FeatureFlagRecord[]
  featureFlagServiceAvailable: boolean
  featureFlagError?: string | null
}

export function SettingsTabs({
  agents,
  behavior,
  integrations,
  featureFlags,
  featureFlagServiceAvailable,
  featureFlagError,
}: SettingsTabsProps) {
  const [activeTab, setActiveTab] = useState<TabName>("Appearance")

  return (
    <div className="space-y-6">
      <nav className="flex flex-wrap gap-2 rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] p-2">
        {TABS.map((tab) => {
          const isActive = activeTab === tab
          return (
            <button
              key={tab}
              type="button"
              onClick={() => setActiveTab(tab)}
              className={`rounded-lg px-4 py-2 text-xs font-semibold uppercase tracking-wide transition ${
                isActive
                  ? "bg-[var(--color-text)] text-[var(--color-bg)]"
                  : "text-gray-600 hover:bg-gray-100"
              }`}
            >
              {tab}
            </button>
          )
        })}
      </nav>

      {activeTab === "Appearance" ? <ThemeCard /> : null}
      {activeTab === "Agents" ? <AgentManager agents={agents} /> : null}
      {activeTab === "Integrations" ? <IntegrationsForm initialSettings={integrations} /> : null}
      {activeTab === "HubSpot Sync" ? (
        <div className="rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] p-6 shadow-sm">
          <div className="mb-6">
            <h2 className="text-lg font-semibold text-[var(--color-text)]">HubSpot Bi-Directional Sync</h2>
            <p className="mt-1 text-sm text-gray-500">
              Monitor real-time synchronization between TRS and HubSpot CRM
            </p>
          </div>
          <SyncStatus />
        </div>
      ) : null}
      {activeTab === "Feature Flags" ? (
        <FeatureFlags
          flags={featureFlags}
          serviceAvailable={featureFlagServiceAvailable}
          error={featureFlagError}
        />
      ) : null}
      {activeTab === "Behavior" ? (
        <ToneManager
          agents={agents.map((agent) => ({ id: agent.id, name: agent.name }))}
          behavior={behavior}
        />
      ) : null}
    </div>
  )
}
