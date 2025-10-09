import { Badge } from '@/ui/badge'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/ui/card'
import { PageDescription, PageHeader, PageTitle } from '@/ui/page-header'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/ui/table'
import { Button } from '@/ui/button'
import { TopTabs } from '@/components/kit/TopTabs'

const mockInvoices = [
  { id: '1', client: 'Acme Corp', invoiceNumber: 'INV-2025-1043', status: 'Paid', dueDate: '2025-09-30', amount: 45000, daysOverdue: 0 },
  { id: '2', client: 'GlobalTech Inc', invoiceNumber: 'INV-2025-1044', status: 'Pending', dueDate: '2025-10-15', amount: 28000, daysOverdue: 0 },
  { id: '3', client: 'DataFlow Systems', invoiceNumber: 'INV-2025-1045', status: 'Overdue', dueDate: '2025-09-25', amount: 12500, daysOverdue: 13 },
  { id: '4', client: 'CloudBridge', invoiceNumber: 'INV-2025-1046', status: 'Pending', dueDate: '2025-10-20', amount: 9500, daysOverdue: 0 },
  { id: '5', client: 'TechVentures LLC', invoiceNumber: 'INV-2025-1047', status: 'Paid', dueDate: '2025-09-15', amount: 52000, daysOverdue: 0 },
  { id: '6', client: 'Innovation Labs', invoiceNumber: 'INV-2025-1048', status: 'Overdue', dueDate: '2025-10-01', amount: 4500, daysOverdue: 7 },
]

const currentARR = 2840000
const monthlyBurn = 185000
const runway = 18.5
const burnMultiple = 0.65
const nrr = 118
const ruleOf40 = 62

export default function FinancePage({
  searchParams,
}: {
  searchParams: { tab?: string }
}) {
  const tab = searchParams?.tab ?? 'Overview'
  const totalOutstanding = mockInvoices.filter(i => i.status !== 'Paid').reduce((sum, i) => sum + i.amount, 0)
  const overdueAmount = mockInvoices.filter(i => i.status === 'Overdue').reduce((sum, i) => sum + i.amount, 0)

  const body = (
    <div className="space-y-6">
      <PageHeader className="rounded-xl border border-[color:var(--color-outline)]">
        <PageTitle>Finance</PageTitle>
        <PageDescription>
          Monitor efficiency metrics, runway, cash flow, and accounts receivable.
        </PageDescription>
        <div className="flex flex-wrap items-center gap-2 text-sm">
          <Badge variant="success">ARR: ${(currentARR / 1000000).toFixed(1)}M</Badge>
          <Badge variant="default">Runway: {runway}mo</Badge>
          {overdueAmount > 0 && <Badge variant="outline">${(overdueAmount / 1000).toFixed(0)}K overdue</Badge>}
        </div>
      </PageHeader>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Annual Recurring Revenue</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-semibold text-[color:var(--color-text)]">
              ${(currentARR / 1000000).toFixed(2)}M
            </p>
            <p className="mt-1 text-xs text-[color:var(--color-positive)]">↑ 12% MoM</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Net Revenue Retention</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-semibold text-[color:var(--color-text)]">{nrr}%</p>
            <p className="mt-1 text-xs text-[color:var(--color-text-muted)]">Last 12 months</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Rule of 40</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-semibold text-[color:var(--color-text)]">{ruleOf40}%</p>
            <p className="mt-1 text-xs text-[color:var(--color-text-muted)]">Growth + margin</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Monthly Burn</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-semibold text-[color:var(--color-text)]">
              ${(monthlyBurn / 1000).toFixed(0)}K
            </p>
            <p className="mt-1 text-xs text-[color:var(--color-text-muted)]">Average last 3 months</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Burn Multiple</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-semibold text-[color:var(--color-text)]">{burnMultiple}x</p>
            <p className="mt-1 text-xs text-[color:var(--color-positive)]">Efficient</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Cash Runway</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-semibold text-[color:var(--color-text)]">{runway}</p>
            <p className="mt-1 text-xs text-[color:var(--color-text-muted)]">Months at current burn</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Revenue waterfall (Last 30 days)</CardTitle>
          <CardDescription>Monthly ARR movement breakdown by expansion, contraction, and churn.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[
              { label: 'Starting ARR', value: 2720000, change: 0, type: 'base' },
              { label: 'New business', value: 185000, change: 185000, type: 'positive' },
              { label: 'Expansion', value: 95000, change: 95000, type: 'positive' },
              { label: 'Contraction', value: -45000, change: -45000, type: 'negative' },
              { label: 'Churn', value: -115000, change: -115000, type: 'negative' },
              { label: 'Ending ARR', value: 2840000, change: 120000, type: 'ending' },
            ].map((item, index) => (
              <div key={index}>
                <div className="mb-1 flex items-center justify-between text-sm">
                  <span className={`font-medium ${
                    item.type === 'ending' ? 'text-[color:var(--color-text)]' :
                    item.type === 'base' ? 'text-[color:var(--color-text-muted)]' :
                    'text-[color:var(--color-text)]'
                  }`}>
                    {item.label}
                  </span>
                  <div className="flex items-center gap-2">
                    <span className={`text-sm ${
                      item.type === 'positive' ? 'text-[color:var(--color-positive)]' :
                      item.type === 'negative' ? 'text-[color:var(--color-negative)]' :
                      'text-[color:var(--color-text)]'
                    }`}>
                      ${(item.value / 1000).toFixed(0)}K
                    </span>
                  </div>
                </div>
                {item.type !== 'base' && item.type !== 'ending' && (
                  <div className="h-2 overflow-hidden rounded-full bg-[color:var(--color-surface-muted)]">
                    <div
                      className={`h-full ${
                        item.type === 'positive' ? 'bg-[color:var(--color-positive)]' :
                        'bg-[color:var(--color-negative)]'
                      }`}
                      style={{ width: `${(Math.abs(item.value) / 185000) * 100}%` }}
                    />
                  </div>
                )}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <CardTitle>Invoice aging</CardTitle>
              <CardDescription>Outstanding invoices by aging bucket with collection status.</CardDescription>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm">Export</Button>
              <Button variant="primary" size="sm">Send reminders</Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Client</TableHead>
                <TableHead>Invoice #</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Due Date</TableHead>
                <TableHead className="text-right">Amount</TableHead>
                <TableHead className="text-right">Days Overdue</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {mockInvoices.map((invoice) => (
                <TableRow key={invoice.id}>
                  <TableCell className="font-medium">{invoice.client}</TableCell>
                  <TableCell className="text-sm text-[color:var(--color-text-muted)]">{invoice.invoiceNumber}</TableCell>
                  <TableCell>
                    <Badge variant={
                      invoice.status === 'Paid' ? 'success' :
                      invoice.status === 'Overdue' ? 'outline' :
                      'default'
                    }>
                      {invoice.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-sm text-[color:var(--color-text-muted)]">
                    {new Date(invoice.dueDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                  </TableCell>
                  <TableCell className="text-right font-medium">
                    ${invoice.amount.toLocaleString()}
                  </TableCell>
                  <TableCell className={`text-right text-sm ${
                    invoice.daysOverdue > 0 ? 'text-[color:var(--color-negative)]' : 'text-[color:var(--color-text-muted)]'
                  }`}>
                    {invoice.daysOverdue > 0 ? invoice.daysOverdue : '—'}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          <div className="mt-4 flex items-center justify-between rounded-lg bg-[color:var(--color-surface-muted)]/40 p-3 text-sm">
            <span className="text-[color:var(--color-text-muted)]">Total Outstanding</span>
            <span className="font-semibold text-[color:var(--color-text)]">
              ${totalOutstanding.toLocaleString()}
            </span>
          </div>
        </CardContent>
      </Card>
    </div>
  )

  return (
    <div className="min-h-screen bg-white text-black">
      <div className="px-4 py-3 border-b border-gray-200 flex items-center justify-between">
        <TopTabs />
        <div className="text-xs text-gray-600">{tab}</div>
      </div>
      <main className="max-w-7xl mx-auto p-4">{body}</main>
    </div>
  )
}
