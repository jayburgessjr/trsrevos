"use client"

import { useState, useTransition } from "react"
import { Check, Eye, EyeOff, Lock, Save } from "lucide-react"

import { saveIntegrations } from "@/app/settings/actions"
import type { IntegrationSettings } from "@/lib/settings/types"
import { cn } from "@/lib/utils"
import { Input } from "@/ui/input"

type IntegrationsFormProps = {
  initialSettings: IntegrationSettings
}

const SECRET_FIELDS: Array<keyof IntegrationSettings> = [
  "openaiApiKey",
  "googleApiKey",
  "supabaseAnonKey",
]

export function IntegrationsForm({ initialSettings }: IntegrationsFormProps) {
  const [form, setForm] = useState(initialSettings)
  const [maskSecrets, setMaskSecrets] = useState<Record<string, boolean>>(() => {
    return SECRET_FIELDS.reduce(
      (acc, key) => ({
        ...acc,
        [key]: true,
      }),
      {} as Record<string, boolean>,
    )
  })
  const [saved, setSaved] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [pending, startTransition] = useTransition()

  const updateField = <K extends keyof IntegrationSettings>(field: K, value: IntegrationSettings[K]) => {
    setSaved(false)
    setForm((prev) => ({
      ...prev,
      [field]: value,
    }))
  }

  const handleSubmit = () => {
    setError(null)
    startTransition(async () => {
      try {
        await saveIntegrations(form)
        setSaved(true)
      } catch (err) {
        console.error(err)
        setError((err as Error).message ?? "Unable to save integrations")
      }
    })
  }

  return (
    <section className="rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] p-6 space-y-4">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h3 className="text-sm font-semibold text-[var(--color-text)]">API &amp; Integrations</h3>
          <div className="text-xs text-gray-500">
            Manage platform credentials and delivery channels. Values persist to <code>.env.local</code>.
          </div>
        </div>
        <button
          type="button"
          onClick={handleSubmit}
          disabled={pending}
          className="inline-flex items-center gap-2 rounded-lg bg-[var(--color-text)] px-3 py-2 text-xs font-semibold uppercase tracking-wide text-[var(--color-bg)] shadow-sm disabled:cursor-not-allowed disabled:opacity-60"
        >
          {pending ? (
            <span className="flex items-center gap-1">
              <Save size={12} className="animate-spin" />
              Saving...
            </span>
          ) : (
            <>
              <Save size={12} />
              Save
            </>
          )}
        </button>
      </div>

      {error ? (
        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-2 text-xs text-red-700">
          {error}
        </div>
      ) : null}

      <div className="grid gap-4 lg:grid-cols-2">
        <IntegrationField
          label="OpenAI API Key"
          description="Primary LLM provider for copilot workflows."
          value={form.openaiApiKey}
          masked={maskSecrets.openaiApiKey}
          onChange={(value) => updateField("openaiApiKey", value)}
          onToggleMask={() =>
            setMaskSecrets((prev) => ({ ...prev, openaiApiKey: !prev.openaiApiKey }))
          }
        />
        <IntegrationField
          label="Google API Key"
          description="Used for Workspace automations and calendar sync."
          value={form.googleApiKey}
          masked={maskSecrets.googleApiKey}
          onChange={(value) => updateField("googleApiKey", value)}
          onToggleMask={() =>
            setMaskSecrets((prev) => ({ ...prev, googleApiKey: !prev.googleApiKey }))
          }
        />
        <IntegrationField
          label="Supabase Project URL"
          description="Database connection string for persistent governance data."
          value={form.supabaseUrl}
          masked={false}
          onChange={(value) => updateField("supabaseUrl", value)}
        />
        <IntegrationField
          label="Supabase Anon Key"
          description="Client-facing credential for runtime reads."
          value={form.supabaseAnonKey}
          masked={maskSecrets.supabaseAnonKey}
          onChange={(value) => updateField("supabaseAnonKey", value)}
          onToggleMask={() =>
            setMaskSecrets((prev) => ({ ...prev, supabaseAnonKey: !prev.supabaseAnonKey }))
          }
        />
        <IntegrationField
          label="Email Service"
          description="SMTP provider or Gmail workspace service."
          value={form.emailService}
          masked={false}
          onChange={(value) => updateField("emailService", value)}
        />

        <div className="rounded-lg border border-[var(--color-border)] bg-[var(--color-bg)] p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-[var(--color-text)]">Calendar Sync</p>
              <p className="text-[11px] text-gray-500">
                Enable bidirectional calendar orchestration for agents.
              </p>
            </div>
            <Toggle
              checked={form.calendarSyncEnabled}
              onCheckedChange={(value) => updateField("calendarSyncEnabled", value)}
            />
          </div>
          <p className="mt-3 flex items-center gap-2 text-[11px] text-gray-500">
            <Lock size={12} />
            Stored locally on this deployment. Rotate credentials regularly.
          </p>
        </div>
      </div>

      {saved ? (
        <div className="inline-flex items-center gap-2 rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-[11px] font-medium text-emerald-700">
          <Check size={12} />
          Integrations saved
        </div>
      ) : null}
    </section>
  )
}

type IntegrationFieldProps = {
  label: string
  description: string
  value: string
  masked: boolean
  onChange: (value: string) => void
  onToggleMask?: () => void
}

function IntegrationField({
  label,
  description,
  value,
  masked,
  onChange,
  onToggleMask,
}: IntegrationFieldProps) {
  const displayValue = masked ? maskValue(value) : value
  const isSecret = typeof onToggleMask === "function"

  return (
    <div className="rounded-lg border border-[var(--color-border)] bg-[var(--color-bg)] p-4 text-xs">
      <div className="flex items-center justify-between gap-2">
        <p className="text-sm font-semibold text-[var(--color-text)]">{label}</p>
        {isSecret ? (
          <button
            type="button"
            onClick={onToggleMask}
            className="inline-flex items-center gap-1 text-[11px] font-semibold uppercase tracking-wide text-gray-500"
          >
            {masked ? <EyeOff size={12} /> : <Eye size={12} />}
            {masked ? "Reveal" : "Hide"}
          </button>
        ) : null}
      </div>
      <p className="mt-1 text-[11px] text-gray-500">{description}</p>
      <Input
        value={displayValue}
        onChange={(event) => onChange(event.target.value)}
        type={isSecret && masked ? "password" : "text"}
        className={cn(
          "mt-3 h-10 border-[var(--color-border)] bg-[var(--color-surface)] text-[var(--color-text)]",
          masked && "tracking-[4px]",
        )}
        autoComplete="off"
      />
    </div>
  )
}

function maskValue(value: string) {
  if (!value) return ""
  if (value.length <= 6) return "••••••"
  const visible = value.slice(-4)
  return `••••••••${visible}`
}

type ToggleProps = {
  checked: boolean
  onCheckedChange: (value: boolean) => void
}

function Toggle({ checked, onCheckedChange }: ToggleProps) {
  return (
    <button
      type="button"
      onClick={() => onCheckedChange(!checked)}
      className={cn(
        "relative h-6 w-12 rounded-full border border-transparent transition-all",
        checked ? "bg-emerald-500" : "bg-gray-300",
      )}
      aria-pressed={checked}
    >
      <span
        className={cn(
          "absolute top-1/2 h-5 w-5 -translate-y-1/2 rounded-full bg-white transition-all",
          checked ? "right-1" : "left-1",
        )}
      />
    </button>
  )
}
