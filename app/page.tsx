import { getTodayPlan, computeTodayPlanAction, lockTodayPlanAction, startFocusAction } from '@/core/dailyPlan/actions'
import { getFocusBlocks } from '@/core/dailyPlan/service'
import { getTodayRecap, generateRecapAction } from '@/core/recap/actions'
import { generateICalForFocusBlocks } from '@/core/calendar/timebox'
import { getSession } from '@/lib/session'
import { Badge } from '@/ui/badge'
import { Button } from '@/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/ui/card'
import { FocusTimer } from '@/ui/focus-timer'
import { Input } from '@/ui/input'
import { PageDescription, PageHeader, PageTitle } from '@/ui/page-header'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/ui/tabs'
import { KPIStanding } from '@/ui/kpi-standing'
import { MotivationalQuote } from '@/ui/motivational-quote'
import { NewsTicker } from '@/ui/news-ticker'
import { DailyScorecard } from '@/components/ui/DailyScorecard'
import Link from 'next/link'

export default async function HomePage() {
  const session = await getSession()
  const user = session.user
  const today = new Date()
  const plan = await getTodayPlan(user.id, today)
  const recap = await getTodayRecap(user.id, today)
  const focusBlocks = plan?.locked ? getFocusBlocks(user.id, today) : null

  // Generate iCal if plan is locked
  let iCalData: string | null = null
  if (plan?.locked && focusBlocks) {
    iCalData = generateICalForFocusBlocks(user.id, focusBlocks, 'Review top priorities and update forecast')
  }

  return (
    <div className="relative space-y-8">
      {/* Hero background with Caribbean water image */}
      <div className="absolute inset-x-0 top-0 -z-10 h-[400px] overflow-hidden rounded-3xl">
        <div
          className="h-full w-full bg-gradient-to-br from-cyan-400 via-blue-500 to-blue-600"
          style={{
            backgroundImage: 'linear-gradient(135deg, rgba(6, 182, 212, 0.9) 0%, rgba(59, 130, 246, 0.85) 50%, rgba(37, 99, 235, 0.9) 100%)',
          }}
        />
        <div className="absolute inset-0 bg-black/20" />
      </div>
      {/* News ticker at top */}
      <NewsTicker />

      <PageHeader className="relative rounded-xl border border-white/30 bg-white/95 shadow-lg backdrop-blur-sm">
        <div className="flex flex-col gap-3">
          <PageTitle className="text-[color:var(--color-text)]">Morning briefing</PageTitle>
          <PageDescription className="text-[color:var(--color-text)]">
            Welcome back, {user.name.split(' ')[0]}. This workspace will evolve into your single source of truth for pipeline
            confidence, customer health, and capital efficiency.
          </PageDescription>
          <div className="flex flex-wrap items-center gap-3 text-sm text-[color:var(--color-text-muted)]">
            <span>Today is {today.toLocaleDateString(undefined, { weekday: 'long', month: 'short', day: 'numeric' })}</span>
            <Badge variant="success">Momentum: steady</Badge>
            <span>Confidence calibrated with session stubs.</span>
          </div>
        </div>
      </PageHeader>

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-[2fr,1fr]">
        <div className="space-y-6">
          {/* Daily Scorecard */}
          <DailyScorecard />

          {/* KPI Standing card */}
          <KPIStanding />

          {/* Motivational quote */}
          <MotivationalQuote />

          <Card>
            <CardHeader>
              <CardTitle>Yesterday recap</CardTitle>
              <CardDescription>
                Snapshot of momentum, blockers, and wins from the past 24 hours. TODO: integrate activity pulse and sentiment.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4 text-sm text-[color:var(--color-text-muted)]">
              <p>• TODO hook: feed closed-won revenue diffs and churn signals.</p>
              <p>• TODO hook: align partner pipeline coverage vs. goal.</p>
              <p>• TODO hook: surface finance reconciliations requiring action.</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <CardTitle>Today&apos;s plan</CardTitle>
                  <CardDescription>
                    Rank-ordered focus list combining impact, probability, strategy weight, urgency, and confidence divided by
                    effort.
                  </CardDescription>
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  <Link href="/plan">
                    <Button variant="outline" size="sm">
                      Open module
                    </Button>
                  </Link>
                  <form id="computePlan" action={computeTodayPlanAction}>
                    <input type="hidden" name="userId" value={user.id} />
                    <Button type="submit" variant="primary" size="sm">
                      Compute
                    </Button>
                  </form>
                  <form id="lockPlan" action={lockTodayPlanAction}>
                    <input type="hidden" name="userId" value={user.id} />
                    <Button type="submit" variant="secondary" size="sm" disabled={!plan}>
                      {plan?.locked ? 'Locked' : 'Lock plan'}
                    </Button>
                  </form>
                  {plan?.locked && (
                    <form id="startFocus" action={startFocusAction}>
                      <input type="hidden" name="userId" value={user.id} />
                      <Button type="submit" variant="primary" size="sm">
                        Start 50m Focus
                      </Button>
                    </form>
                  )}
                  {iCalData && (
                    <a
                      href={`data:text/calendar;charset=utf-8,${encodeURIComponent(iCalData)}`}
                      download="trs-daily-plan.ics"
                    >
                      <Button variant="outline" size="sm">
                        Download iCal
                      </Button>
                    </a>
                  )}
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {plan ? (
                <div className="space-y-4">
                  <div className="flex items-center justify-between text-xs text-[color:var(--color-text-muted)]">
                    <span>
                      Generated {new Date(plan.generatedAt).toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' })}
                    </span>
                    {plan.locked ? <Badge variant="outline">Locked for the day</Badge> : <Badge variant="outline">Draft</Badge>}
                  </div>
                  <ol className="space-y-3">
                    {plan.items.map((item, index) => (
                      <li key={item.id} className="rounded-lg border border-[color:var(--color-outline)] bg-white p-4 shadow-sm">
                        <div className="flex items-start justify-between gap-4">
                          <div>
                            <p className="text-xs font-semibold uppercase tracking-wide text-[color:var(--color-text-muted)]">
                              Rank {index + 1}
                            </p>
                            <p className="text-base font-semibold text-[color:var(--color-text)]">{item.title}</p>
                            <p className="mt-1 text-sm text-[color:var(--color-text-muted)]">{item.summary}</p>
                            <p className="mt-2 text-sm text-[color:var(--color-text)]">
                              Next action: <span className="font-medium">{item.nextAction}</span>
                            </p>
                          </div>
                          <div className="flex flex-col items-end gap-2">
                            <Badge variant="outline">Score {item.score}</Badge>
                            <span className="text-xs text-[color:var(--color-text-muted)]">Effort {item.effort}</span>
                          </div>
                        </div>
                      </li>
                    ))}
                  </ol>
                </div>
              ) : (
                <div className="rounded-lg border border-dashed border-[color:var(--color-outline)] bg-[color:var(--color-surface-muted)]/40 p-6 text-sm text-[color:var(--color-text-muted)]">
                  <p className="font-medium text-[color:var(--color-text)]">No plan generated yet.</p>
                  <p className="mt-1">Tap compute to synthesize a 5–7 item focus list from upcoming signals.</p>
                  <p className="mt-2 text-xs uppercase tracking-wide">TODO hook: fetch previous plan fallback.</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Quick capture</CardTitle>
              <CardDescription>Drop a note for later triage. TODO: pipe into inbox service.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <form className="space-y-3">
                <Input placeholder="What needs attention?" />
                <Button type="button" variant="outline" size="sm">
                  Save draft
                </Button>
              </form>
            </CardContent>
          </Card>
          <FocusTimer />
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Daily recap</CardTitle>
                  <CardDescription>End-of-day summary with progress, risks, and tomorrow&apos;s first action.</CardDescription>
                </div>
                <form action={generateRecapAction}>
                  <input type="hidden" name="userId" value={user.id} />
                  <Button type="submit" variant="outline" size="sm">
                    Generate
                  </Button>
                </form>
              </div>
            </CardHeader>
            <CardContent>
              {recap ? (
                <div className="prose prose-sm max-w-none text-[color:var(--color-text-muted)]">
                  <div className="text-xs text-[color:var(--color-text-muted)] mb-3">
                    Generated {new Date(recap.generatedAt).toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' })}
                  </div>
                  <div className="whitespace-pre-wrap">{recap.markdown}</div>
                </div>
              ) : (
                <p className="text-sm text-[color:var(--color-text-muted)]">No recap generated yet. Click Generate above.</p>
              )}
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>Operating radar</CardTitle>
              <CardDescription>Snapshots across pipeline, finance, and client health. TODO: hydrate metrics.</CardDescription>
            </CardHeader>
            <CardContent>
              <Tabs defaultValue="pipeline">
                <TabsList>
                  <TabsTrigger value="pipeline">Pipeline</TabsTrigger>
                  <TabsTrigger value="finance">Finance</TabsTrigger>
                  <TabsTrigger value="clients">Clients</TabsTrigger>
                </TabsList>
                <TabsContent value="pipeline" className="text-sm text-[color:var(--color-text-muted)]">
                  TODO: pipeline coverage vs. commit chart.
                </TabsContent>
                <TabsContent value="finance" className="text-sm text-[color:var(--color-text-muted)]">
                  TODO: weekly ARR waterfall and burn multiple.
                </TabsContent>
                <TabsContent value="clients" className="text-sm text-[color:var(--color-text-muted)]">
                  TODO: NPS + activation funnel summary.
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
