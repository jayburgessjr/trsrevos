import { notFound } from 'next/navigation'

import { actionListAgents, actionLogs, actionRunAgent, actionToggleAgent } from '@/core/agents/actions'

export default async function AgentDetailPage({ params }: { params: { key: string } }) {
  const list = await actionListAgents()
  const agent = list.find((entry) => entry.meta.key === params.key)

  if (!agent) {
    return notFound()
  }

  const selectedAgent = agent

  async function runAgent(formData: FormData) {
    'use server'
    const payloadRaw = formData.get('payload')
    let payload: any
    if (payloadRaw) {
      try {
        payload = JSON.parse(String(payloadRaw))
      } catch (error) {
        console.error('Invalid payload JSON', error)
        payload = undefined
      }
    }
    await actionRunAgent(selectedAgent.meta.key, payload)
  }

  async function toggleAgent() {
    'use server'
    await actionToggleAgent(selectedAgent.meta.key, !selectedAgent.status.enabled)
  }

  const logs = await actionLogs(selectedAgent.meta.key)

  return (
    <div className="space-y-6">
      <header className="flex flex-col gap-3 rounded-xl border border-gray-200 bg-white p-5 dark:border-neutral-800 dark:bg-neutral-950 md:flex-row md:items-center md:justify-between">
        <div className="space-y-1">
          <p className="text-xs uppercase tracking-wide text-gray-500 dark:text-neutral-500">{selectedAgent.meta.category}</p>
          <h1 className="text-xl font-semibold text-gray-900 dark:text-neutral-100">{selectedAgent.meta.name}</h1>
          <p className="text-sm text-gray-600 dark:text-neutral-400">{selectedAgent.meta.description}</p>
          <dl className="mt-3 grid grid-cols-1 gap-3 text-xs text-gray-500 dark:text-neutral-400 sm:grid-cols-3">
            <div>
              <dt className="font-semibold text-gray-700 dark:text-neutral-300">Status</dt>
              <dd>{selectedAgent.status.enabled ? 'Enabled' : 'Disabled'}</dd>
            </div>
            <div>
              <dt className="font-semibold text-gray-700 dark:text-neutral-300">Last run</dt>
              <dd>{selectedAgent.status.lastRun ? new Date(selectedAgent.status.lastRun).toLocaleString() : '—'}</dd>
            </div>
            <div>
              <dt className="font-semibold text-gray-700 dark:text-neutral-300">Impact to date</dt>
              <dd>{selectedAgent.status.impact$ ? `$${Number(selectedAgent.status.impact$).toLocaleString()}` : '—'}</dd>
            </div>
          </dl>
        </div>
        <form action={toggleAgent}>
          <button
            className={`rounded-md px-4 py-2 text-xs font-semibold transition ${
              selectedAgent.status.enabled
                ? 'bg-[var(--trs-accent)] text-white hover:opacity-90'
                : 'border border-gray-200 text-gray-700 hover:bg-gray-50 dark:border-neutral-800 dark:text-neutral-200 dark:hover:bg-neutral-900'
            }`}
            type="submit"
          >
            {selectedAgent.status.enabled ? 'Disable auto-run' : 'Enable auto-run'}
          </button>
        </form>
      </header>

      <section className="rounded-xl border border-gray-200 bg-white p-5 dark:border-neutral-800 dark:bg-neutral-950">
        <div className="flex items-center justify-between gap-3">
          <div>
            <h2 className="text-sm font-semibold text-gray-900 dark:text-neutral-100">Run agent</h2>
            <p className="text-xs text-gray-500 dark:text-neutral-500">Optional JSON payload overrides defaults.</p>
          </div>
          {selectedAgent.meta.autoRunnable ? (
            <span className="rounded-full border border-emerald-300 px-2 py-1 text-[10px] font-semibold uppercase text-emerald-600">
              Auto runnable
            </span>
          ) : null}
        </div>
        <form action={runAgent} className="mt-4 space-y-3">
          <textarea
            name="payload"
            placeholder='{"accountId":"acme"}'
            className="w-full rounded-md border border-gray-200 px-3 py-2 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-[var(--trs-accent)] dark:border-neutral-800 dark:bg-neutral-900 dark:text-neutral-100"
            rows={4}
            defaultValue={selectedAgent.samplePayload ? JSON.stringify(selectedAgent.samplePayload, null, 2) : ''}
          />
          {selectedAgent.samplePayload ? (
            <details className="text-xs text-gray-500 dark:text-neutral-400">
              <summary className="cursor-pointer font-semibold text-gray-700 dark:text-neutral-300">Sample payload</summary>
              <pre className="mt-2 overflow-x-auto rounded-md bg-gray-50 p-3 text-[11px] leading-relaxed dark:bg-neutral-900">
                {JSON.stringify(selectedAgent.samplePayload, null, 2)}
              </pre>
            </details>
          ) : null}
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
            <button
              type="submit"
              className="inline-flex items-center justify-center rounded-md bg-[var(--trs-accent)] px-4 py-2 text-xs font-semibold uppercase tracking-wide text-white transition hover:opacity-90"
            >
              Run now
            </button>
            <span className="text-xs text-gray-500 dark:text-neutral-500">
              Auto-run scheduling will connect to orchestration later.
            </span>
          </div>
        </form>
      </section>

      <section className="rounded-xl border border-gray-200 bg-white p-5 dark:border-neutral-800 dark:bg-neutral-950">
        <h2 className="text-sm font-semibold text-gray-900 dark:text-neutral-100">Recent runs</h2>
        <div className="mt-3 divide-y divide-gray-200 text-sm dark:divide-neutral-800">
          {logs.length ? (
            logs.map((entry, index) => (
              <div key={index} className="py-4">
                <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-gray-500 dark:text-neutral-400">
                  <span>{new Date(entry.ts).toLocaleString()}</span>
                  <span className={entry.output.ok ? 'text-emerald-600' : 'text-red-500'}>
                    {entry.output.ok ? 'OK' : 'Failed'}
                  </span>
                </div>
                <div className="mt-2 text-xs text-gray-600 dark:text-neutral-400">
                  Summary: {entry.output.summary ?? '—'}
                </div>
                <pre className="mt-2 overflow-x-auto rounded-md bg-gray-50 p-3 text-[11px] leading-relaxed dark:bg-neutral-900">
                  {JSON.stringify(entry.output.data ?? {}, null, 2)}
                </pre>
              </div>
            ))
          ) : (
            <div className="py-6 text-sm text-gray-500 dark:text-neutral-400">No runs yet.</div>
          )}
        </div>
      </section>
    </div>
  )
}
