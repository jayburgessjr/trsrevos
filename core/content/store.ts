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
  ContentPiece,
  CreateContentInput,
  AdCampaign,
  CreateAdCampaignInput,
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

// Marketing Content Pieces Store
const contentPieces: ContentPiece[] = [
  {
    id: 'mkt-1',
    title: 'LinkedIn Post: Q1 Revenue Success Story',
    contentType: 'Client',
    format: 'Post',
    status: 'Published',
    purpose: 'Inspire',
    channel: 'LinkedIn',
    targetAudience: 'ACME Corp',
    targetId: 'acme-corp',
    description: 'Showcase ACME Corp\'s 40% ARR growth using RevOS',
    createdBy: 'Maya',
    assignedTo: 'Jordan',
    createdAt: new Date('2025-01-15').toISOString(),
    updatedAt: new Date('2025-01-20').toISOString(),
    scheduledDate: new Date('2025-01-22').toISOString(),
    publishedDate: new Date('2025-01-22').toISOString(),
    aiGenerated: false,
    performanceMetrics: {
      views: 4200,
      engagement: 320,
      clicks: 180,
      shares: 45,
    },
    tags: ['success story', 'client', 'revenue growth'],
  },
  {
    id: 'mkt-2',
    title: 'Webinar: Revenue Forecasting Best Practices',
    contentType: 'Prospect',
    format: 'Webinar',
    status: 'Scheduled',
    purpose: 'Sell',
    channel: 'Event',
    targetAudience: 'Enterprise SaaS Prospects',
    description: 'Educational webinar on improving forecast accuracy with AI',
    createdBy: 'Alexa',
    assignedTo: 'Morgan',
    createdAt: new Date('2025-02-01').toISOString(),
    updatedAt: new Date('2025-02-05').toISOString(),
    scheduledDate: new Date('2025-02-25').toISOString(),
    dueDate: new Date('2025-02-20').toISOString(),
    aiGenerated: false,
    tags: ['webinar', 'forecasting', 'prospect'],
  },
  {
    id: 'mkt-3',
    title: 'Partner Co-Marketing One-Pager',
    contentType: 'Partner',
    format: 'One-Pager',
    status: 'Draft',
    purpose: 'Add Value',
    targetAudience: 'Salesforce Partner Network',
    description: 'Joint solution brief for Salesforce integration',
    createdBy: 'Jordan',
    assignedTo: 'Jay',
    createdAt: new Date('2025-02-10').toISOString(),
    updatedAt: new Date('2025-02-12').toISOString(),
    dueDate: new Date('2025-02-28').toISOString(),
    aiGenerated: false,
    tags: ['partner', 'salesforce', 'integration'],
  },
  {
    id: 'mkt-4',
    title: 'Email: Revenue Intelligence White Paper',
    contentType: 'Marketing',
    format: 'White Paper',
    status: 'Review',
    purpose: 'Add Value',
    channel: 'Email',
    targetAudience: 'Email Subscribers',
    description: 'Deep dive on AI-powered revenue intelligence',
    createdBy: 'Maya',
    assignedTo: 'Alexa',
    createdAt: new Date('2025-01-28').toISOString(),
    updatedAt: new Date('2025-02-08').toISOString(),
    dueDate: new Date('2025-02-18').toISOString(),
    aiGenerated: true,
    tags: ['white paper', 'revenue intelligence', 'AI'],
  },
  {
    id: 'mkt-5',
    title: 'Case Study Video: Globex Implementation',
    contentType: 'Prospect',
    format: 'Video',
    status: 'Idea',
    purpose: 'Inspire',
    targetAudience: 'Mid-Market SaaS',
    targetId: 'globex-corp',
    description: 'Video case study showing Globex\'s implementation journey',
    createdBy: 'Riya',
    createdAt: new Date('2025-02-14').toISOString(),
    updatedAt: new Date('2025-02-14').toISOString(),
    aiGenerated: false,
    tags: ['case study', 'video', 'implementation'],
  },
];

const adCampaigns: AdCampaign[] = [
  {
    id: 'ad-1',
    name: 'Q1 Revenue Leaders Campaign',
    platform: 'LinkedIn',
    objective: 'Lead Generation',
    status: 'Active',
    budget: 15000,
    spent: 8500,
    startDate: new Date('2025-01-15').toISOString(),
    endDate: new Date('2025-03-31').toISOString(),
    targetAudience: 'CROs, VP Revenue, Enterprise SaaS',
    createdBy: 'Morgan',
    createdAt: new Date('2025-01-10').toISOString(),
    updatedAt: new Date('2025-02-15').toISOString(),
    metrics: {
      impressions: 125000,
      clicks: 2400,
      conversions: 180,
      ctr: 1.92,
      cpc: 3.54,
      roas: 3.8,
    },
    contentIds: ['mkt-1', 'mkt-4'],
  },
  {
    id: 'ad-2',
    name: 'Partner Co-Marketing Push',
    platform: 'Multi-Channel',
    objective: 'Brand Awareness',
    status: 'Active',
    budget: 8000,
    spent: 3200,
    startDate: new Date('2025-02-01').toISOString(),
    endDate: new Date('2025-04-30').toISOString(),
    targetAudience: 'Salesforce ecosystem',
    createdBy: 'Jay',
    createdAt: new Date('2025-01-25').toISOString(),
    updatedAt: new Date('2025-02-10').toISOString(),
    metrics: {
      impressions: 45000,
      clicks: 890,
      conversions: 45,
      ctr: 1.98,
      cpc: 3.60,
    },
    contentIds: ['mkt-3'],
  },
  {
    id: 'ad-3',
    name: 'Forecast Webinar Promotion',
    platform: 'LinkedIn',
    objective: 'Conversion',
    status: 'Draft',
    budget: 5000,
    spent: 0,
    startDate: new Date('2025-02-18').toISOString(),
    endDate: new Date('2025-02-25').toISOString(),
    targetAudience: 'Finance & RevOps Leaders',
    createdBy: 'Alexa',
    createdAt: new Date('2025-02-12').toISOString(),
    updatedAt: new Date('2025-02-12').toISOString(),
    contentIds: ['mkt-2'],
  },
];

export function listContentPieces() {
  return contentPieces.map(piece => clone(piece));
}

export function getContentPiece(id: string) {
  const piece = contentPieces.find(p => p.id === id);
  return piece ? clone(piece) : null;
}

export function getContentPiecesByStatus(status: ContentStatus) {
  return contentPieces.filter(p => p.status === status).map(p => clone(p));
}

export function getContentPiecesByType(contentType: string) {
  return contentPieces.filter(p => p.contentType === contentType).map(p => clone(p));
}

export function getContentPiecesByClient(clientId: string) {
  return contentPieces.filter(p => p.targetId === clientId).map(p => clone(p));
}

export function createContentPiece(input: CreateContentInput): ContentPiece {
  const now = new Date().toISOString();
  const piece: ContentPiece = {
    ...input,
    id: `mkt-${id()}`,
    createdAt: now,
    updatedAt: now,
  };
  contentPieces.push(piece);
  return clone(piece);
}

export function updateContentPiece(id: string, updates: Partial<ContentPiece>): ContentPiece | null {
  const piece = contentPieces.find(p => p.id === id);
  if (!piece) return null;

  Object.assign(piece, updates, { updatedAt: new Date().toISOString() });
  return clone(piece);
}

export function deleteContentPiece(id: string): boolean {
  const index = contentPieces.findIndex(p => p.id === id);
  if (index === -1) return false;
  contentPieces.splice(index, 1);
  return true;
}

export function listAdCampaigns() {
  return adCampaigns.map(campaign => clone(campaign));
}

export function getAdCampaign(id: string) {
  const campaign = adCampaigns.find(c => c.id === id);
  return campaign ? clone(campaign) : null;
}

export function getAdCampaignsByStatus(status: string) {
  return adCampaigns.filter(c => c.status === status).map(c => clone(c));
}

export function createAdCampaign(input: CreateAdCampaignInput): AdCampaign {
  const now = new Date().toISOString();
  const campaign: AdCampaign = {
    ...input,
    id: `ad-${id()}`,
    createdAt: now,
    updatedAt: now,
  };
  adCampaigns.push(campaign);
  return clone(campaign);
}

export function updateAdCampaign(id: string, updates: Partial<AdCampaign>): AdCampaign | null {
  const campaign = adCampaigns.find(c => c.id === id);
  if (!campaign) return null;

  Object.assign(campaign, updates, { updatedAt: new Date().toISOString() });
  return clone(campaign);
}

export function deleteAdCampaign(id: string): boolean {
  const index = adCampaigns.findIndex(c => c.id === id);
  if (index === -1) return false;
  adCampaigns.splice(index, 1);
  return true;
}

export function getMarketingKPIs() {
  const totalContent = contentPieces.length;
  const publishedContent = contentPieces.filter(p => p.status === 'Published').length;
  const scheduledContent = contentPieces.filter(p => p.status === 'Scheduled').length;
  const draftContent = contentPieces.filter(p => p.status === 'Draft').length;
  const ideaContent = contentPieces.filter(p => p.status === 'Idea').length;

  const totalViews = contentPieces.reduce((sum, p) => sum + (p.performanceMetrics?.views || 0), 0);
  const totalEngagement = contentPieces.reduce((sum, p) => sum + (p.performanceMetrics?.engagement || 0), 0);
  const totalConversions = contentPieces.reduce((sum, p) => sum + (p.performanceMetrics?.conversions || 0), 0);

  const activeCampaigns = adCampaigns.filter(c => c.status === 'Active').length;
  const totalAdSpend = adCampaigns.reduce((sum, c) => sum + c.spent, 0);
  const totalAdBudget = adCampaigns.reduce((sum, c) => sum + c.budget, 0);
  const totalImpressions = adCampaigns.reduce((sum, c) => sum + (c.metrics?.impressions || 0), 0);
  const totalClicks = adCampaigns.reduce((sum, c) => sum + (c.metrics?.clicks || 0), 0);
  const totalAdConversions = adCampaigns.reduce((sum, c) => sum + (c.metrics?.conversions || 0), 0);

  const avgCTR = activeCampaigns > 0
    ? adCampaigns.filter(c => c.status === 'Active').reduce((sum, c) => sum + (c.metrics?.ctr || 0), 0) / activeCampaigns
    : 0;

  const avgROAS = activeCampaigns > 0
    ? adCampaigns.filter(c => c.status === 'Active').reduce((sum, c) => sum + (c.metrics?.roas || 0), 0) / activeCampaigns
    : 0;

  return {
    content: {
      total: totalContent,
      published: publishedContent,
      scheduled: scheduledContent,
      draft: draftContent,
      ideas: ideaContent,
      views: totalViews,
      engagement: totalEngagement,
      conversions: totalConversions,
    },
    advertising: {
      activeCampaigns,
      totalSpend: totalAdSpend,
      totalBudget: totalAdBudget,
      impressions: totalImpressions,
      clicks: totalClicks,
      conversions: totalAdConversions,
      avgCTR,
      avgROAS,
    },
  };
}
