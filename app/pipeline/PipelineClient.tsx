"use client";

import { useEffect, useMemo, useRef, useState, useTransition } from "react";

import { PageTemplate } from "@/components/layout/PageTemplate";
import type { PageTemplateBadge } from "@/components/layout/PageTemplate";
import { PageTabs } from "@/components/layout/PageTabs";
import { AddProspectModal } from "@/components/pipeline/AddProspectModal";
import { ImportProspectsModal } from "@/components/pipeline/ImportProspectsModal";
import { PipelineFilters } from "@/components/pipeline/PipelineFilters";
import { PipelineKanban } from "@/components/pipeline/PipelineKanban";
import { markClosedWon } from "@/app/pipeline/actions";
import type {
  OpportunityWithNotes,
  PipelineAutomationState,
  PipelineSyncJob,
  PipelineMetrics,
} from "@/core/pipeline/actions";
import {
  schedulePipelineSyncs,
  syncPipelineAnalytics,
  triggerPipelineAlerts,
} from "@/core/pipeline/actions";
import { buildPipelineAnalytics } from "@/core/pipeline/analytics";
import type { PipelineAnalytics } from "@/core/pipeline/analytics";
import { Badge } from "@/ui/badge";
import { Button } from "@/ui/button";
import { Card, CardContent } from "@/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/ui/table";
import { cn } from "@/lib/utils";
import { TRS_CARD, TRS_SUBTITLE } from "@/lib/style";

const currencyFormatter = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  maximumFractionDigits: 0,
});

function formatCurrency(value: number) {
  return currencyFormatter.format(Math.round(value || 0));
}

function formatVariance(value: number) {
  const formatted = formatCurrency(Math.abs(value));
  return value >= 0 ? `+${formatted}` : `-${formatted}`;
}

function severityVariant(severity: "info" | "warning" | "critical") {
  if (severity === "critical") return "destructive" as const;
  if (severity === "warning") return "warning" as const;
  return "outline" as const;
}

function formatNextRun(job: PipelineSyncJob) {
  return new Date(job.nextRun).toLocaleString(undefined, {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

type Props = {
  opportunities: OpportunityWithNotes[];
  metrics: PipelineMetrics;
  automation: PipelineAutomationState;
  userId: string;
  isSampleData?: boolean;
};

export default function PipelineClient({
  opportunities,
  metrics,
  automation,
  userId,
  isSampleData = false,
}: Props) {
  const isReadOnly = isSampleData;
  const [activeTab, setActiveTab] = useState("Overview");
  const [showAddProspect, setShowAddProspect] = useState(false);
  const [showImportProspects, setShowImportProspects] = useState(false);
  const [filteredOpportunities, setFilteredOpportunities] =
    useState<OpportunityWithNotes[]>(opportunities);
  const [syncMessage, setSyncMessage] = useState<string | null>(null);
  const [syncPending, startSync] = useTransition();
  const [automationMessage, setAutomationMessage] = useState<string | null>(null);
  const [alertMessage, setAlertMessage] = useState<string | null>(null);
  const [automationState, setAutomationState] = useState<PipelineAutomationState>(automation);
  const [selectedScenario, setSelectedScenario] = useState<"commit" | "upside" | "best">("commit");
  const [automationPending, startAutomation] = useTransition();
  const [, startAlert] = useTransition();
  const sampleOpportunity = useMemo(
    () => opportunities.find((opp) => opp.stage !== "ClosedWon" && opp.stage !== "ClosedLost"),
    [opportunities],
  );
  const sampleClosedWonAction = useMemo(
    () =>
      !isReadOnly && sampleOpportunity
        ? markClosedWon.bind(null, {
            pipelineId: undefined,
            opportunityId: sampleOpportunity.id,
          })
        : null,
    [isReadOnly, sampleOpportunity],
  );

  const quarterlyTarget = 1_200_000;
  const analytics = useMemo<PipelineAnalytics>(
    () => buildPipelineAnalytics(opportunities, { target: quarterlyTarget }),
    [opportunities, quarterlyTarget],
  );

  const handleSync = () => {
    if (isReadOnly) {
      setSyncMessage("Connect Supabase to enable live pipeline syncs.");
      return;
    }

    startSync(async () => {
      const result = await syncPipelineAnalytics();
      setSyncMessage(
        result.ok
          ? `Pipeline sync captured stage counts: ${Object.entries(result.stages)
              .map(([stage, count]) => `${stage} ${count}`)
              .join(", ")}`
          : "Pipeline sync failed",
      );
    });
  };

  const weightedCoverage = quarterlyTarget
    ? (analytics.weightedTotal / quarterlyTarget) * 100
    : 0;
  const scenarioKeys: Array<keyof PipelineAnalytics["scenarios"]> = [
    "commit",
    "upside",
    "best",
  ];
  const activeScenario = analytics.scenarios[selectedScenario];
  const activeCoveragePct = activeScenario.coverage * 100;
  const topScores = useMemo(
    () => analytics.opportunityScores.slice(0, 8),
    [analytics.opportunityScores],
  );
  const riskAlerts = analytics.alerts;
  const schedule = automationState.schedule;
  const alertHistory = automationState.alerts;

  const handleAutomations = () => {
    if (isReadOnly) {
      setAutomationMessage("Automations are disabled while viewing demo data.");
      return;
    }

    startAutomation(async () => {
      const result = await schedulePipelineSyncs();
      if (result.ok) {
        setAutomationState((prev) => ({
          alerts: prev.alerts,
          schedule: result.jobs,
        }));
        setAutomationMessage(
          `Scheduled syncs for ${result.jobs
            .map((job) => `${job.integration} → ${new Date(job.nextRun).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}`)
            .join(", ")}`,
        );
      } else {
        setAutomationMessage("Failed to schedule automations");
      }
    });
  };

  const handleOpenModal = () => {
    if (isReadOnly) {
      return;
    }
    setShowAddProspect(true);
  };

  const handleOpenImport = () => {
    if (isReadOnly) {
      return;
    }
    setShowImportProspects(true);
  };

  useEffect(() => {
    setFilteredOpportunities(opportunities);
  }, [opportunities]);

  const alertHash = useMemo(
    () => analytics.alerts.map((alert) => alert.id).join("|"),
    [analytics.alerts],
  );
  const lastAlertHashRef = useRef<string | null>(null);

  useEffect(() => {
    if (isReadOnly) {
      lastAlertHashRef.current = null;
      setAlertMessage(null);
      return;
    }

    if (!analytics.alerts.length) {
      lastAlertHashRef.current = null;
      setAlertMessage(null);
      return;
    }

    if (lastAlertHashRef.current === alertHash) {
      return;
    }

    lastAlertHashRef.current = alertHash;
    startAlert(async () => {
      const result = await triggerPipelineAlerts({ alerts: analytics.alerts });
      if (result.ok) {
        setAlertMessage(
          result.logged > 0
            ? `Logged ${result.logged} pipeline risk alert${result.logged === 1 ? "" : "s"}`
            : null,
        );
        setAutomationState((prev) => ({
          schedule: prev.schedule,
          alerts: result.alerts,
        }));
      } else {
        setAlertMessage("Failed to notify on pipeline risks");
      }
    });
  }, [alertHash, analytics.alerts, isReadOnly, startAlert]);

  const opportunitiesByStage = useMemo(() => {
    const stages = [
      "Prospect",
      "Qualify",
      "Proposal",
      "Negotiation",
      "ClosedWon",
      "ClosedLost",
    ];
    const grouped: { [stage: string]: OpportunityWithNotes[] } = {};

    stages.forEach((stage) => {
      grouped[stage] = filteredOpportunities.filter(
        (opp) => opp.stage === stage,
      );
    });

    return grouped;
  }, [filteredOpportunities]);

  const atRiskDeals = useMemo(() => {
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    return opportunities.filter((opp) => {
      const updated = new Date(opp.updated_at);
      return (
        updated < thirtyDaysAgo &&
        opp.stage !== "ClosedWon" &&
        opp.stage !== "ClosedLost"
      );
    });
  }, [opportunities]);

  const recentlyMovedDeals = useMemo(() => {
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    return opportunities.filter((opp) => {
      const updated = new Date(opp.updated_at);
      return updated > sevenDaysAgo;
    });
  }, [opportunities]);

  const headerBadges = useMemo<PageTemplateBadge[]>(
    () => [
      { label: "Quarterly target $1.2M" },
      {
        label: `${atRiskDeals.length} deals at risk`,
        variant: atRiskDeals.length > 0 ? "warning" : "success",
      },
      {
        label: `${recentlyMovedDeals.length} moved this week`,
        variant: "default",
      },
    ],
    [atRiskDeals.length, recentlyMovedDeals.length],
  );

  const kpiCards = (
    <div className="grid grid-cols-1 gap-3 md:grid-cols-2 lg:grid-cols-4">
      <Card className={cn(TRS_CARD)}>
        <CardContent className="p-4 space-y-2">
          <div className={TRS_SUBTITLE}>Weighted Pipeline</div>
          <div className="text-2xl font-semibold text-black">
            {formatCurrency(analytics.weightedTotal)}
          </div>
          <div className="flex items-center gap-2 text-xs text-gray-600">
            <Badge variant={weightedCoverage >= 100 ? "success" : "outline"}>
              {weightedCoverage.toFixed(0)}% of goal
            </Badge>
          </div>
        </CardContent>
      </Card>

      <Card className={cn(TRS_CARD)}>
        <CardContent className="p-4 space-y-2">
          <div className={TRS_SUBTITLE}>Win Rate</div>
          <div className="text-2xl font-semibold text-black">
            {metrics.winRate.toFixed(0)}%
          </div>
          <div className="flex items-center gap-2 text-xs text-gray-600">
            <span className="font-medium text-gray-700">
              {opportunitiesByStage.ClosedWon?.length || 0} won
            </span>
            <span>/</span>
            <span>
              {(opportunitiesByStage.ClosedWon?.length || 0) +
                (opportunitiesByStage.ClosedLost?.length || 0)}{" "}
              closed
            </span>
          </div>
        </CardContent>
      </Card>

      <Card className={cn(TRS_CARD)}>
        <CardContent className="p-4 space-y-2">
          <div className={TRS_SUBTITLE}>Avg Deal Size</div>
          <div className="text-2xl font-semibold text-black">
            ${(metrics.avgDealSize / 1000).toFixed(0)}K
          </div>
          <div className="flex items-center gap-2 text-xs text-gray-600">
            <span>{metrics.dealCount} active deals</span>
          </div>
        </CardContent>
      </Card>

      <Card className={cn(TRS_CARD)}>
        <CardContent className="p-4 space-y-2">
          <div className={TRS_SUBTITLE}>Avg Sales Cycle</div>
          <div className="text-2xl font-semibold text-black">
            {metrics.avgSalesCycle.toFixed(0)} days
          </div>
          <div className="flex items-center gap-2 text-xs text-gray-600">
            <Badge variant={atRiskDeals.length > 0 ? "warning" : "success"}>
              {atRiskDeals.length} at risk
            </Badge>
          </div>
        </CardContent>
      </Card>
    </div>
  );

  return (
    <PageTemplate
      title="Revenue Pipeline"
      description="Monitor coverage, velocity, and forecast confidence in one workspace."
      actions={
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            disabled={syncPending || isReadOnly}
            onClick={handleSync}
            title={
              isReadOnly ? "Available when live pipeline data is connected" : undefined
            }
          >
            {syncPending ? "Syncing…" : "Sync analytics"}
          </Button>
          <Button
            variant="outline"
            size="sm"
            disabled={automationPending || isReadOnly}
            onClick={handleAutomations}
            title={
              isReadOnly ? "Available when live pipeline data is connected" : undefined
            }
          >
            {automationPending ? "Scheduling…" : "Automate syncs"}
          </Button>
          {sampleClosedWonAction ? (
            <form action={sampleClosedWonAction} className="inline-flex">
              <Button variant="outline" size="sm" type="submit">
                Playground: Closed Won
              </Button>
            </form>
          ) : null}
          <Button
            variant="outline"
            size="sm"
            onClick={handleOpenImport}
            disabled={isReadOnly}
            title={
              isReadOnly ? "Importing requires an active Supabase connection" : undefined
            }
          >
            Import CSV
          </Button>
          <Button
            variant="primary"
            size="sm"
            onClick={handleOpenModal}
            disabled={isReadOnly}
            title={
              isReadOnly ? "Add prospects once live data is enabled" : undefined
            }
          >
            + New Prospect
          </Button>
        </div>
      }
      badges={headerBadges}
      stats={kpiCards}
    >
      <PageTabs
        tabs={["Overview", "Pipeline", "Forecast"]}
        activeTab={activeTab}
        onTabChange={setActiveTab}
      />

      {isSampleData ? (
        <div className="rounded-md border border-indigo-200 bg-indigo-50 p-3 text-xs text-indigo-800">
          You’re viewing demo pipeline data. Configure Supabase credentials to
          load live opportunities and unlock pipeline automations.
        </div>
      ) : null}

      {syncMessage ? (
        <div className="rounded-md border border-sky-200 bg-sky-50 p-3 text-xs text-sky-800">
          {syncMessage}
        </div>
      ) : null}
      {automationMessage ? (
        <div className="rounded-md border border-emerald-200 bg-emerald-50 p-3 text-xs text-emerald-700">
          {automationMessage}
        </div>
      ) : null}
      {alertMessage ? (
        <div className="rounded-md border border-amber-200 bg-amber-50 p-3 text-xs text-amber-700">
          {alertMessage}
        </div>
      ) : null}

      {activeTab === "Overview" && (
        <div className="space-y-4">
          <div className={cn(TRS_CARD, "p-4")}>
            <div className="space-y-1">
              <h2 className="text-lg font-semibold text-black">
                Sales Pipeline Overview
              </h2>
              <p className="text-sm text-gray-500">
                Track prospects through your sales funnel
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-3 lg:grid-cols-5">
            {[
              "Prospect",
              "Qualify",
              "Proposal",
              "Negotiation",
              "ClosedWon",
            ].map((stage) => {
              const count = opportunitiesByStage[stage]?.length || 0;
              const value =
                opportunitiesByStage[stage]?.reduce(
                  (sum, opp) => sum + opp.amount,
                  0,
                ) || 0;

              return (
                <Card key={stage} className={cn(TRS_CARD)}>
                  <CardContent className="p-4">
                    <div className="mb-2 text-xs font-medium uppercase text-gray-500">
                      {stage === "ClosedWon" ? "Closed Won" : stage}
                    </div>
                    <div className="mb-1 text-2xl font-semibold text-black">
                      {count}
                    </div>
                    <div className="text-sm text-gray-600">
                      {(value / 1000).toFixed(0)}K
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>

          <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
            <Card className={cn(TRS_CARD)}>
              <CardContent className="p-4">
                <h3 className="mb-3 font-semibold">Recent Activity (7 days)</h3>
                <div className="space-y-2">
                  {recentlyMovedDeals.length === 0 ? (
                    <p className="text-sm text-gray-500">No recent activity</p>
                  ) : (
                    recentlyMovedDeals.slice(0, 5).map((deal) => (
                      <div
                        key={deal.id}
                        className="flex items-center justify-between rounded bg-gray-50 p-2 text-sm"
                      >
                        <div>
                          <div className="font-medium">{deal.name}</div>
                          <div className="text-xs text-gray-500">
                            {deal.client?.name}
                          </div>
                        </div>
                        <Badge variant="outline">{deal.stage}</Badge>
                      </div>
                    ))
                  )}
                </div>
              </CardContent>
            </Card>

            <Card className={cn(TRS_CARD)}>
              <CardContent className="p-4">
                <h3 className="mb-3 font-semibold">At-Risk Deals (30+ days)</h3>
                <div className="space-y-2">
                  {atRiskDeals.length === 0 ? (
                    <p className="text-sm text-gray-500">No deals at risk</p>
                  ) : (
                    atRiskDeals.slice(0, 5).map((deal) => {
                      const updated = new Date(deal.updated_at);
                      const daysStale = Math.floor(
                        (Date.now() - updated.getTime()) /
                          (1000 * 60 * 60 * 24),
                      );

                      return (
                        <div
                          key={deal.id}
                          className="flex items-center justify-between rounded bg-yellow-50 p-2 text-sm"
                        >
                          <div>
                            <div className="font-medium">{deal.name}</div>
                            <div className="text-xs text-gray-500">
                              {deal.client?.name}
                            </div>
                          </div>
                          <Badge variant="warning">{daysStale}d</Badge>
                        </div>
                      );
                    })
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      )}

      {activeTab === "Pipeline" && (
        <div className="space-y-4">
          <div className={cn(TRS_CARD, "p-4")}>
            <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
              <div className="space-y-1">
                <h2 className="text-lg font-semibold text-black">
                  Pipeline Kanban Board
                </h2>
                <p className="text-sm text-gray-500">
                  Drag and drop deals to move them through stages
                </p>
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleOpenImport}
                  disabled={isReadOnly}
                  title={
                    isReadOnly
                      ? "Importing requires an active Supabase connection"
                      : undefined
                  }
                >
                  Import CSV
                </Button>
                <Button
                  variant="primary"
                  size="sm"
                  onClick={handleOpenModal}
                  disabled={isReadOnly}
                  title={
                    isReadOnly ? "Add prospects once live data is enabled" : undefined
                  }
                >
                  + New Prospect
                </Button>
              </div>
            </div>
          </div>

          <PipelineFilters
            opportunities={opportunities}
            onFilterChange={setFilteredOpportunities}
          />

          <PipelineKanban
            opportunitiesByStage={opportunitiesByStage}
            userId={userId}
            readOnly={isReadOnly}
          />
        </div>
      )}

      {activeTab === "Forecast" && (
        <div className="space-y-4">
          <Card className={cn(TRS_CARD)}>
            <CardContent className="space-y-4 p-4">
              <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
                <div>
                  <h3 className="text-lg font-semibold text-black">Scenario Planning</h3>
                  <p className="text-sm text-gray-600">
                    Toggle commit, upside, and best-case projections with variance tracking.
                  </p>
                </div>
                <div className="flex flex-wrap gap-2">
                  {scenarioKeys.map((key) => {
                    const projection = analytics.scenarios[key];
                    const isActive = selectedScenario === key;
                    return (
                      <Button
                        key={key}
                        variant={isActive ? "primary" : "outline"}
                        size="sm"
                        onClick={() => setSelectedScenario(key)}
                      >
                        {projection.label} · {formatCurrency(projection.value)}
                      </Button>
                    );
                  })}
                </div>
              </div>
              <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
                <div className="rounded-lg border border-gray-200 bg-white p-3">
                  <div className="text-xs uppercase text-gray-500">Projection</div>
                  <div className="text-xl font-semibold text-black">
                    {formatCurrency(activeScenario.value)}
                  </div>
                  <div className="text-xs text-gray-500">{activeScenario.description}</div>
                </div>
                <div className="rounded-lg border border-gray-200 bg-white p-3">
                  <div className="text-xs uppercase text-gray-500">Variance vs Target</div>
                  <div
                    className={cn(
                      "text-xl font-semibold",
                      activeScenario.variance >= 0 ? "text-emerald-600" : "text-rose-600",
                    )}
                  >
                    {formatVariance(activeScenario.variance)}
                  </div>
                  <div className="text-xs text-gray-500">
                    Goal {formatCurrency(quarterlyTarget)}
                  </div>
                </div>
                <div className="rounded-lg border border-gray-200 bg-white p-3">
                  <div className="text-xs uppercase text-gray-500">Coverage</div>
                  <div className="text-xl font-semibold text-black">
                    {activeCoveragePct.toFixed(0)}%
                  </div>
                  <div className="text-xs text-gray-500">
                    {activeScenario.coverage.toFixed(1)}x multiplier
                  </div>
                </div>
              </div>
              <div className="rounded-lg border border-dashed border-gray-200 bg-gray-50 p-3 text-xs text-gray-600">
                Commit {formatCurrency(analytics.scenarios.commit.value)} • Upside {" "}
                {formatCurrency(analytics.scenarios.upside.value)} • Best Case {" "}
                {formatCurrency(analytics.scenarios.best.value)} · Weighted coverage {" "}
                {weightedCoverage.toFixed(0)}% · Pipeline total {formatCurrency(analytics.pipelineTotal)}
              </div>
            </CardContent>
          </Card>

          <Card className={cn(TRS_CARD)}>
            <CardContent className="space-y-4 p-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-black">Stage-weighted Forecast</h3>
                <span className="text-xs text-gray-500">
                  Weighted total {formatCurrency(analytics.weightedTotal)}
                </span>
              </div>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Stage</TableHead>
                    <TableHead>Deals</TableHead>
                    <TableHead>Total</TableHead>
                    <TableHead>Weighted</TableHead>
                    <TableHead>Avg Prob</TableHead>
                    <TableHead>Historical Win</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {analytics.stageSummary.map((stage) => (
                    <TableRow key={stage.stage}>
                      <TableCell>{stage.stage}</TableCell>
                      <TableCell>{stage.deals}</TableCell>
                      <TableCell>{formatCurrency(stage.totalValue)}</TableCell>
                      <TableCell>{formatCurrency(stage.weightedValue)}</TableCell>
                      <TableCell>{stage.averageProbability.toFixed(0)}%</TableCell>
                      <TableCell>{(stage.historicalWinRate * 100).toFixed(0)}%</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>

          <Card className={cn(TRS_CARD)}>
            <CardContent className="space-y-4 p-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-black">Opportunity Scoring</h3>
                <span className="text-xs text-gray-500">
                  Historical win/loss data blended with agent signals
                </span>
              </div>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Opportunity</TableHead>
                    <TableHead>Stage</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead>Score</TableHead>
                    <TableHead>Signals</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {topScores.map((opp) => (
                    <TableRow key={opp.id}>
                      <TableCell>
                        <div className="font-medium text-sm text-black">{opp.name}</div>
                        <div className="text-xs text-gray-500">
                          {(opp.clientName || "No client") + " • " + (opp.ownerName || "Unassigned")}
                        </div>
                      </TableCell>
                      <TableCell>{opp.stage}</TableCell>
                      <TableCell>{formatCurrency(opp.amount)}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Badge
                            variant={
                              opp.riskLevel === "low"
                                ? "success"
                                : opp.riskLevel === "medium"
                                  ? "warning"
                                  : "destructive"
                            }
                          >
                            {opp.score}
                          </Badge>
                          <span className="text-xs capitalize text-gray-500">{opp.riskLevel} risk</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="text-xs text-gray-600">
                          {opp.signals.join(" • ")}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                  {!topScores.length && (
                    <TableRow>
                      <TableCell colSpan={5} className="py-4 text-center text-sm text-gray-500">
                        Add pipeline data to activate scoring insights.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>

          <Card className={cn(TRS_CARD)}>
            <CardContent className="space-y-4 p-4">
              <div className="grid gap-4 lg:grid-cols-2">
                <div>
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-semibold text-black">Risk Alerts</h3>
                    <Badge variant="outline">{riskAlerts.length} open</Badge>
                  </div>
                  <div className="mt-3 space-y-3">
                    {riskAlerts.length ? (
                      riskAlerts.slice(0, 5).map((alert) => (
                        <div
                          key={alert.id}
                          className="rounded-lg border border-gray-200 bg-white p-3 text-sm shadow-sm"
                        >
                          <div className="flex items-center justify-between gap-2">
                            <span className="font-medium text-black">{alert.summary}</span>
                            <Badge variant={severityVariant(alert.severity)}>{alert.type}</Badge>
                          </div>
                          {alert.detail ? (
                            <div className="mt-1 text-xs text-gray-500">{alert.detail}</div>
                          ) : null}
                        </div>
                      ))
                    ) : (
                      <p className="text-sm text-gray-500">All clear. Commit coverage is holding.</p>
                    )}
                  </div>
                </div>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-semibold text-black">Automation Schedule</h3>
                    <Badge variant="outline">{schedule.length} jobs</Badge>
                  </div>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Integration</TableHead>
                        <TableHead>Cadence</TableHead>
                        <TableHead>Next Run</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {schedule.map((job) => (
                        <TableRow key={job.id}>
                          <TableCell className="capitalize">{job.integration}</TableCell>
                          <TableCell>{job.cadence}</TableCell>
                          <TableCell>{formatNextRun(job)}</TableCell>
                        </TableRow>
                      ))}
                      {!schedule.length && (
                        <TableRow>
                          <TableCell colSpan={3} className="py-3 text-center text-sm text-gray-500">
                            Schedule automations to keep CRM, calendar, and billing in sync.
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                  <div className="text-xs text-gray-500">
                    Recent notifications:
                    {alertHistory.length ? (
                      <ul className="mt-1 space-y-1">
                        {alertHistory.slice(0, 3).map((alert) => (
                          <li key={`${alert.id}-${alert.loggedAt}`}>
                            <span className="font-medium text-gray-700">
                              {new Date(alert.loggedAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                            </span>{" "}
                            • {alert.summary}
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <span className="ml-1">Awaiting first alert push.</span>
                    )}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {!isReadOnly && showAddProspect ? (
        <AddProspectModal
          onClose={() => setShowAddProspect(false)}
          userId={userId}
        />
      ) : null}

      {!isReadOnly && showImportProspects ? (
        <ImportProspectsModal
          onClose={() => setShowImportProspects(false)}
          userId={userId}
        />
      ) : null}
    </PageTemplate>
  );
}
