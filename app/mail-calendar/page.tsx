"use client"

import { useMemo } from "react"
import { usePathname, useSearchParams } from "next/navigation"

import { PageTemplate } from "@/components/layout/PageTemplate"
import { Badge } from "@/ui/badge"
import { Button } from "@/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/ui/card"
import { TRS_CARD, TRS_SECTION_TITLE } from "@/lib/style"
import { resolveTabs } from "@/lib/tabs"

const inboxThreads = [
  {
    id: "t1",
    sender: "RevenueOps Alerts",
    subject: "Daily pipeline sync & risk summary",
    preview: "Highlights from RevOps: 3 deals need follow up, 1 flagged for pricing exception.",
    receivedAt: "9:24 AM",
    tags: ["Priority", "Automation"],
  },
  {
    id: "t2",
    sender: "Gmail – Marketing",
    subject: "Launch checklist for Q4 nurture sequence",
    preview: "Creative brief approved. Final assets due Friday before we handoff to sequencing.",
    receivedAt: "8:10 AM",
    tags: ["Campaign", "Content"],
  },
  {
    id: "t3",
    sender: "HostGator Support",
    subject: "DNS verification for calendar routing",
    preview: "TXT records validated. You can finalize calendar availability sync across providers.",
    receivedAt: "Yesterday",
    tags: ["Integration"],
  },
]

const calendarEvents = [
  {
    id: "e1",
    title: "Customer QBR – Northwind",
    time: "10:30 – 11:15 AM",
    participants: ["Alex", "Priya", "Northwind CS"],
    type: "External",
  },
  {
    id: "e2",
    title: "Pricing desk office hours",
    time: "12:00 – 12:30 PM",
    participants: ["GTM Ops"],
    type: "Internal",
  },
  {
    id: "e3",
    title: "Marketing <> Sales sync",
    time: "2:00 – 2:45 PM",
    participants: ["Demand Gen", "Sales Leads"],
    type: "Collaboration",
  },
]

const integrationStatus = [
  { id: "i1", name: "Gmail API", description: "Primary inbox connection for GTM leadership.", status: "Connected" },
  { id: "i2", name: "Google Calendar", description: "Two-way sync with focus blocks and QBRs.", status: "Connected" },
  { id: "i3", name: "HostGator Mailboxes", description: "Routing shared support and partner mailboxes.", status: "Syncing" },
  { id: "i4", name: "Zoom", description: "Auto-attach meeting recordings to thread history.", status: "Planned" },
]

const schedulerInsights = [
  "Auto-send recap docs 15 minutes after meetings with transcripts and highlights.",
  "Detect conflicts between focus blocks and external invites to suggest alternates.",
  "Create shared agendas with AI-suggested objectives for pipeline and renewal calls.",
]

const roadmapItems = [
  {
    id: "r1",
    title: "Outlook + Microsoft 365",
    description: "Extend parity for enterprise clients running Microsoft stacks.",
    eta: "Q1 FY26",
  },
  {
    id: "r2",
    title: "Slack highlights",
    description: "Push high-signal email summaries into deal rooms and CS channels.",
    eta: "In discovery",
  },
  {
    id: "r3",
    title: "Dialer intelligence",
    description: "Attach call notes and Gong snippets to relevant threads automatically.",
    eta: "Pilot customers",
  },
  {
    id: "r4",
    title: "Calendar analytics pack",
    description: "Report on context switching, meeting load, and focus-time leakage.",
    eta: "Design sprint",
  },
]

const availabilityMetrics = [
  { label: "Focus hours protected", value: "18 hrs", trend: "↑ 3 hrs WoW" },
  { label: "QBR windows available", value: "6 slots", trend: "Next 14 days" },
  { label: "Travel days detected", value: "2 leaders", trend: "Auto-blocked on calendar" },
]

export default function MailCalendarPage() {
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const tabs = useMemo(() => resolveTabs(pathname), [pathname])
  const activeTab = useMemo(() => {
    const current = searchParams.get("tab")
    return current && tabs.includes(current) ? current : tabs[0]
  }, [searchParams, tabs])

  return (
    <PageTemplate
      title="Mail & Calendar"
      description="Centralize email, calendar availability, and meeting intelligence so GTM teams never miss a follow-up."
      badges={[
        { label: "Realtime sync", variant: "success" as const },
        { label: "Gmail & Google Calendar ready" },
        { label: "HostGator routing supported", variant: "default" as const },
      ]}
    >
      {activeTab === "Inbox" && (
        <div className="space-y-4">
          <Card className={TRS_CARD}>
            <CardHeader>
              <CardTitle className="text-lg font-semibold text-black">Today’s priorities</CardTitle>
              <CardDescription className="text-sm text-gray-500">
                Threads surfaced from automation rules, sentiment analysis, and revenue triggers.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {inboxThreads.map((thread) => (
                <div key={thread.id} className="rounded-lg border border-gray-200 bg-gray-50 p-4">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div>
                      <p className="text-sm font-semibold text-black">{thread.subject}</p>
                      <p className="text-xs text-gray-500">{thread.sender}</p>
                    </div>
                    <span className="text-xs text-gray-500">{thread.receivedAt}</span>
                  </div>
                  <p className="mt-2 text-sm text-gray-600">{thread.preview}</p>
                  <div className="mt-3 flex flex-wrap items-center gap-2">
                    {thread.tags.map((tag) => (
                      <Badge key={tag} variant="outline">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          <Card className={TRS_CARD}>
            <CardHeader>
              <CardTitle className="text-lg font-semibold text-black">Automation playbooks</CardTitle>
              <CardDescription className="text-sm text-gray-500">
                Suggested automations to keep inbox triage tight across GTM teams.
              </CardDescription>
            </CardHeader>
            <CardContent className="grid grid-cols-1 gap-4 md:grid-cols-2">
              {[
                {
                  id: "a1",
                  title: "Follow-up nudges",
                  description: "Auto-remind owners on stalled threads after 24 hours with no reply.",
                  impact: "Protect SLAs",
                },
                {
                  id: "a2",
                  title: "Deal room bundling",
                  description: "Attach latest forecast, pricing sheet, and mutual action plan to opportunity emails.",
                  impact: "Faster cycles",
                },
                {
                  id: "a3",
                  title: "Calendar insights in inbox",
                  description: "Embed available focus blocks or QBR windows directly into reply suggestions.",
                  impact: "Eliminate back-and-forth",
                },
                {
                  id: "a4",
                  title: "Sentiment routing",
                  description: "Escalate negative sentiment threads to leadership with context and suggested replies.",
                  impact: "Save renewals",
                },
              ].map((play) => (
                <div key={play.id} className="flex flex-col rounded-lg border border-gray-200 p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="text-sm font-semibold text-black">{play.title}</p>
                      <p className="mt-1 text-sm text-gray-600">{play.description}</p>
                    </div>
                    <Badge variant="success">{play.impact}</Badge>
                  </div>
                  <Button variant="outline" className="mt-4 self-start text-sm">
                    Configure
                  </Button>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      )}

      {activeTab === "Calendar" && (
        <div className="space-y-4">
          <Card className={TRS_CARD}>
            <CardHeader>
              <CardTitle className="text-lg font-semibold text-black">Upcoming schedule</CardTitle>
              <CardDescription className="text-sm text-gray-500">
                Key meetings synchronized from Google Calendar and focus block priorities.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {calendarEvents.map((event) => (
                <div
                  key={event.id}
                  className="flex flex-col gap-2 rounded-lg border border-gray-200 bg-gray-50 p-4 md:flex-row md:items-center md:justify-between"
                >
                  <div>
                    <p className="text-sm font-semibold text-black">{event.title}</p>
                    <p className="text-xs text-gray-500">{event.participants.join(", ")}</p>
                  </div>
                  <div className="flex flex-wrap items-center gap-3 text-sm text-gray-600">
                    <Badge variant="outline">{event.type}</Badge>
                    <span>{event.time}</span>
                    <Button variant="outline" size="sm" className="text-xs">
                      Open details
                    </Button>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
            <Card className={TRS_CARD}>
              <CardHeader>
                <CardTitle className="text-lg font-semibold text-black">Availability intelligence</CardTitle>
                <CardDescription className="text-sm text-gray-500">
                  Surface shared free blocks, travel windows, and focus hours per leader.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                {availabilityMetrics.map((metric) => (
                  <div key={metric.label} className="rounded-lg border border-dashed border-gray-200 p-3">
                    <div className="flex items-center justify-between text-sm text-gray-600">
                      <span className={TRS_SECTION_TITLE}>{metric.label}</span>
                      <span>{metric.trend}</span>
                    </div>
                    <p className="mt-1 text-lg font-semibold text-black">{metric.value}</p>
                  </div>
                ))}
              </CardContent>
            </Card>

            <Card className={TRS_CARD}>
              <CardHeader>
                <CardTitle className="text-lg font-semibold text-black">Scheduler automations</CardTitle>
                <CardDescription className="text-sm text-gray-500">
                  Recommended workflows to align invites, agenda prep, and follow-ups.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                {schedulerInsights.map((insight) => (
                  <div key={insight} className="rounded-lg border border-gray-200 bg-gray-50 p-3 text-sm text-gray-700">
                    {insight}
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>
        </div>
      )}

      {activeTab === "Integrations" && (
        <div className="space-y-4">
          <Card className={TRS_CARD}>
            <CardHeader>
              <CardTitle className="text-lg font-semibold text-black">Integration status</CardTitle>
              <CardDescription className="text-sm text-gray-500">
                Connection health across email, calendar, conferencing, and workspace tools.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {integrationStatus.map((integration) => (
                <div
                  key={integration.id}
                  className="flex flex-col gap-3 rounded-lg border border-gray-200 p-4 md:flex-row md:items-center md:justify-between"
                >
                  <div>
                    <p className="text-sm font-semibold text-black">{integration.name}</p>
                    <p className="text-xs text-gray-500">{integration.description}</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <Badge
                      variant={
                        integration.status === "Connected" ? "success" : integration.status === "Syncing" ? "warning" : "outline"
                      }
                    >
                      {integration.status}
                    </Badge>
                    <Button variant="outline" size="sm" className="text-xs">
                      Manage
                    </Button>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          <Card className={TRS_CARD}>
            <CardHeader>
              <CardTitle className="text-lg font-semibold text-black">Next up</CardTitle>
              <CardDescription className="text-sm text-gray-500">
                Planned integrations and roadmap items for unified comms.
              </CardDescription>
            </CardHeader>
            <CardContent className="grid grid-cols-1 gap-4 md:grid-cols-2">
              {roadmapItems.map((item) => (
                <div key={item.id} className="flex flex-col justify-between rounded-lg border border-gray-200 p-4">
                  <div>
                    <p className="text-sm font-semibold text-black">{item.title}</p>
                    <p className="mt-1 text-sm text-gray-600">{item.description}</p>
                  </div>
                  <div className="mt-3 text-xs text-gray-500">ETA: {item.eta}</div>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      )}
    </PageTemplate>
  )
}
