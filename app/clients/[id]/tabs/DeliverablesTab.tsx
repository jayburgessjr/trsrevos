'use client'

import { useState, useTransition } from 'react'

import { linkDeliverable, unlinkDeliverable } from '@/core/clients/actions'
import { ClientDeliverable } from '@/core/clients/types'
import { Badge } from '@/ui/badge'
import { Button } from '@/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/ui/card'
import { Input } from '@/ui/input'

const TYPE_OPTIONS = [
  { value: 'content', label: 'Content' },
  { value: 'dashboard', label: 'Dashboard' },
  { value: 'doc', label: 'Doc' },
  { value: 'link', label: 'External Link' },
]

type DeliverablesTabProps = {
  clientId: string
  items: ClientDeliverable[]
}

type DeliverableForm = {
  title: string
  type: string
  url: string
  share_expires_at: string
}

const initialForm: DeliverableForm = {
  title: '',
  type: 'content',
  url: '',
  share_expires_at: '',
}

export default function DeliverablesTab({ clientId, items: initialItems }: DeliverablesTabProps) {
  const [items, setItems] = useState(initialItems)
  const [form, setForm] = useState(initialForm)
  const [pendingId, setPendingId] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()

  const handleSubmit = () => {
    if (!form.title.trim()) return
    setPendingId('new')
    startTransition(async () => {
      const result = await linkDeliverable({
        clientId,
        title: form.title.trim(),
        type: form.type,
        url: form.url.trim() || undefined,
        share_expires_at: form.share_expires_at.trim() || undefined,
      })
      if (result) {
        setItems((prev) => [result, ...prev])
        setForm(initialForm)
      }
      setPendingId(null)
    })
  }

  const handleRemove = (id: string) => {
    setPendingId(id)
    startTransition(async () => {
      const success = await unlinkDeliverable(id)
      if (success) {
        setItems((prev) => prev.filter((item) => item.id !== id))
      }
      setPendingId(null)
    })
  }

  return (
    <div className="flex flex-col gap-4">
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Link a deliverable</CardTitle>
          <CardDescription>Surface the assets and dashboards that support this client.</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-3 md:grid-cols-4">
          <div className="md:col-span-2">
            <label className="text-xs font-medium text-[color:var(--color-text-muted)]" htmlFor="deliverable-title">
              Title
            </label>
            <Input
              id="deliverable-title"
              value={form.title}
              onChange={(event) => setForm((prev) => ({ ...prev, title: event.target.value }))}
              placeholder="Board deck, Looker dashboard, etc."
            />
          </div>
          <div>
            <label className="text-xs font-medium text-[color:var(--color-text-muted)]" htmlFor="deliverable-type">
              Type
            </label>
            <select
              id="deliverable-type"
              value={form.type}
              onChange={(event) => setForm((prev) => ({ ...prev, type: event.target.value }))}
              className="w-full rounded-md border border-[color:var(--color-outline)] bg-white px-3 py-2 text-sm"
            >
              {TYPE_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="text-xs font-medium text-[color:var(--color-text-muted)]" htmlFor="deliverable-expiration">
              Share expires on (optional)
            </label>
            <Input
              id="deliverable-expiration"
              type="date"
              value={form.share_expires_at}
              onChange={(event) => setForm((prev) => ({ ...prev, share_expires_at: event.target.value }))}
            />
          </div>
          <div className="md:col-span-4">
            <label className="text-xs font-medium text-[color:var(--color-text-muted)]" htmlFor="deliverable-url">
              URL (optional)
            </label>
            <Input
              id="deliverable-url"
              value={form.url}
              onChange={(event) => setForm((prev) => ({ ...prev, url: event.target.value }))}
              placeholder="https://"
            />
          </div>
          <div className="md:col-span-4 flex justify-end">
            <Button onClick={handleSubmit} disabled={isPending && pendingId === 'new'}>
              Link deliverable
            </Button>
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-4 md:grid-cols-2">
        {items.length ? (
          items.map((deliverable) => {
            const title = deliverable.title ?? deliverable.name ?? 'Untitled'
            const expires = deliverable.share_expires_at
              ? new Date(deliverable.share_expires_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
              : null
            return (
              <Card key={deliverable.id} className="flex flex-col gap-3 border-[color:var(--color-outline)] p-4">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <CardTitle className="text-sm font-semibold text-[color:var(--color-text)]">{title}</CardTitle>
                    <p className="text-xs text-[color:var(--color-text-muted)]">{deliverable.url ?? deliverable.link ?? 'No link provided'}</p>
                  </div>
                  <Badge variant="outline">{deliverable.type ?? 'content'}</Badge>
                </div>
                {expires ? (
                  <p className="text-xs text-[color:var(--color-text-muted)]">Share expires {expires}</p>
                ) : null}
                <div className="flex justify-end">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleRemove(deliverable.id)}
                    disabled={isPending && pendingId === deliverable.id}
                  >
                    Remove
                  </Button>
                </div>
              </Card>
            )
          })
        ) : (
          <p className="md:col-span-2 rounded-lg border border-dashed border-[color:var(--color-outline)] px-4 py-10 text-center text-sm text-[color:var(--color-text-muted)]">
            No deliverables linked yet.
          </p>
        )}
      </div>
    </div>
  )
}
