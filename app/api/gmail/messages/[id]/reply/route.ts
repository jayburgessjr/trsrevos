import { NextRequest, NextResponse } from 'next/server'

import { getGmailClient, persistOAuthCredentials, requireGmailContext } from '@/lib/gmail/server'
import { createRawEmail } from '@/lib/gmail/utils'
import { mapGmailError } from '@/lib/gmail/errors'

export const dynamic = 'force-dynamic'

type RouteContext = {
  params: { id: string }
}

type ReplyPayload = {
  to: string | string[]
  subject: string
  body: string
  cc?: string | string[]
  bcc?: string | string[]
  threadId?: string
  inReplyTo?: string
  references?: string
  replyTo?: string
}

export async function POST(request: NextRequest, context: RouteContext) {
  const id = context.params.id

  if (!id) {
    return NextResponse.json({ error: 'invalid_message_id' }, { status: 400 })
  }

  let payload: ReplyPayload

  try {
    payload = (await request.json()) as ReplyPayload
  } catch (error) {
    console.error('Failed to parse reply payload', error)
    return NextResponse.json({ error: 'invalid_payload' }, { status: 400 })
  }

  if (!payload.body || !payload.subject || !payload.to) {
    return NextResponse.json({ error: 'missing_fields' }, { status: 400 })
  }

  try {
    const { oauthClient, supabase, user, integration } = await requireGmailContext()
    const gmail = getGmailClient(oauthClient)

    const raw = createRawEmail({
      to: payload.to,
      cc: payload.cc,
      bcc: payload.bcc,
      subject: payload.subject,
      body: payload.body,
      from: user.email ?? undefined,
      replyTo: payload.replyTo ?? undefined,
      inReplyTo: payload.inReplyTo ?? undefined,
      references: payload.references ?? undefined,
    })

    const response = await gmail.users.messages.send({
      userId: 'me',
      requestBody: {
        raw,
        threadId: payload.threadId ?? undefined,
      },
    })

    await persistOAuthCredentials(supabase, user.id, integration, oauthClient)

    return NextResponse.json({
      id: response.data.id ?? null,
      threadId: response.data.threadId ?? null,
      labelIds: response.data.labelIds ?? [],
    })
  } catch (error) {
    return mapGmailError(error, 'Failed to send Gmail reply', 'unable_to_send_reply')
  }
}
