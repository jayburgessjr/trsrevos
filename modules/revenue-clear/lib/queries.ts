import { notFound } from 'next/navigation'

import { createClient } from '@/lib/supabase/server'

import {
  AuditLeak,
  BlueprintIntervention,
  ExecutionTask,
  ExecutionWeeklySummary,
  NextStepPlan,
  RevenueClearClient,
  RevenueClearIntake,
  RevenueClearResult,
  RevenueClearSnapshot,
  RevboardMetric,
} from './types'

export type RevenuePipelineOption = {
  id: string
  label: string
  stage: string | null
  amount: number | null
  clientId: string | null
}

function toClient(row: any): RevenueClearClient {
  return {
    id: row.id,
    name: row.name,
    industry: row.industry ?? null,
    revenueModel: row.revenue_model ?? row.revenueModel ?? null,
    monthlyRevenue: row.monthly_recurring_revenue ?? row.monthlyRevenue ?? null,
    profitMargin: row.profit_margin ?? row.profitMargin ?? null,
    targetGrowth: row.target_growth ?? row.targetGrowth ?? null,
    primaryGoal: row.primary_goal ?? row.primaryGoal ?? null,
  }
}

function toIntake(row: any | null): RevenueClearIntake | null {
  if (!row) return null
  return {
    id: row.id,
    companyProfile: row.company_profile ?? row.companyProfile ?? {
      name: '',
      industry: '',
      revenueModel: '',
    },
    financials: row.financials ?? {
      monthlyRevenue: 0,
      profitMargin: 0,
      targetGrowth: 0,
    },
    goals: row.goals ?? {
      primaryGoal: '',
      secondaryGoal: '',
      notes: '',
    },
    claritySummaryUrl: row.clarity_summary_url ?? row.claritySummaryUrl ?? null,
  }
}

function toAudit(row: any): AuditLeak {
  return {
    id: row.id,
    pillar: row.pillar,
    leakSeverity: Number(row.leak_severity ?? row.leakSeverity ?? 0),
    leakDescription: row.leak_description ?? row.leakDescription ?? '',
    estimatedLoss: Number(row.estimated_loss ?? row.estimatedLoss ?? 0),
    score: Number(row.score ?? 0),
    leakMapUrl: row.leak_map_url ?? row.leakMapUrl ?? null,
  }
}

function toIntervention(row: any): BlueprintIntervention {
  return {
    id: row.id,
    interventionName: row.intervention_name ?? row.interventionName ?? '',
    diagnosis: row.diagnosis ?? '',
    fix: row.fix ?? '',
    projectedLift: Number(row.projected_lift ?? row.projectedLift ?? 0),
    effortScore: Number(row.effort_score ?? row.effortScore ?? 0),
    roiIndex: Number(row.roi_index ?? row.roiIndex ?? 0),
    blueprintUrl: row.blueprint_url ?? row.blueprintUrl ?? null,
  }
}

function toMetric(row: any): RevboardMetric {
  return {
    id: row.id,
    kpiName: row.kpi_name ?? row.kpiName ?? '',
    baselineValue: Number(row.baseline_value ?? row.baselineValue ?? 0),
    currentValue: Number(row.current_value ?? row.currentValue ?? 0),
    delta: Number(row.delta ?? 0),
    interventionId: row.intervention_id ?? row.interventionId ?? null,
    date: row.date ?? new Date().toISOString(),
  }
}

function toTask(row: any): ExecutionTask {
  return {
    id: row.id,
    taskName: row.task_name ?? row.taskName ?? '',
    status: (row.status ?? 'todo').toLowerCase(),
    assignedTo: row.assigned_to ?? row.assignedTo ?? '',
    startDate: row.start_date ?? row.startDate ?? new Date().toISOString(),
    endDate: row.end_date ?? row.endDate ?? new Date().toISOString(),
    progressNotes: row.progress_notes ?? row.progressNotes ?? '',
  }
}

function toWeeklySummary(row: any | null): ExecutionWeeklySummary | null {
  if (!row) return null
  return {
    notes: row.notes ?? row.summary ?? '',
    advisorSummary: row.advisor_summary ?? row.advisorSummary ?? null,
  }
}

function toResult(row: any | null): RevenueClearResult | null {
  if (!row) return null
  return {
    id: row.id,
    beforeMRR: Number(row.before_mrr ?? row.beforeMRR ?? 0),
    afterMRR: Number(row.after_mrr ?? row.afterMRR ?? 0),
    beforeProfit: Number(row.before_profit ?? row.beforeProfit ?? 0),
    afterProfit: Number(row.after_profit ?? row.afterProfit ?? 0),
    totalGain: Number(row.total_gain ?? row.totalGain ?? 0),
    paybackPeriod: Number(row.payback_period ?? row.paybackPeriod ?? 0),
    reportUrl: row.report_url ?? row.reportUrl ?? null,
  }
}

function toNextStep(row: any | null): NextStepPlan | null {
  if (!row) return null
  return {
    id: row.id,
    nextOffer: row.next_offer ?? row.nextOffer ?? 'Advisory',
    rationale: row.rationale ?? '',
    projectedOutcome: Number(row.projected_outcome ?? row.projectedOutcome ?? 0),
    proposalDoc: row.proposal_doc ?? row.proposalDoc ?? '',
    proposalUrl: row.proposal_url ?? row.proposalUrl ?? null,
  }
}

export async function listRevenueClearClients(): Promise<RevenueClearClient[]> {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('clients')
    .select(
      `id, name, industry, revenue_model, monthly_recurring_revenue, profit_margin, target_growth, primary_goal`,
    )
    .order('name', { ascending: true })

  if (error) {
    console.error('Failed to load Revenue Clear clients:', error)
    return []
  }

  return (data ?? []).map(toClient)
}

export async function listRevenuePipelineOptions(): Promise<RevenuePipelineOption[]> {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('opportunities')
    .select('id, name, stage, amount, client_id')
    .order('created_at', { ascending: false })

  if (error) {
    console.warn('Failed to load pipeline opportunities for Revenue Clear onboarding', error)
    return []
  }

  return (data ?? [])
    .filter((opportunity: any) => opportunity.stage !== 'ClosedLost')
    .map((opportunity: any) => ({
      id: opportunity.id as string,
      label: opportunity.name as string,
      stage: (opportunity.stage as string | null) ?? null,
      amount: typeof opportunity.amount === 'number' ? (opportunity.amount as number) : Number(opportunity.amount ?? 0),
      clientId: (opportunity.client_id as string | null) ?? null,
    }))
}

export async function getRevenueClearSnapshot(clientId: string): Promise<RevenueClearSnapshot> {
  const supabase = await createClient()

  const { data: clientRow, error: clientError } = await supabase
    .from('clients')
    .select(
      `id, name, industry, revenue_model, monthly_recurring_revenue, profit_margin, target_growth, primary_goal`,
    )
    .eq('id', clientId)
    .maybeSingle()

  if (clientError) {
    console.error('Failed to load client for Revenue Clear:', clientError)
    notFound()
  }

  if (!clientRow) {
    notFound()
  }

  const client = toClient(clientRow)

  const [intakeRes, auditsRes, interventionsRes, metricsRes, tasksRes, weeklyRes, resultsRes, nextStepsRes] =
    await Promise.all([
      supabase.from('intakes').select('*').eq('client_id', clientId).maybeSingle(),
      supabase.from('audits').select('*').eq('client_id', clientId),
      supabase.from('interventions').select('*').eq('client_id', clientId).order('roi_index', { ascending: false }),
      supabase
        .from('revboard_metrics')
        .select('*')
        .eq('client_id', clientId)
        .order('date', { ascending: true }),
      supabase.from('tasks').select('*').eq('client_id', clientId).order('start_date', { ascending: true }),
      supabase.from('execution_weekly_reports').select('*').eq('client_id', clientId).order('created_at', { ascending: false }).maybeSingle(),
      supabase.from('results').select('*').eq('client_id', clientId).maybeSingle(),
      supabase.from('next_steps').select('*').eq('client_id', clientId).maybeSingle(),
    ])

  if (intakeRes.error) {
    console.warn('Failed to load intake snapshot', intakeRes.error)
  }

  if (auditsRes.error) {
    console.warn('Failed to load audits snapshot', auditsRes.error)
  }

  if (interventionsRes.error) {
    console.warn('Failed to load interventions snapshot', interventionsRes.error)
  }

  if (metricsRes.error) {
    console.warn('Failed to load metrics snapshot', metricsRes.error)
  }

  if (tasksRes.error) {
    console.warn('Failed to load tasks snapshot', tasksRes.error)
  }

  if (weeklyRes.error) {
    console.warn('Failed to load weekly summary snapshot', weeklyRes.error)
  }

  if (resultsRes.error) {
    console.warn('Failed to load results snapshot', resultsRes.error)
  }

  if (nextStepsRes.error) {
    console.warn('Failed to load next steps snapshot', nextStepsRes.error)
  }

  return {
    client,
    intake: toIntake(intakeRes.data ?? null),
    audits: (auditsRes.data ?? []).map(toAudit),
    interventions: (interventionsRes.data ?? []).map(toIntervention),
    metrics: (metricsRes.data ?? []).map(toMetric),
    tasks: (tasksRes.data ?? []).map(toTask),
    weeklySummary: toWeeklySummary(weeklyRes.data ?? null),
    results: toResult(resultsRes.data ?? null),
    nextStep: toNextStep(nextStepsRes.data ?? null),
  }
}
