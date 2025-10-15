'use client'

import { useMemo, useState, useTransition } from 'react'

import type { ClientRoiNarrative } from '@/core/projects/types'
import { showToast } from '@/ui/toast'

type ClientOption = { id: string; name: string }

type RoiNarrativesProps = {
  narratives: ClientRoiNarrative[]
  clients: ClientOption[]
  onCreateNarrative: (narrative: ClientRoiNarrative) => void
  onShareNarrative: (narrative: ClientRoiNarrative) => void
}

type NarrativeFormState = {
  clientId: string
  periodStart: string
  periodEnd: string
  roiPercent: string
  arrImpact: string
  highlights: string
  surveyScore: string
  sentiment: ClientRoiNarrative['sentiment']
  shareTargets: string
}

const INITIAL_FORM: NarrativeFormState = {
  clientId: '',
  periodStart: '',
  periodEnd: '',
  roiPercent: '',
  arrImpact: '',
  highlights: '',
  surveyScore: '',
  sentiment: null,
  shareTargets: '',
}

const CARD_CLASS = 'rounded-xl border border-gray-200 bg-white p-4'

export function RoiNarratives({ narratives, clients, onCreateNarrative, onShareNarrative }: RoiNarrativesProps) {
  const [form, setForm] = useState<NarrativeFormState>(INITIAL_FORM)
  const [createPending, startCreate] = useTransition()
  const [sharePending, startShare] = useTransition()

  const clientOptions = useMemo(
    () => clients.slice().sort((a, b) => a.name.localeCompare(b.name)),
    [clients],
  )

  const sortedNarratives = useMemo(() => {
    return [...narratives].sort((a, b) => (a.generatedAt > b.generatedAt ? -1 : 1))
  }, [narratives])

  const handleSubmit = () => {
    if (!form.clientId || !form.roiPercent || !form.arrImpact) {
      showToast({
        title: 'ROI narrative',
        description: 'Client, ROI %, and ARR impact are required.',
        variant: 'destructive',
      })
      return
    }

    const roiValue = Number.parseFloat(form.roiPercent)
    const arrValue = Number.parseFloat(form.arrImpact)

    if (Number.isNaN(roiValue) || Number.isNaN(arrValue)) {
      showToast({ title: 'ROI narrative', description: 'Enter numeric ROI and ARR impact values.', variant: 'destructive' })
      return
    }

    const highlights = form.highlights
      .split('\n')
      .map((line) => line.trim())
      .filter(Boolean)

    const shareTargets = form.shareTargets
      .split(',')
      .map((value) => value.trim())
      .filter(Boolean)

    startCreate(async () => {
      const response = await fetch('/api/projects/roi-reports', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          clientId: form.clientId,
          periodStart: form.periodStart || undefined,
          periodEnd: form.periodEnd || undefined,
          roiPercent: roiValue,
          arrImpact: arrValue,
          highlights,
          surveyScore: form.surveyScore ? Number.parseInt(form.surveyScore, 10) : undefined,
          sentiment: form.sentiment ?? undefined,
          shareTargets,
        }),
      })

      const payload = (await response.json().catch(() => null)) as {
        ok?: boolean
        error?: string
        narrative?: ClientRoiNarrative
      }

      if (!response.ok || !payload?.ok || !payload.narrative) {
        showToast({
          title: 'ROI narrative failed',
          description: payload?.error ?? 'Unable to generate narrative',
          variant: 'destructive',
        })
        return
      }

      onCreateNarrative(payload.narrative)
      showToast({ title: 'Narrative generated', description: 'ROI summary logged and ready to share.' })
      setForm(INITIAL_FORM)
    })
  }

  const handleShare = (id: string, existingTargets: string[]) => {
    const shareTargets = prompt('Enter recipients separated by comma', existingTargets.join(', '))
    if (!shareTargets) {
      return
    }
    const recipients = shareTargets
      .split(',')
      .map((value) => value.trim())
      .filter(Boolean)

    startShare(async () => {
      const response = await fetch('/api/projects/roi-reports', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, shareTargets: recipients }),
      })

      const payload = (await response.json().catch(() => null)) as {
        ok?: boolean
        error?: string
        narrative?: ClientRoiNarrative
      }

      if (!response.ok || !payload?.ok || !payload.narrative) {
        showToast({
          title: 'Share failed',
          description: payload?.error ?? 'Unable to share narrative',
          variant: 'destructive',
        })
        return
      }

      onShareNarrative(payload.narrative)
      showToast({ title: 'Narrative shared', description: 'Stakeholders notified with the latest ROI summary.' })
    })
  }

  return (
    <div className="grid gap-4">
      <section className={CARD_CLASS}>
        <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
          <div>
            <h3 className="text-sm font-semibold text-black">Client ROI narratives</h3>
            <p className="text-xs text-gray-500">
              Blend delivery metrics, finance impact, and survey feedback into executive-ready reviews.
            </p>
          </div>
        </div>
        <div className="mt-3 grid gap-4 md:grid-cols-[1fr,1fr]">
          <form
            className="rounded-lg border border-gray-100 p-3 text-xs text-gray-700"
            onSubmit={(event) => {
              event.preventDefault()
              handleSubmit()
            }}
          >
            <div className="text-sm font-medium text-black">New narrative</div>
            <label className="mt-2 block">
              <span className="text-[11px] font-medium uppercase tracking-wide text-gray-500">Client</span>
              <select
                className="mt-1 w-full rounded border border-gray-200 px-2 py-1 text-sm"
                value={form.clientId}
                onChange={(event) => setForm((prev) => ({ ...prev, clientId: event.target.value }))}
              >
                <option value="">Select client</option>
                {clientOptions.map((client) => (
                  <option key={client.id} value={client.id}>
                    {client.name}
                  </option>
                ))}
              </select>
            </label>
            <div className="mt-2 grid grid-cols-1 gap-2 md:grid-cols-2">
              <label className="block">
                <span className="text-[11px] font-medium uppercase tracking-wide text-gray-500">Period start</span>
                <input
                  type="date"
                  className="mt-1 w-full rounded border border-gray-200 px-2 py-1 text-sm"
                  value={form.periodStart}
                  onChange={(event) => setForm((prev) => ({ ...prev, periodStart: event.target.value }))}
                />
              </label>
              <label className="block">
                <span className="text-[11px] font-medium uppercase tracking-wide text-gray-500">Period end</span>
                <input
                  type="date"
                  className="mt-1 w-full rounded border border-gray-200 px-2 py-1 text-sm"
                  value={form.periodEnd}
                  onChange={(event) => setForm((prev) => ({ ...prev, periodEnd: event.target.value }))}
                />
              </label>
            </div>
            <label className="mt-2 block">
              <span className="text-[11px] font-medium uppercase tracking-wide text-gray-500">ROI %</span>
              <input
                className="mt-1 w-full rounded border border-gray-200 px-2 py-1 text-sm"
                value={form.roiPercent}
                onChange={(event) => setForm((prev) => ({ ...prev, roiPercent: event.target.value }))}
                placeholder="e.g. 145"
              />
            </label>
            <label className="mt-2 block">
              <span className="text-[11px] font-medium uppercase tracking-wide text-gray-500">ARR impact (USD)</span>
              <input
                className="mt-1 w-full rounded border border-gray-200 px-2 py-1 text-sm"
                value={form.arrImpact}
                onChange={(event) => setForm((prev) => ({ ...prev, arrImpact: event.target.value }))}
                placeholder="e.g. 48000"
              />
            </label>
            <label className="mt-2 block">
              <span className="text-[11px] font-medium uppercase tracking-wide text-gray-500">Highlights (one per line)</span>
              <textarea
                className="mt-1 h-20 w-full rounded border border-gray-200 px-2 py-1 text-sm"
                value={form.highlights}
                onChange={(event) => setForm((prev) => ({ ...prev, highlights: event.target.value }))}
                placeholder={'Revenue uplift from new pricing\nCollections cycle reduced'}
              />
            </label>
            <div className="mt-2 grid grid-cols-1 gap-2 md:grid-cols-2">
              <label className="block">
                <span className="text-[11px] font-medium uppercase tracking-wide text-gray-500">Survey score</span>
                <input
                  className="mt-1 w-full rounded border border-gray-200 px-2 py-1 text-sm"
                  value={form.surveyScore}
                  onChange={(event) => setForm((prev) => ({ ...prev, surveyScore: event.target.value }))}
                  placeholder="e.g. 9"
                />
              </label>
              <label className="block">
                <span className="text-[11px] font-medium uppercase tracking-wide text-gray-500">Sentiment</span>
                <select
                  className="mt-1 w-full rounded border border-gray-200 px-2 py-1 text-sm"
                  value={form.sentiment ?? ''}
                  onChange={(event) =>
                    setForm((prev) => ({
                      ...prev,
                      sentiment: event.target.value
                        ? (event.target.value as ClientRoiNarrative['sentiment'])
                        : null,
                    }))
                  }
                >
                  <option value="">Select sentiment</option>
                  <option value="Promoter">Promoter</option>
                  <option value="Passive">Passive</option>
                  <option value="Detractor">Detractor</option>
                </select>
              </label>
            </div>
            <label className="mt-2 block">
              <span className="text-[11px] font-medium uppercase tracking-wide text-gray-500">Share with (emails)</span>
              <input
                className="mt-1 w-full rounded border border-gray-200 px-2 py-1 text-sm"
                value={form.shareTargets}
                onChange={(event) => setForm((prev) => ({ ...prev, shareTargets: event.target.value }))}
                placeholder="exec@client.com, sponsor@client.com"
              />
            </label>
            <button
              type="submit"
              className="mt-3 inline-flex h-9 items-center justify-center rounded-md bg-gray-900 px-3 text-sm font-medium text-white transition hover:bg-black"
              disabled={createPending}
            >
              {createPending ? 'Generating…' : 'Generate narrative'}
            </button>
          </form>

          <div className="space-y-3 text-xs text-gray-700">
            {sortedNarratives.length === 0 ? (
              <div className="rounded-lg border border-dashed border-gray-200 p-4 text-gray-500">
                No ROI narratives generated yet. Publish delivery wins to accelerate renewals and expansions.
              </div>
            ) : (
              sortedNarratives.map((narrative) => (
                <div key={narrative.id} className="rounded-lg border border-gray-100 p-3">
                  <div className="flex items-center justify-between text-sm font-medium text-black">
                    <span>{narrative.clientName}</span>
                    <span>{narrative.roiPercent}% ROI</span>
                  </div>
                  <p className="text-[11px] text-gray-500">
                    Period {narrative.periodStart} → {narrative.periodEnd} • ARR impact ${narrative.arrImpact.toLocaleString()}
                  </p>
                  <ul className="mt-2 list-disc space-y-1 pl-4 text-[11px] text-gray-600">
                    {narrative.highlights.map((highlight, index) => (
                      <li key={`${narrative.id}-highlight-${index}`}>{highlight}</li>
                    ))}
                  </ul>
                  <div className="mt-2 flex flex-wrap gap-2 text-[10px] text-gray-500">
                    {typeof narrative.surveyScore === 'number' ? <span>Survey score {narrative.surveyScore}</span> : null}
                    {narrative.sentiment ? <span>Sentiment {narrative.sentiment}</span> : null}
                    {narrative.sharedAt ? (
                      <span>Shared {new Date(narrative.sharedAt).toLocaleString()}</span>
                    ) : (
                      <span className="text-amber-600">Not shared</span>
                    )}
                  </div>
                  <button
                    type="button"
                    className="mt-3 inline-flex h-8 items-center justify-center rounded border border-gray-200 px-3 text-[11px]"
                    onClick={() => handleShare(narrative.id, narrative.sharedWith)}
                    disabled={sharePending}
                  >
                    {sharePending ? 'Sharing…' : 'Share QBR'}
                  </button>
                </div>
              ))
            )}
          </div>
        </div>
      </section>
    </div>
  )
}
