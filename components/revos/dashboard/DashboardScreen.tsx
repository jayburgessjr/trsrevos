'use client'

import Link from 'next/link'
import { useMemo } from 'react'

import { useRevosData } from '@/app/providers/RevosDataProvider'
import { Badge } from '@/ui/badge'
import { Button } from '@/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/ui/table'

export default function DashboardScreen() {
  const { projects, documents, content, agents, automationLogs, invoices } = useRevosData()

  const metrics = useMemo(() => {
    const activeProjects = projects.filter((project) => project.status === 'Active').length
    const deliverablesInProgress = documents.filter((doc) => doc.status !== 'Final')
    const activeClients = new Set(
      projects.filter((project) => project.status === 'Active' || project.status === 'Pending').map((project) => project.client),
    ).size
    const blueprintsDelivered = documents.filter(
      (doc) => doc.type.toLowerCase().includes('blueprint') && doc.status === 'Final',
    ).length
    const revenueInProgress = invoices
      .filter((invoice) => invoice.status !== 'Paid')
      .reduce((total, invoice) => total + invoice.amount, 0)
    const automationHoursSaved = (automationLogs.length * 1.5).toFixed(1)

    const documentCountByType = documents.reduce<Record<string, number>>((acc, doc) => {
      acc[doc.type] = (acc[doc.type] ?? 0) + 1
      return acc
    }, {})

    const quickbooksSummary = invoices.reduce(
      (acc, invoice) => {
        acc[invoice.status] = {
          amount: (acc[invoice.status]?.amount ?? 0) + invoice.amount,
          count: (acc[invoice.status]?.count ?? 0) + 1,
        }
        return acc
      },
      {} as Record<string, { amount: number; count: number }>,
    )

    const deliverableRows = deliverablesInProgress
      .map((doc) => ({
        id: doc.id,
        title: doc.title,
        project: projects.find((project) => project.id === doc.projectId)?.name ?? 'Unlinked',
        status: doc.status,
        updatedAt: doc.updatedAt,
      }))
      .sort((a, b) => (a.updatedAt > b.updatedAt ? -1 : 1))
      .slice(0, 5)

    const automationFeed = automationLogs
      .map((log) => ({
        id: log.id,
        summary: log.summary,
        agent: agents.find((agent) => agent.id === log.agentId)?.name ?? 'Unknown Agent',
        project: log.projectId ? projects.find((project) => project.id === log.projectId)?.name : undefined,
        createdAt: log.createdAt,
      }))
      .sort((a, b) => (a.createdAt > b.createdAt ? -1 : 1))
      .slice(0, 6)

    return {
      activeProjects,
      deliverablesInProgress: deliverablesInProgress.length,
      activeClients,
      blueprintsDelivered,
      revenueInProgress,
      automationHoursSaved,
      documentCountByType,
      quickbooksSummary,
      deliverableRows,
      automationFeed,
    }
  }, [projects, documents, automationLogs, invoices, agents])

  return (
    <div className="space-y-8">
      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <MetricCard label="Active Projects" value={metrics.activeProjects} accent="emerald" subtitle="Tracking live engagements" />
        <MetricCard
          label="Deliverables in Progress"
          value={metrics.deliverablesInProgress}
          accent="orange"
          subtitle="Documents awaiting review"
        />
        <MetricCard
          label="Revenue in Progress"
          value={`$${metrics.revenueInProgress.toLocaleString()}`}
          accent="slate"
          subtitle="Open QuickBooks invoices"
        />
        <MetricCard
          label="Automation Hours Saved"
          value={metrics.automationHoursSaved}
          accent="emerald"
          subtitle="Based on agent run history"
        />
      </section>

      <section className="grid gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2 border-slate-200">
          <CardHeader className="flex flex-col gap-1 border-b border-slate-200/60 pb-4">
            <CardTitle className="text-lg font-semibold">Active Deliverables</CardTitle>
            <CardDescription>Monitor drafts and reviews across all engagements.</CardDescription>
          </CardHeader>
          <CardContent className="px-0">
            <Table>
              <TableHeader>
                <TableRow className="hover:bg-transparent">
                  <TableHead className="px-6">Document</TableHead>
                  <TableHead>Project</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Updated</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {metrics.deliverableRows.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={4} className="px-6 py-10 text-center text-sm text-slate-500">
                      All deliverables are finalized.
                    </TableCell>
                  </TableRow>
                ) : (
                  metrics.deliverableRows.map((row) => (
                    <TableRow key={row.id} className="hover:bg-slate-50/60">
                      <TableCell className="px-6">
                        <div className="font-medium text-slate-900">{row.title}</div>
                        <div className="text-xs text-slate-500">{row.id}</div>
                      </TableCell>
                      <TableCell>{row.project}</TableCell>
                      <TableCell>
                        <Badge
                          variant="outline"
                          className={row.status === 'In Review' ? 'border-orange-500 text-orange-600' : 'border-slate-300 text-slate-600'}
                        >
                          {row.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-xs text-slate-500">
                        {new Date(row.updatedAt).toLocaleDateString()}
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
        <Card className="border-slate-200">
          <CardHeader className="border-b border-slate-200/60 pb-4">
            <CardTitle className="text-lg font-semibold">Automation Feed</CardTitle>
            <CardDescription>Recent agent runs powering delivery.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {metrics.automationFeed.length === 0 ? (
              <p className="text-sm text-slate-500">No automation events yet.</p>
            ) : (
              metrics.automationFeed.map((item) => (
                <div key={item.id} className="rounded-lg border border-slate-200/80 bg-white p-4 text-sm shadow-sm">
                  <p className="font-medium text-slate-900">{item.agent}</p>
                  <p className="mt-1 text-slate-600">{item.summary}</p>
                  <div className="mt-2 flex items-center justify-between text-xs text-slate-500">
                    <span>{item.project ?? 'Standalone run'}</span>
                    <span>{new Date(item.createdAt).toLocaleString()}</span>
                  </div>
                </div>
              ))
            )}
            <Button asChild variant="outline" className="w-full border-slate-300">
              <Link href="/agents">Launch an Agent</Link>
            </Button>
          </CardContent>
        </Card>
      </section>

      <section className="grid gap-6 lg:grid-cols-3">
        <Card className="border-slate-200">
          <CardHeader className="border-b border-slate-200/60 pb-4">
            <CardTitle className="text-lg font-semibold">Document Mix</CardTitle>
            <CardDescription>Breakdown of working deliverables.</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-wrap gap-2 pt-4">
            {Object.entries(metrics.documentCountByType).map(([type, count]) => (
              <Badge key={type} variant="outline" className="bg-slate-100 text-slate-700">
                {type} • {count}
              </Badge>
            ))}
            {Object.keys(metrics.documentCountByType).length === 0 && (
              <p className="text-sm text-slate-500">No documents captured yet.</p>
            )}
          </CardContent>
        </Card>
        <Card className="border-slate-200 lg:col-span-2">
          <CardHeader className="border-b border-slate-200/60 pb-4">
            <CardTitle className="text-lg font-semibold">QuickBooks Invoices</CardTitle>
            <CardDescription>Revenue status synced from finance.</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-4 pt-4 md:grid-cols-3">
            {['Draft', 'Sent', 'Paid'].map((status) => {
              const summary = metrics.quickbooksSummary[status] ?? { amount: 0, count: 0 }
              return (
                <div key={status} className="rounded-lg border border-slate-200/80 bg-white p-4 shadow-sm">
                  <p className="text-xs uppercase tracking-widest text-slate-500">{status}</p>
                  <p className="mt-1 text-xl font-semibold text-slate-900">
                    ${summary.amount.toLocaleString()}
                  </p>
                  <p className="text-xs text-slate-500">{summary.count} invoices</p>
                </div>
              )
            })}
          </CardContent>
        </Card>
      </section>

      <section>
        <Card className="border-slate-200">
          <CardHeader className="border-b border-slate-200/60 pb-4">
            <CardTitle className="text-lg font-semibold">Content Pipeline</CardTitle>
            <CardDescription>Derivative assets created from project work.</CardDescription>
          </CardHeader>
          <CardContent className="px-0">
            <Table>
              <TableHeader>
                <TableRow className="hover:bg-transparent">
                  <TableHead className="px-6">Title</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Project</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {content.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={4} className="px-6 py-10 text-center text-sm text-slate-500">
                      No content generated yet.
                    </TableCell>
                  </TableRow>
                ) : (
                  content.map((item) => (
                    <TableRow key={item.id} className="hover:bg-slate-50/60">
                      <TableCell className="px-6">
                        <div className="font-medium text-slate-900">{item.title}</div>
                        <div className="text-xs text-slate-500">{new Date(item.createdAt).toLocaleDateString()}</div>
                      </TableCell>
                      <TableCell>{item.type}</TableCell>
                      <TableCell>
                        <Badge
                          variant="outline"
                          className={item.status === 'Published' ? 'border-emerald-500 text-emerald-600' : 'border-slate-300 text-slate-600'}
                        >
                          {item.status}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {item.sourceProjectId
                          ? projects.find((project) => project.id === item.sourceProjectId)?.name ?? 'Unlinked'
                          : 'Standalone'}
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </section>
    </div>
  )
}

type MetricCardProps = {
  label: string
  value: string | number
  accent: 'emerald' | 'orange' | 'slate'
  subtitle: string
}

function MetricCard({ label, value, accent, subtitle }: MetricCardProps) {
  const accentClasses = {
    emerald: 'border-emerald-500 text-emerald-700',
    orange: 'border-orange-500 text-orange-600',
    slate: 'border-slate-500 text-slate-600',
  }

  return (
    <Card className="border-slate-200">
      <CardHeader className="pb-3">
        <CardDescription className="uppercase tracking-widest text-xs text-slate-500">{label}</CardDescription>
        <CardTitle className="text-2xl font-semibold text-slate-900">{value}</CardTitle>
      </CardHeader>
      <CardContent>
        <Badge variant="outline" className={accentClasses[accent]}>
          {subtitle}
        </Badge>
      </CardContent>
    </Card>
  )
}
