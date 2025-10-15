"use client";

import type { FormEvent } from "react";
import { useCallback, useMemo, useState, useTransition } from "react";
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
import { Button } from "@/ui/button";
import { Badge } from "@/ui/badge";
import { Select } from "@/ui/select";
import { Textarea } from "@/ui/textarea";
import { Input } from "@/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/ui/table";
import type { ExecDashboard } from "@/core/exec/types";
import { refreshDashboardSnapshot } from "@/core/exec/actions";
import {
  recordForecastApproval,
  submitForecastComment,
} from "@/core/exec/review";
import type {
  ForecastReviewApproval,
  ForecastReviewState,
  ForecastScenarioKey,
} from "@/core/exec/review";
import { TRS_CARD } from "@/lib/style";
import { resolveTabs } from "@/lib/tabs";
import { cn } from "@/lib/utils";

type DashboardClientProps = {
  data: ExecDashboard;
  exportAction: () => Promise<void>;
  review: ForecastReviewState;
};

export default function DashboardClient({
  data,
  exportAction,
  review,
}: DashboardClientProps) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const tabs = useMemo(() => resolveTabs(pathname), [pathname]);
  const activeTab = useMemo(() => {
    const current = searchParams.get("tab");
    return current && tabs.includes(current) ? current : tabs[0];
  }, [searchParams, tabs]);
  const [refreshMessage, setRefreshMessage] = useState<string | null>(null);
  const [refreshPending, startRefresh] = useTransition();
  const [reviewState, setReviewState] = useState<ForecastReviewState>(review);
  const [commentScenario, setCommentScenario] =
    useState<ForecastScenarioKey>("commit");
  const [commentText, setCommentText] = useState("");
  const [focusArea, setFocusArea] = useState("");
  const [commentError, setCommentError] = useState<string | null>(null);
  const [approvalScenario, setApprovalScenario] =
    useState<ForecastScenarioKey>("commit");
  const [approvalDecision, setApprovalDecision] = useState<
    "approved" | "changes_requested"
  >("approved");
  const [approvalNote, setApprovalNote] = useState("");
  const [approvalFeedback, setApprovalFeedback] = useState<string | null>(null);
  const [reviewPending, startReviewAction] = useTransition();

  const handleRefresh = () => {
    startRefresh(async () => {
      const result = await refreshDashboardSnapshot(data.scope);
      setRefreshMessage(
        result.success
          ? "Dashboard refresh requested. Snapshot will update shortly."
          : "Dashboard refresh failed",
      );
    });
  };

  const buildTabHref = useCallback(
    (tab: string) => {
      const params = new URLSearchParams(searchParams.toString());
      params.set("tab", tab);
      params.delete("export");
      return `${pathname}?${params.toString()}`;
    },
    [pathname, searchParams],
  );

  const exportErrored = searchParams.get("export") === "failed";

  const d = data;
  const scenarioOptions: ForecastScenarioKey[] = ["commit", "upside", "best"];
  const scenarioLabels: Record<ForecastScenarioKey, string> = {
    commit: "Commit",
    upside: "Upside",
    best: "Best Case",
  };
  const dateTimeFormatter = useMemo(
    () =>
      new Intl.DateTimeFormat("en-US", {
        month: "short",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      }),
    [],
  );

  const approvalsByScenario = useMemo(() => {
    const map = new Map<ForecastScenarioKey, ForecastReviewApproval>();
    reviewState.approvals.forEach((approval) => {
      if (!map.has(approval.scenario)) {
        map.set(approval.scenario, approval);
      }
    });
    return map;
  }, [reviewState.approvals]);

  const handleSubmitComment = useCallback(
    (event: FormEvent<HTMLFormElement>) => {
      event.preventDefault();
      if (!commentText.trim()) {
        setCommentError("Add guidance before submitting.");
        return;
      }
      setCommentError(null);

      startReviewAction(async () => {
        const result = await submitForecastComment({
          scope: data.scope,
          scenario: commentScenario,
          comment: commentText,
          focusArea,
        });

        if (!result.ok || !result.comment) {
          setCommentError("Unable to submit comment right now.");
          return;
        }

        setReviewState((prev) => ({
          ...prev,
          comments: [result.comment, ...prev.comments].slice(0, 50),
        }));
        setCommentText("");
        setFocusArea("");
      });
    },
    [commentScenario, commentText, data.scope, focusArea, startReviewAction],
  );

  const handleSubmitApproval = useCallback(
    (event: FormEvent<HTMLFormElement>) => {
      event.preventDefault();
      setApprovalFeedback(null);

      startReviewAction(async () => {
        const result = await recordForecastApproval({
          scope: data.scope,
          scenario: approvalScenario,
          status: approvalDecision,
          note: approvalNote,
        });

        if (!result.ok || !result.approval) {
          setApprovalFeedback("Failed to record decision. Try again shortly.");
          return;
        }

        setReviewState((prev) => ({
          ...prev,
          approvals: [
            result.approval,
            ...prev.approvals.filter(
              (item) =>
                !(
                  item.approverId === result.approval.approverId &&
                  item.scenario === result.approval.scenario
                ),
            ),
          ],
        }));
        setApprovalFeedback("Decision logged for finance & exec review.");
        setApprovalNote("");
      });
    },
    [approvalDecision, approvalNote, approvalScenario, data.scope, startReviewAction],
  );

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
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleRefresh}
            disabled={refreshPending}
            className="rounded-md border border-gray-300 bg-white px-3 py-1.5 text-xs hover:bg-gray-100 disabled:opacity-60"
          >
            {refreshPending ? "Refreshing…" : "Refresh snapshot"}
          </button>
          <form action={exportAction}>
            <button className="rounded-md border border-gray-300 bg-white px-3 py-1.5 text-xs hover:bg-gray-100" type="submit">
              Export board deck
            </button>
          </form>
        </div>
      }
      toolbar={<ScopeBar initial={d.scope} />}
      toolbarClassName="flex flex-col gap-2 md:flex-row md:items-center md:justify-between"
      stats={activeTab === "Overview" ? kpiGrid : null}
    >
      <PageTabs tabs={tabs} activeTab={activeTab} hrefForTab={buildTabHref} />

      {refreshMessage ? (
        <div className="rounded-md border border-blue-200 bg-blue-50 p-3 text-xs text-blue-800">
          {refreshMessage}
        </div>
      ) : null}

      {exportErrored ? (
        <div className="rounded-md border border-red-200 bg-red-50 p-3 text-xs text-red-700">
          Export failed. Please try again in a moment.
        </div>
      ) : null}

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

          <Card className={cn(TRS_CARD)}>
            <div className="grid gap-4 p-4 lg:grid-cols-2">
              <div className="space-y-4">
                <div>
                  <div className="text-sm font-semibold text-black">Forecast Review Comments</div>
                  <p className="text-xs text-gray-500">
                    Capture finance and revenue leader guidance on the live forecast.
                  </p>
                </div>
                <form onSubmit={handleSubmitComment} className="space-y-2">
                  <div className="grid grid-cols-1 gap-2 md:grid-cols-2">
                    <Select
                      value={commentScenario}
                      onChange={(event) =>
                        setCommentScenario(event.target.value as ForecastScenarioKey)
                      }
                    >
                      {scenarioOptions.map((option) => (
                        <option key={option} value={option}>
                          {scenarioLabels[option]}
                        </option>
                      ))}
                    </Select>
                    <Input
                      value={focusArea}
                      onChange={(event) => setFocusArea(event.target.value)}
                      placeholder="Focus area (optional)"
                    />
                  </div>
                  <Textarea
                    rows={3}
                    value={commentText}
                    onChange={(event) => setCommentText(event.target.value)}
                    placeholder="Call out risks, upside drivers, or asks for finance..."
                  />
                  {commentError ? (
                    <div className="text-xs text-rose-600">{commentError}</div>
                  ) : null}
                  <div className="flex justify-end">
                    <Button type="submit" size="sm" disabled={reviewPending}>
                      {reviewPending ? "Submitting…" : "Add comment"}
                    </Button>
                  </div>
                </form>
                <div className="space-y-3">
                  {reviewState.comments.slice(0, 4).map((comment) => (
                    <div
                      key={comment.id}
                      className="rounded-md border border-gray-200 bg-white p-3 text-sm shadow-sm"
                    >
                      <div className="flex items-center justify-between text-xs text-gray-500">
                        <span className="font-medium text-gray-700">{comment.authorName}</span>
                        <Badge variant="outline">{scenarioLabels[comment.scenario]}</Badge>
                      </div>
                      <p className="mt-2 text-sm text-gray-700">{comment.comment}</p>
                      {comment.focusArea ? (
                        <div className="mt-1 text-xs text-gray-500">Focus: {comment.focusArea}</div>
                      ) : null}
                      <div className="mt-1 text-[11px] text-gray-400">
                        {dateTimeFormatter.format(new Date(comment.createdAt))}
                      </div>
                    </div>
                  ))}
                  {!reviewState.comments.length && (
                    <p className="text-sm text-gray-500">
                      No comments yet. Start the commit review to align stakeholders.
                    </p>
                  )}
                </div>
              </div>
              <div className="space-y-4">
                <div>
                  <div className="text-sm font-semibold text-black">Approvals & Decisions</div>
                  <p className="text-xs text-gray-500">
                    Record commit sign-off or request adjustments before locking guidance.
                  </p>
                </div>
                <form onSubmit={handleSubmitApproval} className="space-y-2">
                  <div className="grid grid-cols-1 gap-2 md:grid-cols-2">
                    <Select
                      value={approvalScenario}
                      onChange={(event) =>
                        setApprovalScenario(event.target.value as ForecastScenarioKey)
                      }
                    >
                      {scenarioOptions.map((option) => (
                        <option key={option} value={option}>
                          {scenarioLabels[option]}
                        </option>
                      ))}
                    </Select>
                    <Select
                      value={approvalDecision}
                      onChange={(event) =>
                        setApprovalDecision(
                          event.target.value as "approved" | "changes_requested",
                        )
                      }
                    >
                      <option value="approved">Approve commit</option>
                      <option value="changes_requested">Request changes</option>
                    </Select>
                  </div>
                  <Textarea
                    rows={3}
                    value={approvalNote}
                    onChange={(event) => setApprovalNote(event.target.value)}
                    placeholder="Note optional context for finance or GTM leaders"
                  />
                  {approvalFeedback ? (
                    <div
                      className={cn(
                        "text-xs",
                        approvalFeedback.startsWith("Failed")
                          ? "text-rose-600"
                          : "text-emerald-600",
                      )}
                    >
                      {approvalFeedback}
                    </div>
                  ) : null}
                  <div className="flex justify-end">
                    <Button type="submit" size="sm" disabled={reviewPending}>
                      {reviewPending ? "Recording…" : "Record decision"}
                    </Button>
                  </div>
                </form>
                <div className="space-y-2">
                  {scenarioOptions.map((option) => {
                    const approval = approvalsByScenario.get(option);
                    const variant = approval
                      ? approval.status === "approved"
                        ? "success"
                        : "warning"
                      : "outline";
                    return (
                      <div
                        key={option}
                        className="rounded-md border border-gray-200 bg-white p-3 text-sm shadow-sm"
                      >
                        <div className="flex items-center justify-between">
                          <div className="font-medium text-gray-800">
                            {scenarioLabels[option]}
                          </div>
                          <Badge variant={variant}>
                            {approval
                              ? approval.status === "approved"
                                ? "Approved"
                                : "Changes requested"
                              : "Pending"}
                          </Badge>
                        </div>
                        <div className="mt-1 text-xs text-gray-500">
                          {approval
                            ? `${approval.approverName} • ${dateTimeFormatter.format(
                                new Date(approval.createdAt),
                              )}`
                            : "Awaiting reviewer"}
                        </div>
                        {approval?.note ? (
                          <div className="mt-1 text-xs text-gray-600">{approval.note}</div>
                        ) : null}
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </Card>

          <Card className={cn(TRS_CARD)}>
            <div className="space-y-4 p-4">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-sm font-semibold text-black">Finance Export History</div>
                  <p className="text-xs text-gray-500">
                    Track every forecast package sent to finance with download links.
                  </p>
                </div>
                <Badge variant="outline">{reviewState.versions.length} versions</Badge>
              </div>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Version</TableHead>
                    <TableHead>Scenario</TableHead>
                    <TableHead>Coverage</TableHead>
                    <TableHead>Risk</TableHead>
                    <TableHead>Owner</TableHead>
                    <TableHead>Download</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {reviewState.versions.slice(0, 6).map((version) => (
                    <TableRow key={version.id}>
                      <TableCell>v{version.version}</TableCell>
                      <TableCell>{scenarioLabels[version.scenario]}</TableCell>
                      <TableCell>{version.coverage.toFixed(1)}x</TableCell>
                      <TableCell>{version.riskIndex.toFixed(1)}%</TableCell>
                      <TableCell>
                        <div className="text-sm text-gray-800">{version.authorName}</div>
                        <div className="text-[11px] text-gray-500">
                          {dateTimeFormatter.format(new Date(version.createdAt))}
                        </div>
                      </TableCell>
                      <TableCell>
                        <a
                          href={version.downloadUrl}
                          download={`forecast-v${version.version}.csv`}
                          className="text-xs font-medium text-blue-600 hover:underline"
                        >
                          Download CSV
                        </a>
                      </TableCell>
                    </TableRow>
                  ))}
                  {!reviewState.versions.length && (
                    <TableRow>
                      <TableCell colSpan={6} className="py-4 text-center text-sm text-gray-500">
                        Export a forecast to finance to build the version history.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          </Card>
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
