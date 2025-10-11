"use client";

import { useCallback, useMemo } from "react";
import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";

import { PageTemplate } from "@/components/layout/PageTemplate";
import { PageTabs } from "@/components/layout/PageTabs";
import AlertList from "@/components/exec/AlertList";
import KpiCard from "@/components/exec/KpiCard";
import ScopeBar from "@/components/exec/ScopeBar";
import { SmallSpark } from "@/components/exec/SmallSpark";
import { Card } from "@/components/kit/Card";
import { AreaChart, BarChart } from "@/components/kit/Charts";
import type { ExecDashboard } from "@/core/exec/types";
import { TRS_CARD } from "@/lib/style";
import { resolveTabs } from "@/lib/tabs";
import { cn } from "@/lib/utils";

type DashboardClientProps = {
  data: ExecDashboard;
  exportAction: () => Promise<{ ok: boolean; url: string }>;
};

export default function DashboardClient({
  data,
  exportAction,
}: DashboardClientProps) {
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

  const d = data;

  const kpiGrid = (
    <div className="grid grid-cols-1 gap-3 md:grid-cols-2 lg:grid-cols-4">
      <Card className={cn(TRS_CARD, "p-4")}>
        <div className="mb-3 border-b border-gray-200 pb-2 text-sm font-medium text-black">
          Health Ribbon
        </div>
        <div className="grid grid-cols-2 gap-3">
          <KpiCard
            label="North Star Run-rate"
            value={`$${Math.round(d.ribbon.northStarRunRate / 1000)}K`}
            hint={`${d.ribbon.northStarDeltaVsPlanPct}% vs plan`}
          />
          <KpiCard
            label="Cash on Hand"
            value={`$${Math.round(d.ribbon.cashOnHand / 1000)}K`}
            hint={`${d.ribbon.runwayDays}d runway`}
          />
          <KpiCard
            label="TRS Score"
            value={`${d.ribbon.trsScore}`}
            hint="0–100"
          />
          <KpiCard
            label="Risk Index"
            value={`${d.ribbon.riskIndexPct}%`}
            hint="Prob. downside"
          />
        </div>
      </Card>
      <Card className={cn(TRS_CARD, "p-4")}>
        <div className="mb-3 border-b border-gray-200 pb-2 text-sm font-medium text-black">
          Sales
        </div>
        <div className="grid grid-cols-2 gap-3">
          <KpiCard
            label="Coverage (x)"
            value={d.sales.pipelineCoverageX.toFixed(1)}
            hint="vs target"
          />
          <KpiCard label="Win Rate 7d" value={`${d.sales.winRate7dPct}%`} />
          <KpiCard label="Win Rate 30d" value={`${d.sales.winRate30dPct}%`} />
          <KpiCard
            label="Cycle Time"
            value={`${d.sales.cycleTimeDaysMedian}d`}
          />
        </div>
      </Card>
      <Card className={cn(TRS_CARD, "p-4")}>
        <div className="mb-3 border-b border-gray-200 pb-2 text-sm font-medium text-black">
          Finance
        </div>
        <div className="grid grid-cols-2 gap-3">
          <KpiCard
            label="AR Total"
            value={`$${Math.round(d.finance.arTotal / 1000)}K`}
          />
          <KpiCard label="DSO" value={`${d.finance.dsoDays}d`} />
          <KpiCard
            label="Collected (7d)"
            value={`$${Math.round(d.finance.cashCollected7d / 1000)}K`}
          />
          <KpiCard
            label="Price Realization"
            value={`${d.finance.priceRealizationPct}%`}
          />
        </div>
      </Card>
      <Card className={cn(TRS_CARD, "p-4")}>
        <div className="mb-3 border-b border-gray-200 pb-2 text-sm font-medium text-black">
          Total Revenue
        </div>
        <div className="h-40">
          <SmallSpark />
        </div>
      </Card>
    </div>
  );

  return (
    <PageTemplate
      title="Executive Dashboard"
      description="Board-ready visibility across revenue, finance, and product health."
      actions={
        <form action={exportAction}>
          <button className="rounded-md border border-gray-300 bg-white px-3 py-1.5 text-xs hover:bg-gray-100">
            Export board deck
          </button>
        </form>
      }
      toolbar={<ScopeBar initial={d.scope} />}
      toolbarClassName="flex flex-col gap-2 md:flex-row md:items-center md:justify-between"
      stats={activeTab === "Overview" ? kpiGrid : null}
    >
      <PageTabs tabs={tabs} activeTab={activeTab} hrefForTab={buildTabHref} />

      {activeTab === "Overview" && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 gap-3 lg:grid-cols-3">
            <Card className={cn(TRS_CARD, "lg:col-span-2")}>
              <div className="flex items-center justify-between border-b border-gray-200 px-4 py-3">
                <div className="text-sm font-medium">Forecast Cone</div>
                <Link
                  href="/pipeline?tab=Analytics&action=commit"
                  className="rounded-md border border-gray-300 bg-white px-2 py-1 text-xs hover:bg-gray-100"
                >
                  Create Commit Set
                </Link>
              </div>
              <div className="h-64 p-4">
                <AreaChart />
              </div>
              <div className="px-4 pb-4 text-[11px] text-gray-500">
                p10 / p50 / p90 weekly bookings cone (stubbed)
              </div>
            </Card>
            <Card className={cn(TRS_CARD)}>
              <div className="flex items-center justify-between border-b border-gray-200 px-4 py-3">
                <div className="text-sm font-medium">Subscriptions</div>
                <div className="text-[11px] text-gray-500">+180% MoM</div>
              </div>
              <div className="h-64 p-4">
                <BarChart />
              </div>
            </Card>
          </div>

          <div className="grid grid-cols-1 gap-3 md:grid-cols-2 lg:grid-cols-3">
            <Card className={cn(TRS_CARD)}>
              <div className="flex items-center justify-between border-b border-gray-200 px-4 py-3">
                <div className="text-sm font-medium">Cash Control</div>
                <Link
                  href="/finance?tab=Analytics#collections"
                  className="rounded-md border border-gray-300 bg-white px-2 py-1 text-xs hover:bg-gray-100"
                >
                  Accelerate +5d
                </Link>
              </div>
              <div className="grid grid-cols-2 gap-3 p-4">
                <KpiCard
                  label="Due Today"
                  value={`$${Math.round(d.cashPanel.dueToday / 1000)}K`}
                />
                <KpiCard
                  label="Due This Week"
                  value={`$${Math.round(d.cashPanel.dueThisWeek / 1000)}K`}
                />
                <KpiCard
                  label="At Risk"
                  value={`$${Math.round(d.cashPanel.atRisk / 1000)}K`}
                />
                <KpiCard
                  label="Scenario DSO"
                  value={`-${d.cashPanel.scenarioDSOdaysSaved}d`}
                />
              </div>
            </Card>

            <Card className={cn(TRS_CARD)}>
              <div className="flex items-center justify-between border-b border-gray-200 px-4 py-3">
                <div className="text-sm font-medium">
                  Pricing Power & Deal Desk
                </div>
                <Link
                  href="/pipeline?tab=Reports#deal-desk"
                  className="rounded-md border border-gray-300 bg-white px-2 py-1 text-xs hover:bg-gray-100"
                >
                  Open Deal Desk
                </Link>
              </div>
              <div className="space-y-3 p-4 text-sm">
                <div className="mb-2 text-[11px] text-gray-500">
                  Discount vs Win vs Margin (stub chart)
                </div>
                <div className="flex h-24 items-center justify-center rounded-md border border-gray-200 bg-white text-xs text-gray-600">
                  Curve
                </div>
                <div>
                  <div className="mb-2 text-[12px] font-medium">
                    Guardrail Breaches
                  </div>
                  <ul className="space-y-2 text-[12px]">
                    {d.pricing.guardrailBreaches.map((b) => (
                      <li
                        key={b.id}
                        className="flex items-center justify-between"
                      >
                        <span>
                          {b.account} • {b.discountPct}% • {b.owner}
                        </span>
                        <Link
                          className="rounded-md border border-gray-300 px-2 py-0.5 text-xs hover:bg-gray-100"
                          href={`/pipeline?tab=Reports#deal-${b.id}`}
                        >
                          Review
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </Card>

            <Card className={cn(TRS_CARD)}>
              <div className="flex items-center justify-between border-b border-gray-200 px-4 py-3">
                <div className="text-sm font-medium">Content Influence</div>
                <Link
                  className="rounded-md border border-gray-300 px-2 py-1 text-xs hover:bg-gray-100"
                  href="/content?tab=Analytics"
                >
                  Open Content
                </Link>
              </div>
              <div className="space-y-3 p-4">
                <div className="grid grid-cols-2 gap-3">
                  <KpiCard
                    label="Influenced $"
                    value={`$${Math.round(d.content.influenced / 1000)}K`}
                  />
                  <KpiCard
                    label="Closed-Won $"
                    value={`$${Math.round(d.content.closedWon / 1000)}K`}
                  />
                  <KpiCard
                    label="Usage Rate"
                    value={`${d.content.usageRatePct}%`}
                  />
                  <KpiCard
                    label="Advanced $"
                    value={`$${Math.round(d.content.advanced / 1000)}K`}
                  />
                </div>
                <div>
                  <div className="mb-2 text-[11px] font-medium text-gray-700">
                    Alerts
                  </div>
                  <AlertList items={d.alerts.slice(0, 2)} />
                </div>
              </div>
            </Card>
          </div>
        </div>
      )}

      {activeTab === "Analytics" && (
        <Card className={cn(TRS_CARD, "p-6")}>
          <div className="space-y-3 text-center">
            <h2 className="text-lg font-semibold text-black">
              Advanced Analytics
            </h2>
            <p className="text-sm text-gray-600">
              Deep-dive metrics, cohort analysis, and predictive modeling
            </p>
            <div className="text-[11px] text-gray-500 italic">
              Feature coming soon
            </div>
          </div>
        </Card>
      )}

      {activeTab === "Reports" && (
        <Card className={cn(TRS_CARD, "p-6")}>
          <div className="space-y-4">
            <h2 className="text-lg font-semibold text-black">
              Executive Reports
            </h2>
            <p className="text-sm text-gray-600">
              Board decks, investor updates, and quarterly business reviews
            </p>
            <div className="text-[11px] text-gray-500 italic">
              Report builder coming soon
            </div>
          </div>
        </Card>
      )}

      {activeTab === "Notifications" && (
        <Card className={cn(TRS_CARD, "p-6")}>
          <div className="space-y-4">
            <h2 className="text-lg font-semibold text-black">
              Notifications & Alerts
            </h2>
            <div className="space-y-3">
              <AlertList items={d.alerts} />
            </div>
          </div>
        </Card>
      )}
    </PageTemplate>
  );
}
