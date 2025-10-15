import type { Metadata } from 'next'

import { ClientSwitcher } from '@/modules/revenue-clear/components/ClientSwitcher'
import RevenueClearShell from '@/modules/revenue-clear/components/RevenueClearShell'
import {
  getRevenueClearSnapshot,
  listRevenueClearClients,
} from '@/modules/revenue-clear/lib/queries'

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
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-b from-[#0e1018] via-[#121526] to-[#0b0d16] px-6 py-10 text-center text-white">
        <div className="max-w-xl space-y-4">
          <h1 className="text-3xl font-semibold">Revenue Clear</h1>
          <p className="text-sm text-white/70">
            Add at least one client record in Supabase to activate the guided Revenue Clear workspace.
          </p>
        </div>
      </div>
    )
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

  const intro = (
    <div className="space-y-6 rounded-3xl border border-white/10 bg-white/5 p-6 shadow-[0_0_60px_-25px_rgba(59,130,246,0.75)] backdrop-blur">
      <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
        <div className="space-y-3">
          <span className="text-xs font-semibold uppercase tracking-[0.2em] text-sky-200/80">System Overview</span>
          <h1 className="text-3xl font-semibold text-white">Revenue Clear Command Center</h1>
          <p className="max-w-2xl text-sm leading-relaxed text-white/70">
            Build the Revenue Clear module inside TRS RevOS, a guided, data-driven workflow that automates the full Revenue
            Clarity Audit — from intake through results and next-step engagement.
          </p>
        </div>
        <ClientSwitcher clients={clients} activeClientId={activeClientId} />
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <section className="space-y-3 rounded-2xl border border-white/10 bg-[#101225]/70 p-4">
          <header className="space-y-1">
            <h2 className="text-sm font-semibold uppercase tracking-[0.18em] text-white/70">Guided Workflow</h2>
            <p className="text-xs text-white/60">Tabs in order:</p>
          </header>
          <ol className="space-y-3">
            {STAGES.map((stage, index) => (
              <li key={stage.title} className="flex items-start gap-3">
                <span className="mt-0.5 text-xs font-semibold text-sky-200">{index + 1}.</span>
                <div className="space-y-1">
                  <p className="text-sm font-semibold text-white">{stage.title}</p>
                  <p className="text-xs text-white/60">{stage.description}</p>
                </div>
              </li>
            ))}
          </ol>
        </section>

        <section className="space-y-3 rounded-2xl border border-white/10 bg-[#101225]/70 p-4">
          <header className="space-y-1">
            <h2 className="text-sm font-semibold uppercase tracking-[0.18em] text-white/70">Automation Layer</h2>
            <p className="text-xs text-white/60">Edge functions trigger Supabase writes + AI agents.</p>
          </header>
          <ul className="space-y-3 text-sm text-white/80">
            {AUTOMATIONS.map((automation) => (
              <li key={automation.trigger} className="space-y-1">
                <p className="font-semibold text-white">{automation.trigger}</p>
                <p className="text-xs text-white/60">
                  {automation.agent} → {automation.outcome}
                </p>
              </li>
            ))}
          </ul>
        </section>

        <section className="space-y-3 rounded-2xl border border-white/10 bg-[#101225]/70 p-4">
          <header className="space-y-1">
            <h2 className="text-sm font-semibold uppercase tracking-[0.18em] text-white/70">Output Deliverables</h2>
            <p className="text-xs text-white/60">Every stage ships a client-facing asset.</p>
          </header>
          <ul className="space-y-2 text-sm text-white/80">
            {DELIVERABLES.map((deliverable) => (
              <li key={deliverable.stage} className="flex flex-col">
                <span className="font-semibold text-white">{deliverable.stage}</span>
                <span className="text-xs text-white/60">
                  {deliverable.deliverable} · {deliverable.format}
                </span>
              </li>
            ))}
          </ul>
        </section>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {[
          { label: 'Client', value: activeClient.name },
          { label: 'Industry', value: activeClient.industry ?? 'Not set' },
          { label: 'Revenue Model', value: activeClient.revenueModel ?? 'Not set' },
          { label: 'Monthly Revenue', value: formatCurrency(activeClient.monthlyRevenue) },
          { label: 'Profit Margin', value: formatPercent(activeClient.profitMargin) },
          { label: 'Target Growth', value: formatPercent(activeClient.targetGrowth) },
          { label: 'Primary Goal', value: activeClient.primaryGoal ?? 'Define growth objectives', span: 'md:col-span-2 lg:col-span-1 xl:col-span-2' },
        ].map((fact) => (
          <div
            key={fact.label}
            className={`rounded-2xl border border-white/10 bg-white/5 p-4 text-left shadow-inner shadow-black/20 ${fact.span ?? ''}`}
          >
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-white/60">{fact.label}</p>
            <p className="mt-1 text-base font-semibold text-white">{fact.value}</p>
          </div>
        ))}
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-2xl border border-white/10 bg-[#101225]/70 p-4">
          <h3 className="text-xs font-semibold uppercase tracking-[0.18em] text-white/60">Database Schema</h3>
          <ul className="mt-2 grid grid-cols-2 gap-2 text-xs text-white/70">
            {SCHEMA_MODELS.map((model) => (
              <li key={model} className="rounded-lg border border-white/10 bg-white/5 px-2 py-1 text-center">
                {model}
              </li>
            ))}
          </ul>
        </div>
        <div className="rounded-2xl border border-white/10 bg-[#101225]/70 p-4">
          <h3 className="text-xs font-semibold uppercase tracking-[0.18em] text-white/60">Environment</h3>
          <ul className="mt-2 space-y-2 text-xs text-white/70">
            {ENV_VARS.map((env) => (
              <li key={env} className="flex items-center justify-between rounded-lg border border-white/10 bg-white/5 px-3 py-2">
                <span>{env}</span>
                <span className="text-[10px] uppercase tracking-widest text-sky-200/80">Required</span>
              </li>
            ))}
          </ul>
        </div>
        <div className="rounded-2xl border border-white/10 bg-[#101225]/70 p-4">
          <h3 className="text-xs font-semibold uppercase tracking-[0.18em] text-white/60">Automation Stack</h3>
          <p className="mt-2 text-xs text-white/70">
            Supabase Edge Functions invoke OpenAI agents with structured JSON prompts. Results persist back into the matching
            tables and expose downloadable assets for each stage.
          </p>
        </div>
        <div className="rounded-2xl border border-white/10 bg-[#101225]/70 p-4">
          <h3 className="text-xs font-semibold uppercase tracking-[0.18em] text-white/60">Navigation Tips</h3>
          <p className="mt-2 text-xs text-white/70">
            Progress stays pinned with autosave indicators. The RevBoard tab mirrors live TRS Score updates, while Results and
            Next Steps export PDF packages for client delivery.
          </p>
        </div>
      </div>
    </div>
  )

  return <RevenueClearShell snapshot={snapshot} intro={intro} />
}
