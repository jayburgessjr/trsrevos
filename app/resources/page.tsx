import { Badge } from '@/ui/badge'
import { Button } from '@/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/ui/card'
import { PageDescription, PageHeader, PageTitle } from '@/ui/page-header'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/ui/tabs'

const pricingScenarios = [
  { tier: 'Starter', list: 8500, floor: 7200, discountGuard: '15% max', packaging: 'Seats + usage' },
  { tier: 'Growth', list: 18500, floor: 16000, discountGuard: '12% max', packaging: 'Seats + workflow pack' },
  { tier: 'Enterprise', list: 42000, floor: 38000, discountGuard: '10% max', packaging: 'Seats + governance + support' },
]

const revenueDrivers = [
  { id: 'rd1', name: 'Net new ARR', amount: 185000, change: '+12% MoM' },
  { id: 'rd2', name: 'Expansion ARR', amount: 95000, change: '+6% MoM' },
  { id: 'rd3', name: 'Contraction ARR', amount: -45000, change: '-2% MoM' },
  { id: 'rd4', name: 'Churn ARR', amount: -115000, change: '+1% MoM' },
]

const profitMetrics = [
  { id: 'pm1', name: 'Gross margin', value: '78%', benchmark: 'Top quartile SaaS' },
  { id: 'pm2', name: 'Magic number', value: '1.3x', benchmark: 'Efficient growth' },
  { id: 'pm3', name: 'CAC payback', value: '13.5 months', benchmark: 'Target < 15 months' },
  { id: 'pm4', name: 'Rule of 40', value: '62', benchmark: 'Above target' },
]

export default function ResourcesPage() {
  return (
    <div className="space-y-6 p-6">
      <PageHeader className="rounded-xl border border-[color:var(--color-outline)]">
        <PageTitle>Resources &amp; Calculators</PageTitle>
        <PageDescription>
          Finance-ready calculators to pressure test pricing, revenue, profit, and board-ready scenarios in minutes.
        </PageDescription>
        <div className="flex flex-wrap items-center gap-2 text-sm">
          <Badge variant="outline">Prebuilt GTM formulas</Badge>
          <Badge variant="success">Live benchmarks</Badge>
          <Badge variant="default">Downloadable templates</Badge>
        </div>
      </PageHeader>

      <Tabs defaultValue="pricing">
        <TabsList className="flex flex-wrap">
          <TabsTrigger value="pricing">Pricing</TabsTrigger>
          <TabsTrigger value="revenue">Revenue</TabsTrigger>
          <TabsTrigger value="financial">Financial Plan</TabsTrigger>
          <TabsTrigger value="profit">Profitability</TabsTrigger>
          <TabsTrigger value="scenarios">Board Scenarios</TabsTrigger>
        </TabsList>

        <TabsContent value="pricing" className="space-y-4 border-none p-0">
          <Card>
            <CardHeader>
              <CardTitle>Guardrail calculator</CardTitle>
              <CardDescription>Set floor prices, packaging guardrails, and instant impact to ARR and margin.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="rounded-lg border border-[color:var(--color-outline)] bg-[color:var(--color-surface-muted)]/30 p-4">
                <p className="text-sm text-[color:var(--color-text)]">
                  Adjust list price and discount allowances to visualize net ARR impact. Export recommendations for sales playbooks in one click.
                </p>
              </div>
              <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                {pricingScenarios.map((scenario) => (
                  <div key={scenario.tier} className="flex flex-col rounded-lg border border-[color:var(--color-outline)] p-4">
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-semibold text-[color:var(--color-text)]">{scenario.tier}</p>
                      <Badge variant="outline">{scenario.packaging}</Badge>
                    </div>
                    <dl className="mt-3 space-y-2 text-sm text-[color:var(--color-text)]">
                      <div className="flex items-center justify-between text-xs text-[color:var(--color-text-muted)]">
                        <dt>List price</dt>
                        <dd>${scenario.list.toLocaleString()}</dd>
                      </div>
                      <div className="flex items-center justify-between text-xs text-[color:var(--color-text-muted)]">
                        <dt>Floor price</dt>
                        <dd>${scenario.floor.toLocaleString()}</dd>
                      </div>
                      <div className="flex items-center justify-between text-xs text-[color:var(--color-text-muted)]">
                        <dt>Discount guardrail</dt>
                        <dd>{scenario.discountGuard}</dd>
                      </div>
                    </dl>
                    <Button variant="outline" className="mt-4">
                      Export playbook
                    </Button>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Packaging experiments</CardTitle>
              <CardDescription>Compare usage-based vs seat-based packaging to find the optimal blend.</CardDescription>
            </CardHeader>
            <CardContent className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div className="space-y-3 rounded-lg border border-[color:var(--color-outline)] p-4">
                <p className="text-sm font-medium text-[color:var(--color-text)]">Usage-first</p>
                <p className="text-sm text-[color:var(--color-text-muted)]">
                  Meter core AI generation and automations. Seat add-ons unlock analytics and governance modules.
                </p>
                <Badge variant="success">Recommended</Badge>
              </div>
              <div className="space-y-3 rounded-lg border border-[color:var(--color-outline)] p-4">
                <p className="text-sm font-medium text-[color:var(--color-text)]">Seat-first</p>
                <p className="text-sm text-[color:var(--color-text-muted)]">
                  Predictable ARR but lower margin. Layer usage overages when activation crosses 120% of plan.
                </p>
                <Badge variant="outline">In testing</Badge>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="revenue" className="space-y-4 border-none p-0">
          <Card>
            <CardHeader>
              <CardTitle>Revenue bridge</CardTitle>
              <CardDescription>Understand what is driving ARR movement across segments and motions.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                {revenueDrivers.map((driver) => (
                  <div key={driver.id} className="rounded-lg border border-[color:var(--color-outline)] p-4">
                    <p className="text-sm font-medium text-[color:var(--color-text)]">{driver.name}</p>
                    <p className={`mt-2 text-2xl font-semibold ${
                      driver.amount >= 0
                        ? 'text-[color:var(--color-positive)]'
                        : 'text-[color:var(--color-negative)]'
                    }`}>
                      ${Math.abs(driver.amount / 1000).toFixed(0)}K
                    </p>
                    <p className="text-xs text-[color:var(--color-text-muted)]">{driver.change}</p>
                  </div>
                ))}
              </div>
              <div className="rounded-lg border border-dashed border-[color:var(--color-outline)] p-4 text-sm text-[color:var(--color-text)]">
                Model net new pipeline coverage, expansion playbooks, and churn saves with scenario toggles. Export to RevOps dashboards instantly.
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Coverage calculator</CardTitle>
              <CardDescription>Blend quota capacity, attainment, and forecast confidence to project outcomes.</CardDescription>
            </CardHeader>
            <CardContent className="grid grid-cols-1 gap-4 md:grid-cols-3">
              {[
                { label: 'Total quota capacity', value: '$9.2M', detail: '12 AEs · 2.3x pipeline coverage' },
                { label: 'In-quarter commit', value: '$3.4M', detail: '65% probability weighted' },
                { label: 'Stretch scenario', value: '$4.1M', detail: 'Requires 3 net-new logo wins' },
              ].map((metric) => (
                <div key={metric.label} className="rounded-lg border border-[color:var(--color-outline)] p-4">
                  <p className="text-xs font-medium uppercase tracking-wide text-[color:var(--color-text-muted)]">{metric.label}</p>
                  <p className="mt-2 text-2xl font-semibold text-[color:var(--color-text)]">{metric.value}</p>
                  <p className="mt-1 text-xs text-[color:var(--color-text-muted)]">{metric.detail}</p>
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="financial" className="space-y-4 border-none p-0">
          <Card>
            <CardHeader>
              <CardTitle>Financial runway</CardTitle>
              <CardDescription>Plan burn, runway, and investment pacing with CFO-grade controls.</CardDescription>
            </CardHeader>
            <CardContent className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div className="space-y-3 rounded-lg border border-[color:var(--color-outline)] p-4">
                <p className="text-sm font-medium text-[color:var(--color-text)]">Base plan</p>
                <p className="text-3xl font-semibold text-[color:var(--color-text)]">18.5 months</p>
                <p className="text-xs text-[color:var(--color-text-muted)]">Runway based on current burn rate of $185K/mo</p>
              </div>
              <div className="space-y-3 rounded-lg border border-[color:var(--color-outline)] p-4">
                <p className="text-sm font-medium text-[color:var(--color-text)]">Efficiency scenario</p>
                <p className="text-3xl font-semibold text-[color:var(--color-positive)]">21.3 months</p>
                <p className="text-xs text-[color:var(--color-text-muted)]">Assumes 8% opex reduction + 6% ARR uplift</p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Cash flow planner</CardTitle>
              <CardDescription>Align hiring plans, vendor spend, and capital strategy.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {["Headcount pacing vs plan","Vendor consolidation savings","Capital efficiency by cohort"].map((item) => (
                <div key={item} className="rounded-lg border border-[color:var(--color-outline)] bg-[color:var(--color-surface-muted)]/30 p-3 text-sm text-[color:var(--color-text)]">
                  {item}
                </div>
              ))}
              <Button variant="outline" className="self-start">
                Open planner workspace
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="profit" className="space-y-4 border-none p-0">
          <Card>
            <CardHeader>
              <CardTitle>Profitability snapshot</CardTitle>
              <CardDescription>Track margin, CAC payback, and capital efficiency benchmarks.</CardDescription>
            </CardHeader>
            <CardContent className="grid grid-cols-1 gap-4 md:grid-cols-2">
              {profitMetrics.map((metric) => (
                <div key={metric.id} className="rounded-lg border border-[color:var(--color-outline)] p-4">
                  <p className="text-sm font-medium text-[color:var(--color-text)]">{metric.name}</p>
                  <p className="mt-2 text-2xl font-semibold text-[color:var(--color-text)]">{metric.value}</p>
                  <p className="text-xs text-[color:var(--color-text-muted)]">{metric.benchmark}</p>
                </div>
              ))}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Margin improvement ideas</CardTitle>
              <CardDescription>Quick wins sourced from GTM, product, and finance collaboration.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {["Shift implementation to partners for enterprise tier","Launch usage alerts to prevent overage credits","Automate onboarding to reduce services cost"].map((idea) => (
                <div key={idea} className="rounded-lg border border-[color:var(--color-outline)] bg-[color:var(--color-surface-muted)]/30 p-3 text-sm text-[color:var(--color-text)]">
                  {idea}
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="scenarios" className="space-y-4 border-none p-0">
          <Card>
            <CardHeader>
              <CardTitle>Board-ready packs</CardTitle>
              <CardDescription>Assemble scenario outputs with commentary, risks, and actions in seconds.</CardDescription>
            </CardHeader>
            <CardContent className="grid grid-cols-1 gap-4 md:grid-cols-3">
              {[
                { title: 'Base', summary: 'Plan of record, current hiring, pipeline confidence.' },
                { title: 'Upside', summary: 'Requires 2 strategic wins + PLG conversion lift.' },
                { title: 'Downside', summary: 'Models churn risk, slip deals, and cost controls.' },
              ].map((pack) => (
                <div key={pack.title} className="flex flex-col justify-between rounded-lg border border-[color:var(--color-outline)] p-4">
                  <div>
                    <p className="text-sm font-semibold text-[color:var(--color-text)]">{pack.title}</p>
                    <p className="mt-1 text-sm text-[color:var(--color-text-muted)]">{pack.summary}</p>
                  </div>
                  <Button variant="outline" className="mt-4">
                    Generate pack
                  </Button>
                </div>
              ))}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>What-if levers</CardTitle>
              <CardDescription>Toggle hiring, win rates, and pricing to see multi-quarter impact.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {["AE ramp time","Enterprise discount rate","Partner-sourced pipeline"].map((lever) => (
                <div key={lever} className="flex items-center justify-between rounded-lg border border-[color:var(--color-outline)] p-3 text-sm text-[color:var(--color-text)]">
                  <span>{lever}</span>
                  <Badge variant="outline">Interactive</Badge>
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
