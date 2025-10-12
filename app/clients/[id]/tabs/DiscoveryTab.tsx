'use client'

import { useMemo, useState, useTransition } from 'react'

import { saveDiscovery } from '@/core/clients/actions'
import { DiscoveryResponse } from '@/core/clients/types'
import { Badge } from '@/ui/badge'
import { Button } from '@/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/ui/card'
import { Textarea } from '@/ui/textarea'

const FORM_DEFINITIONS: Array<{
  key: DiscoveryResponse['form_type']
  title: string
  description: string
}> = [
  {
    key: 'gap_selling',
    title: 'Gap Selling Brief',
    description: 'Capture the current state, desired future state, and quantified business impact across teams.',
  },
  {
    key: 'clarity_gap',
    title: 'Clarity Gap Diagnostic',
    description: 'Surface gaps across data, enablement, and execution that limit the growth program.',
  },
  {
    key: 'revenue_research',
    title: 'Revenue Research Notes',
    description: 'Document qualitative signal from customers, partners, and internal stakeholders.',
  },
]

type DiscoveryTabProps = {
  clientId: string
  responses: DiscoveryResponse[]
}

type FormState = {
  value: string
  error: string | null
  completed: boolean
  updatedAt: string | null
}

const formatTimestamp = (value: string | null) => {
  if (!value) return null
  const dt = new Date(value)
  if (Number.isNaN(dt.getTime())) return null
  return dt.toLocaleString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })
}

export default function DiscoveryTab({ clientId, responses }: DiscoveryTabProps) {
  const responseMap = useMemo(() => {
    const map = new Map<DiscoveryResponse['form_type'], DiscoveryResponse>()
    responses.forEach((response) => map.set(response.form_type, response))
    return map
  }, [responses])

  const initialState = useMemo<Record<string, FormState>>(
    () =>
      FORM_DEFINITIONS.reduce((acc, form) => {
        const existing = responseMap.get(form.key)
        acc[form.key] = {
          value: existing ? JSON.stringify(existing.answers ?? {}, null, 2) : '{\n  "summary": ""\n}',
          error: null,
          completed: Boolean(existing?.completed_at),
          updatedAt: existing?.updated_at ?? existing?.created_at ?? null,
        }
        return acc
      }, {} as Record<string, FormState>),
    [responseMap],
  )

  const [forms, setForms] = useState(initialState)
  const [pendingKey, setPendingKey] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()

  const handleChange = (key: string, value: string) => {
    setForms((prev) => ({
      ...prev,
      [key]: {
        ...prev[key],
        value,
        error: null,
      },
    }))
  }

  const handleSave = (key: string, markComplete: boolean) => {
    const raw = forms[key]
    if (!raw) return

    let parsed: Record<string, unknown>
    try {
      parsed = JSON.parse(raw.value)
    } catch (error) {
      setForms((prev) => ({
        ...prev,
        [key]: { ...prev[key], error: 'Answers must be valid JSON.' },
      }))
      return
    }

    setPendingKey(key)
    startTransition(async () => {
      const result = await saveDiscovery(key as DiscoveryResponse['form_type'], clientId, parsed, {
        completed: markComplete,
      })
      setForms((prev) => ({
        ...prev,
        [key]: {
          value: JSON.stringify(parsed, null, 2),
          error: null,
          completed: markComplete || Boolean(result?.completed_at),
          updatedAt: result?.updated_at ?? result?.created_at ?? new Date().toISOString(),
        },
      }))
      setPendingKey(null)
    })
  }

  return (
    <div className="grid gap-4 md:grid-cols-3">
      {FORM_DEFINITIONS.map((form) => {
        const state = forms[form.key]
        const completedBadge = state?.completed
          ? { label: 'Completed', variant: 'success' as const }
          : { label: 'In Progress', variant: 'outline' as const }
        return (
          <Card key={form.key} className="flex flex-col border-[color:var(--color-outline)]">
            <CardHeader className="flex flex-col gap-2">
              <div className="flex items-center justify-between">
                <CardTitle>{form.title}</CardTitle>
                <Badge variant={completedBadge.variant}>{completedBadge.label}</Badge>
              </div>
              <CardDescription>{form.description}</CardDescription>
              {state?.updatedAt ? (
                <p className="text-xs text-[color:var(--color-text-muted)]">
                  Updated {formatTimestamp(state.updatedAt)}
                </p>
              ) : null}
            </CardHeader>
            <CardContent className="flex flex-1 flex-col gap-3">
              <Textarea
                value={state?.value ?? ''}
                onChange={(event) => handleChange(form.key, event.target.value)}
                className="min-h-[220px] font-mono"
                spellCheck={false}
              />
              {state?.error ? (
                <p className="text-xs text-[color:var(--color-critical)]">{state.error}</p>
              ) : null}
              <div className="mt-auto flex items-center justify-between gap-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleSave(form.key, false)}
                  disabled={isPending && pendingKey === form.key}
                >
                  Save draft
                </Button>
                <Button
                  size="sm"
                  onClick={() => handleSave(form.key, true)}
                  disabled={isPending && pendingKey === form.key}
                >
                  Save & complete
                </Button>
              </div>
            </CardContent>
          </Card>
        )
      })}
    </div>
  )
}
