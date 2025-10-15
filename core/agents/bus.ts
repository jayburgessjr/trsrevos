import { Agent, AgentKey, AgentRunInput, AgentRunOutput } from './types'

const REGISTRY = new Map<AgentKey, Agent>()
type Log = { ts: string; key: AgentKey; input: AgentRunInput; output: AgentRunOutput }
const LOGS: Log[] = []
const STATUS = new Map<
  AgentKey,
  {
    enabled: boolean
    lastRun?: string
    lastSummary?: string
    impact$?: number
    lifecycle?: string
    autoRunnable?: boolean
  }
>()

export function register(agent: Agent) {
  REGISTRY.set(agent.meta.key, agent)
  if (!STATUS.has(agent.meta.key))
    STATUS.set(agent.meta.key, {
      enabled: true,
      autoRunnable: agent.meta.autoRunnable ?? false,
      lifecycle: 'active',
    })
}

export function listAgents() {
  return Array.from(REGISTRY.values()).map((a) => ({
    meta: a.meta,
    status: STATUS.get(a.meta.key) ?? { enabled: true },
    samplePayload: a.samplePayload,
  }))
}

export function getAgent(key: AgentKey) {
  return REGISTRY.get(key)!
}

export async function runAgent(key: AgentKey, input: AgentRunInput) {
  const a = getAgent(key)
  const out = await a.run(input)
  const ts = new Date().toISOString()
  LOGS.unshift({ ts, key, input, output: out })
  const s = STATUS.get(key) ?? { enabled: true }
  s.lastRun = ts
  s.lastSummary = out.summary ?? (out.ok ? 'Completed' : 'Failed')
  const impact = (out.data && (out.data.expectedImpact$ || out.data.dollarsAdvanced$)) ?? 0
  s.impact$ = (s.impact$ ?? 0) + Number(impact)
  STATUS.set(key, s)
  return out
}

export function logsFor(key: AgentKey, limit = 50) {
  return LOGS.filter((l) => l.key === key).slice(0, limit)
}

export function setEnabled(key: AgentKey, enabled: boolean) {
  const s = STATUS.get(key) ?? { enabled: true }
  s.enabled = enabled
  s.lifecycle = enabled ? 'active' : 'disabled'
  STATUS.set(key, s)
  return s
}
