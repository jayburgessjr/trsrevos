import { NextRequest, NextResponse } from 'next/server'

import { getGmailClient, persistOAuthCredentials, requireGmailContext } from '@/lib/gmail/server'
import { createRawEmail } from '@/lib/gmail/utils'
import { mapGmailError } from '@/lib/gmail/errors'

type SendPayload = {
  to: string | string[]
  subject: string
  body: string
  cc?: string | string[]
  bcc?: string | string[]
  replyTo?: string
}

export async function POST(request: NextRequest) {
  let payload: SendPayload

  try {
    payload = (await request.json()) as SendPayload
  } catch (error) {
    console.error('Failed to parse send payload', error)
    return NextResponse.json({ error: 'invalid_payload' }, { status: 400 })
  }

  if (!payload.to || !payload.subject || !payload.body) {
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
    })

    const response = await gmail.users.messages.send({
      userId: 'me',
      requestBody: { raw },
    })

    await persistOAuthCredentials(supabase, user.id, integration, oauthClient)

    return NextResponse.json({
      id: response.data.id ?? null,
      threadId: response.data.threadId ?? null,
      labelIds: response.data.labelIds ?? [],
    })
  } catch (error) {
    return mapGmailError(error, 'Failed to send Gmail message', 'unable_to_send_message')
  }
}
