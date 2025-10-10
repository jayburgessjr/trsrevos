'use server'

import { revalidatePath } from "next/cache"

import { readAgentBehavior, readAgentsConfig, writeAgentBehavior, writeAgentsConfig } from "@/lib/agents/storage"
import type { AgentBehavior, AgentDefinition, AgentParameters } from "@/lib/agents/types"
import { saveIntegrationSettings } from "@/lib/settings/env"
import { featureFlagServiceAvailable, setFeatureFlagAccessLevel, setFeatureFlagState } from "@/lib/settings/feature-flags"
import type { FeatureFlagAccessLevel, IntegrationSettings } from "@/lib/settings/types"

type AgentActionKind = "retrain" | "deploy"

function bumpVersion(version: string, part: "patch" | "minor" = "patch") {
  const segments = version.split(".").map((seg) => Number.parseInt(seg, 10))
  while (segments.length < 3) {
    segments.push(0)
  }
  if (!segments.every((n) => Number.isFinite(n))) {
    return part === "minor" ? "1.1.0" : "1.0.1"
  }
  if (part === "minor") {
    segments[1] += 1
    segments[2] = 0
  } else {
    segments[2] += 1
  }
  return segments.join(".")
}

async function updateAgentCollection(
  agentId: string,
  updater: (agent: AgentDefinition) => AgentDefinition,
): Promise<AgentDefinition> {
  const agents = await readAgentsConfig()
  const index = agents.findIndex((agent) => agent.id === agentId)
  if (index === -1) {
    throw new Error(`Agent ${agentId} not found`)
  }
  const updatedAgent = updater(agents[index])
  const nextAgents = [...agents]
  nextAgents[index] = updatedAgent
  await writeAgentsConfig(nextAgents)
  revalidatePath("/settings")
  return updatedAgent
}

export async function updateAgentParameters(agentId: string, parameters: AgentParameters) {
  return updateAgentCollection(agentId, (agent) => ({
    ...agent,
    parameters,
    status: agent.status === "disabled" ? "needs_update" : agent.status,
  }))
}

export async function performAgentAction(agentId: string, action: AgentActionKind) {
  const now = new Date().toISOString()
  const versionSegment = action === "deploy" ? "minor" : "patch"
  return updateAgentCollection(agentId, (agent) => ({
    ...agent,
    status: "active",
    buildVersion: bumpVersion(agent.buildVersion, versionSegment),
    lastDeployAt: now,
  }))
}

export async function saveIntegrations(settings: IntegrationSettings) {
  await saveIntegrationSettings(settings)
  revalidatePath("/settings")
  return settings
}

export async function updateAgentBehavior(agentId: string, behavior: AgentBehavior) {
  const map = await readAgentBehavior()
  const next = {
    ...map,
    [agentId]: behavior,
  }
  await writeAgentBehavior(next)
  revalidatePath("/settings")
  return behavior
}

export async function updateFeatureFlagState(flagId: string, enabled: boolean) {
  if (!featureFlagServiceAvailable()) {
    throw new Error("Supabase service role not configured")
  }
  const result = await setFeatureFlagState(flagId, enabled)
  revalidatePath("/settings")
  return result
}

export async function updateFeatureFlagAccess(flagId: string, access: FeatureFlagAccessLevel) {
  if (!featureFlagServiceAvailable()) {
    throw new Error("Supabase service role not configured")
  }
  const result = await setFeatureFlagAccessLevel(flagId, access)
  revalidatePath("/settings")
  return result
}
