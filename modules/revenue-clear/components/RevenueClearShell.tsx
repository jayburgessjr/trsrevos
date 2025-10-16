'use client'

import { useCallback, useMemo, useState, type ReactNode } from 'react'

import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/ui/tabs'

import { useAutosave } from '../hooks/useAutosave'
import {
  AuditLeak,
  BlueprintIntervention,
  ExecutionTask,
  ExecutionWeeklySummary,
  NextStepPlan,
  RevenueClearIntake,
  RevenueClearResult,
  RevenueClearSnapshot,
  RevboardMetric,
  StageStatus,
  RevenueClearStageKey,
} from '../lib/types'
import {
  runAdvisorSummary,
  runBlueprintGeneration,
  runIntakeSummary,
  runLeakScan,
  runProposal,
  runResultsReport,
} from '../lib/automations'
import { ProgressStepper } from './ProgressStepper'
import IntakeTab from './tabs/IntakeTab'
import AuditTab from './tabs/AuditTab'
import BlueprintTab from './tabs/BlueprintTab'
import RevboardTab from './tabs/RevboardTab'
import ExecutionTab from './tabs/ExecutionTab'
import ResultsTab from './tabs/ResultsTab'
import NextStepsTab from './tabs/NextStepsTab'
import { createClient } from '@/lib/supabase/client'

const TAB_CONFIG: { key: RevenueClearStageKey; label: string; description: string }[] = [
  { key: 'intake', label: 'Intake', description: 'Baseline data, goals, and financial posture.' },
  { key: 'audit', label: 'Audit', description: 'Leak severity across pricing, demand, retention, forecasting.' },
  { key: 'blueprint', label: 'Blueprint', description: 'Prioritized interventions and projected ROI.' },
  { key: 'revboard', label: 'RevBoard', description: 'KPI tracking and TRS score telemetry.' },
  { key: 'execution', label: 'Execution', description: 'Tasks, owners, and weekly advisor recaps.' },
  { key: 'results', label: 'Results', description: 'Before/after impact and ROI payback.' },
  { key: 'nextSteps', label: 'Next Steps', description: 'Proposal packaging and client-ready plan.' },
]

const DEFAULT_INTAKE: RevenueClearIntake = {
  companyProfile: {
    name: '',
    industry: '',
    revenueModel: '',
  },
  financials: {
    monthlyRevenue: 0,
    profitMargin: 0,
    targetGrowth: 0,
  },
  goals: {
    primaryGoal: '',
    secondaryGoal: '',
    notes: '',
  },
}

const DEFAULT_RESULT: RevenueClearResult = {
  beforeMRR: 0,
  afterMRR: 0,
  beforeProfit: 0,
  afterProfit: 0,
  totalGain: 0,
  paybackPeriod: 0,
}

const DEFAULT_NEXT_STEPS: NextStepPlan = {
  nextOffer: 'Advisory',
  rationale: '',
  projectedOutcome: 0,
  proposalDoc: '',
}

const BLUEPRINT_PLACEHOLDER_COUNT = 3

function padBlueprintInterventions(list: BlueprintIntervention[]): BlueprintIntervention[] {
  const normalized = list.slice(0, BLUEPRINT_PLACEHOLDER_COUNT).map((item) => ({
    ...item,
    interventionName: item.interventionName?.trim() ?? '',
    diagnosis: item.diagnosis?.trim() ?? '',
    fix: item.fix?.trim() ?? '',
    projectedLift: Number.isFinite(item.projectedLift) ? item.projectedLift : 0,
    effortScore: Number.isFinite(item.effortScore) ? item.effortScore : 0,
    roiIndex: Number.isFinite(item.roiIndex) ? item.roiIndex : 0,
    blueprintUrl: item.blueprintUrl ?? null,
  }))

  const padded = [...normalized]
  for (let index = padded.length; index < BLUEPRINT_PLACEHOLDER_COUNT; index += 1) {
    padded.push({
      interventionName: '',
      diagnosis: '',
      fix: '',
      projectedLift: 0,
      effortScore: 0,
      roiIndex: 0,
      blueprintUrl: null,
    })
  }

  return padded
}

const DEFAULT_REVBOARD_KPIS: string[] = ['MRR', 'Churn', 'ARPU', 'CAC']

function ensureMetricRows(metrics: RevboardMetric[], client: RevenueClearSnapshot['client']): RevboardMetric[] {
  if (metrics.length) {
    return metrics
  }

  const now = new Date().toISOString()
  const baselineRevenue = client.monthlyRevenue ?? 0

  return DEFAULT_REVBOARD_KPIS.map((kpi) => ({
    kpiName: kpi,
    baselineValue: kpi === 'MRR' ? baselineRevenue : 0,
    currentValue: kpi === 'MRR' ? baselineRevenue : 0,
    delta: 0,
    interventionId: null,
    date: now,
  }))
}

function computeTrsScore(audits: AuditLeak[]): number {
  const weights: Record<AuditLeak['pillar'], number> = {
    pricing: 0.3,
    demand: 0.25,
    retention: 0.25,
    forecasting: 0.2,
  }

  const weightedLoss = audits.reduce((acc, audit) => {
    const severity = Math.max(0, Math.min(10, Number(audit.leakSeverity ?? 0)))
    const normalized = severity / 10
    return acc + normalized * (weights[audit.pillar] ?? 0) * 100
  }, 0)

  return Math.max(0, Math.round(100 - weightedLoss))
}

type RevenueClearShellProps = {
  snapshot: RevenueClearSnapshot
  intro?: ReactNode
}

export default function RevenueClearShell({ snapshot, intro }: RevenueClearShellProps) {
  const supabase = useMemo(() => createClient(), [])
  const [activeTab, setActiveTab] = useState<RevenueClearStageKey>('intake')

  const [intake, setIntake] = useState<RevenueClearIntake>(snapshot.intake ?? DEFAULT_INTAKE)
  const [audits, setAudits] = useState<AuditLeak[]>(
    snapshot.audits.length
      ? snapshot.audits
      : ([
          'pricing',
          'demand',
          'retention',
          'forecasting',
        ] as AuditLeak['pillar'][]).map((pillar) => ({
          pillar,
          leakSeverity: 0,
          leakDescription: '',
          estimatedLoss: 0,
          score: 0,
        })),
  )
  const [interventions, setInterventions] = useState<BlueprintIntervention[]>(() =>
    padBlueprintInterventions(snapshot.interventions),
  )
  const [metrics, setMetrics] = useState<RevboardMetric[]>(() =>
    ensureMetricRows(snapshot.metrics, snapshot.client),
  )
  const [tasks, setTasks] = useState<ExecutionTask[]>(snapshot.tasks)
  const [weeklySummary, setWeeklySummary] = useState<ExecutionWeeklySummary | null>(snapshot.weeklySummary)
  const [results, setResults] = useState<RevenueClearResult>(snapshot.results ?? DEFAULT_RESULT)
  const [nextStep, setNextStep] = useState<NextStepPlan>(snapshot.nextStep ?? DEFAULT_NEXT_STEPS)

  const {
    scheduleSave: scheduleIntakeSave,
    saveImmediately: saveIntakeNow,
    status: intakeStatus,
    setStatus: setIntakeStatus,
  } = useAutosave<RevenueClearIntake>(
    async (value) => {
      const { data, error } = await supabase
        .from('revenue_clear_intakes')
        .upsert(
          {
            id: value.id,
            client_id: snapshot.client.id,
            company_profile: value.companyProfile,
            financials: value.financials,
            goals: value.goals,
            clarity_summary_url: value.claritySummaryUrl ?? null,
          },
          { onConflict: 'client_id' },
        )
        .select()
        .maybeSingle()

      if (error) {
        throw error
      }

      if (data) {
        setIntake({
          ...value,
          id: data.id,
          claritySummaryUrl: data.clarity_summary_url ?? value.claritySummaryUrl ?? null,
        })
      }
    },
  )

  const {
    scheduleSave: scheduleAuditSave,
    saveImmediately: saveAuditNow,
    status: auditStatus,
    setStatus: setAuditStatus,
  } = useAutosave<AuditLeak[]>(
    async (value) => {
      const payload = value.map((audit) => ({
        id: audit.id,
        client_id: snapshot.client.id,
        pillar: audit.pillar,
        leak_severity: audit.leakSeverity,
        leak_description: audit.leakDescription,
        estimated_loss: audit.estimatedLoss,
        score: audit.score,
        leak_map_url: audit.leakMapUrl ?? null,
      }))

      const { data, error } = await supabase
        .from('revenue_clear_audits')
        .upsert(payload, { onConflict: 'client_id,pillar' })
        .select()
      if (error) {
        throw error
      }

      if (data) {
        setAudits(
          value.map((audit) => {
            const updated = data.find((row) => row.pillar === audit.pillar)
            if (!updated) return audit
            return {
              ...audit,
              id: updated.id,
              leakMapUrl: updated.leak_map_url ?? audit.leakMapUrl ?? null,
            }
          }),
        )
      }
    },
  )

  const {
    scheduleSave: scheduleBlueprintSave,
    saveImmediately: saveBlueprintNow,
    status: blueprintStatus,
    setStatus: setBlueprintStatus,
  } = useAutosave<BlueprintIntervention[]>(async (value) => {
      const sanitized = value
        .map((item) => ({
          ...item,
          interventionName: item.interventionName?.trim() ?? '',
          diagnosis: item.diagnosis?.trim() ?? '',
          fix: item.fix?.trim() ?? '',
          projectedLift: Number.isFinite(item.projectedLift) ? item.projectedLift : 0,
          effortScore: Number.isFinite(item.effortScore) ? item.effortScore : 0,
          roiIndex: Number.isFinite(item.roiIndex) ? item.roiIndex : 0,
          blueprintUrl: item.blueprintUrl ?? null,
        }))
        .filter(
          (item) =>
            item.interventionName ||
            item.diagnosis ||
            item.fix ||
            item.projectedLift ||
            item.effortScore ||
            item.roiIndex ||
            item.blueprintUrl,
        )

      if (!sanitized.length) {
        setInterventions(padBlueprintInterventions([]))
        return
      }

      const payload = sanitized.map((item) => ({
        id: item.id,
        client_id: snapshot.client.id,
        intervention_name: item.interventionName,
        diagnosis: item.diagnosis,
        fix: item.fix,
        projected_lift: item.projectedLift,
        effort_score: item.effortScore,
        roi_index: item.roiIndex,
        blueprint_url: item.blueprintUrl ?? null,
      }))

      const { data, error } = await supabase
        .from('revenue_clear_interventions')
        .upsert(payload, { onConflict: 'id' })
        .select()

      if (error) {
        throw error
      }

      const persisted = sanitized.map((intervention) => {
        const updated = data?.find(
          (row) => row.id === intervention.id || row.intervention_name === intervention.interventionName,
        )
        return {
          ...intervention,
          id: updated?.id ?? intervention.id,
          blueprintUrl: updated?.blueprint_url ?? intervention.blueprintUrl ?? null,
        }
      })

      setInterventions(padBlueprintInterventions(persisted))
    })

  const {
    scheduleSave: scheduleMetricSave,
    saveImmediately: saveMetricNow,
    status: metricStatus,
    setStatus: setMetricStatus,
  } = useAutosave<RevboardMetric[]>(
    async (value) => {
      const sanitized = value
        .map((metric) => {
          const baselineValue = Number.isFinite(Number(metric.baselineValue))
            ? Number(metric.baselineValue)
            : 0
          const currentValue = Number.isFinite(Number(metric.currentValue))
            ? Number(metric.currentValue)
            : 0
          const computedDelta = Number.isFinite(Number(metric.delta))
            ? Number(metric.delta)
            : Number((currentValue - baselineValue).toFixed(2))

          return {
            ...metric,
            kpiName: metric.kpiName?.trim() ?? '',
            baselineValue,
            currentValue,
            delta: computedDelta,
            interventionId: metric.interventionId ?? null,
            date: metric.date ?? new Date().toISOString(),
          }
        })
        .filter((metric) => metric.kpiName)

      if (!sanitized.length) {
        setMetrics(ensureMetricRows([], snapshot.client))
        return
      }

      const payload = sanitized.map((metric) => ({
        id: metric.id,
        client_id: snapshot.client.id,
        kpi_name: metric.kpiName,
        baseline_value: metric.baselineValue,
        current_value: metric.currentValue,
        delta: metric.delta,
        intervention_id: metric.interventionId ?? null,
        recorded_on: metric.date,
      }))
      const { data, error } = await supabase
        .from('revenue_clear_metrics')
        .upsert(payload, { onConflict: 'id' })
        .select()

      if (error) {
        throw error
      }

      const persisted = sanitized.map((metric) => {
        const updated = data?.find((row) => row.id === metric.id || row.kpi_name === metric.kpiName)
        const baselineValue = Number.isFinite(Number(updated?.baseline_value))
          ? Number(updated?.baseline_value)
          : metric.baselineValue
        const currentValue = Number.isFinite(Number(updated?.current_value))
          ? Number(updated?.current_value)
          : metric.currentValue
        const delta = Number.isFinite(Number(updated?.delta))
          ? Number(updated?.delta)
          : Number((currentValue - baselineValue).toFixed(2))

        return {
          ...metric,
          id: updated?.id ?? metric.id,
          baselineValue,
          currentValue,
          delta,
          interventionId: updated?.intervention_id ?? metric.interventionId ?? null,
          date: updated?.recorded_on ?? metric.date ?? new Date().toISOString(),
        }
      })

      setMetrics(ensureMetricRows(persisted, snapshot.client))
    },
  )

  const {
    scheduleSave: scheduleTaskSave,
    saveImmediately: saveTaskNow,
    status: executionStatus,
    setStatus: setExecutionStatus,
  } = useAutosave<{
    tasks: ExecutionTask[]
    weekly: ExecutionWeeklySummary | null
  }>(async (value) => {
    const taskPayload = value.tasks.map((task) => ({
      id: task.id,
      client_id: snapshot.client.id,
      task_name: task.taskName,
      status: task.status,
      assigned_to: task.assignedTo,
      start_date: task.startDate,
      end_date: task.endDate,
      progress_notes: task.progressNotes,
    }))

    const { data: taskData, error: taskError } = await supabase
      .from('revenue_clear_tasks')
      .upsert(taskPayload, { onConflict: 'id' })
      .select()

    if (taskError) {
      throw taskError
    }

    if (taskData) {
      setTasks(
        value.tasks.map((task) => {
          const updated = taskData.find((row) => row.task_name === task.taskName && row.assigned_to === task.assignedTo)
          if (!updated) return task
          return {
            ...task,
            id: updated.id,
          }
        }),
      )
    }

    if (value.weekly) {
      const { data: weeklyData, error: weeklyError } = await supabase
        .from('revenue_clear_weekly_summaries')
        .upsert(
          {
            client_id: snapshot.client.id,
            notes: value.weekly.notes,
            advisor_summary: value.weekly.advisorSummary ?? null,
          },
          { onConflict: 'client_id' },
        )
        .select()
        .maybeSingle()

      if (weeklyError) {
        throw weeklyError
      }

      if (weeklyData) {
        setWeeklySummary({
          notes: weeklyData.notes ?? value.weekly.notes,
          advisorSummary: weeklyData.advisor_summary ?? value.weekly.advisorSummary ?? null,
        })
      }
    }
  })

  const {
    scheduleSave: scheduleResultsSave,
    saveImmediately: saveResultsNow,
    status: resultsStatus,
    setStatus: setResultsStatus,
  } = useAutosave<RevenueClearResult>(
    async (value) => {
      const { data, error } = await supabase
        .from('revenue_clear_results')
        .upsert(
          {
            id: value.id,
            client_id: snapshot.client.id,
            before_mrr: value.beforeMRR,
            after_mrr: value.afterMRR,
            before_profit: value.beforeProfit,
            after_profit: value.afterProfit,
            total_gain: value.totalGain,
            payback_period: value.paybackPeriod,
            report_url: value.reportUrl ?? null,
          },
          { onConflict: 'client_id' },
        )
        .select()
        .maybeSingle()

      if (error) {
        throw error
      }

      if (data) {
        setResults({
          ...value,
          id: data.id,
          reportUrl: data.report_url ?? value.reportUrl ?? null,
        })
      }
    },
  )

  const {
    scheduleSave: scheduleNextStepsSave,
    saveImmediately: saveNextStepsNow,
    status: nextStepsStatus,
    setStatus: setNextStepsStatus,
  } = useAutosave<NextStepPlan>(
    async (value) => {
      const { data, error } = await supabase
        .from('revenue_clear_next_steps')
        .upsert(
          {
            id: value.id,
            client_id: snapshot.client.id,
            next_offer: value.nextOffer,
            rationale: value.rationale,
            projected_outcome: value.projectedOutcome,
            proposal_doc: value.proposalDoc,
            proposal_url: value.proposalUrl ?? null,
          },
          { onConflict: 'client_id' },
        )
        .select()
        .maybeSingle()

      if (error) {
        throw error
      }

      if (data) {
        setNextStep({
          ...value,
          id: data.id,
          proposalUrl: data.proposal_url ?? value.proposalUrl ?? null,
        })
      }
    },
  )

  const handleIntakeChange = useCallback(
    (value: RevenueClearIntake) => {
      setIntake(value)
      scheduleIntakeSave(value)
    },
    [scheduleIntakeSave],
  )

  const handleAuditChange = useCallback(
    (value: AuditLeak[]) => {
      setAudits(value)
      scheduleAuditSave(value)
    },
    [scheduleAuditSave],
  )

  const handleBlueprintChange = useCallback(
    (value: BlueprintIntervention[]) => {
      const next = padBlueprintInterventions(value)
      setInterventions(next)
      scheduleBlueprintSave(next)
    },
    [scheduleBlueprintSave],
  )

  const handleMetricChange = useCallback(
    (value: RevboardMetric[]) => {
      const next = ensureMetricRows(value, snapshot.client)
      setMetrics(next)
      scheduleMetricSave(next)
    },
    [scheduleMetricSave, snapshot.client],
  )

  const handleTaskChange = useCallback(
    (value: ExecutionTask[]) => {
      const next = { tasks: value, weekly: weeklySummary }
      setTasks(value)
      scheduleTaskSave(next)
    },
    [scheduleTaskSave, weeklySummary],
  )

  const handleWeeklySummaryChange = useCallback(
    (value: ExecutionWeeklySummary) => {
      const nextPayload = { tasks, weekly: value }
      setWeeklySummary(value)
      scheduleTaskSave(nextPayload)
    },
    [scheduleTaskSave, tasks],
  )

  const handleResultsChange = useCallback(
    (value: RevenueClearResult) => {
      setResults(value)
      scheduleResultsSave(value)
    },
    [scheduleResultsSave],
  )

  const handleNextStepsChange = useCallback(
    (value: NextStepPlan) => {
      setNextStep(value)
      scheduleNextStepsSave(value)
    },
    [scheduleNextStepsSave],
  )

  const handleRunIntakeSummary = useCallback(async () => {
    setIntakeStatus('running')
    const response = await runIntakeSummary({
      clientId: snapshot.client.id,
      intake,
    })

    if (response.fileUrl) {
      const updated: RevenueClearIntake = {
        ...intake,
        claritySummaryUrl: response.fileUrl,
      }
      setIntake(updated)
      await saveIntakeNow(updated)
    }
    setIntakeStatus(response.data ? 'saved' : 'error')
  }, [intake, saveIntakeNow, setIntakeStatus, snapshot.client.id])

  const handleRunLeakScan = useCallback(async () => {
    setAuditStatus('running')
    const response = await runLeakScan({
      clientId: snapshot.client.id,
      audits,
    })

    let nextAudits = audits
    if (response.fileUrl) {
      nextAudits = audits.map((audit) => ({
        ...audit,
        leakMapUrl: response.fileUrl ?? audit.leakMapUrl ?? null,
      }))
      setAudits(nextAudits)
    }
    await saveAuditNow(nextAudits)
    setAuditStatus(response.data ? 'saved' : 'error')
  }, [audits, saveAuditNow, setAuditStatus, snapshot.client.id])

  const handleGenerateBlueprint = useCallback(async () => {
    setBlueprintStatus('running')
    const response = await runBlueprintGeneration({
      clientId: snapshot.client.id,
      audits,
      intake,
    })

    let nextBlueprints = interventions
    if (response.data && Array.isArray((response.data as any).interventions)) {
      nextBlueprints = ((response.data as any).interventions as any[]).slice(0, 3).map((item, index) => ({
        interventionName: item.intervention_name ?? item.interventionName ?? `Intervention ${index + 1}`,
        diagnosis: item.diagnosis ?? '',
        fix: item.fix ?? '',
        projectedLift: Number(item.projected_lift ?? 0),
        effortScore: Number(item.effort_score ?? 0),
        roiIndex: Number(item.roi_index ?? 0),
        blueprintUrl: item.blueprint_url ?? item.blueprintUrl ?? null,
      }))
    }

    if (response.fileUrl) {
      nextBlueprints = nextBlueprints.map((item) => ({
        ...item,
        blueprintUrl: response.fileUrl ?? item.blueprintUrl ?? null,
      }))
    }

    const paddedBlueprints = padBlueprintInterventions(nextBlueprints)
    setInterventions(paddedBlueprints)
    await saveBlueprintNow(paddedBlueprints)
    setBlueprintStatus(response.data ? 'saved' : 'error')
  }, [audits, intake, interventions, saveBlueprintNow, setBlueprintStatus, snapshot.client.id])

  const handleCompleteReview = useCallback(async () => {
    setExecutionStatus('running')
    const response = await runAdvisorSummary({
      clientId: snapshot.client.id,
      weeklySummary,
      tasks,
    })

    if (response.data && (response.data as any).advisorSummary) {
      const advisorSummary = (response.data as any).advisorSummary as string
      const nextSummary = {
        notes: weeklySummary?.notes ?? '',
        advisorSummary,
      }
      setWeeklySummary(nextSummary)
      await saveTaskNow({ tasks, weekly: nextSummary })
    }

    setExecutionStatus(response.data ? 'saved' : 'error')
  }, [saveTaskNow, setExecutionStatus, snapshot.client.id, tasks, weeklySummary])

  const handleGenerateReport = useCallback(async () => {
    setResultsStatus('running')
    const response = await runResultsReport({
      clientId: snapshot.client.id,
      results,
    })

    if (response.data && (response.data as any).reportUrl) {
      const nextResult = {
        ...results,
        reportUrl: (response.data as any).reportUrl as string,
      }
      setResults(nextResult)
      await saveResultsNow(nextResult)
    }

    setResultsStatus(response.data ? 'saved' : 'error')
  }, [results, saveResultsNow, setResultsStatus, snapshot.client.id])

  const handleSendProposal = useCallback(async () => {
    setNextStepsStatus('running')
    const response = await runProposal({
      clientId: snapshot.client.id,
      plan: nextStep,
    })

    if (response.data && (response.data as any).proposalUrl) {
      const nextPlan = {
        ...nextStep,
        proposalUrl: (response.data as any).proposalUrl as string,
      }
      setNextStep(nextPlan)
      await saveNextStepsNow(nextPlan)
    }

    setNextStepsStatus(response.data ? 'saved' : 'error')
  }, [nextStep, saveNextStepsNow, setNextStepsStatus, snapshot.client.id])

  const trsScore = useMemo(() => computeTrsScore(audits), [audits])

  const stepperItems = TAB_CONFIG.map((tab) => ({
    ...tab,
    status: (() => {
      switch (tab.key) {
        case 'intake':
          return intakeStatus
        case 'audit':
          return auditStatus
        case 'blueprint':
          return blueprintStatus
        case 'revboard':
          return metricStatus
        case 'execution':
          return executionStatus
        case 'results':
          return resultsStatus
        case 'nextSteps':
          return nextStepsStatus
        default:
          return 'idle' satisfies StageStatus
      }
    })(),
  }))

  return (
    <div className="space-y-6">
      {intro}
      <Tabs
        defaultValue="intake"
        value={activeTab}
        onValueChange={(value) => setActiveTab(value as RevenueClearStageKey)}
      >
        <div className="sticky top-14 z-30 space-y-3 pb-3 supports-[backdrop-filter]:backdrop-blur">
          <ProgressStepper
            items={stepperItems}
            active={activeTab}
            onSelect={(key) => setActiveTab(key)}
          />
          <TabsList className="flex w-full flex-wrap gap-2 border-[color:var(--color-border)] bg-[color:var(--color-surface)]/95 p-1.5 shadow-sm supports-[backdrop-filter]:bg-[color:var(--color-surface)]/80">
            {TAB_CONFIG.map((tab) => (
              <TabsTrigger key={tab.key} value={tab.key}>
                {tab.label}
              </TabsTrigger>
            ))}
          </TabsList>
        </div>

        <TabsContent
          value="intake"
          className="border border-solid border-[color:var(--color-border)] bg-[color:var(--color-surface)] shadow-sm"
        >
          <IntakeTab
            client={snapshot.client}
            value={intake}
            status={intakeStatus}
            onChange={handleIntakeChange}
            onSummarize={handleRunIntakeSummary}
          />
        </TabsContent>

        <TabsContent
          value="audit"
          className="border border-solid border-[color:var(--color-border)] bg-[color:var(--color-surface)] shadow-sm"
        >
          <AuditTab
            audits={audits}
            trsScore={trsScore}
            status={auditStatus}
            onChange={handleAuditChange}
            onRunLeakScan={handleRunLeakScan}
          />
        </TabsContent>

        <TabsContent
          value="blueprint"
          className="border border-solid border-[color:var(--color-border)] bg-[color:var(--color-surface)] shadow-sm"
        >
          <BlueprintTab
            interventions={interventions}
            status={blueprintStatus}
            onChange={handleBlueprintChange}
            onGenerate={handleGenerateBlueprint}
            baselineRevenue={snapshot.client.monthlyRevenue ?? 0}
          />
        </TabsContent>

        <TabsContent
          value="revboard"
          className="border border-solid border-[color:var(--color-border)] bg-[color:var(--color-surface)] shadow-sm"
        >
          <RevboardTab
            metrics={metrics}
            status={metricStatus}
            trsScore={trsScore}
            interventions={interventions}
            onChange={handleMetricChange}
          />
        </TabsContent>

        <TabsContent
          value="execution"
          className="border border-solid border-[color:var(--color-border)] bg-[color:var(--color-surface)] shadow-sm"
        >
          <ExecutionTab
            tasks={tasks}
            status={executionStatus}
            weeklySummary={weeklySummary}
            onChange={handleTaskChange}
            onWeeklySummaryChange={handleWeeklySummaryChange}
            onCompleteReview={handleCompleteReview}
          />
        </TabsContent>

        <TabsContent
          value="results"
          className="border border-solid border-[color:var(--color-border)] bg-[color:var(--color-surface)] shadow-sm"
        >
          <ResultsTab
            value={results}
            status={resultsStatus}
            onChange={handleResultsChange}
            onGenerateReport={handleGenerateReport}
          />
        </TabsContent>

        <TabsContent
          value="nextSteps"
          className="border border-solid border-[color:var(--color-border)] bg-[color:var(--color-surface)] shadow-sm"
        >
          <NextStepsTab
            value={nextStep}
            status={nextStepsStatus}
            onChange={handleNextStepsChange}
            onSendProposal={handleSendProposal}
          />
        </TabsContent>
      </Tabs>
    </div>
  )
}
