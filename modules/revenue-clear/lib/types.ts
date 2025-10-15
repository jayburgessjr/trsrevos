export type RevenueClearStageKey =
  | 'intake'
  | 'audit'
  | 'blueprint'
  | 'revboard'
  | 'execution'
  | 'results'
  | 'nextSteps'

export type StageStatus = 'idle' | 'saving' | 'saved' | 'error' | 'running'

export type RevenueClearClient = {
  id: string
  name: string
  industry: string | null
  revenueModel: string | null
  monthlyRevenue: number | null
  profitMargin: number | null
  targetGrowth: number | null
  primaryGoal: string | null
}

export type IntakeCompanyProfile = {
  name: string
  industry: string
  revenueModel: string
}

export type IntakeFinancials = {
  monthlyRevenue: number
  profitMargin: number
  targetGrowth: number
}

export type IntakeGoals = {
  primaryGoal: string
  secondaryGoal?: string
  notes?: string
}

export type RevenueClearIntake = {
  id?: string
  companyProfile: IntakeCompanyProfile
  financials: IntakeFinancials
  goals: IntakeGoals
  claritySummaryUrl?: string | null
}

export type AuditLeak = {
  id?: string
  pillar: 'pricing' | 'demand' | 'retention' | 'forecasting'
  leakSeverity: number
  leakDescription: string
  estimatedLoss: number
  score: number
  leakMapUrl?: string | null
}

export type BlueprintIntervention = {
  id?: string
  interventionName: string
  diagnosis: string
  fix: string
  projectedLift: number
  effortScore: number
  roiIndex: number
  blueprintUrl?: string | null
}

export type RevboardMetric = {
  id?: string
  kpiName: string
  baselineValue: number
  currentValue: number
  delta: number
  interventionId?: string | null
  date: string
}

export type ExecutionTask = {
  id?: string
  taskName: string
  status: 'todo' | 'in-progress' | 'done'
  assignedTo: string
  startDate: string
  endDate: string
  progressNotes: string
}

export type ExecutionWeeklySummary = {
  notes: string
  advisorSummary?: string | null
}

export type RevenueClearResult = {
  id?: string
  beforeMRR: number
  afterMRR: number
  beforeProfit: number
  afterProfit: number
  totalGain: number
  paybackPeriod: number
  reportUrl?: string | null
}

export type NextStepPlan = {
  id?: string
  nextOffer: 'Advisory' | 'ProfitOS' | 'Equity' | 'Other'
  rationale: string
  projectedOutcome: number
  proposalDoc: string
  proposalUrl?: string | null
}

export type RevenueClearSnapshot = {
  client: RevenueClearClient
  intake: RevenueClearIntake | null
  audits: AuditLeak[]
  interventions: BlueprintIntervention[]
  metrics: RevboardMetric[]
  tasks: ExecutionTask[]
  weeklySummary: ExecutionWeeklySummary | null
  results: RevenueClearResult | null
  nextStep: NextStepPlan | null
}
