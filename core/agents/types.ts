export type AgentKey =
  | 'delivery-orchestrator'
  | 'gap-discovery'
  | 'data-intake'
  | 'qra-strategy'
  | 'build-planner'
  | 'compounding'
  | 'media-agent'
  | 'brief-agent'
  | 'distribution-agent'
  | 'attribution-agent'
  | 'account-intel'
  | 'close-plan'
  | 'commercials'
  | 'collections'
  | 'client-health'

export type AgentMeta = {
  key: AgentKey
  name: string
  category: 'Projects' | 'Content' | 'Clients'
  description: string
  icon?: string
  autoRunnable?: boolean
}

export type AgentRunInput = {
  userId: string
  orgId?: string
  payload?: Record<string, any>
}
export type AgentRunOutput = {
  ok: boolean
  summary?: string
  data?: any
  warnings?: string[]
}

export type Agent = {
  meta: AgentMeta
  run: (input: AgentRunInput) => Promise<AgentRunOutput>
  samplePayload?: Record<string, any>
}
