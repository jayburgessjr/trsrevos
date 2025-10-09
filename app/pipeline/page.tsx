import { PageDescription, PageHeader, PageTitle } from '@/ui/page-header'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/ui/card'
import { Badge } from '@/ui/badge'

export default function PipelinePage() {
  return (
    <div className="space-y-6">
      <PageHeader className="rounded-xl border border-[color:var(--color-outline)]">
        <PageTitle>Pipeline</PageTitle>
        <PageDescription>
          Track forecast health, coverage, and conversion. TODO: hydrate from pipeline API and scoring engine.
        </PageDescription>
        <div className="flex flex-wrap items-center gap-2 text-xs text-[color:var(--color-text-muted)]">
          <Badge variant="outline">TODO: tie into dynamic filters</Badge>
          <span>Zero state until data hooks wire up.</span>
        </div>
      </PageHeader>
      <Card>
        <CardHeader>
          <CardTitle>Commit overview</CardTitle>
          <CardDescription>TODO: show commit vs. goal, coverage ratios, and slippage callouts.</CardDescription>
        </CardHeader>
        <CardContent className="text-sm text-[color:var(--color-text-muted)]">
          No deals loaded. Sync CRM adapter to populate stages and weighted revenue.
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle>Stage velocity</CardTitle>
          <CardDescription>TODO: compute time-in-stage trends, drop-offs, and rep focus suggestions.</CardDescription>
        </CardHeader>
        <CardContent className="text-sm text-[color:var(--color-text-muted)]">
          Waiting for dataset. Hook into RevOps analytics service.
        </CardContent>
      </Card>
    </div>
  )
}
