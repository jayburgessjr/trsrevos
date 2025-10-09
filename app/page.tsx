"use client"

import { useState, useEffect } from "react"
import { useSearchParams } from "next/navigation"
import { TopTabs } from "@/components/kit/TopTabs"
import { Badge } from "@/ui/badge"
import { Button } from "@/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/ui/card"
import { PageDescription, PageHeader, PageTitle } from "@/ui/page-header"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/ui/tabs"
import { Input } from "@/ui/input"
import Link from "next/link"
import { actionComputePlan, actionLockPlan, actionGetPlan, actionGetFocus } from "@/core/dailyPlan/actions"
import { actionGenerateRecap } from "@/core/recap/actions"
import { toICal } from "@/core/calendar/timebox"
import { eventsToday } from "@/core/events/store"
import { DailyPlan } from "@/core/dailyPlan/types"

export default function HomePage() {
  const searchParams = useSearchParams()
  const tab = searchParams.get("tab") ?? "Overview"
  const [plan, setPlan] = useState<DailyPlan | null>(null)
  const [recap, setRecap] = useState<any>(null)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    actionGetPlan().then(setPlan)
  }, [])

  const handleComputePlan = async () => {
    setLoading(true)
    const p = await actionComputePlan()
    setPlan(p)
    setLoading(false)
  }

  const handleLockPlan = async () => {
    setLoading(true)
    const p = await actionLockPlan()
    setPlan(p)
    setLoading(false)
  }

  const handleStartFocus = () => {
    alert("Focus timer started! (stub: integrate with FocusTimer component)")
  }

  const handleGenerateRecap = async () => {
    setLoading(true)
    const r = await actionGenerateRecap()
    setRecap(r)
    setLoading(false)
  }

  const handleDownloadICal = async () => {
    const blocks = await actionGetFocus()
    const ical = toICal(blocks, recap?.tomorrow || "First action tomorrow")
    const blob = new Blob([ical], { type: "text/calendar" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = "trs-daily-plan.ics"
    a.click()
    URL.revokeObjectURL(url)
  }

  const today = new Date()
  const events = eventsToday()
  const dollarsAdvanced = events
    .filter(
      (e) =>
        (e.entity === "proposal" && e.action === "sent") ||
        (e.entity === "invoice" && (e.action === "sent" || e.action === "paid"))
    )
    .map((e) => Number((e.meta as any)?.amount || 0))
    .reduce((a, b) => a + b, 0)
  const proposalsSent = events.filter((e) => e.entity === "proposal" && e.action === "sent").length
  const invoicesSent = events.filter((e) => e.entity === "invoice" && e.action === "sent").length
  const invoicesPaid = events.filter((e) => e.entity === "invoice" && e.action === "paid").length
  const focusCompleted = events.filter((e) => e.entity === "focus" && e.action === "completed").length

  const quotes = [
    "Revenue is a lagging indicator of customer value creation.",
    "Pipeline coverage is confidence; velocity is execution.",
    "Every dollar raised should 3x the business before next round.",
    "Capital efficiency compounds trust with investors and customers.",
  ]
  const dayOfYear = Math.floor((today.getTime() - new Date(today.getFullYear(), 0, 0).getTime()) / 86400000)
  const quote = quotes[dayOfYear % quotes.length]

  const newsItems = [
    "Q4 pipeline coverage at 142% of target",
    "New partner activation: Strategic Consulting Group",
    "Price realization improved to 94% this month",
    "3 invoices paid early this week, improving DSO",
    "Content engagement up 28% from last quarter",
  ]
  const [newsIndex, setNewsIndex] = useState(0)
  useEffect(() => {
    const interval = setInterval(() => {
      setNewsIndex((i) => (i + 1) % newsItems.length)
    }, 5000)
    return () => clearInterval(interval)
  }, [newsItems.length])

  const body = (
    <div className="relative space-y-8 p-6">
      {/* Hero background */}
      <div className="absolute inset-x-0 top-0 -z-10 h-[400px] overflow-hidden rounded-3xl">
        <div
          className="h-full w-full bg-gradient-to-br from-cyan-400 via-blue-500 to-blue-600"
          style={{
            backgroundImage:
              "linear-gradient(135deg, rgba(6, 182, 212, 0.9) 0%, rgba(59, 130, 246, 0.85) 50%, rgba(37, 99, 235, 0.9) 100%)",
          }}
        />
        <div className="absolute inset-0 bg-black/20" />
      </div>

      {/* News ticker */}
      <div className="relative overflow-hidden rounded-lg border border-white/30 bg-white/95 p-2 shadow backdrop-blur-sm">
        <p className="text-center text-sm font-medium text-[color:var(--color-text)]">{newsItems[newsIndex]}</p>
      </div>

      <PageHeader className="relative rounded-xl border border-white/30 bg-white/95 shadow-lg backdrop-blur-sm">
        <div className="flex flex-col gap-3">
          <PageTitle className="text-[color:var(--color-text)]">Morning Briefing</PageTitle>
          <PageDescription className="text-[color:var(--color-text)]">
            Your single source of truth for pipeline confidence, customer health, and capital efficiency.
          </PageDescription>
          <div className="flex flex-wrap items-center gap-3 text-sm text-[color:var(--color-text-muted)]">
            <span>Today is {today.toLocaleDateString(undefined, { weekday: "long", month: "short", day: "numeric" })}</span>
            <Badge variant="success">Momentum: steady</Badge>
          </div>
        </div>
      </PageHeader>

      {/* Motivational quote */}
      <Card>
        <CardContent className="p-4">
          <p className="text-center text-sm italic text-[color:var(--color-text-muted)]">&ldquo;{quote}&rdquo;</p>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-[2fr,1fr]">
        <div className="space-y-6">
          {/* Scorecard */}
          <Card>
            <CardHeader>
              <CardTitle>Today&apos;s Scorecard</CardTitle>
              <CardDescription>Real-time performance metrics from events</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4 md:grid-cols-3">
                <div>
                  <p className="text-xs text-[color:var(--color-text-muted)]">Dollars Advanced</p>
                  <p className="text-2xl font-semibold text-[color:var(--color-text)]">${(dollarsAdvanced / 1000).toFixed(0)}K</p>
                </div>
                <div>
                  <p className="text-xs text-[color:var(--color-text-muted)]">Proposals Sent</p>
                  <p className="text-2xl font-semibold text-[color:var(--color-text)]">{proposalsSent}</p>
                </div>
                <div>
                  <p className="text-xs text-[color:var(--color-text-muted)]">Invoices Sent</p>
                  <p className="text-2xl font-semibold text-[color:var(--color-text)]">{invoicesSent}</p>
                </div>
                <div>
                  <p className="text-xs text-[color:var(--color-text-muted)]">Invoices Paid</p>
                  <p className="text-2xl font-semibold text-[color:var(--color-positive)]">{invoicesPaid}</p>
                </div>
                <div>
                  <p className="text-xs text-[color:var(--color-text-muted)]">Focus Sessions</p>
                  <p className="text-2xl font-semibold text-[color:var(--color-text)]">{focusCompleted}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* KPI Standing */}
          <Card>
            <CardHeader>
              <CardTitle>KPI Standing</CardTitle>
              <CardDescription>Performance deltas across time horizons</CardDescription>
            </CardHeader>
            <CardContent>
              <Tabs defaultValue="today">
                <TabsList>
                  <TabsTrigger value="today">Today</TabsTrigger>
                  <TabsTrigger value="week">Week</TabsTrigger>
                  <TabsTrigger value="quarter">Quarter</TabsTrigger>
                  <TabsTrigger value="year">Year</TabsTrigger>
                </TabsList>
                <TabsContent value="today" className="space-y-3">
                  <div className="flex justify-between text-sm">
                    <span>Pipeline Dollars</span>
                    <span className="font-medium text-[color:var(--color-positive)]">+$12K</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Invoices Sent</span>
                    <span className="font-medium">{invoicesSent}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Win Rate</span>
                    <span className="font-medium">72%</span>
                  </div>
                </TabsContent>
                <TabsContent value="week" className="text-sm text-[color:var(--color-text-muted)]">
                  Week view: stub metrics (7d rolling)
                </TabsContent>
                <TabsContent value="quarter" className="text-sm text-[color:var(--color-text-muted)]">
                  Quarter view: stub metrics (90d)
                </TabsContent>
                <TabsContent value="year" className="text-sm text-[color:var(--color-text-muted)]">
                  Year view: stub metrics (365d)
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>

          {/* Today's Plan */}
          <Card>
            <CardHeader>
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <CardTitle>Today&apos;s Plan</CardTitle>
                  <CardDescription>Rank-ordered focus list by impact, probability, and urgency / effort</CardDescription>
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  <Button variant="primary" size="sm" onClick={handleComputePlan} disabled={loading}>
                    Compute Plan
                  </Button>
                  <Button variant="secondary" size="sm" onClick={handleLockPlan} disabled={!plan || loading}>
                    {plan?.lockedAt ? "Locked" : "Lock Plan"}
                  </Button>
                  {plan?.lockedAt && (
                    <>
                      <Button variant="primary" size="sm" onClick={handleStartFocus}>
                        Start 50m Focus
                      </Button>
                      <Button variant="outline" size="sm" onClick={handleDownloadICal}>
                        Download iCal
                      </Button>
                    </>
                  )}
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {plan ? (
                <div className="space-y-3">
                  {plan.items.map((item, index) => (
                    <div key={item.id} className="rounded-lg border border-[color:var(--color-outline)] bg-white p-4 shadow-sm">
                      <div className="flex items-start justify-between gap-4">
                        <div>
                          <p className="text-xs font-semibold uppercase tracking-wide text-[color:var(--color-text-muted)]">
                            Rank {index + 1}
                          </p>
                          {item.moduleHref ? (
                            <Link href={item.moduleHref} className="text-base font-semibold text-[color:var(--color-primary)] hover:underline">
                              {item.title}
                            </Link>
                          ) : (
                            <p className="text-base font-semibold text-[color:var(--color-text)]">{item.title}</p>
                          )}
                          <p className="mt-1 text-sm text-[color:var(--color-text)]">
                            Next action: <span className="font-medium">{item.nextAction}</span>
                          </p>
                        </div>
                        <div className="flex flex-col items-end gap-2">
                          <Badge variant="outline">Impact ${(item.expectedImpact / 1000).toFixed(0)}K</Badge>
                          <span className="text-xs text-[color:var(--color-text-muted)]">Effort {item.effortHours}h</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="rounded-lg border border-dashed border-[color:var(--color-outline)] bg-[color:var(--color-surface-muted)]/40 p-6 text-sm text-[color:var(--color-text-muted)]">
                  <p className="font-medium text-[color:var(--color-text)]">No plan generated yet.</p>
                  <p className="mt-1">Tap Compute Plan to synthesize a 5–7 item focus list.</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          {/* Quick Capture */}
          <Card>
            <CardHeader>
              <CardTitle>Quick Capture</CardTitle>
              <CardDescription>Drop a note for later triage</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <Input placeholder="What needs attention?" />
              <Button variant="outline" size="sm">
                Save Draft
              </Button>
            </CardContent>
          </Card>

          {/* End-of-Day Recap */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Daily Recap</CardTitle>
                  <CardDescription>End-of-day summary</CardDescription>
                </div>
                <Button variant="outline" size="sm" onClick={handleGenerateRecap} disabled={loading}>
                  Generate
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {recap ? (
                <div className="prose prose-sm max-w-none text-[color:var(--color-text-muted)]">
                  <div className="whitespace-pre-wrap text-sm">{recap.markdown}</div>
                </div>
              ) : (
                <p className="text-sm text-[color:var(--color-text-muted)]">No recap generated yet. Click Generate above.</p>
              )}
            </CardContent>
          </Card>

          {/* Operating Radar */}
          <Card>
            <CardHeader>
              <CardTitle>Operating Radar</CardTitle>
              <CardDescription>Snapshots across pipeline, finance, and client health</CardDescription>
            </CardHeader>
            <CardContent>
              <Tabs defaultValue="pipeline">
                <TabsList>
                  <TabsTrigger value="pipeline">Pipeline</TabsTrigger>
                  <TabsTrigger value="finance">Finance</TabsTrigger>
                  <TabsTrigger value="clients">Clients</TabsTrigger>
                </TabsList>
                <TabsContent value="pipeline" className="text-sm text-[color:var(--color-text-muted)]">
                  Pipeline coverage vs. commit chart (stub)
                </TabsContent>
                <TabsContent value="finance" className="text-sm text-[color:var(--color-text-muted)]">
                  Weekly ARR waterfall and burn multiple (stub)
                </TabsContent>
                <TabsContent value="clients" className="text-sm text-[color:var(--color-text-muted)]">
                  NPS + activation funnel summary (stub)
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )

  return (
    <div className="min-h-screen bg-white text-black">
      <div className="px-4 py-3 border-b border-gray-200 flex items-center justify-between">
        <TopTabs />
        <div className="flex items-center gap-2">
          <span className="sr-only">Current tab: {tab}</span>
          <Link href="/dashboard" className="text-xs px-3 py-1.5 rounded-md border">
            Open dashboard
          </Link>
        </div>
      </div>
      <main className="max-w-7xl mx-auto p-4">{body}</main>
    </div>
  )
}
