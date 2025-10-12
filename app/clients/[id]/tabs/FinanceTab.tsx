'use client'

import { useMemo, useState, useTransition } from 'react'

import { saveFinanceTerms } from '@/core/clients/actions'
import type { ClientFinance } from '../ClientWorkspace'
import { Badge } from '@/ui/badge'
import { Button } from '@/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/ui/card'
import { Input } from '@/ui/input'

const ARRANGEMENT_OPTIONS = [
  { value: 'equity', label: 'Equity' },
  { value: 'advisory', label: 'Advisory' },
  { value: 'partnership', label: 'Partnership' },
]

type FinanceTabProps = {
  clientId: string
  finance: ClientFinance | null
}

const currencyFormatter = new Intl.NumberFormat('en-US', {
  style: 'currency',
  currency: 'USD',
  maximumFractionDigits: 0,
})

export default function FinanceTab({ clientId, finance }: FinanceTabProps) {
  const [arrangement, setArrangement] = useState(finance?.arrangement_type ?? '')
  const [equity, setEquity] = useState(finance?.equity_stake_pct != null ? String(finance.equity_stake_pct) : '')
  const [projection, setProjection] = useState(finance?.projection_mrr != null ? String(finance.projection_mrr) : '')
  const [isPending, startTransition] = useTransition()
  const [message, setMessage] = useState<string | null>(null)

  const mrr = useMemo(
    () => (finance?.monthly_recurring_revenue != null ? currencyFormatter.format(finance.monthly_recurring_revenue) : '—'),
    [finance?.monthly_recurring_revenue],
  )

  const outstanding = useMemo(
    () => (finance?.outstanding_invoices != null ? currencyFormatter.format(finance.outstanding_invoices) : '—'),
    [finance?.outstanding_invoices],
  )

  const handleSave = () => {
    startTransition(async () => {
      const result = await saveFinanceTerms({
        clientId,
        arrangement_type: arrangement || null,
        equity_stake_pct: equity ? Number.parseFloat(equity) : null,
        projection_mrr: projection ? Number.parseFloat(projection) : null,
      })
      if (result) {
        setMessage('Finance terms updated')
      }
    })
  }

  return (
    <div className="grid gap-4 md:grid-cols-2">
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Commercial terms</CardTitle>
          <CardDescription>Track the arrangement type, equity stake, and projected MRR.</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          <div className="grid gap-2">
            <label className="text-xs font-medium text-[color:var(--color-text-muted)]" htmlFor="arrangement-type">
              Arrangement type
            </label>
            <select
              id="arrangement-type"
              value={arrangement}
              onChange={(event) => setArrangement(event.target.value)}
              className="w-full rounded-md border border-[color:var(--color-outline)] bg-white px-3 py-2 text-sm"
            >
              <option value="">Select arrangement</option>
              {ARRANGEMENT_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
          <div className="grid gap-2">
            <label className="text-xs font-medium text-[color:var(--color-text-muted)]" htmlFor="equity-stake">
              Equity stake %
            </label>
            <Input
              id="equity-stake"
              type="number"
              step="0.1"
              value={equity}
              onChange={(event) => setEquity(event.target.value)}
              placeholder="5"
            />
          </div>
          <div className="grid gap-2">
            <label className="text-xs font-medium text-[color:var(--color-text-muted)]" htmlFor="projection-mrr">
              Projected MRR ($)
            </label>
            <Input
              id="projection-mrr"
              type="number"
              step="1000"
              value={projection}
              onChange={(event) => setProjection(event.target.value)}
              placeholder="50000"
            />
          </div>
          {message ? <p className="text-xs text-[color:var(--color-positive)]">{message}</p> : null}
          <div className="flex justify-end">
            <Button onClick={handleSave} disabled={isPending}>
              {isPending ? 'Saving…' : 'Save terms'}
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Financial snapshot</CardTitle>
          <CardDescription>Automated metrics from Supabase finance tables.</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-3">
          <div className="rounded-lg border border-[color:var(--color-outline)] px-3 py-3">
            <p className="text-xs font-medium uppercase tracking-wide text-[color:var(--color-text-muted)]">Current MRR</p>
            <p className="text-lg font-semibold text-[color:var(--color-text)]">{mrr}</p>
          </div>
          <div className="rounded-lg border border-[color:var(--color-outline)] px-3 py-3">
            <p className="text-xs font-medium uppercase tracking-wide text-[color:var(--color-text-muted)]">Outstanding invoices</p>
            <p className="text-lg font-semibold text-[color:var(--color-text)]">{outstanding}</p>
          </div>
          {finance?.updated_at ? (
            <Badge variant="outline">Updated {new Date(finance.updated_at).toLocaleDateString('en-US')}</Badge>
          ) : null}
        </CardContent>
      </Card>
    </div>
  )
}
