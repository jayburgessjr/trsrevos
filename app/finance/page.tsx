import { Badge } from '@/ui/badge'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/ui/card'
import { PageDescription, PageHeader, PageTitle } from '@/ui/page-header'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/ui/table'

export default function FinancePage() {
  return (
    <div className="space-y-6">
      <PageHeader className="rounded-xl border border-[color:var(--color-outline)]">
        <PageTitle>Finance</PageTitle>
        <PageDescription>
          Monitor efficiency metrics, runway, and reconciliations. TODO: plug into finance data warehouse and ledger connectors.
        </PageDescription>
        <Badge variant="outline">Finance guardrails coming soon</Badge>
      </PageHeader>
      <Card>
        <CardHeader>
          <CardTitle>Capital efficiency</CardTitle>
          <CardDescription>TODO: compute burn multiple, rule of 40, and margin trendlines.</CardDescription>
        </CardHeader>
        <CardContent className="text-sm text-[color:var(--color-text-muted)]">
          Metrics offline. Awaiting integration with finance ETL job.
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle>Invoice aging</CardTitle>
          <CardDescription>TODO: show invoice buckets and actions.</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Client</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Due</TableHead>
                <TableHead>Amount</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              <TableRow>
                <TableCell colSpan={4} className="text-sm text-[color:var(--color-text-muted)]">
                  No invoices pulled. TODO: connect to billing service.
                </TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}
