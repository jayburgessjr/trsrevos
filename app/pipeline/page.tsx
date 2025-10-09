import { PageDescription, PageHeader, PageTitle } from '@/ui/page-header'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/ui/card'
import { Badge } from '@/ui/badge'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/ui/table'
import { Button } from '@/ui/button'
import { Select } from '@/ui/select'

const mockDeals = [
  { id: '1', name: 'Enterprise SaaS Platform', company: 'Acme Corp', stage: 'Negotiation', amount: 450000, probability: 75, closeDate: '2025-11-15', owner: 'Sarah Chen' },
  { id: '2', name: 'Revenue Analytics Suite', company: 'GlobalTech Inc', stage: 'Proposal', amount: 280000, probability: 60, closeDate: '2025-11-30', owner: 'Mike Johnson' },
  { id: '3', name: 'Customer Success Platform', company: 'DataFlow Systems', stage: 'Discovery', amount: 125000, probability: 35, closeDate: '2025-12-20', owner: 'Sarah Chen' },
  { id: '4', name: 'API Integration Package', company: 'CloudBridge', stage: 'Negotiation', amount: 95000, probability: 80, closeDate: '2025-10-25', owner: 'Alex Rivera' },
  { id: '5', name: 'Enterprise Expansion', company: 'TechVentures LLC', stage: 'Closed Won', amount: 520000, probability: 100, closeDate: '2025-10-01', owner: 'Mike Johnson' },
  { id: '6', name: 'Starter Package', company: 'Innovation Labs', stage: 'Qualification', amount: 45000, probability: 25, closeDate: '2025-12-15', owner: 'Alex Rivera' },
]

const pipelineGoal = 2500000
const totalWeighted = mockDeals.reduce((sum, deal) => sum + (deal.amount * deal.probability / 100), 0)
const coverage = (totalWeighted / pipelineGoal) * 100

export default function PipelinePage() {
  return (
    <div className="space-y-6">
      <PageHeader className="rounded-xl border border-[color:var(--color-outline)]">
        <PageTitle>Pipeline</PageTitle>
        <PageDescription>
          Track forecast health, coverage, and conversion across all active opportunities.
        </PageDescription>
        <div className="flex flex-wrap items-center gap-3 text-sm">
          <Badge variant={coverage >= 100 ? 'success' : 'outline'}>
            Coverage: {coverage.toFixed(0)}%
          </Badge>
          <span className="text-[color:var(--color-text-muted)]">
            ${(totalWeighted / 1000).toFixed(0)}K weighted pipeline
          </span>
        </div>
      </PageHeader>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Weighted Pipeline</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-semibold text-[color:var(--color-text)]">
              ${(totalWeighted / 1000).toFixed(0)}K
            </p>
            <p className="mt-1 text-xs text-[color:var(--color-text-muted)]">
              Target: ${(pipelineGoal / 1000).toFixed(0)}K
            </p>
            <div className="mt-3 h-2 overflow-hidden rounded-full bg-[color:var(--color-surface-muted)]">
              <div
                className="h-full bg-[color:var(--color-positive)]"
                style={{ width: `${Math.min(coverage, 100)}%` }}
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Active Opportunities</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-semibold text-[color:var(--color-text)]">
              {mockDeals.filter(d => d.stage !== 'Closed Won').length}
            </p>
            <p className="mt-1 text-xs text-[color:var(--color-text-muted)]">
              {mockDeals.filter(d => d.probability >= 60).length} high probability
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Closing This Month</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-semibold text-[color:var(--color-text)]">
              {mockDeals.filter(d => {
                const close = new Date(d.closeDate)
                return close.getMonth() === 9 && close.getFullYear() === 2025
              }).length}
            </p>
            <p className="mt-1 text-xs text-[color:var(--color-text-muted)]">
              ${mockDeals.filter(d => {
                const close = new Date(d.closeDate)
                return close.getMonth() === 9 && close.getFullYear() === 2025
              }).reduce((sum, d) => sum + d.amount, 0) / 1000}K value
            </p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <CardTitle>Deal pipeline</CardTitle>
              <CardDescription>All opportunities with stage, amount, and probability weighting.</CardDescription>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm">Filter by owner</Button>
              <Button variant="outline" size="sm">Filter by stage</Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Opportunity</TableHead>
                <TableHead>Company</TableHead>
                <TableHead>Stage</TableHead>
                <TableHead>Owner</TableHead>
                <TableHead className="text-right">Amount</TableHead>
                <TableHead className="text-right">Probability</TableHead>
                <TableHead className="text-right">Weighted</TableHead>
                <TableHead>Close Date</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {mockDeals.map((deal) => (
                <TableRow key={deal.id}>
                  <TableCell className="font-medium">{deal.name}</TableCell>
                  <TableCell>{deal.company}</TableCell>
                  <TableCell>
                    <Badge variant={
                      deal.stage === 'Closed Won' ? 'success' :
                      deal.stage === 'Negotiation' ? 'default' :
                      'outline'
                    }>
                      {deal.stage}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-sm text-[color:var(--color-text-muted)]">{deal.owner}</TableCell>
                  <TableCell className="text-right font-medium">${(deal.amount / 1000).toFixed(0)}K</TableCell>
                  <TableCell className="text-right">{deal.probability}%</TableCell>
                  <TableCell className="text-right font-medium text-[color:var(--color-text)]">
                    ${(deal.amount * deal.probability / 100 / 1000).toFixed(0)}K
                  </TableCell>
                  <TableCell className="text-sm text-[color:var(--color-text-muted)]">
                    {new Date(deal.closeDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Stage velocity</CardTitle>
          <CardDescription>Average days in each pipeline stage (last 30 days).</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[
              { stage: 'Discovery', days: 12, deals: 8 },
              { stage: 'Qualification', days: 18, deals: 5 },
              { stage: 'Proposal', days: 22, deals: 6 },
              { stage: 'Negotiation', days: 15, deals: 4 },
            ].map((item) => (
              <div key={item.stage}>
                <div className="mb-1 flex items-center justify-between text-sm">
                  <span className="font-medium text-[color:var(--color-text)]">{item.stage}</span>
                  <span className="text-[color:var(--color-text-muted)]">{item.days} days avg • {item.deals} deals</span>
                </div>
                <div className="h-2 overflow-hidden rounded-full bg-[color:var(--color-surface-muted)]">
                  <div
                    className="h-full bg-[color:var(--color-primary)]"
                    style={{ width: `${(item.days / 30) * 100}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
