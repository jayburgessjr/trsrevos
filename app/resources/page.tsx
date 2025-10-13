"use client";

import { useCallback, useEffect, useMemo } from "react";
import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";

import { PageTemplate } from "@/components/layout/PageTemplate";
import { PageTabs } from "@/components/layout/PageTabs";
import { Badge } from "@/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/ui/card";
import { TRS_CARD } from "@/lib/style";
import { resolveTabs } from "@/lib/tabs";
import { cn } from "@/lib/utils";
import RevenueClearInteractiveModel from "@/components/resources/RevenueClearInteractiveModel";

const pricingScenarios = [
  {
    tier: "Starter",
    list: 8500,
    floor: 7200,
    discountGuard: "15% max",
    packaging: "Seats + usage",
  },
  {
    tier: "Growth",
    list: 18500,
    floor: 16000,
    discountGuard: "12% max",
    packaging: "Seats + workflow pack",
  },
  {
    tier: "Enterprise",
    list: 42000,
    floor: 38000,
    discountGuard: "10% max",
    packaging: "Seats + governance + support",
  },
];

const outlineButtonClass =
  "inline-flex items-center justify-center gap-2 rounded-md font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--color-outline)] border border-[color:var(--color-outline)] bg-white text-[color:var(--color-text)] hover:bg-[color:var(--color-surface-muted)] h-9 px-4 text-sm";

const revenueDrivers = [
  { id: "rd1", name: "Net new ARR", amount: 185000, change: "+12% MoM" },
  { id: "rd2", name: "Expansion ARR", amount: 95000, change: "+6% MoM" },
  { id: "rd3", name: "Contraction ARR", amount: -45000, change: "-2% MoM" },
  { id: "rd4", name: "Churn ARR", amount: -115000, change: "+1% MoM" },
];

const profitMetrics = [
  {
    id: "pm1",
    name: "Gross margin",
    value: "78%",
    benchmark: "Top quartile SaaS",
  },
  {
    id: "pm2",
    name: "Magic number",
    value: "1.3x",
    benchmark: "Efficient growth",
  },
  {
    id: "pm3",
    name: "CAC payback",
    value: "13.5 months",
    benchmark: "Target < 15 months",
  },
  { id: "pm4", name: "Rule of 40", value: "62", benchmark: "Above target" },
];

const coverageMetrics = [
  {
    label: "Total quota capacity",
    value: "$9.2M",
    detail: "12 AEs · 2.3x pipeline coverage",
  },
  {
    label: "In-quarter commit",
    value: "$3.4M",
    detail: "65% probability weighted",
  },
  {
    label: "Stretch scenario",
    value: "$4.1M",
    detail: "Requires 3 net-new logo wins",
  },
];

const cashFlowItems = [
  "Headcount pacing vs plan",
  "Vendor consolidation savings",
  "Capital efficiency by cohort",
];

const marginIdeas = [
  "Shift implementation to partners for enterprise tier",
  "Launch usage alerts to prevent overage credits",
  "Automate onboarding to reduce services cost",
];

const scenarioPacks = [
  {
    title: "Base",
    summary: "Plan of record, current hiring, pipeline confidence.",
  },
  {
    title: "Upside",
    summary: "Requires 2 strategic wins + PLG conversion lift.",
  },
  {
    title: "Downside",
    summary: "Models churn risk, slip deals, and cost controls.",
  },
];

const whatIfLevers = [
  "AE ramp time",
  "Enterprise discount rate",
  "Partner-sourced pipeline",
];

export default function ResourcesPage() {
  const pathname = usePathname();
  const router = useRouter();
  const searchParams = useSearchParams();
  const tabs = useMemo(() => resolveTabs(pathname), [pathname]);
  const activeTab = useMemo(() => {
    const current = searchParams.get("tab");
    return current && tabs.includes(current) ? current : tabs[0];
  }, [searchParams, tabs]);

  const buildTabHref = useCallback(
    (tab: string) => {
      if (tab === "Forms") {
        return "/resources/forms";
      }
      const params = new URLSearchParams(searchParams.toString());
      params.set("tab", tab);
      return `${pathname}?${params.toString()}`;
    },
    [pathname, searchParams],
  );

  useEffect(() => {
    if (activeTab === "Forms") {
      router.replace("/resources/forms");
    }
  }, [activeTab, router]);

  return (
    <PageTemplate
      title="Resources & Calculators"
      description="Finance-ready calculators to pressure test pricing, revenue, profit, and board-ready scenarios in minutes."
      badges={[
        { label: "Prebuilt GTM formulas" },
        { label: "Live benchmarks", variant: "success" as const },
        { label: "Downloadable templates", variant: "default" as const },
      ]}
    >
      <PageTabs tabs={tabs} activeTab={activeTab} hrefForTab={buildTabHref} />

      {activeTab === "Pricing" && (
        <div className="space-y-4">
          <Card className={TRS_CARD}>
            <CardHeader>
              <CardTitle className="text-lg font-semibold text-black">
                Guardrail calculator
              </CardTitle>
              <CardDescription className="text-sm text-gray-500">
                Set floor prices, packaging guardrails, and instant impact to
                ARR and margin.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="rounded-lg border border-gray-200 bg-gray-50 p-4 text-sm text-gray-700">
                Adjust list price and discount allowances to visualize net ARR
                impact. Export recommendations for sales playbooks in one click.
              </div>
              <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                {pricingScenarios.map((scenario) => (
                  <div
                    key={scenario.tier}
                    className="flex flex-col rounded-lg border border-gray-200 p-4"
                  >
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-semibold text-black">
                        {scenario.tier}
                      </p>
                      <Badge variant="outline">{scenario.packaging}</Badge>
                    </div>
                    <dl className="mt-3 space-y-2 text-sm text-gray-700">
                      <div className="flex items-center justify-between text-xs text-gray-500">
                        <dt>List price</dt>
                        <dd>${scenario.list.toLocaleString()}</dd>
                      </div>
                      <div className="flex items-center justify-between text-xs text-gray-500">
                        <dt>Floor price</dt>
                        <dd>${scenario.floor.toLocaleString()}</dd>
                      </div>
                      <div className="flex items-center justify-between text-xs text-gray-500">
                        <dt>Discount guardrail</dt>
                        <dd>{scenario.discountGuard}</dd>
                      </div>
                    </dl>
                    <Link
                      href="/content?tab=Pipeline"
                      className={cn(outlineButtonClass, "mt-4 self-start")}
                    >
                      Export playbook
                    </Link>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card className={TRS_CARD}>
            <CardHeader>
              <CardTitle className="text-lg font-semibold text-black">
                Packaging experiments
              </CardTitle>
              <CardDescription className="text-sm text-gray-500">
                Compare usage-based vs seat-based packaging to find the optimal
                blend.
              </CardDescription>
            </CardHeader>
            <CardContent className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div className="space-y-3 rounded-lg border border-gray-200 p-4">
                <p className="text-sm font-medium text-black">Usage-first</p>
                <p className="text-sm text-gray-600">
                  Meter core AI generation and automations. Seat add-ons unlock
                  analytics and governance modules.
                </p>
                <Badge variant="success">Recommended</Badge>
              </div>
              <div className="space-y-3 rounded-lg border border-gray-200 p-4">
                <p className="text-sm font-medium text-black">Seat-first</p>
                <p className="text-sm text-gray-600">
                  Predictable ARR but lower margin. Layer usage overages when
                  activation crosses 120% of plan.
                </p>
                <Badge variant="outline">In testing</Badge>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {activeTab === "Revenue" && (
        <div className="space-y-4">
          <Card className={TRS_CARD}>
            <CardHeader>
              <CardTitle className="text-lg font-semibold text-black">
                Revenue bridge
              </CardTitle>
              <CardDescription className="text-sm text-gray-500">
                Understand what is driving ARR movement across segments and
                motions.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                {revenueDrivers.map((driver) => (
                  <div
                    key={driver.id}
                    className="rounded-lg border border-gray-200 p-4"
                  >
                    <p className="text-sm font-medium text-black">
                      {driver.name}
                    </p>
                    <p
                      className={`mt-2 text-2xl font-semibold ${driver.amount >= 0 ? "text-emerald-600" : "text-rose-600"}`}
                    >
                      ${Math.abs(driver.amount / 1000).toFixed(0)}K
                    </p>
                    <p className="text-xs text-gray-500">{driver.change}</p>
                  </div>
                ))}
              </div>
              <div className="rounded-lg border border-dashed border-gray-200 p-4 text-sm text-gray-700">
                Model net new pipeline coverage, expansion playbooks, and churn
                saves with scenario toggles. Export to RevOps dashboards
                instantly.
              </div>
            </CardContent>
          </Card>

          <Card className={TRS_CARD}>
            <CardHeader>
              <CardTitle className="text-lg font-semibold text-black">
                Coverage calculator
              </CardTitle>
              <CardDescription className="text-sm text-gray-500">
                Blend quota capacity, attainment, and forecast confidence to
                project outcomes.
              </CardDescription>
            </CardHeader>
            <CardContent className="grid grid-cols-1 gap-4 md:grid-cols-3">
              {coverageMetrics.map((metric) => (
                <div
                  key={metric.label}
                  className="rounded-lg border border-gray-200 p-4"
                >
                  <p className="text-xs font-medium uppercase tracking-wide text-gray-500">
                    {metric.label}
                  </p>
                  <p className="mt-2 text-2xl font-semibold text-black">
                    {metric.value}
                  </p>
                  <p className="mt-1 text-xs text-gray-500">{metric.detail}</p>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      )}

      {activeTab === "Revenue Clear" && (
        <div className="py-6">
          <RevenueClearInteractiveModel />
        </div>
      )}

      {activeTab === "Financial Plan" && (
        <div className="space-y-4">
          <Card className={TRS_CARD}>
            <CardHeader>
              <CardTitle className="text-lg font-semibold text-black">
                Financial runway
              </CardTitle>
              <CardDescription className="text-sm text-gray-500">
                Plan burn, runway, and investment pacing with CFO-grade
                controls.
              </CardDescription>
            </CardHeader>
            <CardContent className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div className="space-y-3 rounded-lg border border-gray-200 p-4">
                <p className="text-sm font-medium text-black">Base plan</p>
                <p className="text-3xl font-semibold text-black">18.5 months</p>
                <p className="text-xs text-gray-500">
                  Runway based on current burn rate of $185K/mo
                </p>
              </div>
              <div className="space-y-3 rounded-lg border border-gray-200 p-4">
                <p className="text-sm font-medium text-black">
                  Efficiency scenario
                </p>
                <p className="text-3xl font-semibold text-emerald-600">
                  21.3 months
                </p>
                <p className="text-xs text-gray-500">
                  Assumes 8% opex reduction + 6% ARR uplift
                </p>
              </div>
            </CardContent>
          </Card>

          <Card className={TRS_CARD}>
            <CardHeader>
              <CardTitle className="text-lg font-semibold text-black">
                Cash flow planner
              </CardTitle>
              <CardDescription className="text-sm text-gray-500">
                Align hiring plans, vendor spend, and capital strategy.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {cashFlowItems.map((item) => (
                <div
                  key={item}
                  className="rounded-lg border border-gray-200 bg-gray-50 p-3 text-sm text-gray-700"
                >
                  {item}
                </div>
              ))}
              <Link
                href="/finance?tab=Cash%20Flow"
                className={cn(outlineButtonClass, "self-start")}
              >
                Open planner workspace
              </Link>
            </CardContent>
          </Card>
        </div>
      )}

      {activeTab === "Profit" && (
        <div className="space-y-4">
          <Card className={TRS_CARD}>
            <CardHeader>
              <CardTitle className="text-lg font-semibold text-black">
                Profitability snapshot
              </CardTitle>
              <CardDescription className="text-sm text-gray-500">
                Track margin, CAC payback, and capital efficiency benchmarks.
              </CardDescription>
            </CardHeader>
            <CardContent className="grid grid-cols-1 gap-4 md:grid-cols-2">
              {profitMetrics.map((metric) => (
                <div
                  key={metric.id}
                  className="rounded-lg border border-gray-200 p-4"
                >
                  <p className="text-sm font-medium text-black">
                    {metric.name}
                  </p>
                  <p className="mt-2 text-2xl font-semibold text-black">
                    {metric.value}
                  </p>
                  <p className="text-xs text-gray-500">{metric.benchmark}</p>
                </div>
              ))}
            </CardContent>
          </Card>

          <Card className={TRS_CARD}>
            <CardHeader>
              <CardTitle className="text-lg font-semibold text-black">
                Margin improvement ideas
              </CardTitle>
              <CardDescription className="text-sm text-gray-500">
                Quick wins sourced from GTM, product, and finance collaboration.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {marginIdeas.map((idea) => (
                <div
                  key={idea}
                  className="rounded-lg border border-gray-200 bg-gray-50 p-3 text-sm text-gray-700"
                >
                  {idea}
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      )}

      {activeTab === "Board Scenarios" && (
        <div className="space-y-4">
          <Card className={TRS_CARD}>
            <CardHeader>
              <CardTitle className="text-lg font-semibold text-black">
                Board-ready packs
              </CardTitle>
              <CardDescription className="text-sm text-gray-500">
                Assemble scenario outputs with commentary, risks, and actions in
                seconds.
              </CardDescription>
            </CardHeader>
            <CardContent className="grid grid-cols-1 gap-4 md:grid-cols-3">
              {scenarioPacks.map((pack) => (
                <div
                  key={pack.title}
                  className="flex flex-col justify-between rounded-lg border border-gray-200 p-4"
                >
                  <div>
                    <p className="text-sm font-semibold text-black">
                      {pack.title}
                    </p>
                    <p className="mt-1 text-sm text-gray-600">{pack.summary}</p>
                  </div>
                  <Link
                    href="/dashboard?tab=Reports"
                    className={cn(outlineButtonClass, "mt-4 self-start")}
                  >
                    Generate pack
                  </Link>
                </div>
              ))}
            </CardContent>
          </Card>

          <Card className={TRS_CARD}>
            <CardHeader>
              <CardTitle className="text-lg font-semibold text-black">
                What-if levers
              </CardTitle>
              <CardDescription className="text-sm text-gray-500">
                Toggle hiring, win rates, and pricing to see multi-quarter
                impact.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {whatIfLevers.map((lever) => (
                <div
                  key={lever}
                  className="flex items-center justify-between rounded-lg border border-gray-200 p-3 text-sm text-gray-700"
                >
                  <span>{lever}</span>
                  <Badge variant="outline">Interactive</Badge>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      )}
    </PageTemplate>
  );
}
