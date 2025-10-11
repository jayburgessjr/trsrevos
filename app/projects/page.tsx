import {
  actionGetProjectStats,
  actionListProjectMilestones,
  actionListProjectUpdates,
  actionListProjects,
} from "@/core/projects/actions";
import ProjectsPageClient from "./ProjectsPageClient";
import type { ProjectMilestone, ProjectStats } from "@/core/projects/types";

const currencyFormatter = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  maximumFractionDigits: 0,
});

const percentFormatter = new Intl.NumberFormat("en-US", {
  style: "percent",
  maximumFractionDigits: 0,
});

const monthFormatter = new Intl.DateTimeFormat("en-US", {
  month: "short",
});

type ForecastMetric = { label: string; value: string; context?: string };
type ForecastTimelinePoint = { period: string; count: number; highlight: string };
type ForecastData = { metrics: ForecastMetric[]; timeline: ForecastTimelinePoint[] };

function buildForecastMetrics(stats: ProjectStats): ForecastMetric[] {
  const portfolioBudget = stats.totalBudget > 0 ? currencyFormatter.format(stats.totalBudget) : "—";
  const totalSpend = stats.totalSpent > 0 ? currencyFormatter.format(stats.totalSpent) : "—";
  const utilization = stats.totalBudget > 0 ? `${stats.budgetUtilization}% utilized` : "No budget captured";

  return [
    { label: "Portfolio Budget", value: portfolioBudget, context: utilization },
    {
      label: "Total Spend",
      value: totalSpend,
      context: stats.totalBudget > 0 ? `${percentFormatter.format(stats.totalSpent / stats.totalBudget)} of budget` : "—",
    },
    {
      label: "Average Progress",
      value: `${stats.avgProgress}%`,
      context: `${stats.active} active projects`,
    },
  ];
}

function buildForecastTimeline(milestones: ProjectMilestone[]): ForecastTimelinePoint[] {
  const buckets = new Map<string, { count: number; highlight: string }>();

  milestones
    .filter((milestone) => milestone.dueDate)
    .forEach((milestone) => {
      const due = new Date(milestone.dueDate!);
      const key = `${due.getUTCFullYear()}-${due.getUTCMonth()}`;
      const bucket = buckets.get(key) ?? { count: 0, highlight: milestone.title };
      const highlight = bucket.highlight || milestone.title;
      buckets.set(key, {
        count: bucket.count + 1,
        highlight,
      });
    });

  return Array.from(buckets.entries())
    .sort(([a], [b]) => (a < b ? -1 : 1))
    .slice(0, 4)
    .map(([key, value]) => {
      const [year, month] = key.split("-").map((part) => Number(part));
      const periodDate = new Date(Date.UTC(year, month, 1));
      return {
        period: `${monthFormatter.format(periodDate)} ${year}`,
        count: value.count,
        highlight: value.highlight,
      };
    });
}

export default async function ProjectsPage() {
  const [projects, stats, updates, milestones] = await Promise.all([
    actionListProjects(),
    actionGetProjectStats(),
    actionListProjectUpdates(),
    actionListProjectMilestones(),
  ]);

  const forecast: ForecastData = {
    metrics: buildForecastMetrics(stats),
    timeline: buildForecastTimeline(milestones),
  };

  return (
    <ProjectsPageClient
      projects={projects}
      stats={stats}
      activity={{ updates, milestones }}
      forecast={forecast}
    />
  );
}
