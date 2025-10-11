"use client";

import { useMemo, useState } from "react";

import { PageTemplate } from "@/components/layout/PageTemplate";
import type { PageTemplateBadge } from "@/components/layout/PageTemplate";
import { AddProspectModal } from "@/components/pipeline/AddProspectModal";
import { PipelineFilters } from "@/components/pipeline/PipelineFilters";
import { PipelineKanban } from "@/components/pipeline/PipelineKanban";
import type { OpportunityWithNotes } from "@/core/pipeline/actions";
import {
  PIPELINE_STAGE_LABELS,
  PIPELINE_STAGE_ORDER,
  type PipelineStage,
} from "@/core/pipeline/constants";
import { Badge } from "@/ui/badge";
import { Button } from "@/ui/button";
import { Card, CardContent } from "@/ui/card";
import { cn } from "@/lib/utils";
import { TRS_CARD, TRS_SUBTITLE } from "@/lib/style";

type Props = {
  opportunities: OpportunityWithNotes[];
  metrics: {
    totalValue: number;
    totalWeighted: number;
    dealCount: number;
    avgDealSize: number;
    winRate: number;
    avgSalesCycle: number;
  };
  userId: string;
};

export default function PipelineClient({ opportunities, metrics, userId }: Props) {
  const [activeTab, setActiveTab] = useState("Overview");
  const [showAddProspect, setShowAddProspect] = useState(false);
  const [filteredOpportunities, setFilteredOpportunities] =
    useState<OpportunityWithNotes[]>(opportunities);

  const handleOpenModal = () => {
    setShowAddProspect(true);
  };

  useMemo(() => {
    setFilteredOpportunities(opportunities);
  }, [opportunities]);

  const opportunitiesByStage = useMemo(() => {
    return PIPELINE_STAGE_ORDER.reduce<
      Partial<Record<PipelineStage, OpportunityWithNotes[]>>
    >((acc, stage) => {
      acc[stage] = filteredOpportunities.filter((opp) => opp.stage === stage);
      return acc;
    }, {});
  }, [filteredOpportunities]);

  const quarterlyTarget = 1_200_000;
  const coverage = (metrics.totalWeighted / quarterlyTarget) * 100;

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
            ${(metrics.totalWeighted / 1000).toFixed(0)}K
          </div>
          <div className="flex items-center gap-2 text-xs text-gray-600">
            <Badge variant={coverage >= 100 ? "success" : "outline"}>
              {coverage.toFixed(0)}% of goal
            </Badge>
          </div>
        </CardContent>
      </Card>

      <Card className={cn(TRS_CARD)}>
        <CardContent className="p-4 space-y-2">
          <div className={TRS_SUBTITLE}>Win Rate</div>
          <div className="text-2xl font-semibold text-black">{metrics.winRate.toFixed(0)}%</div>
          <div className="flex items-center gap-2 text-xs text-gray-600">
            <span className="font-medium text-gray-700">
              {(opportunitiesByStage.ClosedWon?.length || 0)} won
            </span>
            <span>/</span>
            <span>
              {(opportunitiesByStage.ClosedWon?.length || 0) +
                (opportunitiesByStage.ClosedLost?.length || 0)} closed
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
        <Button variant="primary" size="sm" onClick={handleOpenModal}>
          + New Prospect
        </Button>
      }
      badges={headerBadges}
      stats={kpiCards}
    >
      <div className="flex items-center gap-2 border-b border-gray-200 pb-2">
        {["Overview", "Pipeline", "Forecast"].map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={cn(
              "px-3 py-2 text-sm font-medium transition-colors",
              activeTab === tab
                ? "border-b-2 border-black text-black"
                : "text-gray-600 hover:text-black"
            )}
          >
            {tab}
          </button>
        ))}
      </div>

      {activeTab === "Overview" && (
        <div className="space-y-4">
          <div className={cn(TRS_CARD, "p-4")}>
            <div className="space-y-1">
              <h2 className="text-lg font-semibold text-black">Sales Pipeline Overview</h2>
              <p className="text-sm text-gray-500">
                Track prospects through your sales funnel
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-3 lg:grid-cols-5">
            {PIPELINE_STAGE_ORDER.filter((stage) => stage !== "ClosedLost").map((stage) => {
              const count = opportunitiesByStage[stage]?.length || 0;
              const value =
                opportunitiesByStage[stage]?.reduce((sum, opp) => sum + opp.amount, 0) || 0;

              return (
                <Card key={stage} className={cn(TRS_CARD)}>
                  <CardContent className="p-4">
                    <div className="mb-2 text-xs font-medium uppercase text-gray-500">
                      {PIPELINE_STAGE_LABELS[stage]}
                    </div>
                    <div className="mb-1 text-2xl font-semibold text-black">{count}</div>
                    <div className="text-sm text-gray-600">{(value / 1000).toFixed(0)}K</div>
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
                          <div className="text-xs text-gray-500">{deal.client?.name}</div>
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
                        (Date.now() - updated.getTime()) / (1000 * 60 * 60 * 24)
                      );

                      return (
                        <div
                          key={deal.id}
                          className="flex items-center justify-between rounded bg-yellow-50 p-2 text-sm"
                        >
                          <div>
                            <div className="font-medium">{deal.name}</div>
                            <div className="text-xs text-gray-500">{deal.client?.name}</div>
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
                <h2 className="text-lg font-semibold text-black">Pipeline Kanban Board</h2>
                <p className="text-sm text-gray-500">
                  Drag and drop deals to move them through stages
                </p>
              </div>
              <Button variant="primary" size="sm" onClick={handleOpenModal}>
                + New Prospect
              </Button>
            </div>
          </div>

          <PipelineFilters
            opportunities={opportunities}
            onFilterChange={setFilteredOpportunities}
          />

          <PipelineKanban opportunitiesByStage={opportunitiesByStage} userId={userId} />
        </div>
      )}

      {activeTab === "Forecast" && (
        <Card className={cn(TRS_CARD, "p-6")}>
          <div className="text-center text-gray-500">
            <h3 className="mb-2 text-lg font-semibold">Forecast Analysis</h3>
            <p>Coming soon: AI-powered forecasting and scenario planning</p>
          </div>
        </Card>
      )}

      {showAddProspect && (
        <AddProspectModal onClose={() => setShowAddProspect(false)} userId={userId} />
      )}
    </PageTemplate>
  );
}
