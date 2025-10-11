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
                Good morning — {greeting}. Daily revenue operating briefing curated by the
                Morning Agent. {s.note}.
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
              Weekly Momentum Plan
            </div>
            <ul className="space-y-3 text-[13px] text-gray-700">
              <li className="rounded-lg border border-gray-100 bg-white p-3">
                <div className="text-sm font-semibold text-black">
                  Close $1.8M in expansion
                </div>
                <div className="text-[12px] text-gray-600">
                  Target accounts: Northwind, Globex, Wayfinder
                </div>
                <div className="mt-2 text-[11px] text-gray-500">
                  Owner: Enterprise pod • Status: Tracking
                </div>
              </li>
              <li className="rounded-lg border border-gray-100 bg-white p-3">
                <div className="text-sm font-semibold text-black">
                  Accelerate collections cycle
                </div>
                <div className="text-[12px] text-gray-600">
                  Launch outreach to all invoices &gt; 30 days
                </div>
                <div className="mt-2 text-[11px] text-gray-500">
                  Owner: Finance • Status: In motion
                </div>
              </li>
              <li className="rounded-lg border border-gray-100 bg-white p-3">
                <div className="text-sm font-semibold text-black">
                  Ship updated pricing guardrails
                </div>
                <div className="text-[12px] text-gray-600">
                  Align deal desk + enablement by Thursday
                </div>
                <div className="mt-2 text-[11px] text-gray-500">
                  Owner: Pricing committee • Status: On track
                </div>
              </li>
            </ul>
          </div>
          <div className={cn(TRS_CARD, "p-4")}>
            <div className="mb-3 text-sm font-semibold text-black">
              Key Metrics Watchlist
            </div>
            <div className="space-y-3 text-[13px] text-gray-700">
              <div className="flex items-center justify-between rounded-lg border border-gray-100 bg-white p-3">
                <div>
                  <div className="font-semibold text-black">
                    Pipeline Coverage
                  </div>
                  <div className="text-[12px] text-gray-600">
                    Goal: 4.5x • Current: 4.1x
                  </div>
                </div>
                <span className="text-[12px] text-emerald-600">
                  Trending up
                </span>
              </div>
              <div className="flex items-center justify-between rounded-lg border border-gray-100 bg-white p-3">
                <div>
                  <div className="font-semibold text-black">Bookings Pace</div>
                  <div className="text-[12px] text-gray-600">
                    Goal: $420K/week • Current: $395K
                  </div>
                </div>
                <span className="text-[12px] text-amber-600">
                  Needs attention
                </span>
              </div>
              <div className="flex items-center justify-between rounded-lg border border-gray-100 bg-white p-3">
                <div>
                  <div className="font-semibold text-black">Focus Sessions</div>
                  <div className="text-[12px] text-gray-600">
                    Goal: 15 • Completed: {s.kpis.focusSessionsToday}
                  </div>
                </div>
                <span className="text-[12px] text-gray-500">
                  Mid-week review tomorrow
                </span>
              </div>
            </div>
          </div>
        </section>
      )}

      {activeTab === "Focus Blocks" && (
        <section className="grid grid-cols-1 gap-3 md:grid-cols-2">
          <div className={cn(TRS_CARD, "p-4")}>
            <div className="mb-3 text-sm font-semibold text-black">
              Planned Deep Work
            </div>
            <div className="space-y-3 text-[13px] text-gray-700">
              <div className="rounded-lg border border-gray-100 bg-white p-3">
                <div className="text-sm font-semibold text-black">
                  Strategic accounts review
                </div>
                <div className="text-[12px] text-gray-600">
                  90m • Owner: You
                </div>
                <div className="mt-1 text-[11px] text-gray-500">
                  Outcome: Confirm expansion roadmap
                </div>
              </div>
              <div className="rounded-lg border border-gray-100 bg-white p-3">
                <div className="text-sm font-semibold text-black">
                  Pricing guardrails draft
                </div>
                <div className="text-[12px] text-gray-600">
                  60m • Owner: Deal desk
                </div>
                <div className="mt-1 text-[11px] text-gray-500">
                  Outcome: Package scenarios for review
                </div>
              </div>
              <div className="rounded-lg border border-gray-100 bg-white p-3">
                <div className="text-sm font-semibold text-black">
                  Collections acceleration
                </div>
                <div className="text-[12px] text-gray-600">
                  45m • Owner: Finance
                </div>
                <div className="mt-1 text-[11px] text-gray-500">
                  Outcome: Prioritize $380K backlog
                </div>
              </div>
            </div>
          </div>
          <div className={cn(TRS_CARD, "p-4")}>
            <div className="mb-3 text-sm font-semibold text-black">
              Recent Sessions
            </div>
            <ul className="space-y-3 text-[13px] text-gray-700">
              <li className="flex items-center justify-between rounded-lg border border-gray-100 bg-white p-3">
                <div>
                  <div className="font-semibold text-black">
                    Partner activation audit
                  </div>
                  <div className="text-[12px] text-gray-600">
                    Completed yesterday • 75m
                  </div>
                </div>
                <span className="text-[12px] text-emerald-600">Complete</span>
              </li>
              <li className="flex items-center justify-between rounded-lg border border-gray-100 bg-white p-3">
                <div>
                  <div className="font-semibold text-black">
                    Forecast calibration
                  </div>
                  <div className="text-[12px] text-gray-600">
                    Completed Monday • 60m
                  </div>
                </div>
                <span className="text-[12px] text-emerald-600">Complete</span>
              </li>
              <li className="flex items-center justify-between rounded-lg border border-gray-100 bg-white p-3">
                <div>
                  <div className="font-semibold text-black">
                    Team enablement sync
                  </div>
                  <div className="text-[12px] text-gray-600">
                    Scheduled Thursday • 45m
                  </div>
                </div>
                <span className="text-[12px] text-amber-600">Upcoming</span>
              </li>
            </ul>
          </div>
        </section>
      )}

      {activeTab === "Risks" && (
        <section className="grid grid-cols-1 gap-3 lg:grid-cols-2">
          <div className={cn(TRS_CARD, "p-4")}>
            <div className="mb-3 text-sm font-semibold text-black">
              Top Risks
            </div>
            <div className="space-y-3 text-[13px] text-gray-700">
              <div className="rounded-lg border border-gray-100 bg-white p-3">
                <div className="text-sm font-semibold text-black">
                  Collections slip in enterprise
                </div>
                <div className="text-[12px] text-gray-600">
                  $540K outstanding &gt; 45 days
                </div>
                <div className="mt-1 text-[11px] text-gray-500">
                  Mitigation: Finance sprint + AE escalation
                </div>
              </div>
              <div className="rounded-lg border border-gray-100 bg-white p-3">
                <div className="text-sm font-semibold text-black">
                  Pricing pressure in EMEA
                </div>
                <div className="text-[12px] text-gray-600">
                  Win rate down 6 pts week-over-week
                </div>
                <div className="mt-1 text-[11px] text-gray-500">
                  Mitigation: Launch value-based play
                </div>
              </div>
              <div className="rounded-lg border border-gray-100 bg-white p-3">
                <div className="text-sm font-semibold text-black">
                  Enablement backlog
                </div>
                <div className="text-[12px] text-gray-600">
                  New reps lacking updated collateral
                </div>
                <div className="mt-1 text-[11px] text-gray-500">
                  Mitigation: Publish draft by Friday
                </div>
              </div>
            </div>
          </div>
          <div className={cn(TRS_CARD, "p-4")}>
            <div className="mb-3 text-sm font-semibold text-black">
              Alerts & Signals
            </div>
            <SummaryFeed
              items={[
                "3 high-value renewals without active champions.",
                "Partner-sourced pipeline pacing below commit line.",
                "Marketing qualified pipeline flat week-over-week.",
              ]}
            />
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
