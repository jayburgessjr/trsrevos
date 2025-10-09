'use server'

import { revalidatePath } from 'next/cache'
import { computeDailyPlan, scheduleFocusBlocks, getFocusBlocks } from './service'
import { Plan } from './types'
import { emit } from '@/core/events/emit'

const planStore = new Map<string, Plan>()

function storeKey(userId: string, day: string) {
  return `${userId}:${day}`
}

export async function getTodayPlan(userId: string, date: Date) {
  const day = date.toISOString().slice(0, 10)
  return planStore.get(storeKey(userId, day)) ?? null
}

export async function computeTodayPlanAction(formData: FormData) {
  const userId = (formData.get('userId') as string) || 'revops-lead'
  const plan = await computeDailyPlan(userId, new Date())
  planStore.set(storeKey(userId, plan.date), plan)
  emit({ entity: 'plan', action: 'computed', meta: { userId, date: plan.date } })
  revalidatePath('/')
  return plan
}

export async function lockTodayPlanAction(formData: FormData) {
  const userId = (formData.get('userId') as string) || 'revops-lead'
  const today = new Date()
  const day = today.toISOString().slice(0, 10)
  const existing = planStore.get(storeKey(userId, day))
  const plan: Plan = existing
    ? { ...existing, locked: true, generatedAt: new Date().toISOString() }
    : { ...(await computeDailyPlan(userId, today)), locked: true }
  planStore.set(storeKey(userId, day), plan)

  // Schedule focus blocks when plan is locked
  scheduleFocusBlocks(userId, today)
  emit({ entity: 'plan', action: 'locked', meta: { userId, date: day } })

  revalidatePath('/')
  return plan
}

export async function startFocusAction(formData: FormData) {
  const userId = (formData.get('userId') as string) || 'revops-lead'
  const today = new Date()
  const blocks = getFocusBlocks(userId, today)

  emit({ entity: 'focus', action: 'started', meta: { userId, timestamp: today.toISOString() } })

  revalidatePath('/')
  return { started: true, blocks }
}
