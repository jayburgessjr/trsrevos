import { Badge } from '@/ui/badge'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/ui/card'
import { PageDescription, PageHeader, PageTitle } from '@/ui/page-header'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/ui/table'
import { Button } from '@/ui/button'
import { TopTabs } from '@/components/kit/TopTabs'

const mockPartners = [
  { id: '1', name: 'Strategic Consulting Group', tier: 'Platinum', status: 'Active', revenue: 485000, deals: 12, enablement: 95, lastActivity: '2025-10-05' },
  { id: '2', name: 'TechSolutions Partners', tier: 'Gold', status: 'Active', revenue: 325000, deals: 8, enablement: 80, lastActivity: '2025-10-07' },
  { id: '3', name: 'Global Integration Services', tier: 'Silver', status: 'Active', revenue: 125000, deals: 5, enablement: 65, lastActivity: '2025-09-28' },
  { id: '4', name: 'CloudBridge Alliance', tier: 'Gold', status: 'Onboarding', revenue: 0, deals: 0, enablement: 45, lastActivity: '2025-10-08' },
  { id: '5', name: 'Enterprise Enablement Co', tier: 'Silver', status: 'Active', revenue: 95000, deals: 3, enablement: 70, lastActivity: '2025-10-03' },
  { id: '6', name: 'Innovation Partners Network', tier: 'Bronze', status: 'Inactive', revenue: 28000, deals: 1, enablement: 30, lastActivity: '2025-08-15' },
]

const pipelineBySource = [
  { source: 'Partner sourced', deals: 15, value: 1250000 },
  { source: 'Partner influenced', deals: 8, value: 680000 },
  { source: 'Co-sell', deals: 5, value: 420000 },
]

const totalPartnerRevenue = mockPartners.reduce((sum, p) => sum + p.revenue, 0)
const activePartners = mockPartners.filter(p => p.status === 'Active').length

export default function PartnersPage({
  searchParams,
}: {
  searchParams: { tab?: string }
}) {
  const tab = searchParams?.tab ?? 'Overview'

  const body = (
    <div className="space-y-6">
      <PageHeader className="rounded-xl border border-[color:var(--color-outline)]">
        <PageTitle>Partners</PageTitle>
        <PageDescription>
          Partner ecosystem management, revenue attribution, and enablement tracking.
        </PageDescription>
        <div className="flex flex-wrap items-center gap-2 text-sm">
          <Badge variant="success">{activePartners} Active Partners</Badge>
          <Badge variant="default">${(totalPartnerRevenue / 1000).toFixed(0)}K sourced revenue</Badge>
        </div>
      </PageHeader>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Total Partners</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-semibold text-[color:var(--color-text)]">{mockPartners.length}</p>
            <p className="mt-1 text-xs text-[color:var(--color-text-muted)]">{activePartners} active</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Partner Revenue</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-semibold text-[color:var(--color-text)]">
              ${(totalPartnerRevenue / 1000).toFixed(0)}K
            </p>
            <p className="mt-1 text-xs text-[color:var(--color-positive)]">↑ 18% QoQ</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Partner Deals</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-semibold text-[color:var(--color-text)]">
              {mockPartners.reduce((sum, p) => sum + p.deals, 0)}
            </p>
            <p className="mt-1 text-xs text-[color:var(--color-text-muted)]">All time</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Avg Enablement Score</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-semibold text-[color:var(--color-text)]">
              {Math.round(mockPartners.reduce((sum, p) => sum + p.enablement, 0) / mockPartners.length)}%
            </p>
            <p className="mt-1 text-xs text-[color:var(--color-text-muted)]">Across all partners</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <CardTitle>Partner directory</CardTitle>
              <CardDescription>All ecosystem partners with tier, status, and performance metrics.</CardDescription>
            </div>
            <Button variant="primary" size="sm">Add partner</Button>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Partner Name</TableHead>
                <TableHead>Tier</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Revenue Sourced</TableHead>
                <TableHead className="text-right">Deals</TableHead>
                <TableHead className="text-right">Enablement</TableHead>
                <TableHead>Last Activity</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {mockPartners.map((partner) => (
                <TableRow key={partner.id}>
                  <TableCell className="font-medium">{partner.name}</TableCell>
                  <TableCell>
                    <Badge variant={
                      partner.tier === 'Platinum' ? 'default' :
                      partner.tier === 'Gold' ? 'success' :
                      'outline'
                    }>
                      {partner.tier}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge variant={
                      partner.status === 'Active' ? 'success' :
                      partner.status === 'Onboarding' ? 'default' :
                      'outline'
                    }>
                      {partner.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right font-medium">
                    ${partner.revenue > 0 ? (partner.revenue / 1000).toFixed(0) + 'K' : '—'}
                  </TableCell>
                  <TableCell className="text-right">{partner.deals}</TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-2">
                      <div className="h-2 w-16 overflow-hidden rounded-full bg-[color:var(--color-surface-muted)]">
                        <div
                          className={`h-full ${
                            partner.enablement >= 80 ? 'bg-[color:var(--color-positive)]' :
                            partner.enablement >= 60 ? 'bg-[color:var(--color-primary)]' :
                            'bg-yellow-500'
                          }`}
                          style={{ width: `${partner.enablement}%` }}
                        />
                      </div>
                      <span className="text-xs text-[color:var(--color-text-muted)]">{partner.enablement}%</span>
                    </div>
                  </TableCell>
                  <TableCell className="text-sm text-[color:var(--color-text-muted)]">
                    {new Date(partner.lastActivity).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
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
            <CardTitle>Partner pipeline attribution</CardTitle>
            <CardDescription>Revenue breakdown by partner sourcing model.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {pipelineBySource.map((item) => (
                <div key={item.source}>
                  <div className="mb-1 flex items-center justify-between text-sm">
                    <span className="font-medium text-[color:var(--color-text)]">{item.source}</span>
                    <span className="text-[color:var(--color-text-muted)]">
                      {item.deals} deals • ${(item.value / 1000).toFixed(0)}K
                    </span>
                  </div>
                  <div className="h-2 overflow-hidden rounded-full bg-[color:var(--color-surface-muted)]">
                    <div
                      className="h-full bg-[color:var(--color-primary)]"
                      style={{ width: `${(item.value / 1250000) * 100}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Enablement scorecard</CardTitle>
            <CardDescription>Partner certification and training completion status.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {[
                { category: 'Product certification', completion: 85, partners: 5 },
                { category: 'Sales methodology', completion: 70, partners: 4 },
                { category: 'Technical training', completion: 60, partners: 3 },
                { category: 'Marketing co-sell', completion: 45, partners: 2 },
              ].map((item) => (
                <div key={item.category}>
                  <div className="mb-1 flex items-center justify-between text-sm">
                    <span className="font-medium text-[color:var(--color-text)]">{item.category}</span>
                    <span className="text-[color:var(--color-text-muted)]">
                      {item.partners} partners • {item.completion}%
                    </span>
                  </div>
                  <div className="h-2 overflow-hidden rounded-full bg-[color:var(--color-surface-muted)]">
                    <div
                      className={`h-full ${
                        item.completion >= 80 ? 'bg-[color:var(--color-positive)]' :
                        item.completion >= 60 ? 'bg-[color:var(--color-primary)]' :
                        'bg-yellow-500'
                      }`}
                      style={{ width: `${item.completion}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
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
