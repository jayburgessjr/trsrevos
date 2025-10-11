"use client";

import { useCallback, useMemo, useState, useTransition } from "react";
import { usePathname, useSearchParams } from "next/navigation";
import Link from "next/link";

import { PageTabs } from "@/components/layout/PageTabs";
import { Card } from "@/components/kit/Card";
import { resolveTabs } from "@/lib/tabs";
import { cn } from "@/lib/utils";
import { TRS_CARD, TRS_SUBTITLE } from "@/lib/style";
import type { Project, ProjectMilestone, ProjectStats, ProjectUpdate } from "@/core/projects/types";
import { actionSubmitProjectAgentPrompt } from "@/core/projects/actions";

type ActivityData = {
  updates: ProjectUpdate[];
  milestones: ProjectMilestone[];
};

type ForecastData = {
  metrics: { label: string; value: string; context?: string }[];
  timeline: { period: string; count: number; highlight: string }[];
};

const agentPrompts = [
  "Where are we trending behind schedule?",
  "Summarize project risks for tomorrow's QBR",
  "What is the next milestone for RevenueOS expansion?",
];

const dateFormatter = new Intl.DateTimeFormat("en-US", {
  month: "short",
  day: "numeric",
});

const dateTimeFormatter = new Intl.DateTimeFormat("en-US", {
  month: "short",
  day: "numeric",
  hour: "numeric",
  minute: "2-digit",
});

function formatDate(value?: string | null) {
  if (!value) return "—";
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return "—";
  return dateFormatter.format(parsed);
}

function formatDateTime(value: string) {
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return value;
  return dateTimeFormatter.format(parsed);
}

function healthBadge(health: Project["health"]) {
  switch (health) {
    case "green":
      return "bg-emerald-100 text-emerald-700";
    case "yellow":
      return "bg-amber-100 text-amber-700";
    case "red":
      return "bg-rose-100 text-rose-700";
    default:
      return "bg-gray-100 text-gray-700";
  }
}

export default function ProjectsPageClient({
  projects,
  stats,
  activity,
  forecast,
}: {
  projects: Project[];
  stats: ProjectStats;
  activity: ActivityData;
  forecast: ForecastData;
}) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const tabs = useMemo(() => resolveTabs(pathname), [pathname]);
  const activeTab = useMemo(() => {
    const current = searchParams.get("tab");
    return current && tabs.includes(current) ? current : tabs[0];
  }, [searchParams, tabs]);

  const buildTabHref = useCallback(
    (tab: string) => {
      const params = new URLSearchParams(searchParams.toString());
      params.set("tab", tab);
      return `${pathname}?${params.toString()}`;
    },
    [pathname, searchParams],
  );

  const [prompt, setPrompt] = useState("");
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const submitPrompt = useCallback(
    (value: string) => {
      if (!value.trim()) return;
      startTransition(async () => {
        const result = await actionSubmitProjectAgentPrompt({ prompt: value });
        if (result.ok) {
          setStatusMessage("Request sent to project agent. We'll notify you when the response is ready.");
          setPrompt("");
        } else {
          setStatusMessage(result.error ?? "Unable to submit agent prompt. Please try again.");
        }
      });
    },
    [],
  );

  return (
    <div className="mx-auto max-w-7xl space-y-4 px-4 py-4">
      <section className="space-y-4">
        <header className="flex flex-col gap-2">
          <h1 className="text-2xl font-semibold text-black">
            Projects Control Center
          </h1>
          <p className="text-sm text-gray-600">
            Coordinate delivery motions, surface risk, and keep stakeholders
            aligned across TRS programs.
          </p>
        </header>

        <PageTabs tabs={tabs} activeTab={activeTab} hrefForTab={buildTabHref} />

        {activeTab === "Overview" && (
          <div className="space-y-4">
            <Card className={cn(TRS_CARD, "p-4")}>
              <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                <div>
                  <div className="text-sm font-semibold text-black">
                    Live Programs
                  </div>
                  <p className="text-xs text-gray-600">
                    Snapshot of core initiatives and momentum.
                  </p>
                </div>
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-4">
                  <div className={cn(TRS_CARD, "p-3")}>
                    <div className={TRS_SUBTITLE}>Active Projects</div>
                    <div className="mt-1 text-xl font-semibold text-black">
                      {stats.active}
                    </div>
                    <div className="text-[11px] text-gray-600">
                      Live delivery
                    </div>
                  </div>
                  <div className={cn(TRS_CARD, "p-3")}>
                    <div className={TRS_SUBTITLE}>On Track</div>
                    <div className="mt-1 text-xl font-semibold text-black">
                      {stats.onTrack}
                    </div>
                    <div className="text-[11px] text-gray-600">
                      Healthy projects
                    </div>
                  </div>
                  <div className={cn(TRS_CARD, "p-3")}>
                    <div className={TRS_SUBTITLE}>At Risk</div>
                    <div className="mt-1 text-xl font-semibold text-black">
                      {stats.atRisk}
                    </div>
                    <div className="text-[11px] text-gray-600">
                      Requires action
                    </div>
                  </div>
                  <div className={cn(TRS_CARD, "p-3")}>
                    <div className={TRS_SUBTITLE}>Budget Utilization</div>
                    <div className="mt-1 text-xl font-semibold text-black">
                      {stats.totalBudget > 0 ? `${stats.budgetUtilization}%` : "—"}
                    </div>
                    <div className="text-[11px] text-gray-600">
                      {stats.totalBudget > 0 ? "Portfolio spend" : "No portfolio budget"}
                    </div>
                  </div>
                </div>
              </div>
              <div className="mt-4 overflow-hidden rounded-lg border border-gray-200">
                <table className="w-full text-sm">
                  <thead className="bg-white text-left text-[12px] uppercase tracking-wide text-gray-500">
                    <tr>
                      <th className="px-3 py-2 font-medium">Project</th>
                      <th className="px-3 py-2 font-medium">Client</th>
                      <th className="px-3 py-2 font-medium">Phase</th>
                      <th className="px-3 py-2 font-medium">Owner</th>
                      <th className="px-3 py-2 font-medium">Health</th>
                      <th className="px-3 py-2 font-medium">Progress</th>
                      <th className="px-3 py-2 font-medium">Due</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200 bg-white">
                    {projects.map((project) => (
                      <tr key={project.id} className="hover:bg-gray-50">
                        <td className="px-3 py-2 font-medium text-black">
                          {project.name}
                        </td>
                        <td className="px-3 py-2">
                          <Link
                            href={`/clients/${project.clientId}?tab=Projects`}
                            className="text-gray-700 hover:text-black hover:underline"
                          >
                            {project.clientName}
                          </Link>
                        </td>
                        <td className="px-3 py-2 text-gray-700">
                          {project.phase}
                        </td>
                        <td className="px-3 py-2 text-gray-700">
                          {project.owner}
                        </td>
                        <td className="px-3 py-2">
                          <span
                            className={cn(
                              "inline-flex items-center rounded-full px-2 py-0.5 text-[11px] font-semibold",
                              healthBadge(project.health),
                            )}
                          >
                            {project.health === "green"
                              ? "On Track"
                              : project.health === "yellow"
                                ? "Watching"
                                : "Critical"}
                          </span>
                        </td>
                        <td className="px-3 py-2 text-gray-700">
                          {project.progress}%
                        </td>
                        <td className="px-3 py-2 text-gray-700">
                          {formatDate(project.dueDate)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Card>
          </div>
        )}

        {activeTab === "Active" && (
          <div className="grid grid-cols-1 gap-3 lg:grid-cols-2">
            <Card className={cn(TRS_CARD, "p-4")}> 
              <div className="flex items-center justify-between">
                <div className="text-sm font-semibold text-black">Recent updates</div>
                <span className="text-[11px] uppercase tracking-wide text-gray-500">
                  {activity.updates.length} logged
                </span>
              </div>
              <div className="mt-3 space-y-3">
                {activity.updates.length === 0 && (
                  <div className="rounded-lg border border-dashed border-gray-200 bg-white p-4 text-sm text-gray-600">
                    Project updates will appear here as delivery owners post check-ins.
                  </div>
                )}
                {activity.updates.slice(0, 6).map((update) => (
                  <div key={update.id} className="rounded-lg border border-gray-200 bg-white p-3">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <div className="text-sm font-semibold text-black">{update.projectName}</div>
                        {update.summary && (
                          <div className="mt-1 text-[12px] text-gray-600">{update.summary}</div>
                        )}
                        <div className="mt-2 text-[11px] uppercase tracking-wide text-gray-500">
                          {update.authorName} • {formatDateTime(update.createdAt)}
                        </div>
                      </div>
                      {update.status && (
                        <span className="text-[11px] font-semibold uppercase tracking-wide text-gray-500">
                          {update.status}
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </Card>

            <Card className={cn(TRS_CARD, "p-4")}>
              <div className="flex items-center justify-between">
                <div className="text-sm font-semibold text-black">Upcoming milestones</div>
                <span className="text-[11px] uppercase tracking-wide text-gray-500">
                  {activity.milestones.length} tracked
                </span>
              </div>
              <div className="mt-3 space-y-3">
                {activity.milestones.length === 0 && (
                  <div className="rounded-lg border border-dashed border-gray-200 bg-white p-4 text-sm text-gray-600">
                    Once milestones are defined, due dates and owners will populate here.
                  </div>
                )}
                {activity.milestones.slice(0, 6).map((milestone) => (
                  <div key={milestone.id} className="rounded-lg border border-gray-200 bg-white p-3">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <div className="text-sm font-semibold text-black">{milestone.title}</div>
                        <div className="text-[12px] text-gray-600">
                          {milestone.projectName}
                        </div>
                        <div className="mt-2 text-[11px] uppercase tracking-wide text-gray-500">
                          {milestone.ownerName ?? "Unassigned"} • Due {formatDate(milestone.dueDate)}
                        </div>
                      </div>
                      <span className="text-[11px] font-semibold uppercase tracking-wide text-gray-500">
                        {milestone.status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          </div>
        )}

        {activeTab === "Forecast" && (
          <div className="space-y-4">
            <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
              {forecast.metrics.map((metric) => (
                <Card key={metric.label} className={cn(TRS_CARD, "p-4")}>
                  <div className={TRS_SUBTITLE}>{metric.label}</div>
                  <div className="mt-2 text-2xl font-semibold text-black">
                    {metric.value}
                  </div>
                  <div className="text-[12px] text-gray-600">
                    {metric.context}
                  </div>
                </Card>
              ))}
            </div>
            <Card className={cn(TRS_CARD, "p-4")}>
              <div className="text-sm font-semibold text-black">Milestone outlook</div>
              <div className="mt-3 grid grid-cols-1 gap-3 md:grid-cols-4">
                {forecast.timeline.length === 0 && (
                  <div className="rounded-lg border border-dashed border-gray-200 bg-white p-4 text-sm text-gray-600">
                    No upcoming milestones have been scheduled.
                  </div>
                )}
                {forecast.timeline.map((point) => (
                  <div key={point.period} className="rounded-lg border border-gray-200 bg-white p-3">
                    <div className="text-[11px] uppercase tracking-wide text-gray-500">{point.period}</div>
                    <div className="mt-1 text-lg font-semibold text-black">{point.count} milestone{point.count === 1 ? "" : "s"}</div>
                    <div className="text-[12px] text-gray-600">Next: {point.highlight}</div>
                  </div>
                ))}
              </div>
            </Card>
          </div>
        )}

        {activeTab === "Agent" && (
          <Card className={cn(TRS_CARD, "p-4")}>
            <div className="text-sm font-semibold text-black">
              Project Intelligence Agent
            </div>
            <p className="mt-2 text-sm text-gray-600">
              Ask the agent to analyze timelines, forecast budget impact, or
              surface risk across delivery tracks.
            </p>
            <div className="mt-4 space-y-3">
              <form
                className="space-y-2"
                onSubmit={(event) => {
                  event.preventDefault();
                  submitPrompt(prompt);
                }}
              >
                <textarea
                  value={prompt}
                  onChange={(event) => setPrompt(event.target.value)}
                  placeholder="Ask about delivery risks, timing, or budget scenarios..."
                  className="h-28 w-full rounded-lg border border-gray-200 bg-white p-3 text-sm text-gray-700 shadow-sm focus:border-black focus:outline-none focus:ring-1 focus:ring-black"
                  disabled={isPending}
                />
                <div className="flex items-center justify-between">
                  <div className="text-[12px] text-gray-500">
                    Agent logs are stored in analytics events for auditing.
                  </div>
                  <button
                    type="submit"
                    disabled={isPending || !prompt.trim()}
                    className={cn(
                      "inline-flex items-center rounded-full border border-black px-4 py-1 text-[12px] font-semibold transition",
                      isPending
                        ? "cursor-wait bg-black text-white opacity-80"
                        : "bg-black text-white hover:bg-white hover:text-black",
                    )}
                  >
                    {isPending ? "Submitting..." : "Send to agent"}
                  </button>
                </div>
              </form>
              {statusMessage && (
                <div className="rounded-lg border border-gray-200 bg-white p-3 text-[12px] text-gray-600">
                  {statusMessage}
                </div>
              )}
              <div>
                <div className="text-[12px] uppercase tracking-wide text-gray-500">
                  Quick prompts
                </div>
                <div className="mt-2 flex flex-wrap gap-2">
                  {agentPrompts.map((prompt) => (
                    <button
                      key={prompt}
                      className="rounded-full border border-gray-300 px-3 py-1 text-[12px] text-gray-700 transition hover:border-black hover:text-black"
                      type="button"
                      onClick={() => {
                        setPrompt(prompt);
                        setStatusMessage(null);
                      }}
                    >
                      {prompt}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </Card>
        )}
      </section>
    </div>
  );
}
