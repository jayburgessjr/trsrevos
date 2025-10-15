'use client'

import { useState, useTransition } from 'react'

import { upsertAutomationPlaybook, updateAutomationPlaybookStatus, runAutomationPlaybook } from '@/core/automations/actions'
import type { AutomationPlaybook } from '@/core/automations/types'
import { cn } from '@/lib/utils'

const CLOSED_WON_TEMPLATE = {
  name: 'Closed Won → Delivery & Finance',
  description: 'Kick off delivery and schedule invoices automatically when a deal closes won.',
  triggerEvent: 'pipeline.closed_won',
  status: 'active' as const,
  configuration: { sla_hours: 4 },
  steps: [
    {
      sortOrder: 1,
      workspace: 'sales' as const,
      action: 'log_closed_won_context',
      config: { summaryField: 'win_notes' },
    },
    {
      sortOrder: 2,
      workspace: 'delivery' as const,
      action: 'create_project_kickoff',
      config: { phase: 'Data' },
    },
    {
      sortOrder: 3,
      workspace: 'finance' as const,
      action: 'schedule_invoice_plan',
      config: { cadence: 'monthly', installments: 3 },
    },
  ],
}

type PlaybookBuilderClientProps = {
  playbooks: AutomationPlaybook[]
}

export default function PlaybookBuilderClient({ playbooks }: PlaybookBuilderClientProps) {
  const [pending, startTransition] = useTransition()
  const [message, setMessage] = useState<string | null>(null)

  const handleCreateTemplate = () => {
    startTransition(async () => {
      try {
        await upsertAutomationPlaybook(CLOSED_WON_TEMPLATE)
        setMessage('Closed-won automation template deployed.')
      } catch (error) {
        console.error('playbooks:create-template', error)
        setMessage('Unable to create automation template.')
      }
    })
  }

  const handleStatusChange = (id: string, status: 'draft' | 'active' | 'archived') => {
    startTransition(async () => {
      try {
        await updateAutomationPlaybookStatus(id, status)
        setMessage(`Playbook status updated to ${status}.`)
      } catch (error) {
        console.error('playbooks:update-status', error)
        setMessage('Unable to update playbook status.')
      }
    })
  }

  const handleRun = (id: string) => {
    startTransition(async () => {
      try {
        const result = await runAutomationPlaybook(id, {
          opportunityId: 'demo-opportunity',
          clientId: 'demo-client',
          amount: 45000,
          name: 'Demo Opportunity',
        })
        setMessage(`Automation run ${result.runId} ${result.status}.`)
      } catch (error) {
        console.error('playbooks:run', error)
        setMessage('Unable to execute automation.')
      }
    })
  }

  return (
    <div className="space-y-6">
      <header className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-black">Automation Playbooks</h1>
          <p className="mt-1 text-sm text-gray-600">
            Orchestrate cross-workspace workflows that connect sales wins to delivery kickoffs and finance schedules.
          </p>
        </div>
        <button
          onClick={handleCreateTemplate}
          disabled={pending}
          className="inline-flex items-center rounded-full bg-gray-900 px-4 py-2 text-sm font-medium text-white shadow-sm transition hover:bg-black disabled:cursor-not-allowed disabled:bg-gray-600"
        >
          Deploy closed-won playbook
        </button>
      </header>

      {message ? (
        <div className="rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2 text-xs text-emerald-900">{message}</div>
      ) : null}

      <section className="grid gap-4 lg:grid-cols-2">
        {playbooks.length === 0 ? (
          <div className="rounded-xl border border-dashed border-gray-300 bg-white p-6 text-sm text-gray-600">
            No automation playbooks configured yet. Deploy the closed-won template to get started.
          </div>
        ) : (
          playbooks.map((playbook) => (
            <article key={playbook.id} className="flex h-full flex-col rounded-xl border border-gray-200 bg-white p-5">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <h2 className="text-lg font-semibold text-gray-900">{playbook.name}</h2>
                  <p className="mt-1 text-sm text-gray-600">{playbook.description ?? 'No description provided.'}</p>
                </div>
                <span
                  className={cn(
                    'rounded-full px-3 py-1 text-xs font-semibold uppercase',
                    playbook.status === 'active'
                      ? 'bg-emerald-100 text-emerald-700'
                      : playbook.status === 'draft'
                      ? 'bg-amber-100 text-amber-700'
                      : 'bg-gray-200 text-gray-700',
                  )}
                >
                  {playbook.status}
                </span>
              </div>

              <dl className="mt-4 space-y-2 text-xs text-gray-600">
                <div className="flex items-center justify-between">
                  <dt>Trigger event</dt>
                  <dd className="font-medium text-gray-900">{playbook.triggerEvent}</dd>
                </div>
                <div className="flex items-start justify-between gap-4">
                  <dt>Steps</dt>
                  <dd className="flex-1 space-y-2 text-gray-700">
                    {playbook.steps.length === 0 ? (
                      <div className="rounded border border-dashed border-gray-200 p-2 text-xs text-gray-500">
                        No steps defined.
                      </div>
                    ) : (
                      playbook.steps.map((step) => (
                        <div key={step.id} className="rounded border border-gray-200 p-2">
                          <div className="flex items-center justify-between text-[11px] uppercase tracking-wide text-gray-500">
                            <span>{step.workspace}</span>
                            <span>#{step.sortOrder}</span>
                          </div>
                          <div className="text-sm font-medium text-gray-900">{step.action}</div>
                          {Object.keys(step.config).length ? (
                            <pre className="mt-1 rounded bg-gray-50 p-2 text-[11px] text-gray-600">
                              {JSON.stringify(step.config, null, 2)}
                            </pre>
                          ) : null}
                        </div>
                      ))
                    )}
                  </dd>
                </div>
              </dl>

              <div className="mt-4 flex flex-wrap gap-2">
                <button
                  onClick={() => handleRun(playbook.id)}
                  disabled={pending}
                  className="rounded-full border border-gray-300 px-3 py-1 text-xs font-medium text-gray-700 hover:border-gray-400 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  Run test
                </button>
                <button
                  onClick={() => handleStatusChange(playbook.id, playbook.status === 'active' ? 'archived' : 'active')}
                  disabled={pending}
                  className="rounded-full border border-gray-300 px-3 py-1 text-xs font-medium text-gray-700 hover:border-gray-400 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {playbook.status === 'active' ? 'Archive playbook' : 'Activate playbook'}
                </button>
                {playbook.status !== 'draft' ? (
                  <button
                    onClick={() => handleStatusChange(playbook.id, 'draft')}
                    disabled={pending}
                    className="rounded-full border border-gray-300 px-3 py-1 text-xs font-medium text-gray-700 hover:border-gray-400 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    Move to draft
                  </button>
                ) : null}
              </div>
            </article>
          ))
        )}
      </section>
    </div>
  )
}
