import { Badge } from '@/ui/badge'
import { Button } from '@/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/ui/card'
import { PageDescription, PageHeader, PageTitle } from '@/ui/page-header'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/ui/tabs'

const inboxThreads = [
  {
    id: 't1',
    sender: 'RevenueOps Alerts',
    subject: 'Daily pipeline sync & risk summary',
    preview: 'Highlights from RevOps: 3 deals need follow up, 1 flagged for pricing exception.',
    receivedAt: '9:24 AM',
    tags: ['Priority', 'Automation'],
  },
  {
    id: 't2',
    sender: 'Gmail – Marketing',
    subject: 'Launch checklist for Q4 nurture sequence',
    preview: 'Creative brief approved. Final assets due Friday before we handoff to sequencing.',
    receivedAt: '8:10 AM',
    tags: ['Campaign', 'Content'],
  },
  {
    id: 't3',
    sender: 'HostGator Support',
    subject: 'DNS verification for calendar routing',
    preview: 'TXT records validated. You can finalize calendar availability sync across providers.',
    receivedAt: 'Yesterday',
    tags: ['Integration'],
  },
]

const calendarEvents = [
  {
    id: 'e1',
    title: 'Customer QBR – Northwind',
    time: '10:30 – 11:15 AM',
    participants: ['Alex', 'Priya', 'Northwind CS'],
    type: 'External',
  },
  {
    id: 'e2',
    title: 'Pricing desk office hours',
    time: '12:00 – 12:30 PM',
    participants: ['GTM Ops'],
    type: 'Internal',
  },
  {
    id: 'e3',
    title: 'Marketing <> Sales sync',
    time: '2:00 – 2:45 PM',
    participants: ['Demand Gen', 'Sales Leads'],
    type: 'Collaboration',
  },
]

const integrationStatus = [
  { id: 'i1', name: 'Gmail API', description: 'Primary inbox connection for GTM leadership.', status: 'Connected' },
  { id: 'i2', name: 'Google Calendar', description: 'Two-way sync with focus blocks and QBRs.', status: 'Connected' },
  { id: 'i3', name: 'HostGator Mailboxes', description: 'Routing shared support and partner mailboxes.', status: 'Syncing' },
  { id: 'i4', name: 'Zoom', description: 'Auto-attach meeting recordings to thread history.', status: 'Planned' },
]

export default function MailCalendarPage() {
  return (
    <div className="space-y-6 p-6">
      <PageHeader className="rounded-xl border border-[color:var(--color-outline)]">
        <PageTitle>Mail &amp; Calendar</PageTitle>
        <PageDescription>
          Centralize email, calendar availability, and meeting intelligence so GTM teams never miss a follow-up.
        </PageDescription>
        <div className="flex flex-wrap items-center gap-2 text-sm">
          <Badge variant="success">Realtime sync</Badge>
          <Badge variant="outline">Gmail &amp; Google Calendar ready</Badge>
          <Badge variant="default">HostGator routing supported</Badge>
        </div>
      </PageHeader>

      <Tabs defaultValue="inbox">
        <TabsList>
          <TabsTrigger value="inbox">Email Inbox</TabsTrigger>
          <TabsTrigger value="calendar">Calendar</TabsTrigger>
          <TabsTrigger value="integrations">Integrations</TabsTrigger>
        </TabsList>

        <TabsContent value="inbox" className="space-y-4 border-none p-0">
          <Card>
              <CardHeader>
                <CardTitle>Today’s priorities</CardTitle>
              <CardDescription>Threads surfaced from automation rules, sentiment analysis, and revenue triggers.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {inboxThreads.map((thread) => (
                <div key={thread.id} className="rounded-lg border border-[color:var(--color-outline)] bg-[color:var(--color-surface-muted)]/30 p-4">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div>
                      <p className="text-sm font-medium text-[color:var(--color-text)]">{thread.subject}</p>
                      <p className="text-xs text-[color:var(--color-text-muted)]">{thread.sender}</p>
                    </div>
                    <span className="text-xs text-[color:var(--color-text-muted)]">{thread.receivedAt}</span>
                  </div>
                  <p className="mt-2 text-sm text-[color:var(--color-text-muted)]">{thread.preview}</p>
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

          <Card>
            <CardHeader>
              <CardTitle>Automation playbooks</CardTitle>
              <CardDescription>Suggested automations to keep inbox triage tight across GTM teams.</CardDescription>
            </CardHeader>
            <CardContent className="grid grid-cols-1 gap-4 md:grid-cols-2">
              {[
                {
                  id: 'a1',
                  title: 'Follow-up nudges',
                  description: 'Auto-remind owners on stalled threads after 24 hours with no reply.',
                  impact: 'Protect SLAs',
                },
                {
                  id: 'a2',
                  title: 'Deal room bundling',
                  description: 'Attach latest forecast, pricing sheet, and mutual action plan to opportunity emails.',
                  impact: 'Faster cycles',
                },
                {
                  id: 'a3',
                  title: 'Calendar insights in inbox',
                  description: 'Embed available focus blocks or QBR windows directly into reply suggestions.',
                  impact: 'Eliminate back-and-forth',
                },
                {
                  id: 'a4',
                  title: 'Sentiment routing',
                  description: 'Escalate negative sentiment threads to leadership with context and suggested replies.',
                  impact: 'Save renewals',
                },
              ].map((play) => (
                <div key={play.id} className="flex flex-col rounded-lg border border-[color:var(--color-outline)] p-4">
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="text-sm font-semibold text-[color:var(--color-text)]">{play.title}</p>
                      <p className="mt-1 text-sm text-[color:var(--color-text-muted)]">{play.description}</p>
                    </div>
                    <Badge variant="success">{play.impact}</Badge>
                  </div>
                  <Button variant="outline" className="mt-4 self-start">
                    Configure
                  </Button>
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="calendar" className="space-y-4 border-none p-0">
          <Card>
            <CardHeader>
              <CardTitle>Upcoming schedule</CardTitle>
              <CardDescription>Key meetings synchronized from Google Calendar and focus block priorities.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {calendarEvents.map((event) => (
                <div key={event.id} className="flex flex-col gap-2 rounded-lg border border-[color:var(--color-outline)] bg-[color:var(--color-surface-muted)]/30 p-4 md:flex-row md:items-center md:justify-between">
                  <div>
                    <p className="text-sm font-medium text-[color:var(--color-text)]">{event.title}</p>
                    <p className="text-xs text-[color:var(--color-text-muted)]">{event.participants.join(', ')}</p>
                  </div>
                  <div className="flex flex-wrap items-center gap-3 text-sm">
                    <Badge variant="outline">{event.type}</Badge>
                    <span className="text-[color:var(--color-text-muted)]">{event.time}</span>
                    <Button variant="outline" size="sm">
                      Open details
                    </Button>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Availability intelligence</CardTitle>
                <CardDescription>Surface shared free blocks, travel windows, and focus hours per leader.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                {[
                  { label: 'Focus hours protected', value: '18 hrs', trend: '↑ 3 hrs WoW' },
                  { label: 'QBR windows available', value: '6 slots', trend: 'Next 14 days' },
                  { label: 'Travel days detected', value: '2 leaders', trend: 'Auto-blocked on calendar' },
                ].map((metric) => (
                  <div key={metric.label} className="rounded-lg border border-dashed border-[color:var(--color-outline)] p-3">
                    <div className="flex items-center justify-between text-sm">
                      <span className="font-medium text-[color:var(--color-text)]">{metric.label}</span>
                      <span className="text-[color:var(--color-text-muted)]">{metric.trend}</span>
                    </div>
                    <p className="mt-1 text-lg font-semibold text-[color:var(--color-text)]">{metric.value}</p>
                  </div>
                ))}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Scheduler automations</CardTitle>
                <CardDescription>Recommended workflows to align invites, agenda prep, and follow-ups.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                {[
                  'Auto-send recap docs 15 minutes after meetings with transcripts and highlights.',
                  'Detect conflicts between focus blocks and external invites to suggest alternates.',
                  'Create shared agendas with AI-suggested objectives for pipeline and renewal calls.',
                ].map((insight, index) => (
                  <div key={index} className="rounded-lg border border-[color:var(--color-outline)] bg-[color:var(--color-surface-muted)]/40 p-3 text-sm text-[color:var(--color-text)]">
                    {insight}
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="integrations" className="space-y-4 border-none p-0">
          <Card>
            <CardHeader>
              <CardTitle>Integration status</CardTitle>
              <CardDescription>Connection health across email, calendar, conferencing, and workspace tools.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {integrationStatus.map((integration) => (
                <div key={integration.id} className="flex flex-col gap-3 rounded-lg border border-[color:var(--color-outline)] p-4 md:flex-row md:items-center md:justify-between">
                  <div>
                    <p className="text-sm font-medium text-[color:var(--color-text)]">{integration.name}</p>
                    <p className="text-xs text-[color:var(--color-text-muted)]">{integration.description}</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <Badge variant={integration.status === 'Connected' ? 'success' : integration.status === 'Syncing' ? 'warning' : 'outline'}>
                      {integration.status}
                    </Badge>
                    <Button variant="outline" size="sm">
                      Manage
                    </Button>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Next up</CardTitle>
              <CardDescription>Planned integrations and roadmap items for unified comms.</CardDescription>
            </CardHeader>
            <CardContent className="grid grid-cols-1 gap-4 md:grid-cols-2">
              {[
                {
                  id: 'r1',
                  title: 'Outlook + Microsoft 365',
                  description: 'Extend parity for enterprise clients running Microsoft stacks.',
                  eta: 'Q1 FY26',
                },
                {
                  id: 'r2',
                  title: 'Slack highlights',
                  description: 'Push high-signal email summaries into deal rooms and CS channels.',
                  eta: 'In discovery',
                },
                {
                  id: 'r3',
                  title: 'Dialer intelligence',
                  description: 'Attach call notes and Gong snippets to relevant threads automatically.',
                  eta: 'Pilot customers',
                },
                {
                  id: 'r4',
                  title: 'Calendar analytics pack',
                  description: 'Report on context switching, meeting load, and focus-time leakage.',
                  eta: 'Design sprint',
                },
              ].map((item) => (
                <div key={item.id} className="flex flex-col justify-between rounded-lg border border-[color:var(--color-outline)] p-4">
                  <div>
                    <p className="text-sm font-semibold text-[color:var(--color-text)]">{item.title}</p>
                    <p className="mt-1 text-sm text-[color:var(--color-text-muted)]">{item.description}</p>
                  </div>
                  <div className="mt-3 text-xs text-[color:var(--color-text-muted)]">ETA: {item.eta}</div>
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
