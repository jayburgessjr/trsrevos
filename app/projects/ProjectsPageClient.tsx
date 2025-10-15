"use client"

import { useCallback, useMemo, useState } from 'react'
import { usePathname, useSearchParams } from 'next/navigation'

import { AgentsPanel } from '@/components/projects/AgentsPanel'
import { FiltersBar, useProjectsFilters } from '@/components/projects/Filters'
import { KpiStrip } from '@/components/projects/KpiStrip'
import { ProjectBoard } from '@/components/projects/Board'
import { ProjectTimeline, type TimelineItem } from '@/components/projects/Timeline'
import { ProjectsTable } from '@/components/projects/ProjectsTable'
import { HealthDashboard } from '@/components/projects/HealthDashboard'
import { DeliveryWorkflows } from '@/components/projects/DeliveryWorkflows'
import { RoiNarratives } from '@/components/projects/RoiNarratives'
import { PageTemplate } from '@/components/layout/PageTemplate'
import { PageTabs } from '@/components/layout/PageTabs'
import { Input } from '@/ui/input'
import type {
  ClientOverview,
  ClientRow,
  OpportunityRecord,
  OwnerRow,
  ProjectRecord,
} from '@/core/projects/queries'
import type {
  ProjectMilestone,
  ProjectStats,
  ProjectDeliveryUpdate,
  ProjectChangeOrder,
  ClientRoiNarrative,
  ClientHealthSnapshot,
} from '@/core/projects/types'

const PAGE_TABS = ["Overview", "Health", "Delivery", "Board", "Timeline", "Agents", "Reports"] as const

type Tab = (typeof PAGE_TABS)[number]

type ProjectsPageClientProps = {
  clients: ClientRow[]
  activeClients: ClientRow[]
  overview: ClientOverview[]
  owners: OwnerRow[]
  projects: ProjectRecord[]
  opportunities: OpportunityRecord[]
  stages: string[]
  healths: string[]
  kpis: { label: string; value: string }[]
  generatedAt: string
  projectStats: ProjectStats
  milestones: ProjectMilestone[]
  deliveryUpdates: ProjectDeliveryUpdate[]
  changeOrders: ProjectChangeOrder[]
  roiNarratives: ClientRoiNarrative[]
  healthHistory: ClientHealthSnapshot[]
  invoiceOptions: InvoiceOption[]
}

type OwnerOption = { id: string; label: string }

type OpportunitySummary = {
  clientId: string
  nextStep: string | null
  dueDate: string | null
  stage: string | null
}

type InvoiceOption = { id: string; label: string }

export default function ProjectsPageClient({
  clients,
  activeClients,
  overview,
  owners,
  projects,
  opportunities,
  stages,
  healths,
  kpis,
  generatedAt,
  projectStats,
  milestones,
  deliveryUpdates,
  changeOrders,
  roiNarratives,
  healthHistory,
  invoiceOptions,
}: ProjectsPageClientProps) {
  const { filters, setFilters } = useProjectsFilters()
  const searchParams = useSearchParams()
  const pathname = usePathname()

  const [deliveryUpdatesState, setDeliveryUpdatesState] = useState(deliveryUpdates)
  const [changeOrdersState, setChangeOrdersState] = useState(changeOrders)
  const [roiNarrativesState, setRoiNarrativesState] = useState(roiNarratives)

  const activeTab = useMemo<Tab>(() => {
    const raw = searchParams.get('tab') ?? ''
    const match = PAGE_TABS.find((tab) => tab.toLowerCase() === raw.toLowerCase())
    return (match ?? 'Overview') as Tab
  }, [searchParams])

  const buildTabHref = useCallback(
    (tab: string) => {
      const params = new URLSearchParams(searchParams.toString())
      if (tab === 'Overview') {
        params.delete('tab')
      } else {
        params.set('tab', tab)
      }
      const query = params.toString()
      return query ? `${pathname}?${query}` : pathname
    },
    [pathname, searchParams],
  )

  const ownerOptions = useMemo<OwnerOption[]>(() => {
    return owners
      .map((owner) => ({
        id: owner.id,
        label: owner.full_name || owner.email || owner.id,
      }))
      .sort((a, b) => a.label.localeCompare(b.label))
  }, [owners])

  const clientOptions = useMemo(() => {
    return clients
      .map((client) => ({ id: client.id, name: client.name }))
      .sort((a, b) => a.name.localeCompare(b.name))
  }, [clients])

  const opportunitySummaries = useMemo(() => buildOpportunitySummaries(opportunities), [opportunities])

  const timelineItems = useMemo<TimelineItem[]>(() => {
    const clientNameMap = new Map(clients.map((client) => [client.id, client.name]))
    return projects.map((project) => ({
      id: project.id,
      projectName: project.name,
      clientName: clientNameMap.get(project.client_id) ?? null,
      startDate: project.start_date,
      endDate: project.end_date,
    }))
  }, [clients, projects])

  const generatedLabel = useMemo(() => {
    const parsed = new Date(generatedAt)
    if (Number.isNaN(parsed.getTime())) return ""
    return parsed.toLocaleString()
  }, [generatedAt])

  return (
    <PageTemplate
      title="Projects"
      description="Project Management Hub for live client delivery."
      toolbar={
        <div className="flex w-full flex-col gap-2 md:flex-row md:items-center md:justify-between">
          <div className="w-full md:max-w-md">
            <Input
              placeholder="Search clients or next steps"
              value={filters.q}
              onChange={(event) =>
                setFilters((current) => ({ ...current, q: event.target.value }))
              }
            />
          </div>
          {generatedLabel ? (
            <span className="text-xs text-gray-500 md:text-sm">Updated {generatedLabel}</span>
          ) : null}
        </div>
      }
      stats={<KpiStrip items={kpis} />}
      statsWrapperClassName="grid gap-3"
      contentClassName="space-y-4"
    >
      <div className="space-y-4">
        <PageTabs tabs={[...PAGE_TABS]} activeTab={activeTab} hrefForTab={buildTabHref} />

        {activeTab === "Overview" ? (
          <div className="space-y-4">
            <FiltersBar
              stagesAvailable={stages}
              healthAvailable={healths}
              owners={ownerOptions}
              value={filters}
              onChange={setFilters}
              showSearch={false}
            />
            <ProjectsTable
              rows={activeClients}
              overview={overview}
              owners={ownerOptions}
              filters={filters}
              opportunities={opportunitySummaries}
            />
          </div>
        ) : null}

        {activeTab === "Health" ? (
          <HealthDashboard
            projects={projects}
            milestones={milestones}
            healthHistory={healthHistory}
            stats={projectStats}
          />
        ) : null}

        {activeTab === "Delivery" ? (
          <DeliveryWorkflows
            projects={projects}
            deliveryUpdates={deliveryUpdatesState}
            changeOrders={changeOrdersState}
            opportunities={opportunities}
            invoices={invoiceOptions}
            onCreateDeliveryUpdate={(update) =>
              setDeliveryUpdatesState((current) => [update, ...current.filter((item) => item.id !== update.id)])
            }
            onUpdateDeliveryApproval={(update) =>
              setDeliveryUpdatesState((current) =>
                current.map((item) => (item.id === update.id ? update : item)),
              )
            }
            onCreateChangeOrder={(order) =>
              setChangeOrdersState((current) => [order, ...current.filter((item) => item.id !== order.id)])
            }
            onUpdateChangeOrder={(order) =>
              setChangeOrdersState((current) =>
                current.map((item) => (item.id === order.id ? order : item)),
              )
            }
          />
        ) : null}

        {activeTab === "Board" ? <ProjectBoard rows={activeClients} /> : null}

        {activeTab === "Timeline" ? <ProjectTimeline items={timelineItems} /> : null}

        {activeTab === "Agents" ? <AgentsPanel /> : null}

        {activeTab === "Reports" ? (
          <RoiNarratives
            narratives={roiNarrativesState}
            clients={clientOptions}
            onCreateNarrative={(narrative) =>
              setRoiNarrativesState((current) => [narrative, ...current.filter((item) => item.id !== narrative.id)])
            }
            onShareNarrative={(narrative) =>
              setRoiNarrativesState((current) =>
                current.map((item) => (item.id === narrative.id ? narrative : item)),
              )
            }
          />
        ) : null}
      </div>
    </PageTemplate>
  )
}

function buildOpportunitySummaries(opportunities: OpportunityRecord[]): OpportunitySummary[] {
  const byClient = new Map<string, OpportunitySummary>()

  opportunities.forEach((opportunity) => {
    if (!opportunity.client_id) {
      return
    }
    const candidate: OpportunitySummary = {
      clientId: opportunity.client_id,
      nextStep: opportunity.next_step,
      dueDate: opportunity.next_step_date ?? opportunity.close_date ?? null,
      stage: normalizeOpportunityStage(opportunity.stage),
    }
    const existing = byClient.get(opportunity.client_id)
    if (!existing) {
      byClient.set(opportunity.client_id, candidate)
      return
    }
    const chosen = chooseBetterOpportunity(existing, candidate)
    byClient.set(opportunity.client_id, chosen)
  })

  return Array.from(byClient.values())
}

const OPPORTUNITY_STAGE_LABELS: Record<string, string> = {
  Prospect: "Discovery",
  Qualify: "Qualification",
  Proposal: "Proposal",
  Negotiation: "Negotiation",
  ClosedWon: "Closed Won",
  ClosedLost: "Closed Lost",
}

function normalizeOpportunityStage(stage: string | null) {
  if (!stage) return null
  return OPPORTUNITY_STAGE_LABELS[stage] ?? stage
}

function chooseBetterOpportunity(current: OpportunitySummary, candidate: OpportunitySummary): OpportunitySummary {
  const currentDue = current.dueDate ? new Date(current.dueDate).getTime() : null
  const candidateDue = candidate.dueDate ? new Date(candidate.dueDate).getTime() : null

  if (candidateDue != null && currentDue != null) {
    return candidateDue < currentDue ? candidate : current
  }
  if (candidateDue != null && currentDue == null) {
    return candidate
  }
  if (candidateDue == null && currentDue != null) {
    return current
  }
  if (!current.nextStep && candidate.nextStep) {
    return candidate
  }
  return current
}
