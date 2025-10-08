import { NextResponse } from 'next/server'
import { z } from 'zod'

import { auth } from '@/auth'
import { deliverableRepository } from '@/lib/repos/deliverable-repository'
import { accountRepository } from '@/lib/repos/account-repository'
import {
  deliverableCreateSchema,
  deliverableStatusSchema,
  deliverableTypeSchema,
  deliverableResponseSchema
} from '@/lib/deliverables/types'
import { serializeDeliverable } from '@/lib/deliverables/serialize'

const listParamsSchema = z.object({
  account: z.string().default('demo')
})

const deliverableListResponseSchema = z.object({
  deliverables: z.array(deliverableResponseSchema)
})

export async function GET(request: Request) {
  const session = await auth()
  if (!session?.user) {
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 })
  }

  const { searchParams } = new URL(request.url)
  const params = listParamsSchema.parse(Object.fromEntries(searchParams))

  const account = await accountRepository.findBySlug(params.account)
  if (!account) {
    return NextResponse.json({ message: 'Account not found' }, { status: 404 })
  }

  const deliverables = await deliverableRepository.listByAccount(account.id)
  const payload = deliverableListResponseSchema.parse({
    deliverables: deliverables.map((record) => serializeDeliverable(record))
  })

  return NextResponse.json(payload)
}

export async function POST(request: Request) {
  const session = await auth()
  if (!session?.user) {
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 })
  }

  const body = await request.json()
  const input = deliverableCreateSchema.parse(body)

  const account = await accountRepository.findBySlug(input.accountSlug)
  if (!account) {
    return NextResponse.json({ message: 'Account not found' }, { status: 404 })
  }

  const record = await deliverableRepository.create({
    accountId: account.id,
    type: input.type,
    title: input.title,
    status: input.status,
    owner: input.owner,
    dueDate: input.dueDate ?? null
  })

  const payload = deliverableResponseSchema.parse(serializeDeliverable(record))

  return NextResponse.json(payload, { status: 201 })
}
