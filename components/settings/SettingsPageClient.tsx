"use client";

import { useMemo, useState } from "react";
import { PageTemplate } from "@/components/layout/PageTemplate";
import type { PageTemplateBadge } from "@/components/layout/PageTemplate";
import { PageTabs } from "@/components/layout/PageTabs";
import { AgentManager } from "@/components/settings/AgentManager";
import { FeatureFlags } from "@/components/settings/FeatureFlags";
import { IntegrationsForm } from "@/components/settings/IntegrationsForm";
import { ThemeCard } from "@/components/settings/ThemeCard";
import { ToneManager } from "@/components/settings/ToneManager";
import type { AgentBehaviorMap, AgentDefinition } from "@/lib/agents/types";
import type {
  FeatureFlagRecord,
  IntegrationSettings,
} from "@/lib/settings/types";

type SettingsPageClientProps = {
  agents: AgentDefinition[];
  behavior: AgentBehaviorMap;
  integrations: IntegrationSettings;
  featureFlags: FeatureFlagRecord[];
  featureFlagServiceAvailable: boolean;
  featureFlagError?: string | null;
};

export function SettingsPageClient({
  agents,
  behavior,
  integrations,
  featureFlags,
  featureFlagServiceAvailable,
  featureFlagError,
}: SettingsPageClientProps) {
  const [activeTab, setActiveTab] = useState("Agents");

  const tabs = [
    "Agents",
    "Appearance",
    "Integrations",
    "Feature Flags",
    "Behavior",
  ];

  const headerBadges = useMemo<PageTemplateBadge[]>(
    () => [
      { label: `${agents.length} agents configured`, variant: "default" },
      {
        label: featureFlagServiceAvailable
          ? "Feature flags connected"
          : "Feature flags offline",
        variant: featureFlagServiceAvailable ? "success" : "outline",
      },
      {
        label: integrations.calendarSyncEnabled
          ? "Calendar sync enabled"
          : "Calendar sync disabled",
        variant: integrations.calendarSyncEnabled ? "success" : "outline",
      },
    ],
    [
      agents.length,
      featureFlagServiceAvailable,
      integrations.calendarSyncEnabled,
    ],
  );

  return (
    <PageTemplate
      title="Workspace Settings"
      description="Configure agents, integrations, and governance controls for RevenueOS."
      badges={headerBadges}
    >
      <PageTabs tabs={tabs} activeTab={activeTab} onTabChange={setActiveTab} />

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
    </PageTemplate>
  );
}
