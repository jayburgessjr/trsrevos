import { NextResponse } from 'next/server'
import { z } from 'zod'

import { trsScoreRepository } from '@/lib/repos/trs-score-repository'

const paramsSchema = z.object({
  accountId: z.string().min(1)
})

const scoreResponseSchema = z.object({
  accountId: z.string(),
  computedAt: z.string().datetime(),
  score: z.number().min(0).max(100),
  band: z.enum(['RED', 'YELLOW', 'GREEN']),
  drivers: z.array(
    z.object({
      name: z.string(),
      delta: z.number()
    })
  )
})

export async function GET(
  _request: Request,
  context: { params: { accountId: string } }
) {
  const { accountId } = paramsSchema.parse(context.params)

  const snapshot = await trsScoreRepository.latestByAccountSlug(accountId)

  if (!snapshot) {
    return NextResponse.json(
      { message: `No TRS Score snapshot found for account '${accountId}'.` },
      { status: 404 }
    )
  }

  const payload = scoreResponseSchema.parse({
    accountId: snapshot.accountSlug,
    computedAt: snapshot.computedAt.toISOString(),
    score: snapshot.score,
    band: snapshot.band,
    drivers: snapshot.drivers
  })

  return NextResponse.json(payload)
}
