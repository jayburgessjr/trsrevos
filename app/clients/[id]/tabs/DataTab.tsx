'use client'

import { useMemo, useState, useTransition } from 'react'

import { setDataRequirement } from '@/core/clients/actions'
import { DataRequirement } from '@/core/clients/types'
import { Badge } from '@/ui/badge'
import { Button } from '@/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/ui/card'
import { Input } from '@/ui/input'
import { Select } from '@/ui/select'
import { Textarea } from '@/ui/textarea'

const STATUS_LABELS: Record<DataRequirement['status'], string> = {
  needed: 'Needed',
  in_progress: 'In Progress',
  collected: 'Collected',
}

type DataTabProps = {
  clientId: string
  requirements: DataRequirement[]
}

type DraftState = {
  status: DataRequirement['status']
  notes: string
}

export default function DataTab({ clientId, requirements }: DataTabProps) {
  const [items, setItems] = useState(requirements)
  const [drafts, setDrafts] = useState<Record<string, DraftState>>(() =>
    requirements.reduce((acc, requirement) => {
      acc[requirement.id] = {
        status: requirement.status,
        notes: requirement.notes ?? '',
      }
      return acc
    }, {} as Record<string, DraftState>),
  )
  const [newSource, setNewSource] = useState('')
  const [newNotes, setNewNotes] = useState('')
  const [isPending, startTransition] = useTransition()
  const [pendingId, setPendingId] = useState<string | null>(null)

  const grouped = useMemo(() => {
    const requiredList = items.filter((item) => item.status !== 'collected')
    const collectedList = items.filter((item) => item.status === 'collected')
    return { requiredList, collectedList }
  }, [items])

  const updateDraft = (id: string, patch: Partial<DraftState>) => {
    setDrafts((prev) => ({
      ...prev,
      [id]: {
        ...prev[id],
        ...patch,
      },
    }))
  }

  const upsertRequirement = (requirement: DataRequirement) => {
    setItems((prev) => {
      const existingIndex = prev.findIndex((item) => item.id === requirement.id)
      if (existingIndex >= 0) {
        const next = [...prev]
        next[existingIndex] = requirement
        return next
      }
      return [requirement, ...prev]
    })
    setDrafts((prev) => ({
      ...prev,
      [requirement.id]: {
        status: requirement.status,
        notes: requirement.notes ?? '',
      },
    }))
  }

  const handleSubmit = (requirement: DataRequirement) => {
    const draft = drafts[requirement.id]
    if (!draft) return

    setPendingId(requirement.id)
    startTransition(async () => {
      const result = await setDataRequirement(
        clientId,
        requirement.source_name,
        draft.status,
        draft.notes.trim() ? draft.notes : undefined,
      )
      if (result) {
        upsertRequirement(result)
      }
      setPendingId(null)
    })
  }

  const handleCreate = () => {
    if (!newSource.trim()) return
    setPendingId('new')
    startTransition(async () => {
      const result = await setDataRequirement(clientId, newSource.trim(), 'needed', newNotes.trim() || undefined)
      if (result) {
        upsertRequirement(result)
        setNewSource('')
        setNewNotes('')
      }
      setPendingId(null)
    })
  }

  const renderRequirement = (requirement: DataRequirement) => {
    const draft = drafts[requirement.id]
    return (
      <Card key={requirement.id} className="flex flex-col gap-3 border-[color:var(--color-outline)] p-4">
        <div className="flex items-start justify-between gap-3">
          <div>
            <CardTitle className="text-sm font-semibold text-[color:var(--color-text)]">
              {requirement.source_name}
            </CardTitle>
            <p className="text-xs text-[color:var(--color-text-muted)]">
              Required by RevOS • Status {STATUS_LABELS[requirement.status]}
            </p>
          </div>
          <Badge variant={requirement.status === 'collected' ? 'success' : 'outline'}>
            {STATUS_LABELS[requirement.status]}
          </Badge>
        </div>
        <div className="grid gap-2">
          <label className="text-xs font-medium text-[color:var(--color-text-muted)]" htmlFor={`${requirement.id}-status`}>
            Status
          </label>
          <Select
            id={`${requirement.id}-status`}
            value={draft?.status ?? requirement.status}
            onChange={(event) => updateDraft(requirement.id, { status: event.target.value as DataRequirement['status'] })}
          >
            {Object.entries(STATUS_LABELS).map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </Select>
        </div>
        <div className="grid gap-2">
          <label className="text-xs font-medium text-[color:var(--color-text-muted)]" htmlFor={`${requirement.id}-notes`}>
            Notes
          </label>
          <Textarea
            id={`${requirement.id}-notes`}
            value={draft?.notes ?? requirement.notes ?? ''}
            onChange={(event) => updateDraft(requirement.id, { notes: event.target.value })}
            placeholder="Connection details, owners, or blockers"
            className="min-h-[96px]"
          />
        </div>
        <div className="flex justify-end">
          <Button
            size="sm"
            onClick={() => handleSubmit(requirement)}
            disabled={isPending && pendingId === requirement.id}
          >
            Save updates
          </Button>
        </div>
      </Card>
    )
  }

  return (
    <div className="flex flex-col gap-4">
      <Card className="border-[color:var(--color-outline)] bg-[color:var(--color-surface)]">
        <CardHeader>
          <CardTitle className="text-base">Add data requirement</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-3 md:grid-cols-3">
          <div className="md:col-span-1">
            <label className="text-xs font-medium text-[color:var(--color-text-muted)]" htmlFor="new-source">
              Source name
            </label>
            <Input
              id="new-source"
              value={newSource}
              onChange={(event) => setNewSource(event.target.value)}
              placeholder="QuickBooks, Gmail, CSV Upload"
            />
          </div>
          <div className="md:col-span-2">
            <label className="text-xs font-medium text-[color:var(--color-text-muted)]" htmlFor="new-notes">
              Notes
            </label>
            <Textarea
              id="new-notes"
              value={newNotes}
              onChange={(event) => setNewNotes(event.target.value)}
              placeholder="Context for why this data unlocks the TRS engine"
              className="min-h-[80px]"
            />
          </div>
          <div className="md:col-span-3 flex justify-end">
            <Button onClick={handleCreate} disabled={isPending && pendingId === 'new'}>
              Link requirement
            </Button>
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-4 md:grid-cols-2">
        <section className="flex flex-col gap-3">
          <h3 className="text-sm font-semibold text-[color:var(--color-text)]">Required</h3>
          {grouped.requiredList.length ? (
            grouped.requiredList.map(renderRequirement)
          ) : (
            <p className="rounded-lg border border-dashed border-[color:var(--color-outline)] px-4 py-8 text-center text-sm text-[color:var(--color-text-muted)]">
              No outstanding requirements.
            </p>
          )}
        </section>
        <section className="flex flex-col gap-3">
          <h3 className="text-sm font-semibold text-[color:var(--color-text)]">Collected</h3>
          {grouped.collectedList.length ? (
            grouped.collectedList.map(renderRequirement)
          ) : (
            <p className="rounded-lg border border-dashed border-[color:var(--color-outline)] px-4 py-8 text-center text-sm text-[color:var(--color-text-muted)]">
              Nothing collected yet.
            </p>
          )}
        </section>
      </div>
    </div>
  )
}
