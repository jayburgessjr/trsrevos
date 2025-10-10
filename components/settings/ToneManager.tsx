"use client"

import { useState, useTransition } from "react"
import { Loader2 } from "lucide-react"

import { updateAgentBehavior } from "@/app/settings/actions"
import type { AgentBehavior, AgentBehaviorMap } from "@/lib/agents/types"

type ToneManagerProps = {
  agents: Array<{ id: string; name: string }>
  behavior: AgentBehaviorMap
}

const TONES: AgentBehavior["tone"][] = ["Professional", "Casual", "Analytical", "Warm"]
const VERBOSITY: AgentBehavior["verbosity"][] = ["Short", "Balanced", "Detailed"]

export function ToneManager({ agents, behavior }: ToneManagerProps) {
  const [drafts, setDrafts] = useState<AgentBehaviorMap>(behavior)
  const [pendingId, setPendingId] = useState<string | null>(null)
  const [toast, setToast] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [pending, startTransition] = useTransition()

  const handleChange = (agentId: string, updater: (value: AgentBehavior) => AgentBehavior) => {
    setDrafts((prev) => ({
      ...prev,
      [agentId]: updater(prev[agentId] ?? defaultBehavior()),
    }))
  }

  const handleSave = (agentId: string) => {
    const payload = drafts[agentId] ?? defaultBehavior()
    setError(null)
    setToast(null)
    setPendingId(agentId)
    startTransition(async () => {
      try {
        await updateAgentBehavior(agentId, payload)
        setToast(`${agents.find((agent) => agent.id === agentId)?.name ?? "Agent"} updated`)
      } catch (err) {
        setError((err as Error).message ?? "Unable to update behavior")
      } finally {
        setPendingId(null)
      }
    })
  }

  return (
    <section className="rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] p-6 space-y-4">
      <div className="space-y-1">
        <h3 className="text-sm font-semibold text-[var(--color-text)]">AI Tone &amp; Behavior</h3>
        <div className="text-xs text-gray-500">
          Calibrate narrative style, verbosity, and generation parameters for every TRS agent.
        </div>
      </div>

      {error ? (
        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-2 text-xs text-red-700">
          {error}
        </div>
      ) : null}
      {toast ? (
        <div className="rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-[11px] text-emerald-700">
          {toast}
        </div>
      ) : null}

      <div className="grid gap-4 lg:grid-cols-2">
        {agents.map((agent) => {
          const values = drafts[agent.id] ?? defaultBehavior()
          return (
            <article
              key={agent.id}
              className="space-y-4 rounded-lg border border-[var(--color-border)] bg-[var(--color-bg)] p-4"
            >
              <header className="space-y-1">
                <p className="text-sm font-semibold text-[var(--color-text)]">{agent.name}</p>
                <p className="text-[11px] text-gray-500">Behaviour overrides apply system-wide.</p>
              </header>

              <div className="grid gap-3 text-xs">
                <FieldBlock label="Tone">
                  <Select
                    value={values.tone}
                    onChange={(value) =>
                      handleChange(agent.id, (draft) => ({ ...draft, tone: value as AgentBehavior["tone"] }))
                    }
                    options={TONES}
                  />
                </FieldBlock>
                <FieldBlock label="Verbosity">
                  <Select
                    value={values.verbosity}
                    onChange={(value) =>
                      handleChange(agent.id, (draft) => ({
                        ...draft,
                        verbosity: value as AgentBehavior["verbosity"],
                      }))
                    }
                    options={VERBOSITY}
                  />
                </FieldBlock>
                <FieldBlock label="Temperature">
                  <Slider
                    min={0}
                    max={1}
                    step={0.05}
                    value={values.temperature}
                    onChange={(value) =>
                      handleChange(agent.id, (draft) => ({ ...draft, temperature: value }))
                    }
                  />
                  <span className="text-[11px] text-gray-500">
                    {values.temperature.toFixed(2)} • Controls creative variance
                  </span>
                </FieldBlock>
                <FieldBlock label="Max Tokens">
                  <input
                    type="number"
                    min={200}
                    max={3200}
                    step={50}
                    value={values.maxTokens}
                    onChange={(event) =>
                      handleChange(agent.id, (draft) => ({
                        ...draft,
                        maxTokens: Number.parseInt(event.target.value, 10),
                      }))
                    }
                    className="h-10 w-full rounded-md border border-[var(--color-border)] bg-[var(--color-surface)] px-3"
                  />
                </FieldBlock>
                <FieldBlock label="Response Delay (ms)">
                  <Slider
                    min={0}
                    max={2000}
                    step={50}
                    value={values.responseDelayMs}
                    onChange={(value) =>
                      handleChange(agent.id, (draft) => ({
                        ...draft,
                        responseDelayMs: value,
                      }))
                    }
                  />
                  <span className="text-[11px] text-gray-500">
                    {values.responseDelayMs}ms • Orchestrates human-like pacing
                  </span>
                </FieldBlock>
              </div>

              <div className="flex justify-end">
                <button
                  type="button"
                  onClick={() => handleSave(agent.id)}
                  className="inline-flex items-center gap-2 rounded-lg bg-[var(--color-text)] px-4 py-2 text-xs font-semibold uppercase tracking-wide text-[var(--color-bg)] shadow-sm disabled:cursor-not-allowed disabled:opacity-60"
                  disabled={pending && pendingId === agent.id}
                >
                  {pending && pendingId === agent.id ? (
                    <Loader2 size={14} className="animate-spin" />
                  ) : null}
                  Save
                </button>
              </div>
            </article>
          )
        })}
      </div>
    </section>
  )
}

function FieldBlock({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="space-y-2">
      <p className="text-[11px] font-semibold uppercase tracking-wide text-gray-500">{label}</p>
      {children}
    </div>
  )
}

type SelectProps = {
  value: string
  onChange: (value: string) => void
  options: string[]
}

function Select({ value, onChange, options }: SelectProps) {
  return (
    <select
      value={value}
      onChange={(event) => onChange(event.target.value)}
      className="h-10 w-full rounded-md border border-[var(--color-border)] bg-[var(--color-surface)] px-3 text-[var(--color-text)]"
    >
      {options.map((option) => (
        <option key={option} value={option}>
          {option}
        </option>
      ))}
    </select>
  )
}

type SliderProps = {
  value: number
  onChange: (value: number) => void
  min: number
  max: number
  step: number
}

function Slider({ value, onChange, min, max, step }: SliderProps) {
  return (
    <input
      type="range"
      min={min}
      max={max}
      step={step}
      value={value}
      onChange={(event) => onChange(Number.parseFloat(event.target.value))}
      className="w-full accent-[var(--color-accent)]"
    />
  )
}

function defaultBehavior(): AgentBehavior {
  return {
    tone: "Professional",
    verbosity: "Balanced",
    temperature: 0.5,
    maxTokens: 1200,
    responseDelayMs: 100,
  }
}
