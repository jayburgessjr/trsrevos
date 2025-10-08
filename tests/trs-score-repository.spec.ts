import { describe, expect, it } from 'vitest'

import { TrsScoreRepository } from '@/lib/repos/trs-score-repository'
import { createInMemoryPrisma } from './utils/in-memory-prisma'

describe('TrsScoreRepository', () => {
  it('records and returns the latest snapshot round-trip', async () => {
    const memory = createInMemoryPrisma()
    const accountId = memory.addAccount({ name: 'Demo Enterprise', slug: 'demo' })

    const repository = new TrsScoreRepository({
      trsScore: memory.prisma.trsScore as unknown as any,
      trsAccount: memory.prisma.trsAccount as unknown as any
    })

    await repository.recordSnapshot({
      accountId,
      inputs: {
        cac: 3.2,
        nrr: 120,
        churn: 4.2,
        payback: 9,
        margin: 70,
        forecastMape: 11,
        velocity: 1.5,
        incidents: 0.6
      },
      computedAt: new Date('2024-10-01T12:00:00.000Z')
    })

    const latest = await repository.latestByAccountSlug('demo')

    expect(latest).not.toBeNull()
    expect(latest?.accountId).toBe(accountId)
    expect(latest?.band).toBe('GREEN')
    expect(latest?.drivers).toHaveLength(8)
    expect(latest?.metrics.cac).toBeCloseTo(3.2)

    await repository.recordSnapshot({
      accountId,
      inputs: {
        cac: 3.8,
        nrr: 112,
        churn: 5.5,
        payback: 10,
        margin: 62,
        forecastMape: 14,
        velocity: 1.2,
        incidents: 1.4
      },
      computedAt: new Date('2024-11-01T12:00:00.000Z')
    })

    const newest = await repository.latestByAccountSlug('demo')
    expect(newest).not.toBeNull()
    expect(newest?.computedAt.toISOString()).toBe('2024-11-01T12:00:00.000Z')
    expect(newest?.band).toBe('YELLOW')
  })
})
