import { Badge } from '@/ui/badge'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/ui/card'
import { PageDescription, PageHeader, PageTitle } from '@/ui/page-header'

export default function PartnersPage() {
  return (
    <div className="space-y-6">
      <PageHeader className="rounded-xl border border-[color:var(--color-outline)]">
        <PageTitle>Partners</PageTitle>
        <PageDescription>Manage ecosystem momentum. TODO: integrate partner CRM + MDF tracking.</PageDescription>
        <Badge variant="outline">Ecosystem experiments pending</Badge>
      </PageHeader>
      <Card>
        <CardHeader>
          <CardTitle>Partner pipeline</CardTitle>
          <CardDescription>TODO: display sourced, influenced, and co-sell motions.</CardDescription>
        </CardHeader>
        <CardContent className="text-sm text-[color:var(--color-text-muted)]">
          Waiting on partner source feed. Connect to partner API soon.
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle>Enablement scorecard</CardTitle>
          <CardDescription>TODO: show certification status and play activation.</CardDescription>
        </CardHeader>
        <CardContent className="text-sm text-[color:var(--color-text-muted)]">
          No partners scored. Add enablement telemetry ingest.
        </CardContent>
      </Card>
    </div>
  )
}
