import Link from 'next/link'
import { notFound } from 'next/navigation'

import { actionMoveKanban, actionSaveGap, actionSaveQRA, actionSetStatus, actionToggleSource } from '@/core/clients/actions'
import { phaseBadgeClasses, REVOS_PHASES } from '@/core/clients/constants'
import { getClient, listClients } from '@/core/clients/store'
import type { ClientRecord } from '@/core/clients/types'

export async function generateStaticParams() {
  return listClients().map((c) => ({ id: c.id }))
}

export default async function ClientPage({ params }: { params: { id: string } }) {
  const client = getClient(params.id)
  if (!client) return notFound()
  return (
    <div className="space-y-6 p-6">
      <header className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-semibold text-[color:var(--color-text)]">{client.name}</h1>
          <p className="text-xs text-[color:var(--color-text-muted)]">Owner: {client.owner ?? '—'}</p>
        </div>
        <div className="flex items-center gap-2 text-xs">
          <span className={`rounded-full px-3 py-1 ${phaseBadgeClasses[client.status]}`}>{client.status}</span>
          <Link className="underline" href="/projects">
            Back to Projects
          </Link>
        </div>
      </header>

      <div className="border-b border-[color:var(--color-outline)]">
        <nav className="flex flex-wrap gap-2">
          {REVOS_PHASES.map((phase) => (
            <form key={phase} action={actionSetStatus.bind(null, client.id, phase)}>
              <button
                className={`rounded-t-lg border border-b-0 px-4 py-2 text-sm transition ${
                  client.status === phase
                    ? 'border-[color:var(--color-outline)] bg-[color:var(--color-surface)] text-[color:var(--color-text)]'
                    : 'border-transparent bg-transparent text-[color:var(--color-text-muted)] hover:text-[color:var(--color-text)]'
                }`}
              >
                {phase}
              </button>
            </form>
          ))}
        </nav>
      </div>

      {client.status === 'Discovery' && <DiscoveryPanel id={client.id} />}
      {client.status === 'Data' && <DataPanel id={client.id} />}
      {client.status === 'Algorithm' && <AlgorithmPanel id={client.id} />}
      {client.status === 'Architecture' && <ArchitecturePanel id={client.id} />}
      {client.status === 'Compounding' && <CompoundingPanel id={client.id} />}
    </div>
  )
}

async function DiscoveryPanel({ id }: { id: string }) {
  const c = getClient(id)
  if (!c) return null

  const prompts = [
    { id: 'g1', q: 'What’s the primary revenue motion?' },
    { id: 'g2', q: 'Biggest churn driver?' },
    { id: 'g3', q: 'Current pricing model?' },
  ]
  const answers = new Map(c.gapAnswers.map((entry) => [entry.id, entry.a]))

  async function save(form: FormData) {
    'use server'
    const payload: Array<{ id: string; q: string; a: string }> = []
    for (const prompt of prompts) {
      payload.push({
        id: prompt.id,
        q: prompt.q,
        a: String(form.get(prompt.id) ?? ''),
      })
    }
    await actionSaveGap(id, payload)
  }

  return (
    <section className="space-y-4 rounded-xl border border-[color:var(--color-outline)] bg-[color:var(--color-surface)] p-4">
      <header>
        <h2 className="text-sm font-medium text-[color:var(--color-text)]">Gap questions</h2>
        <p className="text-xs text-[color:var(--color-text-muted)]">
          Capture discovery context. We’ll sync with the intake doc when the API is ready.
        </p>
      </header>
      <form action={save} className="space-y-3">
        {prompts.map((prompt) => (
          <label key={prompt.id} className="block space-y-1">
            <span className="text-xs text-[color:var(--color-text-muted)]">{prompt.q}</span>
            <input
              name={prompt.id}
              defaultValue={answers.get(prompt.id) ?? ''}
              placeholder="Answer…"
              className="w-full rounded-md border border-[color:var(--color-outline)] bg-white px-3 py-2 text-sm text-[color:var(--color-text)]"
            />
          </label>
        ))}
        <button className="rounded-md bg-[color:var(--color-text)] px-3 py-2 text-xs font-medium text-white">Save</button>
      </form>
    </section>
  )
}

async function DataPanel({ id }: { id: string }) {
  const c = getClient(id)
  if (!c) return null

  async function toggle(form: FormData) {
    'use server'
    const src = String(form.get('src'))
    await actionToggleSource(id, src)
  }

  return (
    <section className="grid gap-4 rounded-xl border border-[color:var(--color-outline)] bg-[color:var(--color-surface)] p-4 md:grid-cols-2">
      <div>
        <h3 className="mb-2 text-sm font-medium text-[color:var(--color-text)]">Available data sources</h3>
        <ul className="space-y-2">
          {c.availableSources.map((source) => (
            <li
              key={source}
              className="flex items-center justify-between rounded-md border border-[color:var(--color-outline)] bg-white px-3 py-2 text-sm"
            >
              <span>{source}</span>
              <form action={toggle}>
                <input type="hidden" name="src" value={source} />
                <button className="text-xs font-medium underline">Toggle</button>
              </form>
            </li>
          ))}
        </ul>
      </div>
      <div>
        <h3 className="mb-2 text-sm font-medium text-[color:var(--color-text)]">Collected data</h3>
        <ul className="space-y-2">
          {c.collectedSources.length === 0 && (
            <li className="rounded-md border border-dashed border-[color:var(--color-outline)] px-3 py-2 text-xs text-[color:var(--color-text-muted)]">
              No sources collected yet.
            </li>
          )}
          {c.collectedSources.map((source) => (
            <li key={source} className="rounded-md border border-[color:var(--color-outline)] bg-white px-3 py-2 text-sm">
              {source}
            </li>
          ))}
        </ul>
      </div>
    </section>
  )
}

async function AlgorithmPanel({ id }: { id: string }) {
  const c = getClient(id)
  if (!c) return null

  async function save(form: FormData) {
    'use server'
    await actionSaveQRA(id, String(form.get('notes') ?? ''))
  }

  return (
    <section className="space-y-3 rounded-xl border border-[color:var(--color-outline)] bg-[color:var(--color-surface)] p-4">
      <div>
        <h3 className="text-sm font-medium text-[color:var(--color-text)]">QRA Strategy</h3>
        <p className="text-xs text-[color:var(--color-text-muted)]">
          Summarize the qualitative revenue analysis before we pipe in the real model.
        </p>
      </div>
      <form action={save} className="space-y-2">
        <textarea
          name="notes"
          defaultValue={c.qraNotes ?? ''}
          placeholder="Write strategy synthesis…"
          className="h-40 w-full rounded-md border border-[color:var(--color-outline)] bg-white p-2 text-sm"
        />
        <button className="rounded-md bg-[color:var(--color-text)] px-3 py-2 text-xs font-medium text-white">Save</button>
      </form>
      <p className="text-xs text-[color:var(--color-text-muted)]">
        Next iteration will run the automated QRA to produce playbooks and projections.
      </p>
    </section>
  )
}

async function ArchitecturePanel({ id }: { id: string }) {
  const c = getClient(id)
  if (!c) return null
  const columns: Array<keyof ClientRecord['kanban']> = ['Backlog', 'Doing', 'Review', 'Done']

  async function move(form: FormData) {
    'use server'
    const card = String(form.get('card'))
    const from = String(form.get('from')) as keyof ClientRecord['kanban']
    const to = String(form.get('to')) as keyof ClientRecord['kanban']
    await actionMoveKanban(id, card, from, to)
  }

  return (
    <section className="space-y-3 rounded-xl border border-[color:var(--color-outline)] bg-[color:var(--color-surface)] p-4">
      <h3 className="text-sm font-medium text-[color:var(--color-text)]">Revenue OS build kanban</h3>
      <div className="grid gap-3 md:grid-cols-4">
        {columns.map((column) => (
          <div key={column} className="rounded-lg border border-[color:var(--color-outline)] bg-white">
            <div className="border-b border-[color:var(--color-outline)] px-3 py-2 text-xs font-medium text-[color:var(--color-text-muted)]">
              {column}
            </div>
            <ul className="space-y-2 p-2">
              {c.kanban[column].length === 0 && (
                <li className="rounded-md border border-dashed border-[color:var(--color-outline)] px-2 py-3 text-xs text-[color:var(--color-text-muted)]">
                  Nothing here yet.
                </li>
              )}
              {c.kanban[column].map((card) => (
                <li key={card} className="rounded-md border border-[color:var(--color-outline)] px-2 py-2 text-sm">
                  <div className="flex items-center justify-between gap-2">
                    <span>{card}</span>
                    <form action={move} className="flex items-center gap-1 text-xs">
                      <input type="hidden" name="card" value={card} />
                      <input type="hidden" name="from" value={column} />
                      <select
                        name="to"
                        className="rounded border border-[color:var(--color-outline)] bg-[color:var(--color-surface)] px-1 py-0.5 text-xs"
                        defaultValue={column}
                      >
                        {columns
                          .filter((other) => other !== column)
                          .map((other) => (
                            <option key={other} value={other}>
                              {other}
                            </option>
                          ))}
                      </select>
                      <button className="underline">Move</button>
                    </form>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </section>
  )
}

async function CompoundingPanel({ id }: { id: string }) {
  const c = getClient(id)
  if (!c) return null

  const pct =
    c.baselineARR && c.realizedARR ? Math.round(((c.realizedARR - c.baselineARR) / c.baselineARR) * 100) : 0

  const maxArr = Math.max(c.realizedARR ?? 0, ...c.history.map((entry) => entry.arr)) || 1

  return (
    <section className="space-y-4 rounded-xl border border-[color:var(--color-outline)] bg-[color:var(--color-surface)] p-4">
      <h3 className="text-sm font-medium text-[color:var(--color-text)]">Compounding impact</h3>
      <div className="grid gap-3 md:grid-cols-3">
        <Stat label="Baseline ARR" value={`$${(c.baselineARR ?? 0).toLocaleString()}`} />
        <Stat label="Realized ARR" value={`$${(c.realizedARR ?? 0).toLocaleString()}`} />
        <Stat label="Uplift" value={`${pct}%`} />
      </div>
      <div className="rounded-lg border border-[color:var(--color-outline)] bg-white p-3">
        <div className="mb-2 text-xs text-[color:var(--color-text-muted)]">ARR trajectory (quarter)</div>
        <svg viewBox="0 0 320 100" className="h-28 w-full">
          <polyline
            fill="none"
            stroke="currentColor"
            strokeWidth={2}
            points={c.history
              .map((entry, index) => {
                const x = (index / Math.max(c.history.length - 1, 1)) * 320
                const normalized = entry.arr / maxArr
                const y = 90 - normalized * 80
                return `${x},${y}`
              })
              .join(' ')}
          />
        </svg>
        <div className="text-[11px] text-[color:var(--color-text-muted)]">
          Projection will connect to QRA once the scoring model lands. Trendline is placeholder data.
        </div>
      </div>
      <p className="text-xs text-[color:var(--color-text-muted)]">
        Track where the client started and the revenue uplift unlocked since activating Revos. Replace with production metrics later.
      </p>
    </section>
  )
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-md border border-[color:var(--color-outline)] bg-white p-3">
      <div className="text-xs text-[color:var(--color-text-muted)]">{label}</div>
      <div className="text-lg font-semibold text-[color:var(--color-text)]">{value}</div>
    </div>
  )
}
