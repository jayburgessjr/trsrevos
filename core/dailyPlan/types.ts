export type StrategicWeight = "Brilliant" | "Incremental" | "Stabilization"

export type PriorityItem = {
  id: string
  title: string
  expectedImpact: number
  effortHours: number
  probability: number
  urgency: number
  confidence: number
  strategicWeight: StrategicWeight
  nextAction: string
  moduleHref?: string
}

export type DailyPlan = {
  id: string
  userId: string
  orgId?: string
  dateISO: string
  items: PriorityItem[]
  lockedAt?: string | null
}
