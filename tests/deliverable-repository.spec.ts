import { describe, expect, it } from 'vitest'

import { DeliverableRepository } from '@/lib/repos/deliverable-repository'
import { createInMemoryPrisma } from './utils/in-memory-prisma'

describe('DeliverableRepository', () => {
  it('creates and retrieves deliverables for an account', async () => {
    const memory = createInMemoryPrisma()
    const accountId = memory.addAccount({ name: 'Demo Enterprise', slug: 'demo' })

    const repository = new DeliverableRepository(memory.prisma.deliverable as unknown as any)

    await repository.create({
      accountId,
      type: 'CLARITY_AUDIT',
      title: 'Clarity Audit',
      status: 'IN_PROGRESS',
      owner: 'Alex Rivera',
      dueDate: new Date('2024-10-15T00:00:00.000Z'),
      lastReviewAt: new Date('2024-09-27T00:00:00.000Z'),
      exportLink: 'https://drive.google.com/demo-clarity-audit'
    })

    const results = await repository.listByAccount(accountId)
    expect(results).toHaveLength(1)
    expect(results[0]?.title).toBe('Clarity Audit')
    expect(results[0]?.owner).toBe('Alex Rivera')
    expect(results[0]?.status).toBe('IN_PROGRESS')
  })
})
