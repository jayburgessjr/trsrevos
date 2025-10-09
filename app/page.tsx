"use client"

import { useState, useEffect } from "react"
import { Badge } from "@/ui/badge"
import { Button } from "@/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/ui/card"
import { PageDescription, PageTitle } from "@/ui/page-header"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/ui/tabs"
import Link from "next/link"
import { actionComputePlan, actionLockPlan, actionGetPlan, actionGetFocus } from "@/core/dailyPlan/actions"
import { actionGenerateRecap } from "@/core/recap/actions"
import { toICal } from "@/core/calendar/timebox"
import { eventsToday } from "@/core/events/store"
import { DailyPlan } from "@/core/dailyPlan/types"
import { StatCard } from "@/components/kit/StatCard"
import { cn } from "@/lib/utils"
import { TRS_CARD, TRS_SECTION_TITLE, TRS_SUBTITLE } from "@/lib/style"

export default function HomePage() {
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

  return (
    <div className="mx-auto max-w-7xl space-y-4 px-4 py-4">
      <div className={cn(TRS_CARD, "p-4 space-y-3")}>
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div className="space-y-1">
            <PageTitle className="text-lg font-semibold text-black">Morning Briefing</PageTitle>
            <PageDescription className="text-sm text-gray-500">
              Your single source of truth for pipeline confidence, customer health, and capital efficiency.
            </PageDescription>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button onClick={handleComputePlan} disabled={loading} size="sm">
              {loading ? "Computing..." : "Compute Plan"}
            </Button>
            <Button onClick={handleLockPlan} disabled={loading} size="sm" variant="outline">
              Lock Plan
            </Button>
            <Button onClick={handleDownloadICal} size="sm" variant="outline">
              Download iCal
            </Button>
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-3 text-xs text-gray-600">
          <span>
            Today is {today.toLocaleDateString(undefined, { weekday: "long", month: "short", day: "numeric" })}
          </span>
          <Badge variant="success">Momentum: steady</Badge>
          <span className="truncate">{newsItems[newsIndex]}</span>
        </div>
      </div>

      <Card className={cn(TRS_CARD)}>
        <CardContent className="p-4">
          <p className="text-center text-sm italic text-gray-500">&ldquo;{quote}&rdquo;</p>
        </CardContent>
      </Card>

      <div className="grid gap-3 lg:grid-cols-[2fr_1fr]">
        <div className="space-y-3">
          <Card className={cn(TRS_CARD)}>
            <CardHeader>
              <CardTitle className={TRS_SECTION_TITLE}>Today&apos;s Priorities</CardTitle>
              <p className={TRS_SUBTITLE}>
                {plan?.items?.length ? "Focus on the highest-impact moves" : "Compute a plan to populate daily priorities."}
              </p>
            </CardHeader>
            <CardContent className="space-y-3">
              {plan?.items?.length ? (
                plan.items.map((item) => (
                  <div key={item.id} className="rounded-lg border border-gray-200 bg-white p-3">
                    <div className="flex items-start justify-between gap-3">
                      <div className="space-y-1">
                        <p className="text-sm font-medium text-black">{item.title}</p>
                        <p className={cn(TRS_SUBTITLE, "text-xs")}>{item.nextAction}</p>
                      </div>
                      <div className="text-right">
                        <div className="text-[11px] text-gray-500 uppercase">Impact</div>
                        <div className="text-sm font-semibold text-black">{item.expectedImpact}%</div>
                      </div>
                    </div>
                    <div className="mt-3 flex flex-wrap items-center gap-2 text-xs text-gray-500">
                      <span>Effort: {item.effortHours}h</span>
                      <span>Confidence: {item.confidence}%</span>
                      <span>Probability: {item.probability}%</span>
                      {item.moduleHref ? (
                        <Link href={item.moduleHref} className="underline">
                          Open workspace
                        </Link>
                      ) : null}
                    </div>
                  </div>
                ))
              ) : (
                <div className="rounded-lg border border-dashed border-gray-200 bg-white p-6 text-center text-sm text-gray-500">
                  No priorities yet. Generate your plan to get curated actions.
                </div>
              )}
            </CardContent>
          </Card>

          <Card className={cn(TRS_CARD)}>
            <CardHeader>
              <CardTitle className={TRS_SECTION_TITLE}>KPI Standing</CardTitle>
              <p className={TRS_SUBTITLE}>Performance deltas across time horizons</p>
            </CardHeader>
            <CardContent className="space-y-3">
              <Tabs defaultValue="today" className="space-y-3">
                <TabsList className="w-full justify-start">
                  <TabsTrigger value="today">Today</TabsTrigger>
                  <TabsTrigger value="week">Week</TabsTrigger>
                  <TabsTrigger value="quarter">Quarter</TabsTrigger>
                  <TabsTrigger value="year">Year</TabsTrigger>
                </TabsList>
                <TabsContent value="today" className="space-y-2 text-sm text-black">
                  <div className="flex items-center justify-between">
                    <span>Pipeline Dollars</span>
                    <span className="font-medium">+$12K</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Invoices Sent</span>
                    <span className="font-medium">{invoicesSent}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Win Rate</span>
                    <span className="font-medium">72%</span>
                  </div>
                </TabsContent>
                <TabsContent value="week" className="space-y-2 text-sm text-black">
                  <div className="flex items-center justify-between">
                    <span>Pipeline Coverage</span>
                    <span className="font-medium">138%</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Avg Deal Size</span>
                    <span className="font-medium">$54K</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>New Meetings</span>
                    <span className="font-medium">14</span>
                  </div>
                </TabsContent>
                <TabsContent value="quarter" className="space-y-2 text-sm text-black">
                  <div className="flex items-center justify-between">
                    <span>Bookings</span>
                    <span className="font-medium">$1.8M</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>CS Expansion</span>
                    <span className="font-medium">$420K</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Churn</span>
                    <span className="font-medium">-1.8%</span>
                  </div>
                </TabsContent>
                <TabsContent value="year" className="space-y-2 text-sm text-black">
                  <div className="flex items-center justify-between">
                    <span>Net Revenue</span>
                    <span className="font-medium">$6.4M</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>EBITDA</span>
                    <span className="font-medium">$1.2M</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Cash Burn</span>
                    <span className="font-medium">$-380K</span>
                  </div>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-3">
          <Card className={cn(TRS_CARD)}>
            <CardHeader>
              <CardTitle className={TRS_SECTION_TITLE}>Performance Snapshot</CardTitle>
              <p className={TRS_SUBTITLE}>Live metrics from today&apos;s activity</p>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="grid gap-3">
                <StatCard label="Dollars Advanced" value={`$${(dollarsAdvanced / 1000).toFixed(1)}K`} delta="vs yesterday" trend="flat" />
                <StatCard label="Proposals Sent" value={`${proposalsSent}`} delta="Past 24 hours" trend="flat" />
                <StatCard label="Invoices Paid" value={`${invoicesPaid}`} delta="Cleared this week" trend="up" />
                <StatCard label="Focus Sessions" value={`${focusCompleted}`} delta="Completed today" trend="up" />
              </div>
            </CardContent>
          </Card>

          <Card className={cn(TRS_CARD)}>
            <CardHeader>
              <CardTitle className={TRS_SECTION_TITLE}>Daily Actions</CardTitle>
              <p className={TRS_SUBTITLE}>Launch workflows and sync teammates</p>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex flex-col gap-2">
                <Button onClick={handleStartFocus} size="sm">Start Focus Timer</Button>
                <Button onClick={handleGenerateRecap} size="sm" variant="outline" disabled={loading}>
                  {loading ? "Working..." : "Generate Recap"}
                </Button>
                <Button onClick={handleDownloadICal} size="sm" variant="outline">
                  Export Agenda (.ics)
                </Button>
              </div>
              {recap && (
                <div className="rounded-lg border border-gray-200 bg-white p-3">
                  <div className={TRS_SECTION_TITLE}>Latest Recap</div>
                  <p className={cn(TRS_SUBTITLE, "mt-1")}>{recap.summary ?? "Recap ready to share with leadership."}</p>
                </div>
              )}
              <div className="text-xs text-gray-500">
                Need a deeper dive? <Link href="/dashboard" className="underline">Open the executive dashboard</Link>.
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
