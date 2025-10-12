"use client"

import { useCallback, useState, useTransition } from "react"

import { showToast } from "@/ui/toast"

const BUTTON_CLASSES =
  "h-9 px-3 rounded-md border border-gray-300 bg-white text-sm text-gray-800 transition hover:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-60"

type AgentKind = "risk_scan" | "collections_nudge" | "ops_check"

type AgentResponse = {
  ok: boolean
  error?: string
}

export function AgentsPanel() {
  const [status, setStatus] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()

  const runAgent = useCallback((kind: AgentKind) => {
    startTransition(async () => {
      try {
        const response = await fetch("/api/agents/run", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ kind, entityType: "projects", entityId: "projects_hub" }),
        })

        const payload: AgentResponse = await response
          .json()
          .catch(() => ({ ok: false, error: "Unknown response" }))

        if (!response.ok || !payload.ok) {
          const message = payload.error ?? "Agent run failed"
          setStatus(message)
          showToast({ title: "Agent run failed", description: message, variant: "destructive" })
          return
        }

        const successMessage = `Agent run logged: ${kind}`
        setStatus(successMessage)
        showToast({ title: "Agent queued", description: successMessage, variant: "success" })
      } catch (error) {
        const message = "Unable to reach agent service"
        setStatus(message)
        showToast({ title: "Agent run failed", description: message, variant: "destructive" })
      }
    })
  }, [])

  return (
    <div className="rounded-xl border border-gray-200 bg-white p-3">
      <div className="text-sm font-medium text-black">Project Agents</div>
      <p className="mt-1 text-xs text-gray-600">
        Trigger playbooks and log activity for portfolio governance.
      </p>
      <div className="mt-3 flex flex-wrap gap-2">
        <button
          type="button"
          className={BUTTON_CLASSES}
          onClick={() => runAgent("risk_scan")}
          disabled={isPending}
        >
          Run Risk Scan
        </button>
        <button
          type="button"
          className={BUTTON_CLASSES}
          onClick={() => runAgent("collections_nudge")}
          disabled={isPending}
        >
          Collections Nudge
        </button>
        <button
          type="button"
          className={BUTTON_CLASSES}
          onClick={() => runAgent("ops_check")}
          disabled={isPending}
        >
          Ops Check
        </button>
      </div>
      {status ? <div className="mt-3 text-xs text-gray-600">{status}</div> : null}
    </div>
  )
}
