'use server'

import { revalidatePath } from 'next/cache'
import { ShareSpace } from './types'

const shares = new Map<string, ShareSpace>()

export async function getShareById(id: string) {
  return shares.get(id) ?? null
}

export async function createShareAction(formData: FormData) {
  const title = (formData.get('title') as string) || 'Shared workspace'
  const watermark = formData.get('watermark') === 'true'
  const id = (typeof crypto !== 'undefined' && 'randomUUID' in crypto ? crypto.randomUUID() : Math.random().toString(36).slice(2))
  const share: ShareSpace = {
    id,
    title,
    summary: 'Preview bundle will load from future data service.',
    watermark,
    createdAt: new Date().toISOString(),
    createdBy: 'revops-lead',
  }
  shares.set(id, share)
  revalidatePath(`/share/${id}`)
  return share
}

export async function revokeShareAction(formData: FormData) {
  const id = formData.get('id') as string
  if (!id) return false
  const existed = shares.delete(id)
  if (existed) {
    revalidatePath(`/share/${id}`)
  }
  return existed
}
