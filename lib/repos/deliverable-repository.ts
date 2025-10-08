import type { DeliverableStatus, DeliverableType, PrismaClient } from '@prisma/client'
import { z } from 'zod'

import { prisma } from '@/lib/prisma'

export type DeliverableRecord = {
  id: string
  accountId: string
  type: DeliverableType
  title: string
  status: DeliverableStatus
  owner: string
  dueDate: Date | null
  lastReviewAt: Date | null
  exportLink: string | null
  createdAt: Date
  updatedAt: Date
}

type DeliverableModel = Pick<
  PrismaClient['deliverable'],
  'create' | 'findMany' | 'findUnique' | 'update'
>

const updatePayloadSchema = z.object({
  title: z.string().min(1).optional(),
  status: z.enum(['PLANNED', 'IN_PROGRESS', 'COMPLETE', 'BLOCKED']).optional(),
  owner: z.string().min(1).optional(),
  dueDate: z.coerce.date().nullable().optional(),
  lastReviewAt: z.coerce.date().nullable().optional(),
  exportLink: z.string().url().nullable().optional()
})

export class DeliverableRepository {
  constructor(private readonly deliverables: DeliverableModel) {}

  async create(input: {
    id?: string
    accountId: string
    type: DeliverableType
    title: string
    status: DeliverableStatus
    owner: string
    dueDate?: Date | null
    lastReviewAt?: Date | null
    exportLink?: string | null
  }): Promise<DeliverableRecord> {
    const created = await this.deliverables.create({
      data: {
        id: input.id,
        accountId: input.accountId,
        type: input.type,
        title: input.title,
        status: input.status,
        owner: input.owner,
        dueDate: input.dueDate ?? null,
        lastReviewAt: input.lastReviewAt ?? null,
        exportLink: input.exportLink ?? null
      }
    })

    return created
  }

  async findById(id: string): Promise<DeliverableRecord | null> {
    const record = await this.deliverables.findUnique({
      where: { id }
    })

    return record
  }

  async listByAccount(accountId: string): Promise<DeliverableRecord[]> {
    const records = await this.deliverables.findMany({
      where: { accountId },
      orderBy: [
        { status: 'asc' },
        { dueDate: 'asc' }
      ]
    })

    return records
  }

  async update(id: string, data: Partial<Omit<DeliverableRecord, 'id' | 'createdAt' | 'updatedAt' | 'accountId'>>): Promise<DeliverableRecord> {
    const payload = updatePayloadSchema.parse(data)

    const updated = await this.deliverables.update({
      where: { id },
      data: {
        title: payload.title,
        status: payload.status,
        owner: payload.owner,
        dueDate: payload.dueDate ?? undefined,
        lastReviewAt: payload.lastReviewAt ?? undefined,
        exportLink: payload.exportLink ?? undefined
      }
    })

    return updated
  }
}

export const deliverableRepository = new DeliverableRepository(prisma.deliverable)
