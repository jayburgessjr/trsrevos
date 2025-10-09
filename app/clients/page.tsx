import { Badge } from '@/ui/badge'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/ui/card'
import { PageDescription, PageHeader, PageTitle } from '@/ui/page-header'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/ui/table'

export default function ClientsPage() {
  return (
    <div className="space-y-6">
      <PageHeader className="rounded-xl border border-[color:var(--color-outline)]">
        <PageTitle>Clients</PageTitle>
        <PageDescription>Directory of accounts, health, and TRS Score levers. TODO: connect to account service.</PageDescription>
        <Badge variant="outline">Client sync pending</Badge>
      </PageHeader>
      <Card>
        <CardHeader>
          <CardTitle>Account overview</CardTitle>
          <CardDescription>TODO: pipe ARR, NRR, and TRS score banding.</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Account</TableHead>
                <TableHead>Segment</TableHead>
                <TableHead>Owner</TableHead>
                <TableHead>TRS Score</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              <TableRow>
                <TableCell colSpan={4} className="text-sm text-[color:var(--color-text-muted)]">
                  No accounts loaded. TODO: fetch from client directory API.
                </TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle>Voice of customer</CardTitle>
          <CardDescription>TODO: surface sentiment snapshots and upcoming check-ins.</CardDescription>
        </CardHeader>
        <CardContent className="text-sm text-[color:var(--color-text-muted)]">
          Feedback stream offline. Connect to CS insights feed soon.
        </CardContent>
      </Card>
    </div>
  )
}
