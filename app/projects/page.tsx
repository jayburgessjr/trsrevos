"use client";

import { useMemo } from "react";
import { usePathname, useSearchParams } from "next/navigation";

import { Card } from "@/components/kit/Card";
import { resolveTabs } from "@/lib/tabs";
import type { RevOSPhase } from "@/core/clients/types";

export type ProjectRowData = {
  name: string;
  clientId: string;
  clientName: string;
  owner: string;
  status: RevOSPhase;
  progress: number;
  dueDate: string;
  health: "green" | "yellow" | "red";
};

const overviewProjects = [
  {
    id: "revos",
    name: "RevenueOS Expansion",
    stage: "Execution",
    owner: "Jay Burgess",
    health: "Stable",
    progress: 68,
    due: "Nov 12",
  },
  {
    id: "reggie",
    name: "Reggie AI Workbench",
    stage: "Architecture",
    owner: "Morgan Lee",
    health: "Watching",
    progress: 52,
    due: "Nov 6",
  },
  {
    id: "ops",
    name: "Delivery Ops Automation",
    stage: "Pilot",
    owner: "Sarah Trent",
    health: "At Risk",
    progress: 34,
    due: "Oct 28",
  },
];

const activeStreams = [
  {
    title: "This Week",
    items: [
      {
        task: "Finalize compounding forecast",
        owner: "Morgan",
        due: "Oct 18",
        status: "On track",
      },
      {
        task: "Align ACME rollout playbook",
        owner: "Jay",
        due: "Oct 19",
        status: "Review",
      },
      {
        task: "Partner launch readiness",
        owner: "Riya",
        due: "Oct 21",
        status: "Blocked",
      },
    ],
  },
  {
    title: "Risks",
    items: [
      {
        task: "Billing integration QA",
        owner: "Noah",
        due: "Oct 20",
        status: "Need escalation",
      },
      {
        task: "Security questionnaire",
        owner: "Amelia",
        due: "Oct 24",
        status: "Waiting on client",
      },
    ],
  },
];

const forecastMetrics = [
  { label: "Q4 ARR Forecast", value: "$3.8M", context: "+6.2% vs plan" },
  { label: "Projected Completion", value: "78%", context: "Across 12 tracks" },
  { label: "Budget Utilization", value: "64%", context: "$420k of $650k" },
];

const forecastTimeline = [
  { month: "Oct", arr: "$940k", milestone: "RevenueOS rollout" },
  { month: "Nov", arr: "$1.25M", milestone: "Compounding launch" },
  { month: "Dec", arr: "$1.6M", milestone: "Partner expansion" },
];

const agentPrompts = [
  "Where are we trending behind schedule?",
  "Summarize project risks for tomorrow's QBR",
  "What is the next milestone for RevenueOS expansion?",
];

export default function ProjectsPage() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const tabs = useMemo(() => resolveTabs(pathname), [pathname]);
  const activeTab = useMemo(() => {
    const current = searchParams.get("tab");
    return current && tabs.includes(current) ? current : tabs[0];
  }, [searchParams, tabs]);

  return (
    <div className="w-full px-6 py-6 space-y-6">
      <header className="flex flex-col gap-2">
        <h1 className="text-2xl font-semibold text-black">Projects Control Center</h1>
        <p className="text-sm text-gray-600">
          Coordinate delivery motions, surface risk, and keep stakeholders aligned across TRS programs.
        </p>
      </header>

      {activeTab === "Overview" && (
        <div className="space-y-4">
          <Card className="p-4">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
              <div>
                <div className="text-sm font-semibold text-black">Live Programs</div>
                <p className="text-xs text-gray-600">Snapshot of core initiatives and momentum.</p>
              </div>
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                <div className="rounded-lg bg-gray-50 p-3">
                  <div className="text-[11px] uppercase tracking-wide text-gray-500">Active Tracks</div>
                  <div className="mt-1 text-xl font-semibold text-black">12</div>
                  <div className="text-[11px] text-emerald-600">+2 vs last week</div>
                </div>
                <div className="rounded-lg bg-gray-50 p-3">
                  <div className="text-[11px] uppercase tracking-wide text-gray-500">On Time</div>
                  <div className="mt-1 text-xl font-semibold text-black">78%</div>
                  <div className="text-[11px] text-emerald-600">SLA window stable</div>
                </div>
                <div className="rounded-lg bg-gray-50 p-3">
                  <div className="text-[11px] uppercase tracking-wide text-gray-500">At Risk</div>
                  <div className="mt-1 text-xl font-semibold text-black">3</div>
                  <div className="text-[11px] text-amber-600">Requires action</div>
                </div>
              </div>
            </div>
            <div className="mt-4 overflow-hidden rounded-lg border border-gray-200">
              <table className="w-full text-sm">
                <thead className="bg-gray-50 text-left text-[12px] uppercase tracking-wide text-gray-500">
                  <tr>
                    <th className="px-3 py-2 font-medium">Project</th>
                    <th className="px-3 py-2 font-medium">Stage</th>
                    <th className="px-3 py-2 font-medium">Owner</th>
                    <th className="px-3 py-2 font-medium">Health</th>
                    <th className="px-3 py-2 font-medium">Progress</th>
                    <th className="px-3 py-2 font-medium">Due</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 bg-white">
                  {overviewProjects.map((project) => (
                    <tr key={project.id} className="hover:bg-gray-50">
                      <td className="px-3 py-2 font-medium text-black">{project.name}</td>
                      <td className="px-3 py-2 text-gray-700">{project.stage}</td>
                      <td className="px-3 py-2 text-gray-700">{project.owner}</td>
                      <td
                        className={`px-3 py-2 text-sm ${
                          project.health === "Stable"
                            ? "text-emerald-600"
                            : project.health === "Watching"
                            ? "text-amber-600"
                            : "text-rose-600"
                        }`}
                      >
                        {project.health}
                      </td>
                      <td className="px-3 py-2 text-gray-700">{project.progress}%</td>
                      <td className="px-3 py-2 text-gray-700">{project.due}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        </div>
      )}

      {activeTab === "Active" && (
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
          {activeStreams.map((stream) => (
            <Card key={stream.title} className="p-4">
              <div className="text-sm font-semibold text-black">{stream.title}</div>
              <div className="mt-3 space-y-3">
                {stream.items.map((item) => (
                  <div key={`${stream.title}-${item.task}`} className="rounded-lg border border-gray-200 p-3">
                    <div className="flex items-start justify-between">
                      <div>
                        <div className="text-sm font-medium text-black">{item.task}</div>
                        <div className="text-[12px] text-gray-600">
                          Owner: {item.owner} • Due {item.due}
                        </div>
                      </div>
                      <span className="text-[11px] font-semibold uppercase tracking-wide text-gray-500">
                        {item.status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          ))}
        </div>
      )}

      {activeTab === "Forecast" && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
            {forecastMetrics.map((metric) => (
              <Card key={metric.label} className="p-4">
                <div className="text-[12px] uppercase tracking-wide text-gray-500">{metric.label}</div>
                <div className="mt-2 text-2xl font-semibold text-black">{metric.value}</div>
                <div className="text-[12px] text-gray-600">{metric.context}</div>
              </Card>
            ))}
          </div>
          <Card className="p-4">
            <div className="text-sm font-semibold text-black">Quarterly outlook</div>
            <div className="mt-3 grid grid-cols-1 gap-3 md:grid-cols-3">
              {forecastTimeline.map((point) => (
                <div key={point.month} className="rounded-lg border border-gray-200 p-3">
                  <div className="text-[11px] uppercase tracking-wide text-gray-500">{point.month}</div>
                  <div className="mt-1 text-lg font-semibold text-black">{point.arr}</div>
                  <div className="text-[12px] text-gray-600">{point.milestone}</div>
                </div>
              ))}
            </div>
          </Card>
        </div>
      )}

      {activeTab === "Agent" && (
        <Card className="p-4">
          <div className="text-sm font-semibold text-black">Project Intelligence Agent</div>
          <p className="mt-2 text-sm text-gray-600">
            Ask the agent to analyze timelines, forecast budget impact, or surface risk across delivery tracks.
          </p>
          <div className="mt-4 space-y-3">
            <div className="rounded-lg border border-gray-200 bg-gray-50 p-3 text-sm text-gray-600">
              Prompt workspace placeholder
            </div>
            <div>
              <div className="text-[12px] uppercase tracking-wide text-gray-500">Quick prompts</div>
              <div className="mt-2 flex flex-wrap gap-2">
                {agentPrompts.map((prompt) => (
                  <button
                    key={prompt}
                    className="rounded-full border border-gray-300 px-3 py-1 text-[12px] text-gray-700 transition hover:border-black hover:text-black"
                    type="button"
                  >
                    {prompt}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </Card>
      )}
    </div>
  );
}
