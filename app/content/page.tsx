import { Badge } from '@/ui/badge'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/ui/card'
import { PageDescription, PageHeader, PageTitle } from '@/ui/page-header'

export default function ContentPage() {
  return (
    <div className="space-y-6">
      <PageHeader className="rounded-xl border border-[color:var(--color-outline)]">
        <PageTitle>Content</PageTitle>
        <PageDescription>
          Editorial and enablement assets powering revenue narratives. TODO: connect to content calendar and asset library.
        </PageDescription>
        <Badge variant="outline">Story builder stubs</Badge>
      </PageHeader>
      <Card>
        <CardHeader>
          <CardTitle>Upcoming stories</CardTitle>
          <CardDescription>TODO: map demand gen + lifecycle themes to TRS Score levers.</CardDescription>
        </CardHeader>
        <CardContent className="text-sm text-[color:var(--color-text-muted)]">
          No drafts ready. Sync with marketing CMS for planned releases.
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle>Asset requests</CardTitle>
          <CardDescription>TODO: queue design, copy, and revops enablement asks.</CardDescription>
        </CardHeader>
        <CardContent className="text-sm text-[color:var(--color-text-muted)]">
          Waiting for intake service. Hook submission form soon.
        </CardContent>
      </Card>
    </div>
  )
}
