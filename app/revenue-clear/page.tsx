import type { Metadata } from 'next'

import { ClientSwitcher } from '@/modules/revenue-clear/components/ClientSwitcher'
import RevenueClearOnboarding from '@/modules/revenue-clear/components/RevenueClearOnboarding'
import RevenueClearShell from '@/modules/revenue-clear/components/RevenueClearShell'
import {
  getRevenueClearSnapshot,
  listRevenueClearClients,
  listRevenuePipelineOptions,
} from '@/modules/revenue-clear/lib/queries'
import { PageTemplate } from '@/components/layout/PageTemplate'
import { Badge } from '@/ui/badge'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/ui/card'

const STAGES = [
  {
    title: 'Intake',
    description: 'Company profile, financials, and goals with autosave + AI baseline summary.',
  },
  {
    title: 'Audit',
    description: 'Leak severity across pricing, demand, retention, and forecasting pillars.',
  },
  {
    title: 'Blueprint',
    description: 'Top interventions, ROI simulation, and BlueprintAI recommendations.',
  },
  {
    title: 'RevBoard',
    description: 'Live KPIs, TRS Score telemetry, and intervention tracking.',
  },
  {
    title: 'Execution',
    description: 'Task tracker, weekly summary, and AdvisorAI recaps.',
  },
  {
    title: 'Results',
    description: 'Before/after MRR + profit and ROI report packaging.',
  },
  {
    title: 'Next Steps',
    description: 'Proposal automation and engagement handoff.',
  },
] as const

const AUTOMATIONS = [
  { trigger: 'Intake saved', agent: 'RevenueClarityAI', outcome: 'Baseline summary + key metrics' },
  { trigger: 'Audit complete', agent: 'RevenueClarityAI', outcome: 'Leak map JSON + chart' },
  { trigger: 'Blueprint saved', agent: 'BlueprintAI', outcome: 'Top 3 interventions with ROI' },
  { trigger: 'Execution review submitted', agent: 'AdvisorAI', outcome: 'Weekly recap + insights' },
  { trigger: 'Results finalized', agent: 'ReportAI', outcome: 'ROI PDF + download link' },
] as const

const DELIVERABLES = [
  { stage: 'Intake', deliverable: 'Clarity Summary', format: 'JSON / PDF' },
  { stage: 'Audit', deliverable: 'Leak Map', format: 'Chart + JSON' },
  { stage: 'Blueprint', deliverable: 'Intervention Plan', format: 'PDF' },
  { stage: 'RevBoard', deliverable: 'KPI Dashboard', format: 'Live' },
  { stage: 'Execution', deliverable: 'Weekly Report', format: 'Table / Summary' },
  { stage: 'Results', deliverable: 'ROI Report', format: 'PDF' },
  { stage: 'Next Steps', deliverable: 'Proposal', format: 'PDF' },
] as const

const SCHEMA_MODELS = [
  'Client',
  'Intake',
  'Audit',
  'Intervention',
  'RevboardMetric',
  'Task',
  'Result',
  'NextStep',
] as const

const ENV_VARS = ['SUPABASE_URL', 'SUPABASE_ANON_KEY', 'OPENAI_API_KEY'] as const

export const metadata: Metadata = {
  title: 'Revenue Clear | TRS RevOS',
  description:
    'Guided, data-driven Revenue Clear workflow with Supabase persistence and AI automations.',
}

type RevenueClearPageProps = {
  searchParams?: Record<string, string | string[] | undefined>
}

function formatCurrency(value: number | null | undefined) {
  if (value === null || value === undefined) return '—'
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0,
  }).format(value)
}

function formatPercent(value: number | null | undefined) {
  if (value === null || value === undefined) return '—'
  return `${Number(value).toFixed(1)}%`
}

export default async function RevenueClearPage({ searchParams }: RevenueClearPageProps) {
  const clients = await listRevenueClearClients()

  if (!clients.length) {
    const pipelineOptions = await listRevenuePipelineOptions()
    return <RevenueClearOnboarding pipelineOptions={pipelineOptions} />
  }

  const requestedClientIdRaw = searchParams?.clientId
  const requestedClientId = Array.isArray(requestedClientIdRaw)
    ? requestedClientIdRaw[0]
    : requestedClientIdRaw
  const activeClientId = clients.some((client) => client.id === requestedClientId)
    ? (requestedClientId as string)
    : clients[0].id

  const snapshot = await getRevenueClearSnapshot(activeClientId)
  const activeClient = snapshot.client

  const workflowCards = [
    {
      title: 'Guided workflow',
      content: (
        <ol className="space-y-2 text-sm text-[color:var(--color-text-muted)]">
          {STAGES.map((stage, index) => (
            <li key={stage.title} className="flex gap-2">
              <span className="font-semibold text-[color:var(--color-text)]">{index + 1}.</span>
              <span>{stage.title} — {stage.description}</span>
            </li>
          ))}
        </ol>
      ),
    },
    {
      title: 'Automation layer',
      content: (
        <ul className="space-y-2 text-sm text-[color:var(--color-text-muted)]">
          {AUTOMATIONS.map((automation) => (
            <li key={automation.trigger}>
              <span className="font-medium text-[color:var(--color-text)]">{automation.trigger}</span>
              <span>{` · ${automation.agent} → ${automation.outcome}`}</span>
            </li>
          ))}
        </ul>
      ),
    },
    {
      title: 'Deliverables',
      content: (
        <ul className="space-y-2 text-sm text-[color:var(--color-text-muted)]">
          {DELIVERABLES.map((deliverable) => (
            <li key={deliverable.stage} className="flex flex-col">
              <span className="font-medium text-[color:var(--color-text)]">{deliverable.stage}</span>
              <span>{`${deliverable.deliverable} · ${deliverable.format}`}</span>
            </li>
          ))}
        </ul>
      ),
    },
  ]

  const clientFacts = [
    { label: 'Client', value: activeClient.name },
    { label: 'Industry', value: activeClient.industry ?? 'Not set' },
    { label: 'Revenue Model', value: activeClient.revenueModel ?? 'Not set' },
    { label: 'Monthly Revenue', value: formatCurrency(activeClient.monthlyRevenue) },
    { label: 'Profit Margin', value: formatPercent(activeClient.profitMargin) },
    { label: 'Target Growth', value: formatPercent(activeClient.targetGrowth) },
    {
      label: 'Primary Goal',
      value: activeClient.primaryGoal ?? 'Define growth objectives',
      span: 'md:col-span-2 lg:col-span-1 xl:col-span-2',
    },
  ]

  return (
    <PageTemplate
      title="Revenue Clear"
      description="Guide revenue clarity engagements with autosave, Supabase persistence, and AI co-pilots."
      actions={<ClientSwitcher clients={clients} activeClientId={activeClientId} />}
      badges={[{ label: 'Supabase workflow' }, { label: 'AI automations' }]}
      stats={
        <div className="space-y-4">
          <div className="grid gap-4 lg:grid-cols-3">
            {workflowCards.map((card) => (
              <Card key={card.title}>
                <CardHeader>
                  <CardTitle>{card.title}</CardTitle>
                  <CardDescription>
                    {card.title === 'Guided workflow'
                      ? 'Stages from intake through next steps.'
                      : card.title === 'Automation layer'
                      ? 'Edge functions trigger Supabase writes and agents.'
                      : 'Client-facing assets produced across the engagement.'}
                  </CardDescription>
                </CardHeader>
                <CardContent>{card.content}</CardContent>
              </Card>
            ))}
          </div>

          <div className="grid gap-4 lg:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Database models</CardTitle>
                <CardDescription>Supabase tables backing the workflow.</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2 text-sm text-[color:var(--color-text-muted)]">
                  {SCHEMA_MODELS.map((model) => (
                    <Badge key={model} variant="outline">
                      {model}
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle>Environment</CardTitle>
                <CardDescription>Required variables for Supabase + AI orchestration.</CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm text-[color:var(--color-text-muted)]">
                  {ENV_VARS.map((env) => (
                    <li key={env} className="flex items-center justify-between rounded-md border border-[color:var(--color-border)] bg-white px-3 py-2">
                      <span>{env}</span>
                      <span className="text-xs uppercase tracking-[0.18em] text-[color:var(--color-text-muted)]">Required</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          </div>

          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {clientFacts.map((fact) => (
              <Card key={fact.label} className={fact.span}>
                <CardContent className="space-y-1">
                  <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[color:var(--color-text-muted)]">
                    {fact.label}
                  </p>
                  <p className="text-base font-semibold text-[color:var(--color-text)]">{fact.value}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      }
    >
      <RevenueClearShell snapshot={snapshot} />
    </PageTemplate>
  )
}
