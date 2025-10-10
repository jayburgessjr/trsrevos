import { NextRequest, NextResponse } from 'next/server'
import type { gmail_v1 } from 'googleapis'

import { getGmailClient, persistOAuthCredentials, requireGmailContext } from '@/lib/gmail/server'
import { toMessageSummary } from '@/lib/gmail/messages'
import { mapGmailError } from '@/lib/gmail/errors'

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  try {
    const { oauthClient, supabase, user, integration } = await requireGmailContext()
    const gmail = getGmailClient(oauthClient)
    const searchParams = request.nextUrl.searchParams

    const maxResultsParam = searchParams.get('maxResults')
    const maxResults = maxResultsParam ? Math.min(Number(maxResultsParam), 50) : 20
    const pageToken = searchParams.get('pageToken') ?? undefined
    const q = searchParams.get('q') ?? undefined
    const labelIds = searchParams.getAll('labelIds').filter(Boolean)

    const listResponse = await gmail.users.messages.list({
      userId: 'me',
      maxResults,
      pageToken,
      q,
      labelIds: labelIds.length ? labelIds : undefined,
    })

    const messageResults = await Promise.all(
      (listResponse.data.messages ?? []).map(async (message: gmail_v1.Schema$Message) => {
        if (!message.id) {
          return null
        }
        const detail = await gmail.users.messages.get({
          userId: 'me',
          id: message.id,
          format: 'metadata',
          metadataHeaders: ['From', 'To', 'Subject', 'Date'],
        })

        return toMessageSummary(detail.data)
      }),
    )

    await persistOAuthCredentials(supabase, user.id, integration, oauthClient)

    const messages = messageResults.filter((entry): entry is ReturnType<typeof toMessageSummary> => Boolean(entry))

    return NextResponse.json({
      messages,
      nextPageToken: listResponse.data.nextPageToken ?? null,
      resultSizeEstimate: listResponse.data.resultSizeEstimate ?? null,
    })
  } catch (error) {
    return mapGmailError(error, 'Failed to list Gmail messages', 'unable_to_list_messages')
  }
}
