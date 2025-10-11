"use client"

import { useState } from "react"
import { AgentManager } from "@/components/settings/AgentManager"
import { FeatureFlags } from "@/components/settings/FeatureFlags"
import { IntegrationsForm } from "@/components/settings/IntegrationsForm"
import { ThemeCard } from "@/components/settings/ThemeCard"
import { ToneManager } from "@/components/settings/ToneManager"
import { cn } from "@/lib/utils"
import type { AgentBehaviorMap, AgentDefinition } from "@/lib/agents/types"
import type { FeatureFlagRecord, IntegrationSettings } from "@/lib/settings/types"

type SettingsPageClientProps = {
  agents: AgentDefinition[]
  behavior: AgentBehaviorMap
  integrations: IntegrationSettings
  featureFlags: FeatureFlagRecord[]
  featureFlagServiceAvailable: boolean
  featureFlagError?: string | null
}

export function SettingsPageClient({
  agents,
  behavior,
  integrations,
  featureFlags,
  featureFlagServiceAvailable,
  featureFlagError,
}: SettingsPageClientProps) {
  const [activeTab, setActiveTab] = useState("Agents")

  const tabs = ["Agents", "Appearance", "Integrations", "Feature Flags", "Behavior"]

  return (
    <div className="mx-auto max-w-7xl space-y-4 px-4 py-4">
      {/* Tab Navigation */}
      <div className="flex items-center gap-2 border-b border-gray-200 pb-2">
        {tabs.map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={cn(
              "px-3 py-2 text-sm font-medium transition-colors",
              activeTab === tab
                ? "border-b-2 border-black text-black"
                : "text-gray-600 hover:text-black"
            )}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      {activeTab === "Agents" && (
        <div className="space-y-4">
          <AgentManager agents={agents} />
        </div>
      )}

      {activeTab === "Appearance" && (
        <div className="space-y-4">
          <ThemeCard />
        </div>
      )}

      {activeTab === "Integrations" && (
        <div className="space-y-4">
          <IntegrationsForm initialSettings={integrations} />
        </div>
      )}

      {activeTab === "Feature Flags" && (
        <div className="space-y-4">
          <FeatureFlags
            flags={featureFlags}
            serviceAvailable={featureFlagServiceAvailable}
            error={featureFlagError}
          />
        </div>
      )}

      {activeTab === "Behavior" && (
        <div className="space-y-4">
          <ToneManager
            agents={agents.map((agent) => ({ id: agent.id, name: agent.name }))}
            behavior={behavior}
          />
        </div>
      )}
    </div>
  )
}
