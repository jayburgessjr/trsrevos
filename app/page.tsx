"use client";

import {
  useCallback,
  useEffect,
  useMemo,
  useState,
  useTransition,
} from "react";
import { usePathname, useSearchParams } from "next/navigation";
import { cn } from "@/lib/utils";
import { TRS_CARD } from "@/lib/style";
import { resolveTabs } from "@/lib/tabs";
import { PageTabs } from "@/components/layout/PageTabs";
import PriorityRow from "@/components/morning/PriorityRow";
import SummaryFeed from "@/components/morning/SummaryFeed";
import CoPilotDrawer from "@/components/morning/CoPilotDrawer";
import { Badge } from "@/ui/badge";
import { Button } from "@/ui/button";
import { PageHeader, PageTitle, PageDescription } from "@/ui/page-header";
import {
  computePlan,
  lockPlan,
  downloadIcal,
  getMorningState,
  markPriorityComplete,
  deferPriority,
} from "@/core/morning/actions";

type S = Awaited<ReturnType<typeof getMorningState>>;

export default function MorningPage() {
  const [s, setS] = useState<S | null>(null);
  const [pending, start] = useTransition();
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
  useEffect(() => {
    (async () => setS(await getMorningState()))();
  }, []);

  const refresh = async () => setS(await getMorningState());

  if (!s) return <div className="p-3 text-sm text-gray-600">Loading…</div>;

  const greeting = new Date().toLocaleDateString(undefined, {
    weekday: "long",
    month: "short",
    day: "numeric",
  });
  const agentNote = s.note.trim();
  const planComputed = s.priorities.length > 0;
  const momentumLabels = {
    down: "Declining",
    steady: "Steady",
    up: "Improving",
  } as const;
  const formatCurrency = (value: number) =>
    new Intl.NumberFormat(undefined, {
      style: "currency",
      currency: "USD",
      maximumFractionDigits: 0,
    }).format(value);
  const weeklyInsights: string[] = [
    `Momentum signal: ${momentumLabels[s.momentum]}`,
    `Pipeline advanced today: ${formatCurrency(s.kpis.pipelineDollars)}`,
    `Win rate (30d): ${s.kpis.winRatePct}%`,
    `Price realization: ${s.kpis.priceRealizationPct}%`,
    `Focus sessions logged today: ${s.kpis.focusSessionsToday}`,
  ];
  if (agentNote) {
    weeklyInsights.push(`Agent note: ${agentNote}`);
  }
  const priorityOutlook = s.priorities.map((p) => {
    const statusLabel =
      p.status === "Done"
        ? "Completed"
        : p.status === "Deferred"
          ? "Deferred"
          : "Active";
    const why = p.why ? ` — ${p.why}` : "";
    return `${p.title} • ${statusLabel}${why}`;
  });
  const focusSuggestions = s.priorities
    .filter((p) => p.status === "Ready" || p.status === "InProgress")
    .map((p) => {
      const why = p.why ? ` Next step: ${p.why}` : "";
      return `Block ${p.effort.toLowerCase()} effort to advance ${p.title}.${why}`;
    });
  const completedSummaries = s.priorities
    .filter((p) => p.status === "Done")
    .map((p) => {
      const why = p.why ? ` — ${p.why}` : "";
      return `Completed ${p.title}${why}`;
    });
  const riskAlerts = s.priorities
    .filter((p) => p.status === "Deferred")
    .map((p) => {
      const why = p.why ? ` (${p.why})` : "";
      return `Deferred: ${p.title}${why}`;
    });
  const followUpChecks = planComputed
    ? s.priorities.map((p) => {
        if (p.status === "Deferred") {
          return `Review ${p.title} after new data arrives.`;
        }
        if (p.status === "Done") {
          return `Capture learnings from ${p.title}.`;
        }
        return `Check in on ${p.title} after the scheduled focus block.`;
      })
    : [];

  const renderTasks = () => (
    <div className={cn(TRS_CARD, "p-3")}>
      <div className="mb-2 text-sm font-semibold text-black">Today&apos;s Tasks</div>
      <div className="space-y-2">
        {s.priorities.length === 0 ? (
          <div className="text-[13px] text-gray-600">
            No tasks yet. Compute your plan to receive curated actions.
          </div>
        ) : (
          s.priorities.map((p) => (
            <PriorityRow
              key={p.id}
              title={p.title}
              why={p.why}
              roi={p.roi$}
              effort={p.effort}
              status={p.status}
              onCheck={() =>
                start(async () => {
                  await markPriorityComplete(p.id);
                  await refresh();
                })
              }
              onDefer={() =>
                start(async () => {
                  await deferPriority(p.id);
                  await refresh();
                })
              }
            />
          ))
        )}
      </div>
    </div>
  );

  return (
    <div className="mx-auto max-w-7xl space-y-6 px-4 py-6">
      <section className="space-y-4">
        <PageHeader className="gap-4 rounded-xl border border-[color:var(--color-outline)]">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div className="space-y-2">
              <PageTitle>Morning Brief</PageTitle>
              <PageDescription>
                Good morning — {greeting}. Daily revenue operating briefing curated by the Morning Agent
                {agentNote ? `. ${agentNote}` : "."}
              </PageDescription>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <Button
                variant="primary"
                size="sm"
                disabled={pending}
                onClick={() =>
                  start(async () => {
                    await computePlan();
                    await refresh();
                  })
                }
              >
                Compute Plan
              </Button>
              <Button
                variant="secondary"
                size="sm"
                disabled={pending || s.planLocked}
                onClick={() =>
                  start(async () => {
                    await lockPlan();
                    await refresh();
                  })
                }
              >
                {s.planLocked ? "Locked" : "Lock Plan"}
              </Button>
              <Button
                variant="outline"
                size="sm"
                disabled={pending}
                onClick={() =>
                  start(async () => {
                    await downloadIcal();
                  })
                }
              >
                Download iCal
              </Button>
              <CoPilotDrawer />
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-2 text-xs">
            <Badge variant="success">Momentum: {s.momentum}</Badge>
            <Badge variant={s.planLocked ? "success" : "warning"}>
              {s.planLocked ? "Plan locked" : "Plan draft"}
            </Badge>
            <Badge variant="outline">Focus sessions today: {s.kpis.focusSessionsToday}</Badge>
          </div>
        </PageHeader>

        <PageTabs tabs={tabs} activeTab={activeTab} hrefForTab={buildTabHref} />
      </section>

      {activeTab === "Today" && (
        <section className="grid grid-cols-1 gap-3">
          {renderTasks()}
        </section>
      )}

      {activeTab === "This Week" && (
        <section className="grid grid-cols-1 gap-3 lg:grid-cols-2">
          <div className={cn(TRS_CARD, "p-4")}>
            <div className="mb-3 text-sm font-semibold text-black">
              Signals &amp; Highlights
            </div>
            {planComputed ? (
              <SummaryFeed items={weeklyInsights} />
            ) : (
              <p className="text-[13px] text-gray-600">
                Compute your plan to unlock weekly insights.
              </p>
            )}
          </div>
          <div className={cn(TRS_CARD, "p-4")}>
            <div className="mb-3 text-sm font-semibold text-black">Priority Outlook</div>
            {planComputed ? (
              <SummaryFeed items={priorityOutlook} />
            ) : (
              <p className="text-[13px] text-gray-600">
                No priorities yet. Run Compute Plan to populate this view.
              </p>
            )}
          </div>
        </section>
      )}

      {activeTab === "Focus Blocks" && (
        <section className="grid grid-cols-1 gap-3 md:grid-cols-2">
          <div className={cn(TRS_CARD, "p-4")}>
            <div className="mb-3 text-sm font-semibold text-black">Focus Recommendations</div>
            {focusSuggestions.length > 0 ? (
              <SummaryFeed items={focusSuggestions} />
            ) : planComputed ? (
              <p className="text-[13px] text-gray-600">
                All priorities are complete or deferred. Monitor for new signals.
              </p>
            ) : (
              <p className="text-[13px] text-gray-600">
                Compute your plan to receive focus block recommendations.
              </p>
            )}
          </div>
          <div className={cn(TRS_CARD, "p-4")}>
            <div className="mb-3 text-sm font-semibold text-black">Sessions Logged Today</div>
            <div className="mb-2 text-[13px] text-gray-600">
              {s.kpis.focusSessionsToday === 0
                ? "No focus sessions recorded today."
                : `${s.kpis.focusSessionsToday} focus session${s.kpis.focusSessionsToday === 1 ? "" : "s"} completed today.`}
            </div>
            {completedSummaries.length > 0 ? (
              <SummaryFeed items={completedSummaries} />
            ) : (
              <p className="text-[13px] text-gray-600">
                {planComputed
                  ? "Mark priorities complete to capture what was accomplished."
                  : "Focus session history will populate after you compute today’s plan."}
              </p>
            )}
          </div>
        </section>
      )}

      {activeTab === "Risks" && (
        <section className="grid grid-cols-1 gap-3 lg:grid-cols-2">
          <div className={cn(TRS_CARD, "p-4")}>
            <div className="mb-3 text-sm font-semibold text-black">Alerts &amp; Signals</div>
            {planComputed ? (
              riskAlerts.length > 0 ? (
                <SummaryFeed items={riskAlerts} />
              ) : (
                <p className="text-[13px] text-gray-600">
                  No risks flagged from today’s plan.
                </p>
              )
            ) : (
              <p className="text-[13px] text-gray-600">
                Compute your plan to surface risk alerts.
              </p>
            )}
          </div>
          <div className={cn(TRS_CARD, "p-4")}>
            <div className="mb-3 text-sm font-semibold text-black">Next Checks</div>
            {planComputed ? (
              <SummaryFeed items={followUpChecks} />
            ) : (
              <p className="text-[13px] text-gray-600">
                Compute your plan to queue upcoming reviews.
              </p>
            )}
          </div>
        </section>
      )}

      {activeTab === "Morning Brief" && (
        <section className="grid grid-cols-1 gap-3">
          {renderTasks()}
        </section>
      )}
    </div>
  );
}
