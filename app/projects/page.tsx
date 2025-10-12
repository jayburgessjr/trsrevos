import ProjectsPageClient from "./ProjectsPageClient";

import {
  fetchClientsForProjects,
  fetchOverviewJoin,
  fetchOwners,
  fetchProjects,
  fetchOpportunities,
  type ClientRow,
} from "@/core/projects/queries";

export const dynamic = "force-dynamic";

const STAGE_ORDER = ["Discovery", "Data", "Algorithm", "Architecture", "Closed"] as const;

export default async function ProjectsPage() {
  const [clients, overview, owners, projects, opportunities] = await Promise.all([
    fetchClientsForProjects(),
    fetchOverviewJoin(),
    fetchOwners(),
    fetchProjects(),
    fetchOpportunities(),
  ]);

  const stages = buildStageFilters(clients);
  const healths = buildHealthFilters(clients);
  const kpis = buildKpis(clients);

  return (
    <ProjectsPageClient
      clients={clients}
      overview={overview}
      owners={owners}
      projects={projects}
      opportunities={opportunities}
      stages={stages}
      healths={healths}
      kpis={kpis}
      generatedAt={new Date().toISOString()}
    />
  );
}

function buildStageFilters(clients: ClientRow[]) {
  const stageSet = new Set<string>();
  clients.forEach((client) => {
    if (client.stage) {
      stageSet.add(client.stage);
    }
  });
  const preferred = STAGE_ORDER.filter((stage) => stageSet.has(stage));
  const extras = Array.from(stageSet).filter((stage) => !STAGE_ORDER.includes(stage as typeof STAGE_ORDER[number]));
  extras.sort((a, b) => a.localeCompare(b));
  return [...preferred, ...extras];
}

function buildHealthFilters(clients: ClientRow[]) {
  const healthSet = new Set<string>();
  clients.forEach((client) => {
    if (client.health) {
      healthSet.add(client.health);
    }
  });
  return Array.from(healthSet).sort((a, b) => a.localeCompare(b));
}

function buildKpis(clients: ClientRow[]) {
  const activeClients = clients.filter((client) => (client.status ?? "").toLowerCase() === "active").length;
  const onboardingClients = clients.filter((client) => (client.phase ?? "").toLowerCase() === "onboarding").length;

  const stageCounts = STAGE_ORDER.map((stage) => ({
    stage,
    count: clients.filter((client) => (client.stage ?? "").toLowerCase() === stage.toLowerCase()).length,
  }));

  const arrTotal = clients.reduce((sum, client) => {
    return sum + (typeof client.arr === "number" ? client.arr : 0);
  }, 0);
  const arrFormatter = new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  });

  const items = [
    { label: "Active clients", value: String(activeClients) },
    { label: "Onboarding", value: String(onboardingClients) },
    ...stageCounts.map(({ stage, count }) => ({ label: stage, value: String(count) })),
    { label: "ARR total", value: arrFormatter.format(arrTotal) },
  ];

  return items;
}
