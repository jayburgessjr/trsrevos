export type ContentStatus = 'Idea' | 'Draft' | 'Review' | 'Scheduled' | 'Published'

export type ContentStage =
  | 'Discovery'
  | 'Evaluation'
  | 'Decision'
  | 'Onboarding'
  | 'Adoption'

export interface ContentBrief {
  cta: string
  outline: string
  notes?: string
}

export interface ContentItem {
  id: string
  title: string
  type: string
  status: ContentStatus
  persona: string
  stage: ContentStage
  objection: string
  ownerId: string
  cost: number
  createdAt: string
  publishedAt?: string | null
  sla: string
  brief?: ContentBrief
}

export type VariantGroup = 'A' | 'B'

export interface Variant {
  id: string
  contentId: string
  kind: string
  headline: string
  cta: string
  group?: VariantGroup
  status: string
}

export interface Distribution {
  id: string
  contentId: string
  channel: string
  scheduledAt?: string | null
  publishedAt?: string | null
  utm?: string | null
  clicks?: number
}

export type TouchAction = 'used' | 'worked' | 'failed'

export interface Touch {
  id: string
  contentId: string
  opportunityId: string
  actor: string
  action: TouchAction
  ts: string
}

export interface Metrics {
  influenced: number
  advanced: number
  closedWon: number
  usageRate: number
  views: number
  ctr: number
}
