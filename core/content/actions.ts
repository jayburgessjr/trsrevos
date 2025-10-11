'use server'

import { revalidatePath } from 'next/cache'

import {
  computeMetrics,
  createItem as createItemInStore,
  createVariant as createVariantInStore,
  getContentState,
  markVariantStatus,
  recordTouch as recordTouchInStore,
  saveBrief as saveBriefInStore,
  scheduleDistribution as scheduleDistributionInStore,
  updateItem as updateItemInStore,
  updateStatus as updateStatusInStore,
} from './store'
import { nextBestContent } from './recommender'
import { ContentBrief, ContentStage, ContentStatus, TouchAction } from './types'
import { requireAuth } from '@/lib/server/auth'
import { logAnalyticsEvent } from '@/core/analytics/actions'

const CONTENT_PATH = '/content'

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
}) {
  const item = createItemInStore(input)
  revalidatePath(CONTENT_PATH)
  return item
}

export async function saveBrief(id: string, brief: ContentBrief) {
  const item = saveBriefInStore(id, brief)
  revalidatePath(CONTENT_PATH)
  return item
}

export async function updateStatus(id: string, status: ContentStatus) {
  const item = updateStatusInStore(id, status)
  revalidatePath(CONTENT_PATH)
  return item
}

export async function updateItem(id: string, patch: Partial<{ ownerId: string; sla: string }>) {
  const item = updateItemInStore(id, patch)
  revalidatePath(CONTENT_PATH)
  return item
}

export async function createVariant(input: {
  contentId: string
  kind: string
  headline: string
  cta: string
  group?: 'A' | 'B'
}) {
  const variant = createVariantInStore(input)
  revalidatePath(CONTENT_PATH)
  return variant
}

export async function markExperimentOutcome(variantId: string, status: string) {
  const variant = markVariantStatus(variantId, status)
  revalidatePath(CONTENT_PATH)
  return variant
}

export async function recordTouch(input: {
  id?: string
  contentId: string
  opportunityId: string
  actor: string
  action: TouchAction
}) {
  const touch = recordTouchInStore(input)
  revalidatePath(CONTENT_PATH)
  return touch
}

export async function scheduleDistribution(input: {
  id?: string
  contentId: string
  channel: string
  whenISO?: string
  utm?: string
}) {
  const distribution = scheduleDistributionInStore({
    id: input.id,
    contentId: input.contentId,
    channel: input.channel,
    scheduledAt: input.whenISO ?? null,
    utm: input.utm ?? null,
  })
  revalidatePath(CONTENT_PATH)
  return distribution
}

export async function getMetrics() {
  return computeMetrics()
}

export async function getContentSnapshot() {
  return getContentState()
}

export async function getSuggestions() {
  return nextBestContent()
}

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
