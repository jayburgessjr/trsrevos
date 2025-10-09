import type { DeliverableResponse } from '@/lib/deliverables/types'
import type { DeliverableRecord } from '@/lib/repos/deliverable-repository'

export const serializeDeliverable = (record: DeliverableRecord): DeliverableResponse => ({
  id: record.id,
  accountId: record.accountId,
  type: record.type,
  title: record.title,
  status: record.status,
  owner: record.owner,
  dueDate: record.dueDate ? record.dueDate.toISOString() : null,
  lastReviewAt: record.lastReviewAt ? record.lastReviewAt.toISOString() : null,
  exportLink: record.exportLink,
  createdAt: record.createdAt.toISOString(),
  updatedAt: record.updatedAt.toISOString()
})
