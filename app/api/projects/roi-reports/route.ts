import { NextResponse } from 'next/server'

import {
  actionCreateClientRoiNarrative,
  actionShareClientRoiNarrative,
} from '@/core/projects/actions'

export async function POST(request: Request) {
  const body = await request.json().catch(() => null)

  const {
    clientId,
    periodStart,
    periodEnd,
    roiPercent,
    arrImpact,
    highlights,
    surveyScore,
    sentiment,
    shareTargets,
  } = (body ?? {}) as {
    clientId?: string
    periodStart?: string
    periodEnd?: string
    roiPercent?: number
    arrImpact?: number
    highlights?: string[]
    surveyScore?: number
    sentiment?: 'Promoter' | 'Passive' | 'Detractor'
    shareTargets?: string[]
  }

  if (!clientId || typeof roiPercent !== 'number' || typeof arrImpact !== 'number') {
    return NextResponse.json(
      { ok: false, error: 'clientId, roiPercent, and arrImpact are required' },
      { status: 400 },
    )
  }

  const result = await actionCreateClientRoiNarrative({
    clientId,
    periodStart: periodStart ?? new Date().toISOString().split('T')[0],
    periodEnd: periodEnd ?? new Date().toISOString().split('T')[0],
    roiPercent,
    arrImpact,
    highlights: highlights ?? [],
    surveyScore,
    sentiment,
    shareTargets,
  })

  return NextResponse.json(result, { status: result.ok ? 200 : 500 })
}

export async function PATCH(request: Request) {
  const body = await request.json().catch(() => null)

  const { id, shareTargets } = (body ?? {}) as {
    id?: string
    shareTargets?: string[]
  }

  if (!id || !Array.isArray(shareTargets)) {
    return NextResponse.json(
      { ok: false, error: 'id and shareTargets are required' },
      { status: 400 },
    )
  }

  const result = await actionShareClientRoiNarrative(id, shareTargets)
  return NextResponse.json(result, { status: result.ok ? 200 : 500 })
}
