import type { Prisma, PrismaClient, TrsBand } from '@prisma/client'
import { z } from 'zod'

import { prisma } from '@/lib/prisma'
import { computeTrsScore, type TrsScoreInputs, type TrsScoreResult } from '@/lib/trs/score'

export type TrsScoreSnapshot = {
  id: string
  accountId: string
  accountSlug: string
  computedAt: Date
  score: number
  band: TrsBand
  drivers: TrsScoreResult['drivers']
  metrics: TrsScoreInputs
}

const driversSchema = z.array(
  z.object({
    name: z.string(),
    delta: z.number()
  })
)

type TrsScoreModel = Pick<PrismaClient['trsScore'], 'create' | 'findFirst'>
type TrsAccountModel = Pick<PrismaClient['trsAccount'], 'findUnique'>

export class TrsScoreRepository {
  constructor(
    private readonly models: {
      trsScore: TrsScoreModel
      trsAccount: TrsAccountModel
    }
  ) {}

  async recordSnapshot(params: {
    accountId: string
    inputs: TrsScoreInputs
    computedAt?: Date
    id?: string
  }): Promise<TrsScoreSnapshot> {
    const { accountId, inputs, computedAt = new Date(), id } = params
    const computed = computeTrsScore(inputs)

    const created = await this.models.trsScore.create({
      data: {
        id,
        accountId,
        computedAt,
        score: computed.score,
        band: computed.band as TrsBand,
        drivers: computed.drivers as unknown as Prisma.JsonArray,
        cac: inputs.cac,
        nrr: inputs.nrr,
        churn: inputs.churn,
        payback: inputs.payback,
        margin: inputs.margin,
        forecastMape: inputs.forecastMape,
        velocity: inputs.velocity,
        incidents: inputs.incidents
      }
    })

    const account = await this.models.trsAccount.findUnique({
      where: { id: accountId },
      select: { slug: true }
    })

    return {
      id: created.id,
      accountId: created.accountId,
      accountSlug: account?.slug ?? '',
      computedAt: created.computedAt,
      score: created.score,
      band: created.band,
      drivers: computed.drivers,
      metrics: inputs
    }
  }

  async latestByAccountSlug(slug: string): Promise<TrsScoreSnapshot | null> {
    const account = await this.models.trsAccount.findUnique({
      where: { slug }
    })

    if (!account) {
      return null
    }

    const latest = await this.models.trsScore.findFirst({
      where: { accountId: account.id },
      orderBy: { computedAt: 'desc' as const }
    })

    if (!latest) {
      return null
    }

    const drivers = driversSchema.parse(latest.drivers)

    return {
      id: latest.id,
      accountId: latest.accountId,
      accountSlug: slug,
      computedAt: latest.computedAt,
      score: latest.score,
      band: latest.band,
      drivers,
      metrics: {
        cac: latest.cac,
        nrr: latest.nrr,
        churn: latest.churn,
        payback: latest.payback,
        margin: latest.margin,
        forecastMape: latest.forecastMape,
        velocity: latest.velocity,
        incidents: latest.incidents
      }
    }
  }
}

export const trsScoreRepository = new TrsScoreRepository({
  trsScore: prisma.trsScore,
  trsAccount: prisma.trsAccount
})
