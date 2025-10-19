'use client'

import { useMemo, useState } from 'react'

import { useRevosData } from '@/app/providers/RevosDataProvider'
import { Badge } from '@/ui/badge'
import { Button } from '@/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/ui/card'
import { Select } from '@/ui/select'
import { Textarea } from '@/ui/textarea'

type AgentFormState = {
  projectId?: string
  notes: string
  // ClarityBot specific fields
  client_name?: string
  industry?: string
  monthly_revenue?: string
  team_size?: string
}

export default function AgentsPageClient() {
  const { agents, projects, automationLogs, runAgent } = useRevosData()
  const [formState, setFormState] = useState<Record<string, AgentFormState>>({})
  const [expandedAgent, setExpandedAgent] = useState<string | null>(null)

  const categoryBreakdown = useMemo(() => {
    return agents.reduce<Record<string, number>>((acc, agent) => {
      acc[agent.category] = (acc[agent.category] ?? 0) + 1
      return acc
    }, {})
  }, [agents])

  const handleRun = (agentId: string) => {
    const state = formState[agentId] ?? {}

    // Build payload based on agent type
    const payload: any = {
      projectId: state.projectId,
      notes: state.notes
    }

    // Add ClarityBot specific fields if this is the clarity bot
    const agent = agents.find(a => a.id === agentId)
    if (agent?.id === 'agent-clarity-bot') {
      // Get project data to populate client context
      const selectedProject = projects.find(p => p.id === state.projectId)

      payload.client_name = selectedProject?.client || state.client_name || 'Unknown Client'
      payload.industry = state.industry || 'SaaS'
      payload.monthly_revenue = parseInt(state.monthly_revenue || selectedProject?.revenueTarget?.toString() || '100000')
      payload.team_size = parseInt(state.team_size || selectedProject?.team?.length?.toString() || '15')
      payload.crm_data = true
      payload.files = state.notes ? [{ name: 'notes.txt', description: state.notes }] : []
    }

    runAgent({ agentId, projectId: state.projectId, notes: state.notes })
    setFormState((current) => ({ ...current, [agentId]: { projectId: state.projectId, notes: '' } }))
  }

  const isClarityBot = (agentId: string) => agentId === 'agent-clarity-bot'
  const isSpecializedAgent = (agentId: string) =>
    ['agent-clarity-bot', 'agent-blueprint-engine', 'agent-offer-desk', 'agent-data-gate', 'agent-qra-forecaster', 'agent-revos-orchestrator'].includes(agentId)

  return (
    <div className="space-y-8">
      <section className="grid gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader className="pb-4">
            <CardTitle className="text-lg font-semibold">Automation Agents</CardTitle>
            <CardDescription>Reusable playbooks that orchestrate revenue science tasks.</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-4 pt-4 md:grid-cols-2">
            {agents.map((agent) => {
              const state = formState[agent.id] ?? { projectId: projects[0]?.id, notes: '', client_name: '', industry: '', monthly_revenue: '', team_size: '' }
              const isClarity = isClarityBot(agent.id)
              const isSpecialized = isSpecializedAgent(agent.id)

              return (
                <div
                  key={agent.id}
                  className={`flex flex-col rounded-lg border-2 border-[#fd8216] p-4 shadow-sm ${
                    isSpecialized
                      ? 'bg-[#004d28]'
                      : 'bg-[#004d28]'
                  }`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="text-sm font-semibold text-foreground">{agent.name}</p>
                      <p className="mt-1 text-xs uppercase tracking-widest text-muted-foreground">{agent.category}</p>
                    </div>
                    <Badge
                      variant="outline"
                      className={isSpecialized ? "border-blue-500 text-blue-700" : "border-emerald-500 text-emerald-600"}
                    >
                      {agent.defaultOutputType}
                    </Badge>
                  </div>
                  <p className="mt-2 text-sm text-muted-foreground">{agent.description}</p>

                  <div className="mt-4 space-y-3 text-sm">
                    {isClarity ? (
                      // ClarityBot specialized inputs
                      <>
                        <div className="space-y-2">
                          <label className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Select Project / Client*</label>
                          <Select
                            value={state.projectId || projects[0]?.id || ''}
                            onChange={(event) => {
                              const selectedProject = projects.find(p => p.id === event.target.value)
                              setFormState((current) => ({
                                ...current,
                                [agent.id]: {
                                  ...state,
                                  projectId: event.target.value,
                                  client_name: selectedProject?.client || '',
                                  monthly_revenue: selectedProject?.revenueTarget?.toString() || '',
                                  team_size: selectedProject?.team?.length?.toString() || '',
                                },
                              }))
                            }}
                            className="border-blue-300 focus:border-blue-500 focus:ring-blue-500"
                          >
                            <option value="">Select a project...</option>
                            {projects.map((project) => (
                              <option key={project.id} value={project.id}>
                                {project.name} ({project.client})
                              </option>
                            ))}
                          </Select>
                        </div>

                        {state.projectId && (() => {
                          const selectedProject = projects.find(p => p.id === state.projectId)
                          return selectedProject ? (
                            <div className="rounded-lg border-2 border-[#fd8216] bg-[#015e32] p-3 text-xs">
                              <p className="font-semibold text-white">Project Context:</p>
                              <div className="mt-2 grid grid-cols-2 gap-2 text-white/80">
                                <div>
                                  <span className="font-medium">Client:</span> {selectedProject.client}
                                </div>
                                <div>
                                  <span className="font-medium">Type:</span> {selectedProject.type}
                                </div>
                                <div>
                                  <span className="font-medium">Revenue:</span> ${(selectedProject.revenueTarget / 1000).toFixed(0)}k
                                </div>
                                <div>
                                  <span className="font-medium">Team:</span> {selectedProject.team.length} members
                                </div>
                              </div>
                            </div>
                          ) : null
                        })()}

                        <div className="grid grid-cols-2 gap-3">
                          <div className="space-y-2">
                            <label className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Industry</label>
                            <input
                              type="text"
                              value={state.industry || ''}
                              onChange={(event) =>
                                setFormState((current) => ({
                                  ...current,
                                  [agent.id]: { ...state, industry: event.target.value },
                                }))
                              }
                              placeholder="B2B SaaS"
                              className="w-full rounded-md border border-border px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                            />
                          </div>
                          <div className="space-y-2">
                            <label className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                              Monthly Revenue
                              <span className="ml-1 text-[10px] text-slate-400">(override)</span>
                            </label>
                            <input
                              type="number"
                              value={state.monthly_revenue || ''}
                              onChange={(event) =>
                                setFormState((current) => ({
                                  ...current,
                                  [agent.id]: { ...state, monthly_revenue: event.target.value },
                                }))
                              }
                              placeholder="Auto from project"
                              className="w-full rounded-md border border-border px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                            />
                          </div>
                        </div>

                        <div className="space-y-2">
                          <label className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Files & Context</label>
                          <Textarea
                            value={state.notes}
                            onChange={(event) =>
                              setFormState((current) => ({
                                ...current,
                                [agent.id]: { ...state, notes: event.target.value },
                              }))
                            }
                            placeholder="Paste data, add context, describe files uploaded..."
                            rows={3}
                          />
                          <p className="text-[10px] text-muted-foreground">Tip: Upload CSV/XLSX exports, CRM data, or paste relevant context</p>
                        </div>
                      </>
                    ) : (
                      // Standard agent inputs
                      <>
                        <div className="space-y-2">
                          <label className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Project Context</label>
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
                          <label className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Notes</label>
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
                      </>
                    )}

                    <Button
                      type="button"
                      onClick={() => handleRun(agent.id)}
                      className={isSpecialized ? "bg-blue-600 hover:bg-blue-700" : ""}
                    >
                      {isClarity ? 'Run Clarity Audit' : isSpecialized ? 'Run Agent' : 'Run Agent'}
                    </Button>
                  </div>

                  <details className="mt-4 rounded-lg border-2 border-dashed border-[#fd8216] bg-[#015e32] p-3 text-xs text-white/80">
                    <summary className="cursor-pointer text-white font-medium">Prompt Blueprint</summary>
                    <p className="mt-2 whitespace-pre-wrap text-white/70">{agent.prompt}</p>
                  </details>
                </div>
              )
            })}
          </CardContent>
        </Card>
        <Card className="border-border">
          <CardHeader className="pb-4">
            <CardTitle className="text-lg font-semibold">Category Snapshot</CardTitle>
            <CardDescription>Ensure balanced automation coverage.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3 pt-4 text-sm text-muted-foreground">
            {Object.entries(categoryBreakdown).map(([category, count]) => (
              <div key={category} className="flex items-center justify-between rounded-lg border border-border bg-card p-3 shadow-sm">
                <span className="font-medium text-muted-foreground">{category}</span>
                <Badge variant="outline" className="border-border text-muted-foreground">
                  {count}
                </Badge>
              </div>
            ))}
            <div className="rounded-lg border border-border bg-card p-3 shadow-sm">
              <p className="text-xs uppercase tracking-widest text-muted-foreground">Total Runs</p>
              <p className="mt-1 text-2xl font-semibold text-foreground">{automationLogs.length}</p>
            </div>
            <div className="rounded-lg border border-border bg-card p-3 shadow-sm">
              <p className="text-xs uppercase tracking-widest text-muted-foreground">Hours Saved</p>
              <p className="mt-1 text-2xl font-semibold text-foreground">{(automationLogs.length * 1.5).toFixed(1)}</p>
            </div>
          </CardContent>
        </Card>
      </section>

      <Card className="border-border">
        <CardHeader className="pb-4">
          <CardTitle className="text-lg font-semibold">Automation Activity</CardTitle>
          <CardDescription>Latest agent executions and outcomes.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4 pt-4">
          {automationLogs.length === 0 ? (
            <p className="text-sm text-muted-foreground">No automation runs recorded yet.</p>
          ) : (
            automationLogs
              .slice()
              .sort((a, b) => (a.createdAt > b.createdAt ? -1 : 1))
              .map((log) => {
                const agent = agents.find((item) => item.id === log.agentId)
                const project = log.projectId
                  ? projects.find((item) => item.id === log.projectId)?.name
                  : 'Standalone run'
                const isClarity = agent?.id === 'agent-clarity-bot'
                const isSpecialized = agent?.id && isSpecializedAgent(agent.id)

                return (
                  <div
                    key={log.id}
                    className="rounded-lg border-2 border-[#fd8216] bg-[#004d28] p-4 shadow-sm"
                  >
                    <div className="flex items-center justify-between text-sm font-medium text-foreground">
                      <div className="flex items-center gap-2">
                        <span>{agent?.name ?? log.agentId}</span>
                        {isClarity && (
                          <Badge variant="outline" className="border-blue-500 text-blue-700 text-[10px]">
                            AUDIT
                          </Badge>
                        )}
                      </div>
                      <span className="text-xs text-muted-foreground suppress-hydration-warning">
                        {new Date(log.createdAt).toLocaleString()}
                      </span>
                    </div>
                    <p className="mt-2 text-sm text-muted-foreground">{log.summary}</p>
                    <div className="mt-2 flex items-center gap-2 text-xs text-muted-foreground">
                      <Badge variant="outline" className="border-border text-muted-foreground">
                        {project ?? 'Unassigned'}
                      </Badge>
                      <Badge
                        variant="outline"
                        className={isSpecialized ? 'border-blue-500 text-blue-600' : 'border-emerald-500 text-emerald-600'}
                      >
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
