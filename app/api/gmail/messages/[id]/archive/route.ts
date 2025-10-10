import { NextRequest, NextResponse } from 'next/server'

import { getGmailClient, persistOAuthCredentials, requireGmailContext } from '@/lib/gmail/server'
import { mapGmailError } from '@/lib/gmail/errors'

type RouteContext = {
  params: { id: string }
}

export async function POST(_request: NextRequest, context: RouteContext) {
  const id = context.params.id

  if (!id) {
    return NextResponse.json({ error: 'invalid_message_id' }, { status: 400 })
  }

  try {
    const { oauthClient, supabase, user, integration } = await requireGmailContext()
    const gmail = getGmailClient(oauthClient)

    await gmail.users.messages.modify({
      userId: 'me',
      id,
      requestBody: {
        removeLabelIds: ['INBOX'],
      },
    })

    await persistOAuthCredentials(supabase, user.id, integration, oauthClient)

    return NextResponse.json({ status: 'archived' })
  } catch (error) {
    if ((error as { code?: number }).code === 404) {
      return NextResponse.json({ error: 'not_found' }, { status: 404 })
    }
    return mapGmailError(error, 'Failed to archive Gmail message', 'unable_to_archive_message')
  }
}
