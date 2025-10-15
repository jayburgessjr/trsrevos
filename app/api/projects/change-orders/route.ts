import { NextResponse } from 'next/server'

import {
  actionCreateChangeOrder,
  actionUpdateChangeOrderStatus,
} from '@/core/projects/actions'

export async function POST(request: Request) {
  const body = await request.json().catch(() => null)

  const {
    projectId,
    title,
    description,
    value,
    invoiceId,
    opportunityId,
    status,
    ownerId,
  } = (body ?? {}) as {
    projectId?: string
    title?: string
    description?: string
    value?: number
    invoiceId?: string
    opportunityId?: string
    status?: 'Draft' | 'Submitted' | 'Approved' | 'Rejected'
    ownerId?: string
  }

  if (!projectId || !title || typeof value !== 'number') {
    return NextResponse.json(
      { ok: false, error: 'projectId, title, and value are required' },
      { status: 400 },
    )
  }

  const result = await actionCreateChangeOrder({
    projectId,
    title,
    description,
    value,
    invoiceId,
    opportunityId,
    status,
    ownerId,
  })

  return NextResponse.json(result, { status: result.ok ? 200 : 500 })
}

export async function PATCH(request: Request) {
  const body = await request.json().catch(() => null)

  const { id, status } = (body ?? {}) as {
    id?: string
    status?: 'Draft' | 'Submitted' | 'Approved' | 'Rejected'
  }

  if (!id || !status) {
    return NextResponse.json(
      { ok: false, error: 'id and status are required' },
      { status: 400 },
    )
  }

  const result = await actionUpdateChangeOrderStatus(id, status)
  return NextResponse.json(result, { status: result.ok ? 200 : 500 })
}
