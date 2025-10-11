'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import { logAnalyticsEvent } from '@/core/analytics/actions'
import { requireAuth } from '@/lib/server/auth'
import type {
  ContentItem,
  ContentBrief,
  ContentStage,
  ContentStatus,
  Variant,
  Distribution,
  Touch,
  TouchAction,
  Metrics,
  ContentPiece,
  CreateContentInput,
  AdCampaign,
  CreateAdCampaignInput,
} from './types'

const CONTENT_PATH = '/content'

// ============================================================================
// CONTENT ITEMS
// ============================================================================

/**
 * Get all content items
 */
export async function getContentItems(): Promise<ContentItem[]> {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('content_items')
    .select('*')
    .order('created_at', { ascending: false })

  if (error) {
    console.error('Error fetching content items:', error)
    return []
  }

  return (data || []).map((item: any) => ({
    id: item.id,
    title: item.title,
    type: item.type,
    status: item.status,
    persona: item.persona,
    stage: item.stage,
    objection: item.objection,
    ownerId: item.owner_id,
    cost: item.cost || 0,
    createdAt: item.created_at,
    publishedAt: item.published_at,
    sla: item.sla,
    brief: item.brief,
  }))
}

/**
 * Create a new content item
 */
export async function createItem(input: {
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
}): Promise<ContentItem> {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('content_items')
    .insert({
      title: input.title,
      type: input.type,
      persona: input.persona,
      stage: input.stage,
      objection: input.objection,
      owner_id: input.ownerId,
      cost: input.cost || 0,
      status: input.status || 'Idea',
      sla: input.sla || 'Normal',
      brief: input.brief || null,
    })
    .select()
    .single()

  if (error || !data) {
    console.error('Error creating content item:', error)
    throw new Error('Failed to create content item')
  }

  await logAnalyticsEvent({
    eventKey: 'content.item.created',
    payload: { contentId: data.id, type: input.type },
  })

  revalidatePath(CONTENT_PATH)

  return {
    id: data.id,
    title: data.title,
    type: data.type,
    status: data.status,
    persona: data.persona,
    stage: data.stage,
    objection: data.objection,
    ownerId: data.owner_id,
    cost: data.cost,
    createdAt: data.created_at,
    publishedAt: data.published_at,
    sla: data.sla,
    brief: data.brief,
  }
}

/**
 * Update content item status
 */
export async function updateStatus(id: string, status: ContentStatus): Promise<ContentItem | null> {
  const supabase = await createClient()

  const updates: any = { status }
  if (status === 'Published') {
    updates.published_at = new Date().toISOString()
  }

  const { data, error } = await supabase
    .from('content_items')
    .update(updates)
    .eq('id', id)
    .select()
    .single()

  if (error || !data) {
    console.error('Error updating content status:', error)
    return null
  }

  await logAnalyticsEvent({
    eventKey: 'content.item.status_updated',
    payload: { contentId: id, status },
  })

  revalidatePath(CONTENT_PATH)

  return {
    id: data.id,
    title: data.title,
    type: data.type,
    status: data.status,
    persona: data.persona,
    stage: data.stage,
    objection: data.objection,
    ownerId: data.owner_id,
    cost: data.cost,
    createdAt: data.created_at,
    publishedAt: data.published_at,
    sla: data.sla,
    brief: data.brief,
  }
}

/**
 * Save content brief
 */
export async function saveBrief(id: string, brief: ContentBrief): Promise<ContentItem | null> {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('content_items')
    .update({ brief })
    .eq('id', id)
    .select()
    .single()

  if (error || !data) {
    console.error('Error saving brief:', error)
    return null
  }

  await logAnalyticsEvent({
    eventKey: 'content.brief.saved',
    payload: { contentId: id },
  })

  revalidatePath(CONTENT_PATH)

  return {
    id: data.id,
    title: data.title,
    type: data.type,
    status: data.status,
    persona: data.persona,
    stage: data.stage,
    objection: data.objection,
    ownerId: data.owner_id,
    cost: data.cost,
    createdAt: data.created_at,
    publishedAt: data.published_at,
    sla: data.sla,
    brief: data.brief,
  }
}

/**
 * Update content item
 */
export async function updateItem(
  id: string,
  patch: Partial<{ ownerId: string; sla: string }>
): Promise<ContentItem | null> {
  const supabase = await createClient()

  const updates: any = {}
  if (patch.ownerId) updates.owner_id = patch.ownerId
  if (patch.sla) updates.sla = patch.sla

  const { data, error } = await supabase
    .from('content_items')
    .update(updates)
    .eq('id', id)
    .select()
    .single()

  if (error || !data) {
    console.error('Error updating content item:', error)
    return null
  }

  revalidatePath(CONTENT_PATH)

  return {
    id: data.id,
    title: data.title,
    type: data.type,
    status: data.status,
    persona: data.persona,
    stage: data.stage,
    objection: data.objection,
    ownerId: data.owner_id,
    cost: data.cost,
    createdAt: data.created_at,
    publishedAt: data.published_at,
    sla: data.sla,
    brief: data.brief,
  }
}

// ============================================================================
// VARIANTS
// ============================================================================

/**
 * Get variants for a content item
 */
export async function getVariants(contentId: string): Promise<Variant[]> {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('content_variants')
    .select('*')
    .eq('content_id', contentId)
    .order('created_at', { ascending: false })

  if (error) {
    console.error('Error fetching variants:', error)
    return []
  }

  return (data || []).map((variant: any) => ({
    id: variant.id,
    contentId: variant.content_id,
    kind: variant.kind,
    headline: variant.headline,
    cta: variant.cta,
    group: variant.group,
    status: variant.status,
  }))
}

/**
 * Create a new variant
 */
export async function createVariant(input: {
  contentId: string
  kind: string
  headline: string
  cta: string
  group?: 'A' | 'B'
}): Promise<Variant> {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('content_variants')
    .insert({
      content_id: input.contentId,
      kind: input.kind,
      headline: input.headline,
      cta: input.cta,
      group: input.group || null,
      status: 'draft',
    })
    .select()
    .single()

  if (error || !data) {
    console.error('Error creating variant:', error)
    throw new Error('Failed to create variant')
  }

  await logAnalyticsEvent({
    eventKey: 'content.variant.created',
    payload: { variantId: data.id, contentId: input.contentId },
  })

  revalidatePath(CONTENT_PATH)

  return {
    id: data.id,
    contentId: data.content_id,
    kind: data.kind,
    headline: data.headline,
    cta: data.cta,
    group: data.group,
    status: data.status,
  }
}

/**
 * Mark experiment outcome
 */
export async function markExperimentOutcome(variantId: string, status: string): Promise<Variant | null> {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('content_variants')
    .update({ status })
    .eq('id', variantId)
    .select()
    .single()

  if (error || !data) {
    console.error('Error marking experiment outcome:', error)
    return null
  }

  await logAnalyticsEvent({
    eventKey: 'content.experiment.marked',
    payload: { variantId, status },
  })

  revalidatePath(CONTENT_PATH)

  return {
    id: data.id,
    contentId: data.content_id,
    kind: data.kind,
    headline: data.headline,
    cta: data.cta,
    group: data.group,
    status: data.status,
  }
}

// ============================================================================
// DISTRIBUTION
// ============================================================================

/**
 * Get distribution channels for content
 */
export async function getDistribution(contentId: string): Promise<Distribution[]> {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('content_distribution')
    .select('*')
    .eq('content_id', contentId)
    .order('scheduled_at', { ascending: true })

  if (error) {
    console.error('Error fetching distribution:', error)
    return []
  }

  return (data || []).map((dist: any) => ({
    id: dist.id,
    contentId: dist.content_id,
    channel: dist.channel,
    scheduledAt: dist.scheduled_at,
    publishedAt: dist.published_at,
    utm: dist.utm,
    clicks: dist.clicks,
  }))
}

/**
 * Schedule content distribution
 */
export async function scheduleDistribution(input: {
  id?: string
  contentId: string
  channel: string
  scheduledAt?: string | null
  utm?: string | null
}): Promise<Distribution> {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('content_distribution')
    .insert({
      content_id: input.contentId,
      channel: input.channel,
      scheduled_at: input.scheduledAt || null,
      utm: input.utm || null,
    })
    .select()
    .single()

  if (error || !data) {
    console.error('Error scheduling distribution:', error)
    throw new Error('Failed to schedule distribution')
  }

  await logAnalyticsEvent({
    eventKey: 'content.distribution.scheduled',
    payload: { distributionId: data.id, channel: input.channel },
  })

  revalidatePath(CONTENT_PATH)

  return {
    id: data.id,
    contentId: data.content_id,
    channel: data.channel,
    scheduledAt: data.scheduled_at,
    publishedAt: data.published_at,
    utm: data.utm,
    clicks: data.clicks,
  }
}

// ============================================================================
// TOUCHES (Content Usage Tracking)
// ============================================================================

/**
 * Get content touches (usage tracking)
 */
export async function getTouches(contentId: string): Promise<Touch[]> {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('content_touches')
    .select('*')
    .eq('content_id', contentId)
    .order('ts', { ascending: false })
    .limit(100)

  if (error) {
    console.error('Error fetching touches:', error)
    return []
  }

  return (data || []).map((touch: any) => ({
    id: touch.id,
    contentId: touch.content_id,
    opportunityId: touch.opportunity_id,
    actor: touch.actor,
    action: touch.action,
    ts: touch.ts,
  }))
}

/**
 * Record a content touch
 */
export async function recordTouch(input: {
  id?: string
  contentId: string
  opportunityId: string
  actor: string
  action: TouchAction
}): Promise<Touch> {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('content_touches')
    .insert({
      content_id: input.contentId,
      opportunity_id: input.opportunityId,
      actor: input.actor,
      action: input.action,
      ts: new Date().toISOString(),
    })
    .select()
    .single()

  if (error || !data) {
    console.error('Error recording touch:', error)
    throw new Error('Failed to record touch')
  }

  await logAnalyticsEvent({
    eventKey: 'content.touch.recorded',
    payload: { touchId: data.id, action: input.action },
  })

  revalidatePath(CONTENT_PATH)

  return {
    id: data.id,
    contentId: data.content_id,
    opportunityId: data.opportunity_id,
    actor: data.actor,
    action: data.action,
    ts: data.ts,
  }
}

// ============================================================================
// METRICS
// ============================================================================

/**
 * Get content metrics
 */
export async function getMetrics(): Promise<Metrics> {
  const supabase = await createClient()

  // Get touch statistics
  const { data: touches } = await supabase
    .from('content_touches')
    .select('action, opportunity_id')

  const influenced = new Set(touches?.map((t: any) => t.opportunity_id) || []).size
  const advanced = touches?.filter((t: any) => t.action === 'worked').length || 0
  const used = touches?.filter((t: any) => t.action === 'used').length || 0
  const usageRate = used > 0 ? (used / (touches?.length || 1)) * 100 : 0

  // Get distribution stats
  const { data: distributions } = await supabase.from('content_distribution').select('clicks')

  const totalClicks = distributions?.reduce((sum: number, d: any) => sum + (d.clicks || 0), 0) || 0
  const views = distributions?.length || 0
  const ctr = views > 0 ? (totalClicks / views) * 100 : 0

  return {
    influenced,
    advanced,
    closedWon: 0, // Would need to join with opportunities
    usageRate,
    views,
    ctr,
  }
}

// ============================================================================
// CONTENT PIECES (Marketing Content)
// ============================================================================

/**
 * Get all content pieces
 */
export async function getContentPieces(): Promise<ContentPiece[]> {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('content_pieces')
    .select('*')
    .order('created_at', { ascending: false })

  if (error) {
    console.error('Error fetching content pieces:', error)
    return []
  }

  return (data || []).map((piece: any) => ({
    id: piece.id,
    title: piece.title,
    contentType: piece.content_type,
    format: piece.format,
    status: piece.status,
    purpose: piece.purpose,
    channel: piece.channel,
    targetAudience: piece.target_audience,
    targetId: piece.target_id,
    description: piece.description,
    createdBy: piece.created_by,
    assignedTo: piece.assigned_to,
    createdAt: piece.created_at,
    updatedAt: piece.updated_at,
    scheduledDate: piece.scheduled_date,
    publishedDate: piece.published_date,
    dueDate: piece.due_date,
    aiGenerated: piece.ai_generated,
    performanceMetrics: piece.performance_metrics,
    tags: piece.tags,
    notes: piece.notes,
  }))
}

/**
 * Create a new content piece
 */
export async function createContentPiece(
  input: CreateContentInput
): Promise<{ success: boolean; piece?: ContentPiece; error?: string }> {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('content_pieces')
    .insert({
      title: input.title,
      content_type: input.contentType,
      format: input.format,
      status: input.status,
      purpose: input.purpose,
      channel: input.channel,
      target_audience: input.targetAudience,
      target_id: input.targetId,
      description: input.description,
      created_by: input.createdBy,
      assigned_to: input.assignedTo,
      scheduled_date: input.scheduledDate,
      published_date: input.publishedDate,
      due_date: input.dueDate,
      ai_generated: input.aiGenerated,
      performance_metrics: input.performanceMetrics,
      tags: input.tags,
      notes: input.notes,
    })
    .select()
    .single()

  if (error || !data) {
    console.error('Error creating content piece:', error)
    return { success: false, error: error?.message }
  }

  await logAnalyticsEvent({
    eventKey: 'content.piece.created',
    payload: { pieceId: data.id, format: input.format },
  })

  revalidatePath(CONTENT_PATH)

  return { success: true, piece: data as unknown as ContentPiece }
}

// ============================================================================
// AD CAMPAIGNS
// ============================================================================

/**
 * Get all ad campaigns
 */
export async function getAdCampaigns(): Promise<AdCampaign[]> {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('ad_campaigns')
    .select('*')
    .order('created_at', { ascending: false })

  if (error) {
    console.error('Error fetching ad campaigns:', error)
    return []
  }

  return (data || []).map((campaign: any) => ({
    id: campaign.id,
    name: campaign.name,
    platform: campaign.platform,
    objective: campaign.objective,
    status: campaign.status,
    budget: campaign.budget,
    spent: campaign.spent,
    startDate: campaign.start_date,
    endDate: campaign.end_date,
    targetAudience: campaign.target_audience,
    createdBy: campaign.created_by,
    createdAt: campaign.created_at,
    updatedAt: campaign.updated_at,
    metrics: campaign.metrics,
    contentIds: campaign.content_ids,
    notes: campaign.notes,
  }))
}

/**
 * Create a new ad campaign
 */
export async function createAdCampaign(
  input: CreateAdCampaignInput
): Promise<{ success: boolean; campaign?: AdCampaign; error?: string }> {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('ad_campaigns')
    .insert({
      name: input.name,
      platform: input.platform,
      objective: input.objective,
      status: input.status,
      budget: input.budget,
      spent: input.spent,
      start_date: input.startDate,
      end_date: input.endDate,
      target_audience: input.targetAudience,
      created_by: input.createdBy,
      metrics: input.metrics,
      content_ids: input.contentIds,
      notes: input.notes,
    })
    .select()
    .single()

  if (error || !data) {
    console.error('Error creating ad campaign:', error)
    return { success: false, error: error?.message }
  }

  await logAnalyticsEvent({
    eventKey: 'content.campaign.created',
    payload: { campaignId: data.id, platform: input.platform },
  })

  revalidatePath(CONTENT_PATH)

  return { success: true, campaign: data as unknown as AdCampaign }
}

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

/**
 * Get content snapshot (all state)
 */
export async function getContentSnapshot() {
  const [items, pieces, campaigns, metrics] = await Promise.all([
    getContentItems(),
    getContentPieces(),
    getAdCampaigns(),
    getMetrics(),
  ])

  return {
    items,
    pieces,
    campaigns,
    metrics,
  }
}

/**
 * Get content suggestions (placeholder for AI recommendations)
 */
export async function getSuggestions() {
  // TODO: Implement AI-based content suggestions
  return []
}

/**
 * Insert content into email
 */
export async function insertContentIntoEmail(contentId: string) {
  try {
    const { user, organizationId } = await requireAuth({ redirectTo: '/login?next=/content' })

    const result = await logAnalyticsEvent({
      eventKey: 'content.email.inserted',
      payload: {
        contentId,
        organizationId,
        userId: user.id,
      },
    })

    if (!result.ok) {
      throw new Error(result.error ?? 'analytics-event-failed')
    }

    return { ok: true, message: 'Queued content for Gmail compose workspace.' } as const
  } catch (error) {
    console.error('content:email-insert-failed', error)
    return { ok: false, error: (error as Error).message ?? 'email-insert-failed' } as const
  }
}
