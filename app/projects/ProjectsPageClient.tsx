"use client";

import { useMemo, useState } from "react";

import { AgentsPanel } from "@/components/projects/AgentsPanel";
import { FiltersBar, useProjectsFilters } from "@/components/projects/Filters";
import { KpiStrip } from "@/components/projects/KpiStrip";
import { ProjectBoard } from "@/components/projects/Board";
import { ProjectTimeline, type TimelineItem } from "@/components/projects/Timeline";
import { ProjectsTable } from "@/components/projects/ProjectsTable";
import type {
  ClientOverview,
  ClientRow,
  OpportunityRecord,
  OwnerRow,
  ProjectRecord,
} from "@/core/projects/queries";

type ProjectsPageClientProps = {
  clients: ClientRow[];
  overview: ClientOverview[];
  owners: OwnerRow[];
  projects: ProjectRecord[];
  opportunities: OpportunityRecord[];
  stages: string[];
  healths: string[];
  kpis: { label: string; value: string }[];
  generatedAt: string;
};

type Tab = "Overview" | "Board" | "Timeline" | "Agents" | "Reports";

const TABS: Tab[] = ["Overview", "Board", "Timeline", "Agents", "Reports"];

export default function ProjectsPageClient({
  clients,
  overview,
  owners,
  projects,
  opportunities,
  stages,
  healths,
  kpis,
  generatedAt,
}: ProjectsPageClientProps) {
  const { filters, setFilters } = useProjectsFilters();
  const [activeTab, setActiveTab] = useState<Tab>("Overview");

  const ownerOptions = useMemo(() => {
    return owners.map((owner) => ({
      id: owner.id,
      label: owner.full_name || owner.email || owner.id,
    }));
  }, [owners]);

  const opportunitySummaries = useMemo(() => {
    return buildOpportunitySummaries(opportunities);
  }, [opportunities]);

  const timelineItems = useMemo<TimelineItem[]>(() => {
    const clientNameMap = new Map(clients.map((client) => [client.id, client.name]));
    return projects.map((project) => ({
      id: project.id,
      projectName: project.name,
      clientName: clientNameMap.get(project.client_id) ?? null,
      startDate: project.start_date,
      endDate: project.end_date,
    }));
  }, [clients, projects]);

  const generatedLabel = useMemo(() => {
    const parsed = new Date(generatedAt);
    if (Number.isNaN(parsed.getTime())) return "";
    return parsed.toLocaleString();
  }, [generatedAt]);

  return (
    <div className="min-h-screen w-full bg-white text-black">
      <section className="border-b border-gray-200 px-4 py-4">
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-xl font-semibold text-black">Projects</h1>
            <p className="text-xs text-gray-600">
              Project Management Hub for live client delivery.
            </p>
          </div>
          <div className="flex flex-col items-start gap-2 md:items-end">
            <input
              className="h-9 w-full rounded-md border border-gray-300 px-2 text-sm md:w-64"
              placeholder="Search clients or next steps"
              value={filters.q}
              onChange={(event) =>
                setFilters((current) => ({ ...current, q: event.target.value }))
              }
            />
            {generatedLabel && (
              <span className="text-xs text-gray-500">Updated {generatedLabel}</span>
            )}
          </div>
        </div>
      </section>

      <section>
        <div className="border-b border-gray-200 px-4">
          <div className="flex h-11 items-center gap-2">
            {TABS.map((tab) => (
              <button
                key={tab}
                type="button"
                onClick={() => setActiveTab(tab)}
                className={`h-8 rounded-md border px-3 text-sm ${
                  activeTab === tab
                    ? "border-black bg-black text-white"
                    : "border-gray-300 bg-white text-gray-700 hover:bg-gray-100"
                }`}
              >
                {tab}
              </button>
            ))}
          </div>
        </div>

        <div className="space-y-4 px-4 py-4">
          {activeTab === "Overview" && (
            <>
              <KpiStrip items={kpis} />
              <FiltersBar
                stagesAvailable={stages}
                healthAvailable={healths}
                owners={ownerOptions}
                value={filters}
                onChange={setFilters}
                showSearch={false}
              />
              <ProjectsTable
                rows={clients}
                overview={overview}
                owners={ownerOptions}
                filters={filters}
                opportunities={opportunitySummaries}
              />
            </>
          )}

          {activeTab === "Board" && <ProjectBoard rows={clients} />}

          {activeTab === "Timeline" && <ProjectTimeline items={timelineItems} />}

          {activeTab === "Agents" && <AgentsPanel />}

          {activeTab === "Reports" && (
            <div className="rounded-xl border border-gray-200 bg-white p-3 text-sm text-gray-700">
              <div className="text-sm font-medium text-black">Reports</div>
              <p className="mt-1 text-xs text-gray-600">
                Export project data for stakeholder reviews.
              </p>
              <div className="mt-3 flex gap-2">
                <button className="h-9 rounded-md border border-gray-300 bg-white px-3 text-sm text-gray-800 hover:bg-gray-100">
                  Export CSV
                </button>
                <button className="h-9 rounded-md border border-gray-300 bg-white px-3 text-sm text-gray-800 hover:bg-gray-100">
                  Export ICS
                </button>
              </div>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}

type OpportunitySummary = {
  clientId: string;
  nextStep: string | null;
  dueDate: string | null;
  stage: string | null;
};

function buildOpportunitySummaries(opportunities: OpportunityRecord[]): OpportunitySummary[] {
  const byClient = new Map<string, OpportunitySummary>();

  opportunities.forEach((opportunity) => {
    if (!opportunity.client_id) {
      return;
    }
    const candidate: OpportunitySummary = {
      clientId: opportunity.client_id,
      nextStep: opportunity.next_step,
      dueDate: opportunity.next_step_date ?? opportunity.close_date ?? null,
      stage: opportunity.stage,
    };
    const existing = byClient.get(opportunity.client_id);
    if (!existing) {
      byClient.set(opportunity.client_id, candidate);
      return;
    }
    const chosen = chooseBetterOpportunity(existing, candidate);
    byClient.set(opportunity.client_id, chosen);
  });

  return Array.from(byClient.values());
}

function chooseBetterOpportunity(
  current: OpportunitySummary,
  candidate: OpportunitySummary
): OpportunitySummary {
  const currentDue = current.dueDate ? new Date(current.dueDate).getTime() : null;
  const candidateDue = candidate.dueDate ? new Date(candidate.dueDate).getTime() : null;

  if (candidateDue != null && currentDue != null) {
    return candidateDue < currentDue ? candidate : current;
  }
  if (candidateDue != null && currentDue == null) {
    return candidate;
  }
  if (candidateDue == null && currentDue != null) {
    return current;
  }
  if (!current.nextStep && candidate.nextStep) {
    return candidate;
  }
  return current;
}
