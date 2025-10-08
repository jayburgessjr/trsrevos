import { NextResponse } from 'next/server'
export async function GET(_: Request, { params }: { params: { id: string } }) {
  // TODO: generate PDF/PPTX and store; log governance snapshot
  return NextResponse.json({ ok: true, id: params.id, exportLink: `/exports/${params.id}.pdf` })
}
