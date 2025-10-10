import type { gmail_v1 } from 'googleapis'

type Header = gmail_v1.Schema$MessagePartHeader

type MessagePart = gmail_v1.Schema$MessagePart

type Message = gmail_v1.Schema$Message

export type GmailMessageSummary = {
  id: string
  threadId: string
  labelIds: string[]
  snippet: string
  internalDate: string | null
  subject: string | null
  from: string | null
  to: string | null
}

export type GmailMessageDetail = GmailMessageSummary & {
  cc: string | null
  bcc: string | null
  replyTo: string | null
  inReplyTo: string | null
  references: string | null
  body: {
    html: string | null
    text: string | null
  }
}

const HEADER_MAP = new Map<string, string>([
  ['subject', 'Subject'],
  ['from', 'From'],
  ['to', 'To'],
  ['cc', 'Cc'],
  ['bcc', 'Bcc'],
  ['reply-to', 'Reply-To'],
  ['in-reply-to', 'In-Reply-To'],
  ['references', 'References'],
])

export function decodeBase64Url(value?: string | null): string {
  if (!value) {
    return ''
  }

  return Buffer.from(value.replace(/-/g, '+').replace(/_/g, '/'), 'base64').toString('utf-8')
}

function findPartByMime(part: MessagePart | undefined, mimeType: string): MessagePart | undefined {
  if (!part) {
    return undefined
  }

  if (part.mimeType === mimeType) {
    return part
  }

  if (part.parts?.length) {
    for (const child of part.parts) {
      const match = findPartByMime(child, mimeType)
      if (match) {
        return match
      }
    }
  }

  return undefined
}

function extractBody(part?: MessagePart): string {
  if (!part) {
    return ''
  }
  if (part.body?.data) {
    return decodeBase64Url(part.body.data)
  }
  if (part.parts?.length) {
    for (const child of part.parts) {
      const body = extractBody(child)
      if (body) {
        return body
      }
    }
  }
  return ''
}

function getHeader(headers: Header[] | undefined, name: string) {
  if (!headers) {
    return null
  }
  const target = HEADER_MAP.get(name.toLowerCase()) ?? name
  const header = headers.find((item) => item.name?.toLowerCase() === target.toLowerCase())
  return header?.value ?? null
}

export function toMessageSummary(message: Message): GmailMessageSummary {
  const headers = message.payload?.headers

  return {
    id: message.id ?? '',
    threadId: message.threadId ?? '',
    labelIds: message.labelIds ?? [],
    snippet: message.snippet ?? '',
    internalDate: message.internalDate ? new Date(Number(message.internalDate)).toISOString() : null,
    subject: getHeader(headers, 'subject'),
    from: getHeader(headers, 'from'),
    to: getHeader(headers, 'to'),
  }
}

export function toMessageDetail(message: Message): GmailMessageDetail {
  const headers = message.payload?.headers
  const htmlPart = findPartByMime(message.payload, 'text/html')
  const textPart = findPartByMime(message.payload, 'text/plain')

  return {
    ...toMessageSummary(message),
    cc: getHeader(headers, 'cc'),
    bcc: getHeader(headers, 'bcc'),
    replyTo: getHeader(headers, 'reply-to'),
    inReplyTo: getHeader(headers, 'in-reply-to'),
    references: getHeader(headers, 'references'),
    body: {
      html: htmlPart ? extractBody(htmlPart) : null,
      text: textPart ? extractBody(textPart) : null,
    },
  }
}
