import { getShareById } from '@/core/shares/actions'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/ui/card'
import { Badge } from '@/ui/badge'

export default async function SharePage({ params }: { params: { id: string } }) {
  const share = await getShareById(params.id)

  if (!share) {
    return (
      <div className="mx-auto flex min-h-screen w-full max-w-3xl flex-col justify-center gap-4 px-6 py-12">
        <Card>
          <CardHeader>
            <CardTitle>Share link expired</CardTitle>
            <CardDescription>Token {params.id} is no longer active. Request a new share from the owner.</CardDescription>
          </CardHeader>
        </Card>
      </div>
    )
  }

  return (
    <div className="mx-auto flex min-h-screen w-full max-w-4xl flex-col gap-6 px-6 py-12">
      <Card className="relative overflow-hidden">
        {share.watermark ? <Watermark /> : null}
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>{share.title}</CardTitle>
              <CardDescription>{share.summary}</CardDescription>
            </div>
            <Badge variant="outline">Preview</Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-4 text-sm text-[color:var(--color-text-muted)]">
          <p>Shared on {new Date(share.createdAt).toLocaleString()} by {share.createdBy}.</p>
          <p>TODO: hydrate with report modules, metrics, and collaboration controls.</p>
          <p>Watermark {share.watermark ? 'enabled' : 'disabled'}.</p>
        </CardContent>
      </Card>
    </div>
  )
}

function Watermark() {
  return (
    <div className="pointer-events-none absolute inset-0 grid place-items-center text-5xl font-semibold uppercase tracking-widest text-[color:var(--color-outline)]/40">
      TRS SHARE
    </div>
  )
}
