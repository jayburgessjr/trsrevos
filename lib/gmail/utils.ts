export type ComposeEmailOptions = {
  to: string | string[]
  subject: string
  body: string
  cc?: string | string[]
  bcc?: string | string[]
  from?: string
  replyTo?: string
  inReplyTo?: string
  references?: string
  contentType?: 'text/plain' | 'text/html'
}

function normaliseAddresses(value?: string | string[] | null) {
  if (!value) {
    return undefined
  }

  if (Array.isArray(value)) {
    return value.filter(Boolean).map((item) => item.trim()).join(', ')
  }

  return value.split(',').map((item) => item.trim()).filter(Boolean).join(', ')
}

export function createRawEmail({
  to,
  subject,
  body,
  cc,
  bcc,
  from,
  replyTo,
  inReplyTo,
  references,
  contentType = 'text/html',
}: ComposeEmailOptions) {
  const headers: Array<[string, string]> = []

  const toHeader = normaliseAddresses(to)
  if (!toHeader) {
    throw new Error('Recipient (to) is required to send email')
  }

  headers.push(['To', toHeader])

  const ccHeader = normaliseAddresses(cc)
  if (ccHeader) {
    headers.push(['Cc', ccHeader])
  }

  const bccHeader = normaliseAddresses(bcc)
  if (bccHeader) {
    headers.push(['Bcc', bccHeader])
  }

  if (from) {
    headers.push(['From', from])
  }

  if (replyTo) {
    headers.push(['Reply-To', replyTo])
  }

  if (inReplyTo) {
    headers.push(['In-Reply-To', inReplyTo])
  }

  if (references) {
    headers.push(['References', references])
  }

  headers.push(['Subject', subject])
  headers.push(['MIME-Version', '1.0'])
  headers.push(['Content-Type', `${contentType}; charset="UTF-8"`])
  headers.push(['Content-Transfer-Encoding', '7bit'])

  const message = `${headers.map(([key, value]) => `${key}: ${value}`).join('\r\n')}\r\n\r\n${body}`

  return Buffer.from(message)
    .toString('base64')
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/, '')
}
