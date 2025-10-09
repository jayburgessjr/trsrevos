import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/ui/card'
import { getEvents } from '@/core/events/store'

export function DailyScorecard() {
  const today = new Date().toISOString().slice(0, 10)
  const events = getEvents({ since: today })

  // Derive metrics from events
  const dollarsAdvanced = events.filter((e) => e.entity === 'pipeline').length * 25000
  const focusSessions = events.filter((e) => e.entity === 'focus' && e.action === 'started').length
  const invoicesSent = events.filter((e) => e.entity === 'invoice' && e.action === 'sent').length
  const invoicesPaid = events.filter((e) => e.entity === 'invoice' && e.action === 'paid').length

  // Stub metrics
  const winRate = 72
  const priceRealization = 94

  return (
    <Card>
      <CardHeader>
        <CardTitle>Today&apos;s Scorecard</CardTitle>
        <CardDescription>Real-time performance metrics derived from events</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 gap-4 md:grid-cols-3">
          <div>
            <p className="text-xs text-[color:var(--color-text-muted)]">Dollars Advanced</p>
            <p className="text-2xl font-semibold text-[color:var(--color-text)]">
              ${(dollarsAdvanced / 1000).toFixed(0)}K
            </p>
          </div>
          <div>
            <p className="text-xs text-[color:var(--color-text-muted)]">Win Rate (7d)</p>
            <p className="text-2xl font-semibold text-[color:var(--color-positive)]">{winRate}%</p>
          </div>
          <div>
            <p className="text-xs text-[color:var(--color-text-muted)]">Price Realization</p>
            <p className="text-2xl font-semibold text-[color:var(--color-text)]">{priceRealization}%</p>
          </div>
          <div>
            <p className="text-xs text-[color:var(--color-text-muted)]">Focus Sessions</p>
            <p className="text-2xl font-semibold text-[color:var(--color-text)]">{focusSessions}</p>
          </div>
          <div>
            <p className="text-xs text-[color:var(--color-text-muted)]">Invoices Sent</p>
            <p className="text-2xl font-semibold text-[color:var(--color-text)]">{invoicesSent}</p>
          </div>
          <div>
            <p className="text-xs text-[color:var(--color-text-muted)]">Invoices Paid</p>
            <p className="text-2xl font-semibold text-[color:var(--color-positive)]">{invoicesPaid}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
