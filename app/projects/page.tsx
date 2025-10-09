import { Badge } from '@/ui/badge'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/ui/card'
import { PageDescription, PageHeader, PageTitle } from '@/ui/page-header'

export default function ProjectsPage() {
  return (
    <div className="space-y-6">
      <PageHeader className="rounded-xl border border-[color:var(--color-outline)]">
        <PageTitle>Projects</PageTitle>
        <PageDescription>Coordinate deliverables, owners, and due dates. TODO: connect to project workspace service.</PageDescription>
        <Badge variant="outline">Assignments syncing soon</Badge>
      </PageHeader>
      <Card>
        <CardHeader>
          <CardTitle>Active engagements</CardTitle>
          <CardDescription>TODO: pull live deliverable states and owner workloads.</CardDescription>
        </CardHeader>
        <CardContent className="text-sm text-[color:var(--color-text-muted)]">
          No projects yet. Plug in deliverables API for upcoming Clarity Audits, ROI reports, and workshops.
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle>Risks &amp; blockers</CardTitle>
          <CardDescription>TODO: surface red/yellow states based on SLA adherence.</CardDescription>
        </CardHeader>
        <CardContent className="text-sm text-[color:var(--color-text-muted)]">
          Waiting on governance signals. Link QA service to populate this list.
        </CardContent>
      </Card>
    </div>
  )
}
