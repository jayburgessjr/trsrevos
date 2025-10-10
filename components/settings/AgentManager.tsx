"use client"

import { useMemo, useState, useTransition } from "react"
import { AlertTriangle, CheckCircle2, Loader2, RefreshCcw, Settings2, Wrench } from "lucide-react"

import { performAgentAction, updateAgentParameters } from "@/app/settings/actions"
import type { AgentDefinition, AgentParameters } from "@/lib/agents/types"
import { cn } from "@/lib/utils"
import { Input } from "@/ui/input"
import { Textarea } from "@/ui/textarea"

type AgentManagerProps = {
  agents: AgentDefinition[]
}

type DrawerMode = "view" | "edit"

const statusMap: Record<
  AgentDefinition["status"],
  { label: string; tone: string; icon: typeof CheckCircle2 }
> = {
  active: { label: "Active", tone: "text-emerald-600", icon: CheckCircle2 },
  disabled: { label: "Disabled", tone: "text-gray-500", icon: AlertTriangle },
  needs_update: { label: "Needs Update", tone: "text-amber-600", icon: RefreshCcw },
}

export function AgentManager({ agents: defaultAgents }: AgentManagerProps) {
  const [agents, setAgents] = useState(defaultAgents)
  const [openDrawerFor, setOpenDrawerFor] = useState<string | null>(null)
  const [drawerMode, setDrawerMode] = useState<DrawerMode>("view")
  const [paramsDraft, setParamsDraft] = useState<AgentParameters | null>(null)
  const [pending, startTransition] = useTransition()
  const [error, setError] = useState<string | null>(null)

  const selectedAgent = useMemo(
    () => agents.find((agent) => agent.id === openDrawerFor) ?? null,
    [agents, openDrawerFor],
  )

  const handleInspect = (agent: AgentDefinition, mode: DrawerMode) => {
    setError(null)
    setDrawerMode(mode)
    setParamsDraft(agent.parameters)
    setOpenDrawerFor(agent.id)
  }

  const handleSave = () => {
    if (!selectedAgent || !paramsDraft) return
    setError(null)
    startTransition(async () => {
      try {
        const updated = await updateAgentParameters(selectedAgent.id, paramsDraft)
        setAgents((prev) => prev.map((agent) => (agent.id === updated.id ? updated : agent)))
        setDrawerMode("view")
      } catch (err) {
        console.error(err)
        setError((err as Error).message ?? "Unable to save configuration")
      }
    })
  }

  const runAgentAction = (agentId: string, action: "retrain" | "deploy") => {
    setError(null)
    startTransition(async () => {
      try {
        const updated = await performAgentAction(agentId, action)
        setAgents((prev) => prev.map((agent) => (agent.id === updated.id ? updated : agent)))
        if (updated.id === openDrawerFor) {
          setParamsDraft(updated.parameters)
        }
      } catch (err) {
        console.error(err)
        setError((err as Error).message ?? "Agent action failed")
      }
    })
  }

  return (
    <section className="rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] p-6 space-y-4">
      <div className="space-y-1">
        <h3 className="text-sm font-semibold text-[var(--color-text)]">AI Agent Management</h3>
        <div className="text-xs text-gray-500">
          Review runtime status for every TRS intelligence worker and push updates in place.
        </div>
      </div>

      {error ? (
        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-2 text-xs text-red-700">
          {error}
        </div>
      ) : null}

      <div className="grid gap-4 lg:grid-cols-2">
        {agents.map((agent) => {
          const status = statusMap[agent.status]
          const StatusIcon = status.icon
          return (
            <article
              key={agent.id}
              className="flex h-full flex-col justify-between rounded-lg border border-[var(--color-border)] bg-[var(--color-bg)] p-5 shadow-sm"
            >
              <div className="space-y-4">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-sm font-semibold text-[var(--color-text)]">{agent.name}</p>
                    <p className="text-xs text-gray-500">{agent.purpose}</p>
                  </div>
                  <span
                    className={cn(
                      "inline-flex items-center gap-1 rounded-full border border-[var(--color-border)] px-2 py-1 text-[11px] font-semibold",
                      status.tone,
                    )}
                  >
                    <StatusIcon size={12} />
                    {status.label}
                  </span>
                </div>
                <div className="grid grid-cols-2 gap-2 text-[11px] text-gray-500">
                  <InfoBlock label="Build" value={agent.buildVersion} />
                  <InfoBlock
                    label="Last Deploy"
                    value={new Date(agent.lastDeployAt).toLocaleString(undefined, {
                      month: "short",
                      day: "numeric",
                    })}
                  />
                  <InfoBlock label="Model" value={agent.parameters.model} />
                  <InfoBlock label="Temperature" value={agent.parameters.temperature.toFixed(2)} />
                </div>
                <div>
                  <p className="text-[11px] font-semibold uppercase tracking-wide text-gray-500">
                    Permissions
                  </p>
                  <div className="mt-2 flex flex-wrap gap-2">
                    {agent.parameters.permissions.map((scope) => (
                      <span
                        key={scope}
                        className="inline-flex items-center rounded-full border border-dashed border-[var(--color-border)] px-2 py-[2px] text-[10px] font-medium uppercase tracking-wide text-gray-500"
                      >
                        {scope}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              <div className="mt-4 flex flex-wrap gap-2">
                <ControlButton onClick={() => handleInspect(agent, "view")} icon={Settings2}>
                  Inspect
                </ControlButton>
                <ControlButton onClick={() => handleInspect(agent, "edit")} icon={Wrench}>
                  Edit Config
                </ControlButton>
                <ControlButton
                  onClick={() => runAgentAction(agent.id, "retrain")}
                  icon={RefreshCcw}
                  disabled={pending}
                >
                  Retrain
                </ControlButton>
                <ControlButton
                  onClick={() => runAgentAction(agent.id, "deploy")}
                  icon={CheckCircle2}
                  disabled={pending}
                >
                  Deploy Update
                </ControlButton>
              </div>
            </article>
          )
        })}
      </div>

      <AgentDrawer
        open={Boolean(selectedAgent)}
        mode={drawerMode}
        agent={selectedAgent}
        parameters={paramsDraft}
        onClose={() => setOpenDrawerFor(null)}
        onModeChange={setDrawerMode}
        onParametersChange={setParamsDraft}
        onSave={handleSave}
        saving={pending}
      />
    </section>
  )
}

function InfoBlock({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] p-3">
      <p className="text-[10px] uppercase tracking-wide text-gray-500">{label}</p>
      <p className="mt-1 text-xs font-semibold text-[var(--color-text)]">{value}</p>
    </div>
  )
}

type ControlButtonProps = {
  children: React.ReactNode
  onClick?: () => void
  icon: React.ComponentType<{ size?: number | string }>
  disabled?: boolean
}

function ControlButton({ children, onClick, icon: Icon, disabled }: ControlButtonProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className="inline-flex items-center gap-2 rounded-lg border border-[var(--color-border)] bg-[var(--color-bg)] px-3 py-2 text-xs font-semibold text-[var(--color-text)] shadow-sm transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
    >
      <Icon size={14} />
      {children}
    </button>
  )
}

type AgentDrawerProps = {
  open: boolean
  mode: DrawerMode
  agent: AgentDefinition | null
  parameters: AgentParameters | null
  onClose: () => void
  onModeChange: (mode: DrawerMode) => void
  onParametersChange: (params: AgentParameters) => void
  onSave: () => void
  saving: boolean
}

function AgentDrawer({
  open,
  mode,
  agent,
  parameters,
  onClose,
  onModeChange,
  onParametersChange,
  onSave,
  saving,
}: AgentDrawerProps) {
  if (!open || !agent || !parameters) return null

  const handlePermissionsChange = (value: string) => {
    const tokens = value
      .split(",")
      .map((token) => token.trim())
      .filter(Boolean)
    onParametersChange({
      ...parameters,
      permissions: tokens,
    })
  }

  return (
    <div className="fixed inset-0 z-40 flex">
      <div className="absolute inset-0 bg-black/20 backdrop-blur-sm" onClick={onClose} />
      <aside className="relative ml-auto flex h-full w-full max-w-xl flex-col overflow-y-auto border-l border-[var(--color-border)] bg-[var(--color-bg)] p-6 shadow-2xl">
        <header className="flex items-center justify-between">
          <div>
            <p className="text-sm font-semibold text-[var(--color-text)]">{agent.name}</p>
            <p className="text-xs text-gray-500">{agent.purpose}</p>
          </div>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => onModeChange(mode === "view" ? "edit" : "view")}
              className="rounded-lg border border-[var(--color-border)] px-3 py-2 text-xs font-semibold uppercase tracking-wide text-gray-600"
            >
              {mode === "view" ? "Edit" : "Preview"}
            </button>
            <button
              type="button"
              onClick={onClose}
              className="rounded-lg border border-[var(--color-border)] px-3 py-2 text-xs font-semibold uppercase tracking-wide text-gray-500"
            >
              Close
            </button>
          </div>
        </header>

        <div className="mt-6 space-y-6">
          <PreviewField label="Model" value={parameters.model} editable={mode === "edit"}>
            <Input
              value={parameters.model}
              onChange={(event) =>
                onParametersChange({
                  ...parameters,
                  model: event.target.value,
                })
              }
            />
          </PreviewField>
          <PreviewField
            label="Temperature"
            value={parameters.temperature.toFixed(2)}
            editable={mode === "edit"}
          >
            <input
              type="number"
              step="0.05"
              min={0}
              max={1}
              value={parameters.temperature}
              onChange={(event) =>
                onParametersChange({
                  ...parameters,
                  temperature: Number.parseFloat(event.target.value),
                })
              }
              className="h-10 w-full rounded-md border border-[var(--color-border)] bg-[var(--color-surface)] px-3 text-sm"
            />
          </PreviewField>
          <PreviewField
            label="System Prompt"
            value={parameters.systemPrompt}
            editable={mode === "edit"}
          >
            <Textarea
              value={parameters.systemPrompt}
              onChange={(event) =>
                onParametersChange({
                  ...parameters,
                  systemPrompt: event.target.value,
                })
              }
              rows={6}
            />
          </PreviewField>
          <PreviewField
            label="Endpoint"
            value={parameters.apiEndpoint}
            editable={mode === "edit"}
          >
            <Input
              value={parameters.apiEndpoint}
              onChange={(event) =>
                onParametersChange({
                  ...parameters,
                  apiEndpoint: event.target.value,
                })
              }
            />
          </PreviewField>
          <PreviewField
            label="Permissions"
            value={parameters.permissions.join(", ")}
            editable={mode === "edit"}
          >
            <Textarea
              value={parameters.permissions.join(", ")}
              onChange={(event) => handlePermissionsChange(event.target.value)}
              rows={3}
            />
          </PreviewField>
        </div>

        {mode === "edit" ? (
          <div className="mt-8 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="rounded-lg border border-[var(--color-border)] px-4 py-2 text-xs font-semibold uppercase tracking-wide text-gray-500"
              disabled={saving}
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={onSave}
              className="inline-flex items-center gap-2 rounded-lg bg-[var(--color-text)] px-4 py-2 text-xs font-semibold uppercase tracking-wide text-[var(--color-bg)] shadow-sm"
              disabled={saving}
            >
              {saving ? <Loader2 size={14} className="animate-spin" /> : null}
              Save Changes
            </button>
          </div>
        ) : null}
      </aside>
    </div>
  )
}

type PreviewFieldProps = {
  label: string
  value: string
  editable: boolean
  children: React.ReactNode
}

function PreviewField({ label, value, editable, children }: PreviewFieldProps) {
  return (
    <div className="space-y-2">
      <p className="text-[11px] font-semibold uppercase tracking-wide text-gray-500">{label}</p>
      {editable ? (
        children
      ) : (
        <div className="rounded-lg border border-dashed border-[var(--color-border)] bg-[var(--color-surface)] p-3 text-xs text-[var(--color-text)]">
          {value || <span className="text-gray-400">Not configured</span>}
        </div>
      )}
    </div>
  )
}
