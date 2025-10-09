import { listClients } from '@/core/clients/store'
import { phaseBadgeClasses, REVOS_PHASES } from '@/core/clients/constants'
import type { RevosPhase } from '@/core/clients/types'
import { Badge } from '@/ui/badge'
import { Button } from '@/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/ui/card'
import { PageDescription, PageHeader, PageTitle } from '@/ui/page-header'
import { Table, TableBody, TableHead, TableHeader, TableRow } from '@/ui/table'

import { ProjectRow } from './project-row'

export type ProjectRowData = {
  id: string
  name: string
  clientId: string
  clientName: string
  owner: string
  status: RevosPhase
  progress: number
  dueDate: string
  health: 'green' | 'yellow' | 'red'
  clientOwner?: string
}

type MockProject = {
  id: string
  name: string
  clientId: string
  clientName: string
  owner: string
  status?: string
  dueDate: string
  progress: number
  health: 'green' | 'yellow' | 'red'
}

const mockProjects: MockProject[] = [
  {
    id: '1',
    name: 'Q4 Revenue Optimization Workshop',
    clientId: 'acme',
    clientName: 'ACME Corp',
    owner: 'Sarah Chen',
    status: 'In Progress',
    dueDate: '2025-10-30',
    progress: 65,
    health: 'green',
  },
  {
    id: '2',
    name: 'Clarity Audit & Scorecard',
    clientId: 'acme',
    clientName: 'ACME Corp',
    owner: 'Mike Johnson',
    status: 'In Progress',
    dueDate: '2025-11-05',
    progress: 40,
    health: 'yellow',
  },
  {
    id: '3',
    name: 'Partner Enablement Package',
    clientId: 'acme',
    clientName: 'ACME Corp',
    owner: 'Alex Rivera',
    status: 'Not Started',
    dueDate: '2025-11-15',
    progress: 0,
    health: 'green',
  },
  {
    id: '4',
    name: 'ROI Analysis Report',
    clientId: 'acme',
    clientName: 'ACME Corp',
    owner: 'Sarah Chen',
    status: 'At Risk',
    dueDate: '2025-10-22',
    progress: 25,
    health: 'red',
  },
  {
    id: '5',
    name: 'Customer Success Playbook',
    clientId: 'acme',
    clientName: 'ACME Corp',
    owner: 'Mike Johnson',
    status: 'Complete',
    dueDate: '2025-09-28',
    progress: 100,
    health: 'green',
  },
  {
    id: '6',
    name: 'Pipeline Review Session',
    clientId: 'acme',
    clientName: 'ACME Corp',
    owner: 'Alex Rivera',
    status: 'In Progress',
    dueDate: '2025-10-25',
    progress: 80,
    health: 'green',
  },
]

const phaseOrder: RevosPhase[] = REVOS_PHASES

export default async function ProjectsPage() {
  const clients = listClients()
  const clientsById = new Map(clients.map((client) => [client.id, client]))

  const projects: ProjectRowData[] = mockProjects.map((project) => {
    const client = clientsById.get(project.clientId)
    return {
      id: project.id,
      name: project.name,
      clientId: project.clientId,
      clientName: client?.name ?? project.clientName,
      owner: project.owner ?? client?.owner ?? 'Unassigned',
      status: client?.status ?? 'Discovery',
      progress: project.progress,
      dueDate: project.dueDate,
      health: project.health,
      clientOwner: client?.owner,
    }
  })

  const phaseCounts = phaseOrder.reduce<Record<RevosPhase, number>>((acc, phase) => {
    acc[phase] = clients.filter((client) => client.status === phase).length
    return acc
  }, Object.fromEntries(phaseOrder.map((phase) => [phase, 0])) as Record<RevosPhase, number>)

  return (
    <div className="space-y-6">
      <PageHeader className="rounded-xl border border-[color:var(--color-outline)]">
        <PageTitle>Projects</PageTitle>
        <PageDescription>Coordinate deliverables, track progress, and manage client engagements.</PageDescription>
        <div className="flex flex-wrap items-center gap-2 text-sm">
          {phaseOrder.map((phase) => (
            <Badge key={phase} variant="outline" className={phaseBadgeClasses[phase]}>
              {phaseCounts[phase]} {phase}
            </Badge>
          ))}
        </div>
      </PageHeader>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-5">
        {phaseOrder.map((phase) => (
          <Card key={phase}>
            <CardHeader>
              <CardTitle className="text-sm font-medium text-[color:var(--color-text-muted)]">{phase}</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-semibold text-[color:var(--color-text)]">{phaseCounts[phase]}</p>
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
            <Button variant="outline" size="sm">
              Add project
            </Button>
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
              {projects.map((project) => (
                <ProjectRow key={project.id} project={project} />
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Risks &amp; blockers</CardTitle>
          <CardDescription>Projects requiring immediate attention based on SLA adherence and status.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {projects
              .filter((project) => project.health !== 'green')
              .map((project) => (
                <div
                  key={project.id}
                  className="rounded-lg border border-[color:var(--color-outline)] bg-white p-4"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <p className="font-medium text-[color:var(--color-text)]">{project.name}</p>
                      <p className="mt-1 text-sm text-[color:var(--color-text-muted)]">
                        {project.clientName} • Owner: {project.owner}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className={phaseBadgeClasses[project.status]}>
                        {project.status}
                      </Badge>
                    </div>
                  </div>
                  <p className="mt-2 text-sm text-[color:var(--color-text-muted)]">
                    Due: {new Date(project.dueDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} •{' '}
                    {project.progress}% complete
                  </p>
                </div>
              ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
