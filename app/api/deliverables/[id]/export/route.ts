import { NextResponse } from 'next/server'
import { z } from 'zod'

import { auth } from '@/auth'
import { deliverableRepository } from '@/lib/repos/deliverable-repository'

const exportResponseSchema = z.object({
  artifactUrl: z.string().url()
})

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

  const artifactUrl = `https://drive.google.com/export/deliverables/${record.id}?ts=${Date.now()}`

  await deliverableRepository.update(record.id, {
    exportLink: artifactUrl
  })

  return NextResponse.json(exportResponseSchema.parse({ artifactUrl }))
}
