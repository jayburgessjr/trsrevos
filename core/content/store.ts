import {
  ContentBrief,
  ContentItem,
  ContentStage,
  ContentStatus,
  Distribution,
  Metrics,
  Touch,
  TouchAction,
  Variant,
} from './types'

const contentItems: ContentItem[] = [
  {
    id: 'cnt-1',
    title: 'RevOps QRA Narrative',
    type: 'One-pager',
    status: 'Draft',
    persona: 'CRO',
    stage: 'Evaluation',
    objection: 'Needs proof of revenue impact',
    ownerId: 'maya',
    cost: 1200,
    createdAt: new Date('2025-01-12').toISOString(),
    publishedAt: null,
    sla: '72h',
    brief: {
      cta: 'Book a revenue lab',
      outline: '1. Urgency\n2. Narrative\n3. Business case',
      notes: 'Use last quarter benchmarks as proof.',
    },
  },
  {
    id: 'cnt-2',
    title: 'CFO Forecast Debrief',
    type: 'Insight Report',
    status: 'Review',
    persona: 'CFO',
    stage: 'Decision',
    objection: 'Skeptical of automation',
    ownerId: 'jordan',
    cost: 1800,
    createdAt: new Date('2024-12-05').toISOString(),
    publishedAt: null,
    sla: '48h',
    brief: {
      cta: 'Schedule working session',
      outline: '1. Why now\n2. Risk mitigation\n3. 90-day proof',
    },
  },
  {
    id: 'cnt-3',
    title: 'Implementation Playbook',
    type: 'Guide',
    status: 'Scheduled',
    persona: 'COO',
    stage: 'Onboarding',
    objection: 'Worried about rollout risk',
    ownerId: 'alexa',
    cost: 950,
    createdAt: new Date('2025-02-08').toISOString(),
    publishedAt: null,
    sla: '5d',
  },
  {
    id: 'cnt-4',
    title: 'Field Battlecard – AI Objections',
    type: 'Battlecard',
    status: 'Published',
    persona: 'VP Sales',
    stage: 'Adoption',
    objection: 'Need talk track for AI concerns',
    ownerId: 'danielle',
    cost: 600,
    createdAt: new Date('2024-11-20').toISOString(),
    publishedAt: new Date('2025-02-01').toISOString(),
    sla: '24h',
  },
  {
    id: 'cnt-5',
    title: 'Pipeline Momentum Newsletter',
    type: 'Newsletter',
    status: 'Idea',
    persona: 'RevOps',
    stage: 'Discovery',
    objection: 'Need executive-ready summary',
    ownerId: 'maya',
    cost: 400,
    createdAt: new Date('2025-02-15').toISOString(),
    sla: '48h',
  },
]

const variants: Variant[] = [
  {
    id: 'var-1',
    contentId: 'cnt-4',
    kind: 'Email CTA',
    headline: 'AI objections? Arm the field fast',
    cta: 'Drop into enablement hub',
    group: 'A',
    status: 'scaling',
  },
  {
    id: 'var-2',
    contentId: 'cnt-4',
    kind: 'Email CTA',
    headline: 'Disarm AI concerns in 2 minutes',
    cta: 'Use the field script',
    group: 'B',
    status: 'testing',
  },
]

const distributions: Distribution[] = [
  {
    id: 'dist-1',
    contentId: 'cnt-4',
    channel: 'LinkedIn',
    publishedAt: new Date('2025-02-02').toISOString(),
    utm: 'utm_source=linkedin&utm_campaign=ai-battlecard',
    clicks: 420,
  },
  {
    id: 'dist-2',
    contentId: 'cnt-3',
    channel: 'Email',
    scheduledAt: new Date('2025-02-18T16:00:00Z').toISOString(),
    utm: 'utm_source=email&utm_campaign=playbook',
    clicks: 55,
  },
]

const touches: Touch[] = [
  {
    id: 'touch-1',
    contentId: 'cnt-4',
    opportunityId: 'opp-8721',
    actor: 'sdr-rachel',
    action: 'worked',
    ts: new Date('2025-02-12T15:02:00Z').toISOString(),
  },
  {
    id: 'touch-2',
    contentId: 'cnt-4',
    opportunityId: 'opp-8728',
    actor: 'ae-jules',
    action: 'used',
    ts: new Date('2025-02-13T12:18:00Z').toISOString(),
  },
  {
    id: 'touch-3',
    contentId: 'cnt-2',
    opportunityId: 'opp-8650',
    actor: 'cs-lee',
    action: 'failed',
    ts: new Date('2025-02-10T09:45:00Z').toISOString(),
  },
]

const id = () => Math.random().toString(36).slice(2, 10)

function clone<T>(value: T): T {
  return JSON.parse(JSON.stringify(value))
}

export function listContentItems() {
  return contentItems.map(item => clone(item))
}

export function listVariants() {
  return variants.map(variant => clone(variant))
}

export function listDistributions() {
  return distributions.map(distribution => clone(distribution))
}

export function listTouches() {
  return touches.map(touch => clone(touch))
}

export function getContentState() {
  return {
    items: listContentItems(),
    variants: listVariants(),
    distributions: listDistributions(),
    touches: listTouches(),
  }
}

export function createItem(input: {
  title: string
  type: string
  persona: string
  stage: ContentStage
  objection: string
  ownerId: string
  cost?: number
  status?: ContentStatus
  sla?: string
  brief?: ContentBrief
}) {
  const now = new Date().toISOString()
  const item: ContentItem = {
    id: `cnt-${id()}`,
    title: input.title,
    type: input.type,
    persona: input.persona,
    stage: input.stage,
    objection: input.objection,
    ownerId: input.ownerId,
    cost: input.cost ?? 0,
    status: input.status ?? 'Idea',
    createdAt: now,
    publishedAt: null,
    sla: input.sla ?? '72h',
    brief: input.brief,
  }
  contentItems.push(item)
  return clone(item)
}

export function updateItem(id: string, patch: Partial<ContentItem>) {
  const item = contentItems.find(entry => entry.id === id)
  if (!item) {
    throw new Error(`Content item ${id} not found`)
  }
  Object.assign(item, patch)
  return clone(item)
}

export function updateStatus(id: string, status: ContentStatus) {
  const item = contentItems.find(entry => entry.id === id)
  if (!item) {
    throw new Error(`Content item ${id} not found`)
  }
  item.status = status
  if (status === 'Published' && !item.publishedAt) {
    item.publishedAt = new Date().toISOString()
  }
  return clone(item)
}

export function saveBrief(id: string, brief: ContentBrief) {
  return updateItem(id, { brief })
}

export function createVariant(input: {
  contentId: string
  kind: string
  headline: string
  cta: string
  group?: 'A' | 'B'
}) {
  const variant: Variant = {
    id: `var-${id()}`,
    contentId: input.contentId,
    kind: input.kind,
    headline: input.headline,
    cta: input.cta,
    group: input.group,
    status: 'testing',
  }
  variants.push(variant)
  return clone(variant)
}

export function markVariantStatus(variantId: string, status: string) {
  const variant = variants.find(entry => entry.id === variantId)
  if (!variant) {
    throw new Error(`Variant ${variantId} not found`)
  }
  variant.status = status
  return clone(variant)
}

export function recordTouch(input: {
  id?: string
  contentId: string
  opportunityId: string
  actor: string
  action: TouchAction
}) {
  if (input.id) {
    const existing = touches.find(touch => touch.id === input.id)
    if (!existing) {
      throw new Error(`Touch ${input.id} not found`)
    }
    existing.action = input.action
    existing.ts = new Date().toISOString()
    return clone(existing)
  }
  const touch: Touch = {
    id: `touch-${id()}`,
    contentId: input.contentId,
    opportunityId: input.opportunityId,
    actor: input.actor,
    action: input.action,
    ts: new Date().toISOString(),
  }
  touches.push(touch)
  return clone(touch)
}

export function scheduleDistribution(input: {
  id?: string
  contentId: string
  channel: string
  scheduledAt?: string | null
  publishedAt?: string | null
  utm?: string | null
}) {
  if (input.id) {
    const existing = distributions.find(entry => entry.id === input.id)
    if (!existing) throw new Error(`Distribution ${input.id} not found`)
    Object.assign(existing, input)
    return clone(existing)
  }
  const distribution: Distribution = {
    id: `dist-${id()}`,
    contentId: input.contentId,
    channel: input.channel,
    scheduledAt: input.scheduledAt ?? null,
    publishedAt: input.publishedAt ?? null,
    utm: input.utm ?? null,
    clicks: 0,
  }
  distributions.push(distribution)
  return clone(distribution)
}

export function computeMetrics(): Metrics {
  const totalTouches = touches.length
  const productiveTouches = touches.filter(touch => touch.action !== 'failed').length
  const workedTouches = touches.filter(touch => touch.action === 'worked').length
  const totalClicks = distributions.reduce((sum, distribution) => sum + (distribution.clicks ?? 0), 0)

  return {
    influenced: productiveTouches * 7500,
    advanced: workedTouches * 5200,
    closedWon: Math.round(workedTouches * 18000 * 0.65),
    usageRate: contentItems.length > 0 ? Number((productiveTouches / contentItems.length).toFixed(2)) : 0,
    views: totalClicks,
    ctr: distributions.length > 0 ? Number(((totalClicks / (distributions.length * 1200)) * 100).toFixed(2)) : 0,
  }
}
