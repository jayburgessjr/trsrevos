import { NextResponse } from 'next/server'

import { auth } from '@/auth'
import { deliverableRepository } from '@/lib/repos/deliverable-repository'
import { deliverableResponseSchema, deliverableUpdateSchema } from '@/lib/deliverables/types'
import { serializeDeliverable } from '@/lib/deliverables/serialize'

type RouteContext = {
  params: { id: string }
}

export async function GET(_request: Request, context: RouteContext) {
  const session = await auth()
  if (!session?.user) {
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 })
  }

  const record = await deliverableRepository.findById(context.params.id)
  if (!record) {
    return NextResponse.json({ message: 'Deliverable not found' }, { status: 404 })
  }

  return NextResponse.json(deliverableResponseSchema.parse(serializeDeliverable(record)))
}

export async function PATCH(request: Request, context: RouteContext) {
  const session = await auth()
  if (!session?.user) {
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 })
  }

  const body = await request.json()
  const payload = deliverableUpdateSchema.parse(body)

  const record = await deliverableRepository.update(context.params.id, payload)
  return NextResponse.json(deliverableResponseSchema.parse(serializeDeliverable(record)))
}
