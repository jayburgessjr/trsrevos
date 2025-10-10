"use client"

import { useMemo, useState, type InputHTMLAttributes } from "react"
import { usePathname, useSearchParams } from "next/navigation"
import { Cpu, Database, Eye, Key, RefreshCw, Save, Settings, Wrench } from "lucide-react"

import { Button } from "@/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/ui/card"
import { Input } from "@/ui/input"
import { PageDescription, PageTitle } from "@/ui/page-header"
import { Select } from "@/ui/select"
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from "@/ui/sheet"
import { cn } from "@/lib/utils"
import { TRS_CARD, TRS_SECTION_TITLE, TRS_SUBTITLE } from "@/lib/style"
import { resolveTabs } from "@/lib/tabs"
import { useTheme } from "@/lib/theme-provider"

type Agent = {
  id: string
  name: string
  model: string
  temperature: number
  role: string
  mode: "Reactive" | "Scheduled" | "Manual"
  lastBuild: string
  lastCommit: string
  config: string
}

const initialAgents: Agent[] = [
  {
    id: "rosie",
    name: "Rosie",
    model: "gpt-4o",
    temperature: 0.7,
    role: "Operator Copilot",
    mode: "Reactive",
    lastBuild: "Oct 9, 2025",
    lastCommit: "main@8d3f1c0",
    config: JSON.stringify(
      {
        persona: "Rosie",
        purpose: "Guide revenue leaders through workflows",
        tone: "Executive",
        escalation: {
          threshold: 0.65,
          notify: ["jay@trs.ai"],
        },
      },
      null,
      2,
    ),
  },
  {
    id: "qra",
    name: "Quantum Revenue Algorithm",
    model: "gpt-4o-mini",
    temperature: 0.5,
    role: "Portfolio Recommender",
    mode: "Scheduled",
    lastBuild: "Oct 8, 2025",
    lastCommit: "main@5ab9ef2",
    config: JSON.stringify(
      {
        cadence: "0 6 * * *",
        objective: "Monitor margin uplift",
        datasets: ["pipeline", "projects"],
        outputs: ["summary", "prioritized_actions"],
      },
      null,
      2,
    ),
  },
  {
    id: "pricing",
    name: "Pricing Thermometer",
    model: "claude-3.5-sonnet",
    temperature: 0.4,
    role: "Elasticity Model",
    mode: "Reactive",
    lastBuild: "Oct 6, 2025",
    lastCommit: "pricing@2c1eafe",
    config: JSON.stringify(
      {
        benchmark: "median_win_rate",
        tolerance: 0.12,
        alerts: {
          destinations: ["pricing@trs.ai"],
          trigger: "variance",
        },
      },
      null,
      2,
    ),
  },
]

export default function ControlCenterPage() {
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const tabs = useMemo(() => resolveTabs(pathname), [pathname])
  const activeTab = useMemo(() => {
    const current = searchParams.get("tab")
    return current && tabs.includes(current) ? current : tabs[0]
  }, [searchParams, tabs])
  const { theme, setTheme } = useTheme()
  const [agents, setAgents] = useState<Agent[]>(initialAgents)
  const [selectedAgentId, setSelectedAgentId] = useState<string | null>(initialAgents[0]?.id ?? null)
  const [editingAgent, setEditingAgent] = useState<Agent | null>(initialAgents[0] ?? null)
  const [drawerAgent, setDrawerAgent] = useState<Agent | null>(null)

  const selectedAgent = useMemo(
    () => agents.find((agent) => agent.id === selectedAgentId) ?? null,
    [agents, selectedAgentId],
  )

  const configIsValid = useMemo(() => {
    if (!editingAgent) return true
    try {
      JSON.parse(editingAgent.config)
      return true
    } catch (error) {
      return false
    }
  }, [editingAgent])

  const handleSelectAgent = (agent: Agent) => {
    setSelectedAgentId(agent.id)
    setEditingAgent(agent)
  }

  const handleSaveAgent = () => {
    if (!editingAgent || !configIsValid) return
    setAgents((prev) => prev.map((agent) => (agent.id === editingAgent.id ? editingAgent : agent)))
  }

  const handleRebuildAgent = async (agentId: string) => {
    try {
      await fetch(`/api/rebuild?agent=${agentId}`)
    } catch (error) {
      console.error("Rebuild failed", error)
    }
  }

  return (
    <>
      <div className="mx-auto max-w-7xl space-y-4 px-4 py-4">
        <Card className={TRS_CARD}>
          <CardContent className="flex flex-col gap-4 p-4 md:flex-row md:items-center md:justify-between">
            <div>
              <div className="flex items-center gap-2 text-black">
                <Settings size={20} />
                <PageTitle className="text-2xl font-semibold text-black">TRS Control Center</PageTitle>
              </div>
              <PageDescription className="mt-1 text-sm text-gray-500">
                Operate RevenueOS without code — configure appearance, AI agents, integrations, and platform governance.
              </PageDescription>
            </div>
            <div className="flex flex-col items-end gap-1 text-right text-gray-500">
              <span className="text-xs font-medium">Environment</span>
              <span className="text-sm font-semibold text-black">Production</span>
            </div>
          </CardContent>
        </Card>

        {activeTab === "Appearance" && (
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
            <Card className={TRS_CARD}>
              <CardHeader className="border-b border-gray-200 px-6 py-5">
                <CardTitle className="flex items-center gap-2 text-lg text-black">
                  <Eye size={16} /> Theme &amp; Layout
                </CardTitle>
              </CardHeader>
              <CardContent className="px-6 py-5">
                <div className="grid gap-4 text-sm text-gray-600">
                  <div className="flex items-center justify-between">
                    <span className={TRS_SECTION_TITLE}>Mode</span>
                    <div className="flex gap-2">
                      <Button
                        variant={theme === "light" ? "default" : "outline"}
                        size="sm"
                        className="rounded-lg px-4 text-xs font-medium"
                        onClick={() => setTheme("light")}
                      >
                        Light
                      </Button>
                      <Button
                        variant={theme === "dark" ? "default" : "outline"}
                        size="sm"
                        className="rounded-lg px-4 text-xs font-medium"
                        onClick={() => setTheme("dark")}
                      >
                        Dark
                      </Button>
                    </div>
                  </div>
                  <div className="grid gap-2">
                    <span className={TRS_SECTION_TITLE}>Accent Preview</span>
                    <div className="flex gap-3">
                      <div className="h-10 flex-1 rounded-lg bg-black shadow-inner" />
                      <div className="h-10 flex-1 rounded-lg bg-gray-900/80" />
                    </div>
                  </div>
                  <div className="grid gap-2">
                    <span className={TRS_SECTION_TITLE}>UI Density</span>
                    <Select defaultValue="comfortable" className="w-48">
                      <option value="comfortable">Comfortable</option>
                      <option value="compact">Compact</option>
                      <option value="expanded">Expanded</option>
                    </Select>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className={TRS_CARD}>
              <CardHeader className="border-b border-gray-200 px-6 py-5">
                <CardTitle className="flex items-center gap-2 text-lg text-black">Brand Controls</CardTitle>
              </CardHeader>
              <CardContent className="px-6 py-5">
                <div className="grid gap-4 text-sm text-gray-600">
                  <div className="grid gap-1">
                    <span className={TRS_SECTION_TITLE}>Logotype</span>
                    <Input placeholder="https://cdn.trs.ai/logo.svg" className="w-full" />
                    <span className={TRS_SUBTITLE}>Rendered across dashboards and outbound comms.</span>
                  </div>
                  <div className="grid gap-1">
                    <span className={TRS_SECTION_TITLE}>Accent Color</span>
                    <Input type="color" defaultValue="#111827" className="h-10 w-24 rounded-md border border-gray-200" />
                    <span className={TRS_SUBTITLE}>Preview updates live on marketing experiences.</span>
                  </div>
                  <div className="grid gap-1">
                    <span className={TRS_SECTION_TITLE}>Surface Frosting</span>
                    <Select defaultValue="subtle" className="w-48">
                      <option value="none">None</option>
                      <option value="subtle">Subtle</option>
                      <option value="strong">Strong</option>
                    </Select>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {activeTab === "Integrations" && (
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
            <IntegrationCard
              title="OpenAI Platform"
              description="Primary model provider for Rosie and Revenue Copilots."
              fields={[
                { label: "API Key", placeholder: "sk-live-**********" },
                { label: "Org ID", placeholder: "org_****" },
              ]}
            />
            <IntegrationCard
              title="Anthropic"
              description="Secondary models for pricing intelligence."
              fields={[{ label: "API Key", placeholder: "live-key-********" }]}
            />
            <IntegrationCard
              title="Google Workspace"
              description="Calendar + Meet orchestration."
              fields={[
                { label: "Service Account", placeholder: "revenue-os@trs.iam.gserviceaccount.com" },
                { label: "Calendar ID", placeholder: "trs.ai_343434@group.calendar.google.com" },
              ]}
            />
            <IntegrationCard
              title="Supabase"
              description="Operational data warehouse for RevenueOS."
              fields={[
                { label: "Project URL", placeholder: "https://trs.supabase.co" },
                { label: "Anon Key", placeholder: "sb-live-********" },
              ]}
            />
            <IntegrationCard
              title="Email Delivery"
              description="SMTP + domain alignment for outbound automations."
              fields={[
                { label: "SMTP Host", placeholder: "smtp.postmarkapp.com" },
                { label: "Username", placeholder: "api@trs.ai" },
                { label: "Password", placeholder: "••••••••" },
              ]}
            />
            <IntegrationCard
              title="Data Connectors"
              description="Sync CRM and ERP systems into RevenueOS."
              fields={[
                { label: "Salesforce Instance", placeholder: "trs.lightning.force.com" },
                { label: "NetSuite Token", placeholder: "token-********" },
              ]}
            />
          </div>
        )}

        {activeTab === "AI Config" && (
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
            <Card className={TRS_CARD}>
              <CardHeader className="border-b border-gray-200 px-6 py-5">
                <CardTitle className="flex items-center gap-2 text-lg text-black">
                  <Cpu size={16} /> Global Defaults
                </CardTitle>
              </CardHeader>
              <CardContent className="px-6 py-5">
                <div className="grid gap-4 text-sm text-gray-600">
                  <SelectField label="Tone" options={["Analytical", "Direct", "Empathetic", "Executive"]} />
                  <SelectField label="Response Depth" options={["Summary", "Detailed", "Action Plan"]} />
                  <SelectField label="Execution Mode" options={["Manual", "Scheduled", "Reactive"]} />
                </div>
              </CardContent>
            </Card>

            <Card className={TRS_CARD}>
              <CardHeader className="border-b border-gray-200 px-6 py-5">
                <CardTitle className="flex items-center gap-2 text-lg text-black">Guardrails</CardTitle>
              </CardHeader>
              <CardContent className="px-6 py-5">
                <div className="grid gap-4 text-sm text-gray-600">
                  <div className="grid gap-1">
                    <span className={TRS_SECTION_TITLE}>Escalation Threshold</span>
                    <Input type="number" defaultValue={0.7} min={0} max={1} step={0.05} className="w-32" />
                    <span className={TRS_SUBTITLE}>Trigger human review when confidence dips.</span>
                  </div>
                  <div className="grid gap-1">
                    <span className={TRS_SECTION_TITLE}>Max Tokens / Response</span>
                    <Input type="number" defaultValue={1200} className="w-32" />
                    <span className={TRS_SUBTITLE}>Hard stop for long-form generation.</span>
                  </div>
                  <div className="grid gap-1">
                    <span className={TRS_SECTION_TITLE}>Allowed Integrations</span>
                    <Select multiple className="h-28 w-full">
                      <option>CRM</option>
                      <option>ERP</option>
                      <option>Billing</option>
                      <option>Attribution</option>
                    </Select>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {activeTab === "Agents" && (
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1fr,1.2fr]">
            <Card className={TRS_CARD}>
              <CardHeader className="border-b border-gray-200 px-6 py-4">
                <CardTitle className="flex items-center gap-2 text-lg text-black">
                  <Wrench size={16} /> AI Agents
                </CardTitle>
              </CardHeader>
              <CardContent className="px-6 py-4">
                <div className="space-y-3">
                  {agents.map((agent) => {
                    const isActive = agent.id === selectedAgentId
                    return (
                      <button
                        key={agent.id}
                        type="button"
                        onClick={() => handleSelectAgent(agent)}
                        className={cn(
                          "w-full rounded-lg border px-4 py-3 text-left transition",
                          isActive ? "border-black bg-gray-50" : "border-gray-200 hover:bg-gray-50",
                        )}
                      >
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-sm font-semibold text-black">{agent.name}</p>
                            <p className="text-xs text-gray-500">{agent.role}</p>
                          </div>
                          <span className="text-xs font-medium text-gray-500">{agent.mode}</span>
                        </div>
                        <div className="mt-2 flex items-center justify-between text-[11px] text-gray-400">
                          <span>{agent.model}</span>
                          <span>Last build {agent.lastBuild}</span>
                        </div>
                      </button>
                    )
                  })}
                </div>
              </CardContent>
            </Card>

            <Card className={TRS_CARD}>
              <CardHeader className="border-b border-gray-200 px-6 py-4">
                <CardTitle className="text-lg text-black">Configuration</CardTitle>
              </CardHeader>
              <CardContent className="px-6 py-4">
                {!selectedAgent && <p className="text-sm text-gray-500">Select an agent to configure.</p>}
                {selectedAgent && editingAgent && (
                  <div className="flex h-full flex-col gap-4">
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <LabeledInput
                        label="Name"
                        value={editingAgent.name}
                        onChange={(event) => setEditingAgent({ ...editingAgent, name: event.target.value })}
                      />
                      <LabeledInput
                        label="Model"
                        value={editingAgent.model}
                        onChange={(event) => setEditingAgent({ ...editingAgent, model: event.target.value })}
                      />
                      <LabeledInput
                        label="Temperature"
                        type="number"
                        step={0.1}
                        min={0}
                        max={1}
                        value={editingAgent.temperature}
                        onChange={(event) =>
                          setEditingAgent({ ...editingAgent, temperature: Number(event.target.value) })
                        }
                      />
                      <LabeledInput
                        label="Role"
                        value={editingAgent.role}
                        onChange={(event) => setEditingAgent({ ...editingAgent, role: event.target.value })}
                      />
                      <div className="col-span-2">
                        <span className={TRS_SECTION_TITLE}>Prompt &amp; Logic JSON</span>
                        <textarea
                          value={editingAgent.config}
                          onChange={(event) => setEditingAgent({ ...editingAgent, config: event.target.value })}
                          className="mt-2 h-48 w-full rounded-lg border border-gray-200 bg-gray-50 p-3 font-mono text-xs text-gray-800 focus-visible:border-black focus-visible:outline-none"
                        />
                        {!configIsValid && (
                          <p className="mt-1 text-xs text-red-500">JSON is invalid — please fix before saving.</p>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center justify-between text-xs text-gray-500">
                      <span>Last build {selectedAgent.lastBuild}</span>
                      <span>Commit {selectedAgent.lastCommit}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex gap-2">
                        <Button
                          type="button"
                          variant="primary"
                          size="sm"
                          className="rounded-lg px-4"
                          disabled={!configIsValid}
                          onClick={handleSaveAgent}
                        >
                          <Save size={14} /> Save Configuration
                        </Button>
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          className="rounded-lg px-4"
                          onClick={() => handleRebuildAgent(selectedAgent.id)}
                        >
                          <RefreshCw size={14} /> Rebuild
                        </Button>
                      </div>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="rounded-lg text-xs text-gray-500"
                        onClick={() => setDrawerAgent(selectedAgent)}
                      >
                        Inspect build
                      </Button>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        )}

        {activeTab === "Diagnostics" && (
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
            <Card className={TRS_CARD}>
              <CardHeader className="border-b border-gray-200 px-6 py-5">
                <CardTitle className="flex items-center gap-2 text-lg text-black">
                  <Database size={16} /> Platform Health
                </CardTitle>
              </CardHeader>
              <CardContent className="px-6 py-5">
                <DiagnosticRow label="System Uptime" value="99.97%" />
                <DiagnosticRow label="API Latency" value="105 ms" />
                <DiagnosticRow label="Token Usage" value="4,990 / day" />
                <DiagnosticRow label="Queue Backlog" value="0 tasks" />
              </CardContent>
            </Card>
            <Card className={TRS_CARD}>
              <CardHeader className="border-b border-gray-200 px-6 py-5">
                <CardTitle className="flex items-center gap-2 text-lg text-black">Build Info</CardTitle>
              </CardHeader>
              <CardContent className="px-6 py-5">
                <DiagnosticRow label="Current Release" value="2025.10.09" />
                <DiagnosticRow label="Next Scheduled Rebuild" value="Oct 15, 2025" />
                <DiagnosticRow label="Last Rebuild Duration" value="2m 43s" />
                <DiagnosticRow label="Node Version" value="18.18.0" />
              </CardContent>
            </Card>
          </div>
        )}
      </div>

      <Sheet open={!!drawerAgent} onOpenChange={(open) => !open && setDrawerAgent(null)}>
        <SheetContent className="w-[360px]">
          <SheetHeader>
            <SheetTitle>Agent Build</SheetTitle>
            {drawerAgent && (
              <SheetDescription>
                Review build metadata and update deployment parameters for {drawerAgent.name}.
              </SheetDescription>
            )}
          </SheetHeader>
          {drawerAgent && (
            <div className="mt-6 space-y-4 text-sm text-gray-600">
              <div className="grid gap-1">
                <span className={TRS_SECTION_TITLE}>Model</span>
                <span className="text-sm text-black">{drawerAgent.model}</span>
                <span className={TRS_SUBTITLE}>Temperature {drawerAgent.temperature.toFixed(1)}</span>
              </div>
              <div className="grid gap-1">
                <span className={TRS_SECTION_TITLE}>Deployment Branch</span>
                <Input defaultValue="main" />
              </div>
              <div className="grid gap-1">
                <span className={TRS_SECTION_TITLE}>Execution Mode</span>
                <Select defaultValue={drawerAgent.mode}>
                  <option value="Reactive">Reactive</option>
                  <option value="Scheduled">Scheduled</option>
                  <option value="Manual">Manual</option>
                </Select>
              </div>
              <div className="grid gap-1">
                <span className={TRS_SECTION_TITLE}>Trigger Pipeline</span>
                <Select defaultValue="full">
                  <option value="full">Full rebuild</option>
                  <option value="prompt-only">Prompt only</option>
                  <option value="config">Configuration sync</option>
                </Select>
              </div>
              <div className="grid gap-2">
                <span className={TRS_SECTION_TITLE}>Changelog Notes</span>
                <textarea className="h-24 w-full rounded-lg border border-gray-200 p-3 text-xs text-gray-800" placeholder="Document what changed for this release." />
              </div>
            </div>
          )}
          <SheetFooter className="mt-8 gap-3">
            {drawerAgent && (
              <Button
                type="button"
                variant="primary"
                size="sm"
                className="rounded-lg px-4"
                onClick={() => {
                  handleRebuildAgent(drawerAgent.id)
                  setDrawerAgent(null)
                }}
              >
                <RefreshCw size={14} /> Rebuild agent
              </Button>
            )}
          </SheetFooter>
        </SheetContent>
      </Sheet>
    </>
  )
}

function IntegrationCard({
  title,
  description,
  fields,
}: {
  title: string
  description: string
  fields: Array<{ label: string; placeholder: string }>
}) {
  return (
    <Card className={TRS_CARD}>
      <CardHeader className="border-b border-gray-200 px-6 py-5">
        <CardTitle className="flex items-center gap-2 text-lg text-black">
          <Key size={16} /> {title}
        </CardTitle>
      </CardHeader>
      <CardContent className="px-6 py-5">
        <p className="mb-4 text-xs text-gray-500">{description}</p>
        <div className="space-y-3">
          {fields.map((field) => (
            <div key={field.label} className="grid gap-1 text-sm">
              <span className={TRS_SECTION_TITLE}>{field.label}</span>
              <Input placeholder={field.placeholder} className="w-full" />
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}

function SelectField({ label, options }: { label: string; options: string[] }) {
  return (
    <div className="grid gap-1">
      <span className={TRS_SECTION_TITLE}>{label}</span>
      <Select defaultValue={options[0]} className="w-full">
        {options.map((option) => (
          <option key={option} value={option}>
            {option}
          </option>
        ))}
      </Select>
    </div>
  )
}

function LabeledInput({ label, ...props }: InputHTMLAttributes<HTMLInputElement> & { label: string }) {
  return (
    <label className="grid gap-1 text-sm text-gray-600">
      <span className={TRS_SECTION_TITLE}>{label}</span>
      <Input {...props} />
    </label>
  )
}

function DiagnosticRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between border-b border-dashed border-gray-200 py-2 text-sm">
      <span className="text-gray-500">{label}</span>
      <span className="font-semibold text-black">{value}</span>
    </div>
  )
}
