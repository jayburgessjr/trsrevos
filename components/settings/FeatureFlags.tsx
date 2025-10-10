"use client"

import { useState } from "react"
import { AlertTriangle, Loader2 } from "lucide-react"

import { updateFeatureFlagAccess, updateFeatureFlagState } from "@/app/settings/actions"
import type { FeatureFlagAccessLevel, FeatureFlagRecord } from "@/lib/settings/types"
import { cn } from "@/lib/utils"

type FeatureFlagsProps = {
  flags: FeatureFlagRecord[]
  serviceAvailable: boolean
  error?: string | null
}

const ACCESS_LEVELS: FeatureFlagAccessLevel[] = ["Admin", "Director", "SuperAdmin"]

export function FeatureFlags({ flags, serviceAvailable, error: initialError }: FeatureFlagsProps) {
  const [rows, setRows] = useState(flags)
  const [error, setError] = useState<string | null>(initialError ?? null)
  const [pendingId, setPendingId] = useState<string | null>(null)
  const [pendingAccessId, setPendingAccessId] = useState<string | null>(null)

  if (!serviceAvailable) {
    return (
      <section className="rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] p-6 space-y-3">
        <h3 className="text-sm font-semibold text-[var(--color-text)]">Feature Flags</h3>
        <div className="rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-xs text-amber-700">
          <p className="font-semibold">Supabase service role key missing</p>
          <p className="mt-1 text-[11px]">
            Provide <code>SUPABASE_SERVICE_ROLE_KEY</code> in{" "}
            <code>.env.local</code> to enable runtime feature flag management.
          </p>
        </div>
      </section>
    )
  }

  return (
    <section className="rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] p-6 space-y-4">
      <div className="space-y-1">
        <h3 className="text-sm font-semibold text-[var(--color-text)]">Feature Flags</h3>
        <div className="text-xs text-gray-500">
          Toggle platform capabilities and scope access by org role. Persists directly in Supabase.
        </div>
      </div>

      {error ? (
        <div className="flex items-center gap-2 rounded-lg border border-red-200 bg-red-50 px-4 py-2 text-xs text-red-700">
          <AlertTriangle size={14} />
          {error}
        </div>
      ) : null}

      <div className="overflow-hidden rounded-lg border border-[var(--color-border)]">
        <table className="min-w-full divide-y divide-[var(--color-border)]">
          <thead className="bg-[var(--color-bg)]">
            <tr className="text-left text-[11px] uppercase tracking-wide text-gray-500">
              <th className="px-4 py-3">Feature</th>
              <th className="px-4 py-3">State</th>
              <th className="px-4 py-3">Access Level</th>
              <th className="px-4 py-3">Updated</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[var(--color-border)] bg-[var(--color-bg)] text-sm">
            {rows.map((flag) => (
              <tr key={flag.id}>
                <td className="px-4 py-3">
                  <p className="font-semibold text-[var(--color-text)]">{flag.name}</p>
                  {flag.description ? (
                    <p className="text-xs text-gray-500">{flag.description}</p>
                  ) : null}
                </td>
                <td className="px-4 py-3">
                  <Toggle
                    checked={flag.is_enabled}
                    disabled={pendingId === flag.id}
                    onCheckedChange={async (value) => {
                      setError(null)
                      setPendingId(flag.id)
                      setRows((prev) =>
                        prev.map((row) =>
                          row.id === flag.id ? { ...row, is_enabled: value } : row,
                        ),
                      )
                      try {
                        const updated = await updateFeatureFlagState(flag.id, value)
                        setRows((prev) =>
                          prev.map((row) => (row.id === updated.id ? updated : row)),
                        )
                      } catch (err) {
                        setRows((prev) =>
                          prev.map((row) =>
                            row.id === flag.id ? { ...row, is_enabled: flag.is_enabled } : row,
                          ),
                        )
                        setError((err as Error).message ?? "Unable to update feature flag")
                      } finally {
                        setPendingId(null)
                      }
                    }}
                  />
                </td>
                <td className="px-4 py-3">
                  <div className="relative inline-flex items-center">
                    <select
                      className="rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] px-3 py-2 text-xs font-semibold text-[var(--color-text)]"
                      value={flag.access_level}
                      onChange={async (event) => {
                        const value = event.target.value as FeatureFlagAccessLevel
                        setError(null)
                        setPendingAccessId(flag.id)
                        const previous = flag.access_level
                        setRows((prev) =>
                          prev.map((row) =>
                            row.id === flag.id ? { ...row, access_level: value } : row,
                          ),
                        )
                        try {
                          const updated = await updateFeatureFlagAccess(flag.id, value)
                          setRows((prev) =>
                            prev.map((row) => (row.id === updated.id ? updated : row)),
                          )
                        } catch (err) {
                          setRows((prev) =>
                            prev.map((row) =>
                              row.id === flag.id ? { ...row, access_level: previous } : row,
                            ),
                          )
                          setError((err as Error).message ?? "Unable to update access level")
                        } finally {
                          setPendingAccessId(null)
                        }
                      }}
                      disabled={pendingAccessId === flag.id}
                    >
                      {ACCESS_LEVELS.map((level) => (
                        <option key={level} value={level}>
                          {level}
                        </option>
                      ))}
                    </select>
                    {pendingAccessId === flag.id ? (
                      <Loader2 size={14} className="absolute -right-6 animate-spin text-gray-400" />
                    ) : null}
                  </div>
                </td>
                <td className="px-4 py-3 text-xs text-gray-500">
                  {flag.updated_at
                    ? new Date(flag.updated_at).toLocaleDateString()
                    : "—"}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  )
}

type ToggleProps = {
  checked: boolean
  onCheckedChange: (value: boolean) => void
  disabled?: boolean
}

function Toggle({ checked, onCheckedChange, disabled }: ToggleProps) {
  return (
    <button
      type="button"
      onClick={() => onCheckedChange(!checked)}
      disabled={disabled}
      className={cn(
        "relative h-6 w-12 rounded-full transition-colors",
        checked ? "bg-emerald-500" : "bg-gray-300",
        disabled && "cursor-not-allowed opacity-60",
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
