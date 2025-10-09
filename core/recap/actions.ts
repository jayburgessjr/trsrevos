'use server'

import { revalidatePath } from 'next/cache'
import { generateRecap, Recap } from './service'
import { emit } from '@/core/events/emit'

const recapStore = new Map<string, Recap>()

function storeKey(userId: string, day: string) {
  return `${userId}:${day}`
}

export async function generateRecapAction(formData: FormData) {
  const userId = (formData.get('userId') as string) || 'revops-lead'
  const today = new Date()
  const day = today.toISOString().slice(0, 10)

  const recap = await generateRecap(userId, today)
  recapStore.set(storeKey(userId, day), recap)

  emit({ entity: 'recap', action: 'generated', meta: { userId, date: day } })

  revalidatePath('/')
  return recap
}

export async function getTodayRecap(userId: string, date: Date): Promise<Recap | null> {
  const day = date.toISOString().slice(0, 10)
  return recapStore.get(storeKey(userId, day)) ?? null
}
