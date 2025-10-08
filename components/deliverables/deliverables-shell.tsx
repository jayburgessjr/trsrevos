'use client'

import { useCallback, useEffect, useMemo, useState } from 'react'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { deliverableStatusSchema, deliverableTypeSchema } from '@/lib/deliverables/types'

type Deliverable = {
  id: string
  accountId: string
  type: string
  title: string
  status: string
  owner: string
  dueDate: string | null
  lastReviewAt: string | null
  exportLink: string | null
  createdAt: string
  updatedAt: string
}

type ToastState = { message: string; variant: 'success' | 'error' | 'info' } | null

type CreateFormState = {
  title: string
  owner: string
  dueDate: string
  type: string
}

type DetailFormState = {
  title: string
  owner: string
  status: string
  dueDate: string
}

const typeOptions = deliverableTypeSchema.options
const statusOptions = deliverableStatusSchema.options

async function apiFetch<T>(input: RequestInfo, init?: RequestInit): Promise<T> {
  const response = await fetch(input, {
    ...init,
    headers: {
      'Content-Type': 'application/json',
      ...init?.headers
    }
  })

  if (!response.ok) {
    const error = await response.json().catch(() => ({}))
    throw new Error(error.message ?? 'Request failed')
  }

  return (await response.json()) as T
}

export function DeliverablesShell() {
  const [deliverables, setDeliverables] = useState<Deliverable[]>([])
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [toast, setToast] = useState<ToastState>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [createState, setCreateState] = useState<CreateFormState>({
    title: '',
    owner: '',
    dueDate: '',
    type: 'CLARITY_AUDIT'
  })

  const selectedDeliverable = useMemo(
    () => deliverables.find((item) => item.id === selectedId) ?? null,
    [deliverables, selectedId]
  )

  const [detailState, setDetailState] = useState<DetailFormState>({
    title: '',
    owner: '',
    status: 'PLANNED',
    dueDate: ''
  })

  const resetDetailState = useCallback(
    (deliverable: Deliverable | null) => {
      if (!deliverable) {
        setDetailState({
          title: '',
          owner: '',
          status: 'PLANNED',
          dueDate: ''
        })
        return
      }
      setDetailState({
        title: deliverable.title,
        owner: deliverable.owner,
        status: deliverable.status,
        dueDate: deliverable.dueDate ? deliverable.dueDate.slice(0, 10) : ''
      })
    },
    [setDetailState]
  )

  const loadDeliverables = useCallback(async () => {
    setIsLoading(true)
    try {
      const data = await apiFetch<{ deliverables: Deliverable[] }>('/api/deliverables')
      setDeliverables(data.deliverables)
      if (data.deliverables.length > 0 && !selectedId) {
        setSelectedId(data.deliverables[0].id)
      }
    } catch (error) {
      setToast({ message: (error as Error).message, variant: 'error' })
    } finally {
      setIsLoading(false)
    }
  }, [selectedId])

  useEffect(() => {
    void loadDeliverables()
  }, [loadDeliverables])

  useEffect(() => {
    resetDetailState(selectedDeliverable)
  }, [selectedDeliverable, resetDetailState])

  useEffect(() => {
    if (!toast) return
    const timer = window.setTimeout(() => setToast(null), 3500)
    return () => window.clearTimeout(timer)
  }, [toast])

  async function handleCreate(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    try {
      const payload = await apiFetch<Deliverable>('/api/deliverables', {
        method: 'POST',
        body: JSON.stringify({
          type: createState.type,
          title: createState.title,
          owner: createState.owner,
          dueDate: createState.dueDate || undefined,
          status: 'PLANNED'
        })
      })

      setToast({ message: 'Deliverable created.', variant: 'success' })
      setCreateState({ title: '', owner: '', dueDate: '', type: 'CLARITY_AUDIT' })
      setDeliverables((current) => [payload, ...current])
      setSelectedId(payload.id)
    } catch (error) {
      setToast({ message: (error as Error).message, variant: 'error' })
    }
  }

  async function handleSave(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (!selectedDeliverable) return
    try {
      const updated = await apiFetch<Deliverable>(`/api/deliverables/${selectedDeliverable.id}`, {
        method: 'PATCH',
        body: JSON.stringify({
          title: detailState.title,
          owner: detailState.owner,
          status: detailState.status,
          dueDate: detailState.dueDate || null
        })
      })
      setToast({ message: 'Deliverable updated.', variant: 'success' })
      setDeliverables((current) =>
        current.map((item) => (item.id === updated.id ? updated : item))
      )
    } catch (error) {
      setToast({ message: (error as Error).message, variant: 'error' })
    }
  }

  async function handleExport() {
    if (!selectedDeliverable) return
    try {
      const result = await apiFetch<{ artifactUrl: string }>(
        `/api/deliverables/${selectedDeliverable.id}/export`
      )
      setToast({ message: 'Deliverable exported.', variant: 'success' })
      setDeliverables((current) =>
        current.map((item) =>
          item.id === selectedDeliverable.id ? { ...item, exportLink: result.artifactUrl } : item
        )
      )
    } catch (error) {
      setToast({ message: (error as Error).message, variant: 'error' })
    }
  }

  return (
    <div className="flex flex-col gap-6">
      {toast && (
        <div
          role="status"
          className={`rounded-md border px-4 py-2 text-sm ${
            toast.variant === 'error'
              ? 'border-red-200 bg-red-50 text-red-700'
              : toast.variant === 'success'
              ? 'border-green-200 bg-green-50 text-green-700'
              : 'border-blue-200 bg-blue-50 text-blue-700'
          }`}
        >
          {toast.message}
        </div>
      )}

      <section className="grid gap-4 rounded-lg border bg-white p-4 shadow-sm">
        <h2 className="text-sm font-semibold text-gray-700">Create Deliverable</h2>
        <form className="grid grid-cols-1 gap-3 md:grid-cols-4" onSubmit={handleCreate}>
          <label className="flex flex-col gap-1 text-xs font-medium text-gray-600">
            Type
            <select
              className="rounded border border-gray-200 px-2 py-1 text-sm"
              value={createState.type}
              onChange={(event) =>
                setCreateState((current) => ({ ...current, type: event.target.value }))
              }
            >
              {typeOptions.map((option) => (
                <option key={option} value={option}>
                  {option.replace(/_/g, ' ')}
                </option>
              ))}
            </select>
          </label>
          <label className="flex flex-col gap-1 text-xs font-medium text-gray-600">
            Title
            <Input
              value={createState.title}
              onChange={(event) =>
                setCreateState((current) => ({ ...current, title: event.target.value }))
              }
              required
            />
          </label>
          <label className="flex flex-col gap-1 text-xs font-medium text-gray-600">
            Owner
            <Input
              value={createState.owner}
              onChange={(event) =>
                setCreateState((current) => ({ ...current, owner: event.target.value }))
              }
              required
            />
          </label>
          <label className="flex flex-col gap-1 text-xs font-medium text-gray-600">
            Due Date
            <Input
              type="date"
              value={createState.dueDate}
              onChange={(event) =>
                setCreateState((current) => ({ ...current, dueDate: event.target.value }))
              }
            />
          </label>
          <div className="md:col-span-4">
            <Button type="submit">Create</Button>
          </div>
        </form>
      </section>

      <div className="grid gap-6 lg:grid-cols-[1.6fr,2fr]">
        <section className="rounded-lg border bg-white shadow-sm">
          <header className="flex items-center justify-between border-b px-4 py-3">
            <h2 className="text-sm font-semibold text-gray-700">
              Deliverables {isLoading && <span className="text-xs text-gray-400">Loading…</span>}
            </h2>
            <span className="text-xs text-gray-500">{deliverables.length} records</span>
          </header>
          <ul className="divide-y text-sm">
            {deliverables.map((item) => (
              <li key={item.id}>
                <button
                  type="button"
                  onClick={() => setSelectedId(item.id)}
                  className={`flex w-full items-start justify-between gap-2 px-4 py-3 text-left transition ${
                    selectedId === item.id ? 'bg-slate-900/5 text-slate-900' : 'hover:bg-slate-50'
                  }`}
                  data-testid={`deliverable-row-${item.id}`}
                >
                  <div className="flex flex-col">
                    <span className="font-semibold">{item.title}</span>
                    <span className="text-xs text-gray-500">
                      {item.type.replace(/_/g, ' ')} • Owner {item.owner}
                    </span>
                  </div>
                  <span className="rounded-full border px-2 py-0.5 text-xs uppercase">
                    {item.status.replace(/_/g, ' ')}
                  </span>
                </button>
              </li>
            ))}
            {deliverables.length === 0 && !isLoading && (
              <li className="px-4 py-6 text-center text-xs text-gray-500">
                No deliverables yet. Create one above to get started.
              </li>
            )}
          </ul>
        </section>

        <section className="rounded-lg border bg-white shadow-sm">
          <header className="border-b px-4 py-3">
            <h2 className="text-sm font-semibold text-gray-700">Details</h2>
          </header>
          {selectedDeliverable ? (
            <div className="flex flex-col gap-4 p-4">
              <form className="grid grid-cols-1 gap-3 md:grid-cols-2" onSubmit={handleSave}>
                <label className="flex flex-col gap-1 text-xs font-medium text-gray-600 md:col-span-2">
                  Title
                  <Input
                    value={detailState.title}
                    onChange={(event) =>
                      setDetailState((current) => ({ ...current, title: event.target.value }))
                    }
                    required
                  />
                </label>
                <label className="flex flex-col gap-1 text-xs font-medium text-gray-600">
                  Owner
                  <Input
                    value={detailState.owner}
                    onChange={(event) =>
                      setDetailState((current) => ({ ...current, owner: event.target.value }))
                    }
                    required
                  />
                </label>
                <label className="flex flex-col gap-1 text-xs font-medium text-gray-600">
                  Status
                  <select
                    className="rounded border border-gray-200 px-2 py-1 text-sm"
                    value={detailState.status}
                    onChange={(event) =>
                      setDetailState((current) => ({ ...current, status: event.target.value }))
                    }
                  >
                    {statusOptions.map((status) => (
                      <option key={status} value={status}>
                        {status.replace(/_/g, ' ')}
                      </option>
                    ))}
                  </select>
                </label>
                <label className="flex flex-col gap-1 text-xs font-medium text-gray-600">
                  Due Date
                  <Input
                    type="date"
                    value={detailState.dueDate}
                    onChange={(event) =>
                      setDetailState((current) => ({ ...current, dueDate: event.target.value }))
                    }
                  />
                </label>
                <div className="md:col-span-2 flex items-center gap-2">
                  <Button type="submit">Save changes</Button>
                  <Button type="button" variant="outline" onClick={handleExport}>
                    Export
                  </Button>
                  {selectedDeliverable.exportLink && (
                    <a
                      className="text-xs text-blue-600 underline"
                      href={selectedDeliverable.exportLink}
                      target="_blank"
                      rel="noreferrer"
                    >
                      View latest export
                    </a>
                  )}
                </div>
              </form>
              <dl className="grid grid-cols-2 gap-3 text-xs text-gray-500">
                <div>
                  <dt className="font-medium text-gray-600">Created</dt>
                  <dd>{new Date(selectedDeliverable.createdAt).toLocaleString()}</dd>
                </div>
                <div>
                  <dt className="font-medium text-gray-600">Updated</dt>
                  <dd>{new Date(selectedDeliverable.updatedAt).toLocaleString()}</dd>
                </div>
              </dl>
            </div>
          ) : (
            <div className="p-6 text-center text-sm text-gray-500">
              Select a deliverable to view details.
            </div>
          )}
        </section>
      </div>
    </div>
  )
}
