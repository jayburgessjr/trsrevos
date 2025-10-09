export type PriorityItemStatus = 'pending' | 'in-progress' | 'complete'

export type PriorityItem = {
  id: string
  title: string
  summary: string
  nextAction: string
  expectedImpact: number
  probability: number
  strategicWeight: number
  urgency: number
  confidence: number
  effort: number
  score: number
  status: PriorityItemStatus
  ownerName?: string
}

export type Plan = {
  id: string
  userId: string
  date: string // YYYY-MM-DD
  generatedAt: string
  locked: boolean
  items: PriorityItem[]
}
