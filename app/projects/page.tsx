import { Badge } from '@/ui/badge'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/ui/card'
import { PageDescription, PageHeader, PageTitle } from '@/ui/page-header'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/ui/table'
import { Button } from '@/ui/button'

const mockProjects = [
  { id: '1', name: 'Q4 Revenue Optimization Workshop', client: 'Acme Corp', owner: 'Sarah Chen', status: 'In Progress', dueDate: '2025-10-30', progress: 65, health: 'green' },
  { id: '2', name: 'Clarity Audit & Scorecard', client: 'GlobalTech Inc', owner: 'Mike Johnson', status: 'In Progress', dueDate: '2025-11-05', progress: 40, health: 'yellow' },
  { id: '3', name: 'Partner Enablement Package', client: 'DataFlow Systems', owner: 'Alex Rivera', status: 'Not Started', dueDate: '2025-11-15', progress: 0, health: 'green' },
  { id: '4', name: 'ROI Analysis Report', client: 'CloudBridge', owner: 'Sarah Chen', status: 'At Risk', dueDate: '2025-10-22', progress: 25, health: 'red' },
  { id: '5', name: 'Customer Success Playbook', client: 'TechVentures LLC', owner: 'Mike Johnson', status: 'Complete', dueDate: '2025-09-28', progress: 100, health: 'green' },
  { id: '6', name: 'Pipeline Review Session', client: 'Innovation Labs', owner: 'Alex Rivera', status: 'In Progress', dueDate: '2025-10-25', progress: 80, health: 'green' },
]

const statusCounts = {
  'Not Started': mockProjects.filter(p => p.status === 'Not Started').length,
  'In Progress': mockProjects.filter(p => p.status === 'In Progress').length,
  'At Risk': mockProjects.filter(p => p.status === 'At Risk').length,
  'Complete': mockProjects.filter(p => p.status === 'Complete').length,
}

export default function ProjectsPage() {
  return (
    <div className="space-y-6">
      <PageHeader className="rounded-xl border border-[color:var(--color-outline)]">
        <PageTitle>Projects</PageTitle>
        <PageDescription>Coordinate deliverables, track progress, and manage client engagements.</PageDescription>
        <div className="flex flex-wrap items-center gap-2 text-sm">
          <Badge variant="success">{statusCounts['Complete']} Complete</Badge>
          <Badge variant="default">{statusCounts['In Progress']} In Progress</Badge>
          {statusCounts['At Risk'] > 0 && <Badge variant="outline">{statusCounts['At Risk']} At Risk</Badge>}
        </div>
      </PageHeader>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
        {Object.entries(statusCounts).map(([status, count]) => (
          <Card key={status}>
            <CardHeader>
              <CardTitle className="text-sm font-medium text-[color:var(--color-text-muted)]">{status}</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-semibold text-[color:var(--color-text)]">{count}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader>
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <CardTitle>Active engagements</CardTitle>
              <CardDescription>All client deliverables with owners, timelines, and health status.</CardDescription>
            </div>
            <Button variant="outline" size="sm">Add project</Button>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Project</TableHead>
                <TableHead>Client</TableHead>
                <TableHead>Owner</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Progress</TableHead>
                <TableHead>Due Date</TableHead>
                <TableHead>Health</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {mockProjects.map((project) => (
                <TableRow key={project.id}>
                  <TableCell className="font-medium">{project.name}</TableCell>
                  <TableCell className="text-sm text-[color:var(--color-text-muted)]">{project.client}</TableCell>
                  <TableCell className="text-sm text-[color:var(--color-text-muted)]">{project.owner}</TableCell>
                  <TableCell>
                    <Badge variant={
                      project.status === 'Complete' ? 'success' :
                      project.status === 'At Risk' ? 'outline' :
                      'default'
                    }>
                      {project.status}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <div className="h-2 w-24 overflow-hidden rounded-full bg-[color:var(--color-surface-muted)]">
                        <div
                          className="h-full bg-[color:var(--color-primary)]"
                          style={{ width: `${project.progress}%` }}
                        />
                      </div>
                      <span className="text-xs text-[color:var(--color-text-muted)]">{project.progress}%</span>
                    </div>
                  </TableCell>
                  <TableCell className="text-sm text-[color:var(--color-text-muted)]">
                    {new Date(project.dueDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                  </TableCell>
                  <TableCell>
                    <div className={`h-3 w-3 rounded-full ${
                      project.health === 'green' ? 'bg-[color:var(--color-positive)]' :
                      project.health === 'yellow' ? 'bg-yellow-500' :
                      'bg-[color:var(--color-negative)]'
                    }`} />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Risks & blockers</CardTitle>
          <CardDescription>Projects requiring immediate attention based on SLA adherence and status.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {mockProjects.filter(p => p.status === 'At Risk' || p.health === 'yellow' || p.health === 'red').map((project) => (
              <div key={project.id} className="rounded-lg border border-[color:var(--color-outline)] bg-white p-4">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <p className="font-medium text-[color:var(--color-text)]">{project.name}</p>
                    <p className="mt-1 text-sm text-[color:var(--color-text-muted)]">
                      {project.client} • Owner: {project.owner}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant={project.health === 'red' ? 'outline' : 'default'}>
                      {project.health === 'red' ? 'Critical' : 'Monitor'}
                    </Badge>
                  </div>
                </div>
                <p className="mt-2 text-sm text-[color:var(--color-text-muted)]">
                  Due: {new Date(project.dueDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} • {project.progress}% complete
                </p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
