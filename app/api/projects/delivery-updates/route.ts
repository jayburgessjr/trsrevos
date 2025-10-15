import { NextResponse } from 'next/server'

import {
  actionCreateDeliveryUpdate,
  actionUpdateDeliveryApproval,
} from '@/core/projects/actions'

export async function POST(request: Request) {
  const body = await request.json().catch(() => null)

  const {
    projectId,
    status,
    blockers,
    decisions,
    reminderCadence,
    nextReviewAt,
    requiresApproval,
    approverIds,
    authorId,
  } = (body ?? {}) as {
    projectId?: string
    status?: string
    blockers?: string
    decisions?: string
    reminderCadence?: 'Daily' | 'Weekly' | 'Biweekly' | 'Monthly'
    nextReviewAt?: string
    requiresApproval?: boolean
    approverIds?: string[]
    authorId?: string
  }

  if (!projectId || !status) {
    return NextResponse.json(
      { ok: false, error: 'projectId and status are required' },
      { status: 400 },
    )
  }

  const result = await actionCreateDeliveryUpdate({
    projectId,
    status,
    blockers,
    decisions,
    reminderCadence,
    nextReviewAt,
    requiresApproval,
    approverIds,
    authorId,
  })

  return NextResponse.json(result, { status: result.ok ? 200 : 500 })
}

export async function PATCH(request: Request) {
  const body = await request.json().catch(() => null)

  const { id, approverId, approvalStatus } = (body ?? {}) as {
    id?: string
    approverId?: string
    approvalStatus?: 'Approved' | 'Rejected'
  }

  if (!id || !approverId || !approvalStatus) {
    return NextResponse.json(
      { ok: false, error: 'id, approverId, and approvalStatus are required' },
      { status: 400 },
    )
  }

  const result = await actionUpdateDeliveryApproval(id, approverId, approvalStatus)
  return NextResponse.json(result, { status: result.ok ? 200 : 500 })
}
