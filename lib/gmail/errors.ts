import { NextResponse } from 'next/server'

export function mapGmailError(error: unknown, fallbackMessage: string, defaultCode: string) {
  console.error(fallbackMessage, error)
  if (error instanceof Error) {
    if (error.message.includes('authenticated')) {
      return NextResponse.json({ error: 'unauthenticated' }, { status: 401 })
    }
    if (error.message.includes('not connected')) {
      return NextResponse.json({ error: 'integration_not_connected' }, { status: 409 })
    }
  }
  return NextResponse.json({ error: defaultCode }, { status: 500 })
}
