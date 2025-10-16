'use client'

import { useMemo, useState } from 'react'
import Link from 'next/link'

import { useRevosData } from '@/app/providers/RevosDataProvider'
import { Badge } from '@/ui/badge'
import { Button } from '@/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/ui/card'
import { Input } from '@/ui/input'
import { Select } from '@/ui/select'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/ui/table'

const projectTypes = ['Audit', 'Blueprint', 'Advisory', 'Internal'] as const
const projectStatuses = ['Pending', 'Active', 'Delivered', 'Closed'] as const

type FormState = {
  name: string
  client: string
  type: (typeof projectTypes)[number]
  status: (typeof projectStatuses)[number]
  startDate: string
  endDate: string
  quickbooksInvoiceUrl: string
  team: string
  revenueTarget: number
}

const initialFormState: FormState = {
  name: '',
  client: '',
  type: 'Audit',
  status: 'Pending',
  startDate: '',
  endDate: '',
  quickbooksInvoiceUrl: '',
  team: '',
  revenueTarget: 25000,
}

export default function ProjectsPageClient() {
  const { projects, resources, invoices, createProject, updateProjectStatus } = useRevosData()
  const [form, setForm] = useState<FormState>(initialFormState)

  const sortedProjects = useMemo(() => {
    return [...projects].sort((a, b) => (a.startDate > b.startDate ? -1 : 1))
  }, [projects])

  const stats = useMemo(() => {
    const totalsByStatus = projects.reduce<Record<string, number>>((acc, project) => {
      acc[project.status] = (acc[project.status] ?? 0) + 1
      return acc
    }, {})

    return {
      totalsByStatus,
      totalRevenue: projects.reduce((total, project) => total + project.revenueTarget, 0),
      linkedResources: projects.reduce((total, project) => total + project.resources.length, 0),
    }
  }, [projects])

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (!form.name.trim() || !form.client.trim()) return
    createProject({
      name: form.name.trim(),
      client: form.client.trim(),
      type: form.type,
      status: form.status,
      startDate: form.startDate || new Date().toISOString(),
      endDate: form.endDate || undefined,
      quickbooksInvoiceUrl: form.quickbooksInvoiceUrl || undefined,
      team: form.team
        .split(',')
        .map((member) => member.trim())
        .filter(Boolean),
      revenueTarget: Number.isNaN(Number(form.revenueTarget)) ? 0 : Number(form.revenueTarget),
      documents: [],
      agents: [],
      resources: [],
    })
    setForm(initialFormState)
  }

  const handleStatusChange = (projectId: string, status: string) => {
    if (!projectStatuses.includes(status as (typeof projectStatuses)[number])) return
    updateProjectStatus({ id: projectId, status: status as (typeof projectStatuses)[number] })
  }

  return (
    <div className="space-y-8">
      <section className="grid gap-4 lg:grid-cols-3">
        <Card className="border-slate-200 lg:col-span-2">
          <CardHeader className="border-b border-slate-200/60 pb-4">
            <CardTitle className="text-lg font-semibold">Create Project</CardTitle>
            <CardDescription>Launch a new client engagement or internal initiative.</CardDescription>
          </CardHeader>
          <CardContent className="pt-4">
            <form className="grid grid-cols-1 gap-4 md:grid-cols-2" onSubmit={handleSubmit}>
              <div className="space-y-2">
                <label className="text-xs font-semibold uppercase tracking-wide text-slate-500">Project Name</label>
                <Input
                  value={form.name}
                  onChange={(event) => setForm((current) => ({ ...current, name: event.target.value }))}
                  placeholder="Clarity Audit – Client"
                  required
                />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-semibold uppercase tracking-wide text-slate-500">Client</label>
                <Input
                  value={form.client}
                  onChange={(event) => setForm((current) => ({ ...current, client: event.target.value }))}
                  placeholder="Client name"
                  required
                />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-semibold uppercase tracking-wide text-slate-500">Type</label>
                <Select
                  value={form.type}
                  onChange={(event) =>
                    setForm((current) => ({ ...current, type: event.target.value as FormState['type'] }))
                  }
                >
                  {projectTypes.map((type) => (
                    <option key={type} value={type}>
                      {type}
                    </option>
                  ))}
                </Select>
              </div>
              <div className="space-y-2">
                <label className="text-xs font-semibold uppercase tracking-wide text-slate-500">Status</label>
                <Select
                  value={form.status}
                  onChange={(event) =>
                    setForm((current) => ({ ...current, status: event.target.value as FormState['status'] }))
                  }
                >
                  {projectStatuses.map((status) => (
                    <option key={status} value={status}>
                      {status}
                    </option>
                  ))}
                </Select>
              </div>
              <div className="space-y-2">
                <label className="text-xs font-semibold uppercase tracking-wide text-slate-500">Start Date</label>
                <Input
                  type="date"
                  value={form.startDate}
                  onChange={(event) => setForm((current) => ({ ...current, startDate: event.target.value }))}
                />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-semibold uppercase tracking-wide text-slate-500">End Date</label>
                <Input
                  type="date"
                  value={form.endDate}
                  onChange={(event) => setForm((current) => ({ ...current, endDate: event.target.value }))}
                />
              </div>
              <div className="space-y-2 md:col-span-2">
                <label className="text-xs font-semibold uppercase tracking-wide text-slate-500">Assigned Team</label>
                <Input
                  value={form.team}
                  onChange={(event) => setForm((current) => ({ ...current, team: event.target.value }))}
                  placeholder="Comma separated names"
                />
              </div>
              <div className="space-y-2 md:col-span-2">
                <label className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                  QuickBooks Invoice URL
                </label>
                <Input
                  type="url"
                  value={form.quickbooksInvoiceUrl}
                  onChange={(event) =>
                    setForm((current) => ({ ...current, quickbooksInvoiceUrl: event.target.value }))
                  }
                  placeholder="https://..."
                />
              </div>
              <div className="space-y-2 md:col-span-2">
                <label className="text-xs font-semibold uppercase tracking-wide text-slate-500">Revenue Target (USD)</label>
                <Input
                  type="number"
                  min={0}
                  value={form.revenueTarget}
                  onChange={(event) =>
                    setForm((current) => ({ ...current, revenueTarget: Number(event.target.value) }))
                  }
                />
              </div>
              <div className="md:col-span-2">
                <Button type="submit" className="w-full md:w-auto">
                  Create Project
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
        <Card className="border-slate-200">
          <CardHeader className="border-b border-slate-200/60 pb-4">
            <CardTitle className="text-lg font-semibold">Portfolio Snapshot</CardTitle>
            <CardDescription>Track load and linked knowledge.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3 pt-4 text-sm text-slate-600">
            <div className="rounded-lg border border-slate-200/80 bg-white p-3 shadow-sm">
              <p className="text-xs uppercase tracking-widest text-slate-500">Total Revenue Target</p>
              <p className="mt-1 text-2xl font-semibold text-slate-900">
                ${stats.totalRevenue.toLocaleString()}
              </p>
            </div>
            <div className="rounded-lg border border-slate-200/80 bg-white p-3 shadow-sm">
              <p className="text-xs uppercase tracking-widest text-slate-500">Resources Linked</p>
              <p className="mt-1 text-2xl font-semibold text-slate-900">{stats.linkedResources}</p>
            </div>
            <div className="space-y-2">
              {projectStatuses.map((status) => (
                <div key={status} className="flex items-center justify-between rounded-lg border border-slate-200/80 bg-white p-3 shadow-sm">
                  <span className="text-sm font-medium text-slate-600">{status}</span>
                  <Badge variant="outline" className="border-slate-300 text-slate-600">
                    {stats.totalsByStatus[status] ?? 0}
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </section>

      <Card className="border-slate-200">
        <CardHeader className="border-b border-slate-200/60 pb-4">
          <CardTitle className="text-lg font-semibold">Projects</CardTitle>
          <CardDescription>Central record across delivery, automation, and resources.</CardDescription>
        </CardHeader>
        <CardContent className="px-0">
          <Table>
            <TableHeader>
              <TableRow className="hover:bg-transparent">
                <TableHead className="px-6">Project</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Client</TableHead>
                <TableHead>Team</TableHead>
                <TableHead>Documents</TableHead>
                <TableHead>Resources</TableHead>
                <TableHead>Invoice</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {sortedProjects.map((project) => (
                <TableRow key={project.id} className="hover:bg-slate-50/60">
                  <TableCell className="px-6">
                    <div className="font-medium text-slate-900">{project.name}</div>
                    <div className="text-xs text-slate-500">{project.id}</div>
                  </TableCell>
                  <TableCell>
                    <Select
                      value={project.status}
                      onChange={(event) => handleStatusChange(project.id, event.target.value)}
                    >
                      {projectStatuses.map((status) => (
                        <option key={status} value={status}>
                          {status}
                        </option>
                      ))}
                    </Select>
                  </TableCell>
                  <TableCell>{project.client}</TableCell>
                  <TableCell>
                    <div className="flex flex-wrap gap-1">
                      {project.team.length === 0 ? (
                        <span className="text-xs text-slate-500">Unassigned</span>
                      ) : (
                        project.team.map((member) => (
                          <Badge key={member} variant="secondary" className="bg-slate-100 text-slate-700">
                            {member}
                          </Badge>
                        ))
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <Link href="/documents" className="text-sm text-emerald-600 underline">
                      {project.documents.length} linked
                    </Link>
                  </TableCell>
                  <TableCell>
                    <Link href="/resources" className="text-sm text-emerald-600 underline">
                      {project.resources.length} linked
                    </Link>
                  </TableCell>
                  <TableCell>
                    {project.quickbooksInvoiceUrl ? (
                      <Link href={project.quickbooksInvoiceUrl} className="text-sm text-orange-600 underline">
                        View invoice
                      </Link>
                    ) : (
                      <span className="text-xs text-slate-500">Not linked</span>
                    )}
                    <div className="text-xs text-slate-500">
                      {invoices.find((invoice) => invoice.projectId === project.id)?.status ?? 'Draft'}
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Card className="border-slate-200">
        <CardHeader className="border-b border-slate-200/60 pb-4">
          <CardTitle className="text-lg font-semibold">Resources & Assets</CardTitle>
          <CardDescription>Quick reference of linked frameworks and knowledge.</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {resources.map((resource) => (
            <div key={resource.id} className="rounded-lg border border-slate-200/80 bg-white p-4 text-sm shadow-sm">
              <p className="text-sm font-semibold text-slate-900">{resource.name}</p>
              <p className="mt-1 text-slate-600">{resource.description}</p>
              <div className="mt-2 flex flex-wrap gap-1">
                {resource.tags.map((tag) => (
                  <Badge key={tag} variant="secondary" className="bg-slate-100 text-slate-700">
                    {tag}
                  </Badge>
                ))}
              </div>
              <div className="mt-2 text-xs text-slate-500">
                Linked Projects: {resource.relatedProjectIds.length}
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  )
}
