export type AutomationStepConfig = Record<string, any>

export type AutomationStep = {
  id: string
  sortOrder: number
  workspace: 'sales' | 'delivery' | 'finance' | 'ops'
  action: string
  config: AutomationStepConfig
}

export type AutomationPlaybook = {
  id: string
  name: string
  description: string | null
  triggerEvent: string
  status: 'draft' | 'active' | 'archived'
  configuration: Record<string, unknown>
  createdAt: string
  updatedAt: string | null
  steps: AutomationStep[]
}

export type AutomationRunResult = {
  runId: string
  status: 'completed' | 'failed'
  stepResults: {
    stepId: string
    status: 'completed' | 'skipped' | 'failed'
    output?: Record<string, unknown>
  }[]
}
