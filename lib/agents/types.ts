export type AgentStatus = "active" | "disabled" | "needs_update"

export type AgentParameters = {
  model: string
  temperature: number
  systemPrompt: string
  apiEndpoint: string
  permissions: string[]
}

export type AgentDefinition = {
  id: string
  name: string
  purpose: string
  buildVersion: string
  status: AgentStatus
  lastDeployAt: string
  parameters: AgentParameters
}

export type AgentsConfig = {
  agents: AgentDefinition[]
}

export type AgentBehavior = {
  tone: "Professional" | "Casual" | "Analytical" | "Warm"
  verbosity: "Short" | "Balanced" | "Detailed"
  temperature: number
  maxTokens: number
  responseDelayMs: number
}

export type AgentBehaviorMap = Record<string, AgentBehavior>
