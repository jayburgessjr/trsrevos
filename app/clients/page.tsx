import { Badge } from '@/ui/badge'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/ui/card'
import { PageDescription, PageHeader, PageTitle } from '@/ui/page-header'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/ui/table'
import { Button } from '@/ui/button'

const mockClients = [
  { id: '1', name: 'Acme Corp', segment: 'Enterprise', arr: 450000, owner: 'Sarah Chen', trsScore: 82, health: 'green', nps: 45, renewalDate: '2026-03-15' },
  { id: '2', name: 'GlobalTech Inc', segment: 'Mid-Market', arr: 280000, owner: 'Mike Johnson', trsScore: 68, health: 'yellow', nps: 30, renewalDate: '2025-12-20' },
  { id: '3', name: 'DataFlow Systems', segment: 'SMB', arr: 125000, owner: 'Sarah Chen', trsScore: 71, health: 'green', nps: 38, renewalDate: '2026-01-10' },
  { id: '4', name: 'CloudBridge', segment: 'SMB', arr: 95000, owner: 'Alex Rivera', trsScore: 55, health: 'red', nps: 15, renewalDate: '2025-11-05' },
  { id: '5', name: 'TechVentures LLC', segment: 'Enterprise', arr: 520000, owner: 'Mike Johnson', trsScore: 88, health: 'green', nps: 52, renewalDate: '2026-04-22' },
  { id: '6', name: 'Innovation Labs', segment: 'Mid-Market', arr: 145000, owner: 'Alex Rivera', trsScore: 64, health: 'yellow', nps: 28, renewalDate: '2025-10-30' },
]

const totalARR = mockClients.reduce((sum, c) => sum + c.arr, 0)
const avgNPS = Math.round(mockClients.reduce((sum, c) => sum + c.nps, 0) / mockClients.length)
const atRisk = mockClients.filter(c => c.health === 'red' || c.health === 'yellow').length

export default function ClientsPage() {
  return (
    <div className="space-y-6">
      <PageHeader className="rounded-xl border border-[color:var(--color-outline)]">
        <PageTitle>Clients</PageTitle>
        <PageDescription>
          Client directory with account health, TRS scores, and renewal tracking.
        </PageDescription>
        <div className="flex flex-wrap items-center gap-2 text-sm">
          <Badge variant="success">{mockClients.length} Active Accounts</Badge>
          <Badge variant="default">NPS {avgNPS}</Badge>
          {atRisk > 0 && <Badge variant="outline">{atRisk} At Risk</Badge>}
        </div>
      </PageHeader>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Total ARR</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-semibold text-[color:var(--color-text)]">
              ${(totalARR / 1000000).toFixed(2)}M
            </p>
            <p className="mt-1 text-xs text-[color:var(--color-positive)]">↑ 8% QoQ</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Active Accounts</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-semibold text-[color:var(--color-text)]">{mockClients.length}</p>
            <p className="mt-1 text-xs text-[color:var(--color-text-muted)]">
              {mockClients.filter(c => c.segment === 'Enterprise').length} enterprise
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Average NPS</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-semibold text-[color:var(--color-text)]">{avgNPS}</p>
            <p className="mt-1 text-xs text-[color:var(--color-text-muted)]">Last 90 days</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">At Risk Accounts</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-semibold text-[color:var(--color-text)]">{atRisk}</p>
            <p className="mt-1 text-xs text-[color:var(--color-text-muted)]">
              ${mockClients.filter(c => c.health === 'red' || c.health === 'yellow').reduce((sum, c) => sum + c.arr, 0) / 1000}K ARR
            </p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <CardTitle>Account directory</CardTitle>
              <CardDescription>All client accounts with health scores, ARR, and renewal dates.</CardDescription>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm">Filter</Button>
              <Button variant="outline" size="sm">Export</Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Account Name</TableHead>
                <TableHead>Segment</TableHead>
                <TableHead>Owner</TableHead>
                <TableHead className="text-right">ARR</TableHead>
                <TableHead className="text-right">TRS Score</TableHead>
                <TableHead className="text-right">NPS</TableHead>
                <TableHead>Health</TableHead>
                <TableHead>Renewal Date</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {mockClients.map((client) => (
                <TableRow key={client.id}>
                  <TableCell className="font-medium">{client.name}</TableCell>
                  <TableCell>
                    <Badge variant={
                      client.segment === 'Enterprise' ? 'default' :
                      client.segment === 'Mid-Market' ? 'success' :
                      'outline'
                    }>
                      {client.segment}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-sm text-[color:var(--color-text-muted)]">{client.owner}</TableCell>
                  <TableCell className="text-right font-medium">
                    ${(client.arr / 1000).toFixed(0)}K
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-2">
                      <span className={`text-sm font-medium ${
                        client.trsScore >= 80 ? 'text-[color:var(--color-positive)]' :
                        client.trsScore >= 65 ? 'text-[color:var(--color-text)]' :
                        'text-[color:var(--color-negative)]'
                      }`}>
                        {client.trsScore}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell className="text-right text-sm text-[color:var(--color-text-muted)]">
                    {client.nps}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <div className={`h-3 w-3 rounded-full ${
                        client.health === 'green' ? 'bg-[color:var(--color-positive)]' :
                        client.health === 'yellow' ? 'bg-yellow-500' :
                        'bg-[color:var(--color-negative)]'
                      }`} />
                      <span className="text-xs capitalize text-[color:var(--color-text-muted)]">
                        {client.health}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell className="text-sm text-[color:var(--color-text-muted)]">
                    {new Date(client.renewalDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Health score distribution</CardTitle>
            <CardDescription>Client breakdown by overall health status.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {[
                { status: 'Healthy', count: mockClients.filter(c => c.health === 'green').length, color: 'bg-[color:var(--color-positive)]' },
                { status: 'At Risk', count: mockClients.filter(c => c.health === 'yellow').length, color: 'bg-yellow-500' },
                { status: 'Critical', count: mockClients.filter(c => c.health === 'red').length, color: 'bg-[color:var(--color-negative)]' },
              ].map((item) => (
                <div key={item.status}>
                  <div className="mb-1 flex items-center justify-between text-sm">
                    <span className="font-medium text-[color:var(--color-text)]">{item.status}</span>
                    <span className="text-[color:var(--color-text-muted)]">{item.count} accounts</span>
                  </div>
                  <div className="h-2 overflow-hidden rounded-full bg-[color:var(--color-surface-muted)]">
                    <div
                      className={`h-full ${item.color}`}
                      style={{ width: `${(item.count / mockClients.length) * 100}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Voice of customer</CardTitle>
            <CardDescription>Recent NPS feedback and sentiment highlights.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {[
                { client: 'TechVentures LLC', feedback: 'Excellent support response time and product reliability.', sentiment: 'positive', date: '2025-10-05' },
                { client: 'CloudBridge', feedback: 'Feature requests not being prioritized. Considering alternatives.', sentiment: 'negative', date: '2025-10-03' },
                { client: 'Acme Corp', feedback: 'Great ROI from recent implementation. Team is well-trained.', sentiment: 'positive', date: '2025-10-01' },
              ].map((item, index) => (
                <div key={index} className="rounded-lg border border-[color:var(--color-outline)] bg-white p-3">
                  <div className="flex items-start justify-between gap-2">
                    <p className="text-sm font-medium text-[color:var(--color-text)]">{item.client}</p>
                    <Badge variant={item.sentiment === 'positive' ? 'success' : 'outline'}>
                      {item.sentiment}
                    </Badge>
                  </div>
                  <p className="mt-1 text-sm text-[color:var(--color-text-muted)]">{item.feedback}</p>
                  <p className="mt-2 text-xs text-[color:var(--color-text-muted)]">
                    {new Date(item.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                  </p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Upcoming renewals</CardTitle>
          <CardDescription>Accounts with renewal dates in the next 90 days.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {mockClients
              .filter(c => {
                const renewal = new Date(c.renewalDate)
                const now = new Date()
                const daysUntil = Math.floor((renewal.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
                return daysUntil <= 90 && daysUntil >= 0
              })
              .map((client) => {
                const renewal = new Date(client.renewalDate)
                const now = new Date()
                const daysUntil = Math.floor((renewal.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
                return (
                  <div key={client.id} className="rounded-lg border border-[color:var(--color-outline)] bg-white p-4">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1">
                        <p className="font-medium text-[color:var(--color-text)]">{client.name}</p>
                        <p className="mt-1 text-sm text-[color:var(--color-text-muted)]">
                          ${(client.arr / 1000).toFixed(0)}K ARR • Owner: {client.owner}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant={daysUntil <= 30 ? 'outline' : 'default'}>
                          {daysUntil} days
                        </Badge>
                        <div className={`h-3 w-3 rounded-full ${
                          client.health === 'green' ? 'bg-[color:var(--color-positive)]' :
                          client.health === 'yellow' ? 'bg-yellow-500' :
                          'bg-[color:var(--color-negative)]'
                        }`} />
                      </div>
                    </div>
                  </div>
                )
              })}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
