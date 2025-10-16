'use client'

import { useMemo, useState } from 'react'

import { useRevosData } from '@/app/providers/RevosDataProvider'
import { Badge } from '@/ui/badge'
import { Button } from '@/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/ui/card'
import { Select } from '@/ui/select'
import { Textarea } from '@/ui/textarea'

export default function AgentsPageClient() {
  const { agents, projects, automationLogs, runAgent } = useRevosData()
  const [formState, setFormState] = useState<Record<string, { projectId?: string; notes: string }>>({})

  const categoryBreakdown = useMemo(() => {
    return agents.reduce<Record<string, number>>((acc, agent) => {
      acc[agent.category] = (acc[agent.category] ?? 0) + 1
      return acc
    }, {})
  }, [agents])

  const handleRun = (agentId: string) => {
    const state = formState[agentId] ?? {}
    runAgent({ agentId, projectId: state.projectId, notes: state.notes })
    setFormState((current) => ({ ...current, [agentId]: { projectId: state.projectId, notes: '' } }))
  }

  return (
    <div className="space-y-8">
      <section className="grid gap-4 lg:grid-cols-3">
        <Card className="border-slate-200 lg:col-span-2">
          <CardHeader className="border-b border-slate-200/60 pb-4">
            <CardTitle className="text-lg font-semibold">Automation Agents</CardTitle>
            <CardDescription>Reusable playbooks that orchestrate revenue science tasks.</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-4 pt-4 md:grid-cols-2">
            {agents.map((agent) => {
              const state = formState[agent.id] ?? { projectId: projects[0]?.id, notes: '' }
              return (
                <div key={agent.id} className="flex flex-col rounded-lg border border-slate-200/80 bg-white p-4 shadow-sm">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="text-sm font-semibold text-slate-900">{agent.name}</p>
                      <p className="mt-1 text-xs uppercase tracking-widest text-slate-500">{agent.category}</p>
                    </div>
                    <Badge variant="outline" className="border-emerald-500 text-emerald-600">
                      {agent.defaultOutputType}
                    </Badge>
                  </div>
                  <p className="mt-2 text-sm text-slate-600">{agent.description}</p>
                  <div className="mt-4 space-y-3 text-sm">
                    <div className="space-y-2">
                      <label className="text-xs font-semibold uppercase tracking-wide text-slate-500">Project Context</label>
                      <Select
                        value={state.projectId || projects[0]?.id || ''}
                        onChange={(event) =>
                          setFormState((current) => ({
                            ...current,
                            [agent.id]: { ...state, projectId: event.target.value },
                          }))
                        }
                      >
                        <option value="">Unassigned</option>
                        {projects.map((project) => (
                          <option key={project.id} value={project.id}>
                            {project.name}
                          </option>
                        ))}
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <label className="text-xs font-semibold uppercase tracking-wide text-slate-500">Notes</label>
                      <Textarea
                        value={state.notes}
                        onChange={(event) =>
                          setFormState((current) => ({
                            ...current,
                            [agent.id]: { ...state, notes: event.target.value },
                          }))
                        }
                        placeholder="Add context or desired outcome"
                        rows={3}
                      />
                    </div>
                    <Button type="button" onClick={() => handleRun(agent.id)}>
                      Run Agent
                    </Button>
                  </div>
                  <details className="mt-4 rounded-lg border border-dashed border-slate-200 bg-slate-50/80 p-3 text-xs text-slate-600">
                    <summary className="cursor-pointer text-slate-500">Prompt Blueprint</summary>
                    <p className="mt-2 whitespace-pre-wrap text-slate-600">{agent.prompt}</p>
                  </details>
                </div>
              )
            })}
          </CardContent>
        </Card>
        <Card className="border-slate-200">
          <CardHeader className="border-b border-slate-200/60 pb-4">
            <CardTitle className="text-lg font-semibold">Category Snapshot</CardTitle>
            <CardDescription>Ensure balanced automation coverage.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3 pt-4 text-sm text-slate-600">
            {Object.entries(categoryBreakdown).map(([category, count]) => (
              <div key={category} className="flex items-center justify-between rounded-lg border border-slate-200/80 bg-white p-3 shadow-sm">
                <span className="font-medium text-slate-600">{category}</span>
                <Badge variant="outline" className="border-slate-300 text-slate-600">
                  {count}
                </Badge>
              </div>
            ))}
            <div className="rounded-lg border border-slate-200/80 bg-white p-3 shadow-sm">
              <p className="text-xs uppercase tracking-widest text-slate-500">Total Runs</p>
              <p className="mt-1 text-2xl font-semibold text-slate-900">{automationLogs.length}</p>
            </div>
            <div className="rounded-lg border border-slate-200/80 bg-white p-3 shadow-sm">
              <p className="text-xs uppercase tracking-widest text-slate-500">Hours Saved</p>
              <p className="mt-1 text-2xl font-semibold text-slate-900">{(automationLogs.length * 1.5).toFixed(1)}</p>
            </div>
          </CardContent>
        </Card>
      </section>

      <Card className="border-slate-200">
        <CardHeader className="border-b border-slate-200/60 pb-4">
          <CardTitle className="text-lg font-semibold">Automation Activity</CardTitle>
          <CardDescription>Latest agent executions and outcomes.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4 pt-4">
          {automationLogs.length === 0 ? (
            <p className="text-sm text-slate-500">No automation runs recorded yet.</p>
          ) : (
            automationLogs
              .slice()
              .sort((a, b) => (a.createdAt > b.createdAt ? -1 : 1))
              .map((log) => {
                const agent = agents.find((item) => item.id === log.agentId)
                const project = log.projectId
                  ? projects.find((item) => item.id === log.projectId)?.name
                  : 'Standalone run'
                return (
                  <div key={log.id} className="rounded-lg border border-slate-200/80 bg-white p-4 shadow-sm">
                    <div className="flex items-center justify-between text-sm font-medium text-slate-900">
                      <span>{agent?.name ?? log.agentId}</span>
                      <span className="text-xs text-slate-500">{new Date(log.createdAt).toLocaleString()}</span>
                    </div>
                    <p className="mt-2 text-sm text-slate-600">{log.summary}</p>
                    <div className="mt-2 flex items-center gap-2 text-xs text-slate-500">
                      <Badge variant="outline" className="border-slate-300 text-slate-600">
                        {project ?? 'Unassigned'}
                      </Badge>
                      <Badge variant="outline" className="border-emerald-500 text-emerald-600">
                        {log.outputType}
                      </Badge>
                    </div>
                  </div>
                )
              })
          )}
        </CardContent>
      </Card>
    </div>
  )
}
