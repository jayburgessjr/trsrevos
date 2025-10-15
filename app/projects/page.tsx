import ProjectsPageClient from "./ProjectsPageClient"

import {
  fetchClientsForProjects,
  fetchOverviewJoin,
  fetchOwners,
  fetchProjects,
  fetchOpportunities,
  fetchClientHealthHistory,
  type ClientRow,
} from "@/core/projects/queries"
import {
  actionGetProjectStats,
  actionListProjectMilestones,
  actionListDeliveryUpdates,
  actionListChangeOrders,
  actionListClientRoiNarratives,
} from "@/core/projects/actions"
import { getInvoices as fetchInvoices } from "@/core/finance/actions"

export const dynamic = "force-dynamic"

const STAGE_ORDER = [
  "Discovery",
  "Data",
  "Algorithm",
  "Architecture",
  "Deliverables",
  "Finance",
  "Onboarding",
  "Closed",
] as const

export default async function ProjectsPage() {
  const [
    clients,
    overview,
    owners,
    projects,
    opportunities,
    projectStats,
    milestones,
    deliveryUpdates,
    changeOrders,
    roiNarratives,
    healthHistory,
    invoices,
  ] = await Promise.all([
    fetchClientsForProjects(),
    fetchOverviewJoin(),
    fetchOwners(),
    fetchProjects(),
    fetchOpportunities(),
    actionGetProjectStats(),
    actionListProjectMilestones(),
    actionListDeliveryUpdates(),
    actionListChangeOrders(),
    actionListClientRoiNarratives(),
    fetchClientHealthHistory(),
    fetchInvoices().catch(() => []),
  ])

  const activeClients = clients.filter((client) => (client.status ?? "").toLowerCase() === "active")

  const stages = buildStageFilters(activeClients)
  const healths = buildHealthFilters(activeClients)
  const kpis = buildKpis(clients)
  const invoiceOptions = invoices.map((invoice) => ({
    id: invoice.id,
    label: invoice.invoiceNumber ?? invoice.id,
  }))

  return (
    <ProjectsPageClient
      clients={clients}
      activeClients={activeClients}
      overview={overview}
      owners={owners}
      projects={projects}
      opportunities={opportunities}
      stages={stages}
      healths={healths}
      kpis={kpis}
      generatedAt={new Date().toISOString()}
      projectStats={projectStats}
      milestones={milestones}
      deliveryUpdates={deliveryUpdates}
      changeOrders={changeOrders}
      roiNarratives={roiNarratives}
      healthHistory={healthHistory}
      invoiceOptions={invoiceOptions}
    />
  )
}

function buildStageFilters(clients: ClientRow[]) {
  const stageSet = new Set<string>()
  clients.forEach((client) => {
    if (client.stage) {
      stageSet.add(client.stage)
    }
  })
  const preferred = STAGE_ORDER.filter((stage) => stageSet.has(stage))
  const extras = Array.from(stageSet).filter((stage) => !STAGE_ORDER.includes(stage as typeof STAGE_ORDER[number]))
  extras.sort((a, b) => a.localeCompare(b))
  return [...preferred, ...extras]
}

function buildHealthFilters(clients: ClientRow[]) {
  const healthSet = new Set<string>()
  clients.forEach((client) => {
    if (client.health) {
      healthSet.add(client.health)
    }
  })
  return Array.from(healthSet).sort((a, b) => a.localeCompare(b))
}

function buildKpis(clients: ClientRow[]) {
  const activeClients = clients.filter((client) => (client.status ?? "").toLowerCase() === "active").length
  const onboardingClients = clients.filter((client) => (client.phase ?? "").toLowerCase() === "onboarding").length

  const stageCounts = STAGE_ORDER.map((stage) => ({
    stage,
    count: clients.filter((client) => (client.stage ?? "").toLowerCase() === stage.toLowerCase()).length,
  }))

  const arrTotal = clients.reduce((sum, client) => {
    return sum + (typeof client.arr === "number" ? client.arr : 0)
  }, 0)
  const arrFormatter = new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  })

  const items = [
    { label: "Active clients", value: String(activeClients) },
    { label: "Onboarding", value: String(onboardingClients) },
    ...stageCounts.map(({ stage, count }) => ({ label: stage, value: String(count) })),
    { label: "ARR total", value: arrFormatter.format(arrTotal) },
  ]

  return items
}
