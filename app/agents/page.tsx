import Link from 'next/link'

import { actionListAgents } from '@/core/agents/actions'

export default async function AgentsHubPage() {
  const agents = await actionListAgents()

  if (!agents.length) {
    return (
      <div className="space-y-4">
        <header>
          <h1 className="text-xl font-semibold text-gray-900 dark:text-neutral-100">AI Agents</h1>
          <p className="text-sm text-gray-600 dark:text-neutral-400">
            Operate TRS with focused automations. Click a card to run &amp; configure.
          </p>
        </header>
        <div className="rounded-xl border border-dashed border-gray-200 bg-white p-6 text-sm text-gray-500 dark:border-neutral-800 dark:bg-neutral-950 dark:text-neutral-400">
          No agents registered yet.
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <header className="space-y-1">
        <h1 className="text-xl font-semibold text-gray-900 dark:text-neutral-100">AI Agents</h1>
        <p className="text-sm text-gray-600 dark:text-neutral-400">
          Operate TRS with focused automations. Click a card to run &amp; configure.
        </p>
      </header>
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
        {agents.map(({ meta, status }) => (
          <Link
            key={meta.key}
            href={`/agents/${meta.key}`}
            className="group rounded-xl border border-gray-200 bg-white transition hover:shadow-sm dark:border-neutral-800 dark:bg-neutral-950"
          >
            <div className="flex h-full flex-col p-4">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <div className="text-sm font-semibold text-gray-900 dark:text-neutral-100">{meta.name}</div>
                  <p className="mt-1 text-sm text-gray-600 dark:text-neutral-400">{meta.description}</p>
                </div>
                <span
                  className={`inline-flex items-center rounded-full px-2 py-1 text-[10px] font-semibold tracking-wide ${
                    status.enabled
                      ? 'bg-[var(--trs-accent)] text-white'
                      : 'border border-gray-200 text-gray-600 dark:border-neutral-800 dark:text-neutral-300'
                  }`}
                >
                  {meta.category}
                </span>
              </div>
              <div className="mt-4 flex flex-1 flex-col justify-end gap-1 text-xs text-gray-500 dark:text-neutral-400">
                <div className="flex items-center justify-between">
                  <span className="font-medium text-gray-700 dark:text-neutral-300">Status</span>
                  <span className={status.enabled ? 'text-emerald-600' : 'text-red-500'}>
                    {status.enabled ? 'Enabled' : 'Disabled'}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span>Last run</span>
                  <span>{status.lastRun ? new Date(status.lastRun).toLocaleString() : '—'}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span>Impact</span>
                  <span>{status.impact$ ? `$${Number(status.impact$).toLocaleString()}` : '—'}</span>
                </div>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  )
}
