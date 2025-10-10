import { NextRequest, NextResponse } from 'next/server'

import { getGmailClient, persistOAuthCredentials, requireGmailContext } from '@/lib/gmail/server'
import { toMessageDetail } from '@/lib/gmail/messages'
import { mapGmailError } from '@/lib/gmail/errors'

type RouteContext = {
  params: { id: string }
}

function invalidIdResponse() {
  return NextResponse.json({ error: 'invalid_message_id' }, { status: 400 })
}

export async function GET(_request: NextRequest, context: RouteContext) {
  const id = context.params.id

  if (!id) {
    return invalidIdResponse()
  }

  try {
    const { oauthClient, supabase, user, integration } = await requireGmailContext()
    const gmail = getGmailClient(oauthClient)
    const response = await gmail.users.messages.get({
      userId: 'me',
      id,
      format: 'full',
    })

    await persistOAuthCredentials(supabase, user.id, integration, oauthClient)

    return NextResponse.json({ message: toMessageDetail(response.data) })
  } catch (error) {
    if ((error as { code?: number }).code === 404) {
      return NextResponse.json({ error: 'not_found' }, { status: 404 })
    }
    return mapGmailError(error, 'Failed to fetch Gmail message', 'unable_to_fetch_message')
  }
}

export async function DELETE(_request: NextRequest, context: RouteContext) {
  const id = context.params.id

  if (!id) {
    return invalidIdResponse()
  }

  try {
    const { oauthClient, supabase, user, integration } = await requireGmailContext()
    const gmail = getGmailClient(oauthClient)
    await gmail.users.messages.trash({ userId: 'me', id })
    await persistOAuthCredentials(supabase, user.id, integration, oauthClient)

    return NextResponse.json({ status: 'trashed' })
  } catch (error) {
    if ((error as { code?: number }).code === 404) {
      return NextResponse.json({ error: 'not_found' }, { status: 404 })
    }
    return mapGmailError(error, 'Failed to trash Gmail message', 'unable_to_trash_message')
  }
}
