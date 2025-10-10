"use client";

import { useState, useTransition, useMemo } from "react";
import { PageDescription, PageTitle } from "@/ui/page-header";
import { Card, CardContent } from "@/ui/card";
import { Badge } from "@/ui/badge";
import { Button } from "@/ui/button";
import { cn } from "@/lib/utils";
import { TRS_CARD, TRS_SUBTITLE } from "@/lib/style";
import {
  OpportunityWithNotes,
  moveOpportunityStage,
  addOpportunityNote,
} from "@/core/pipeline/actions";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/ui/table";
import { Input } from "@/ui/input";

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
};

export default function PipelineClient({ opportunities, metrics }: Props) {
  const [activeTab, setActiveTab] = useState("Overview");
  const [selectedDeal, setSelectedDeal] = useState<OpportunityWithNotes | null>(null);
  const [newNote, setNewNote] = useState("");
  const [stageFilter, setStageFilter] = useState<string>("All");
  const [sortBy, setSortBy] = useState<string>("amount-desc");
  const [searchQuery, setSearchQuery] = useState("");
  const [isPending, startTransition] = useTransition();

  const stages = ["All", "New", "Qualify", "Proposal", "Negotiation", "ClosedWon", "ClosedLost"];

  // Filter and sort
  const filteredDeals = useMemo(() => {
    let filtered = opportunities;

    if (stageFilter !== "All") {
      filtered = filtered.filter((d) => d.stage === stageFilter);
    }

    if (searchQuery) {
      filtered = filtered.filter(
        (d) =>
          d.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          d.client?.name.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    return filtered.sort((a, b) => {
      switch (sortBy) {
        case "amount-desc":
          return b.amount - a.amount;
        case "amount-asc":
          return a.amount - b.amount;
        case "probability-desc":
          return (b.probability || 0) - (a.probability || 0);
        case "probability-asc":
          return (a.probability || 0) - (b.probability || 0);
        case "name-asc":
          return a.name.localeCompare(b.name);
        case "name-desc":
          return b.name.localeCompare(a.name);
        default:
          return 0;
      }
    });
  }, [opportunities, stageFilter, searchQuery, sortBy]);

  // Calculate quarterly target and coverage
  const quarterlyTarget = 1200000; // $1.2M target
  const coverage = (metrics.totalWeighted / quarterlyTarget) * 100;

  const handleMoveStage = async (dealId: string, newStage: string) => {
    startTransition(async () => {
      const result = await moveOpportunityStage(dealId, newStage);
      if (!result.success) {
        alert(`Error: ${result.error}`);
      }
    });
  };

  const handleAddNote = async (opportunityId: string, authorId: string) => {
    if (!newNote.trim()) return;

    startTransition(async () => {
      const result = await addOpportunityNote(opportunityId, newNote, authorId);
      if (result.success) {
        setNewNote("");
      } else {
        alert(`Error: ${result.error}`);
      }
    });
  };

  return (
    <div className="mx-auto max-w-7xl space-y-4 px-4 py-4">
      {/* KPI Cards - Always Visible */}
      <div className="grid grid-cols-1 gap-3 md:grid-cols-2 lg:grid-cols-4">
        <Card className={cn(TRS_CARD)}>
          <CardContent className="p-4 space-y-2">
            <div className={TRS_SUBTITLE}>Weighted Pipeline</div>
            <div className="text-2xl font-semibold text-black">
              ${(metrics.totalWeighted / 1000).toFixed(0)}K
            </div>
            <div className="flex items-center gap-2 text-xs text-gray-600">
              <span className="font-medium text-gray-700">↑ 18%</span>
              <span>vs last month</span>
            </div>
          </CardContent>
        </Card>

        <Card className={cn(TRS_CARD)}>
          <CardContent className="p-4 space-y-2">
            <div className={TRS_SUBTITLE}>Win Rate</div>
            <div className="text-2xl font-semibold text-black">{metrics.winRate.toFixed(0)}%</div>
            <div className="flex items-center gap-2 text-xs text-gray-600">
              <span className="font-medium text-gray-700">↑ 5%</span>
              <span>vs last quarter</span>
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
              <span className="font-medium text-gray-700">↑ 12%</span>
              <span>vs target</span>
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
              <span className="font-medium text-gray-700">↓ 8 days</span>
              <span>faster</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tab Navigation */}
      <div className="flex items-center gap-2 border-b border-gray-200 pb-2">
        {["Overview", "Commit", "Forecast", "Health"].map((tab) => (
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

      {/* Tab Content */}
      {activeTab === "Overview" && (
        <div className="space-y-4">
          <div className={cn(TRS_CARD, "p-4 space-y-3")}>
            <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
              <div className="space-y-1">
                <PageTitle className="text-lg font-semibold text-black">
                  Pipeline & Sales Intelligence
                </PageTitle>
                <PageDescription className="text-sm text-gray-500">
                  AI-powered forecasting, coverage analysis, and proactive deal insights
                </PageDescription>
              </div>
              <Button variant="primary" size="sm">
                + New Prospect
              </Button>
            </div>
            <div className="flex flex-wrap items-center gap-3 text-sm text-gray-600">
              <Badge variant={coverage >= 100 ? "success" : "outline"}>
                Coverage: {coverage.toFixed(0)}%
              </Badge>
              <span>${(metrics.totalWeighted / 1000).toFixed(0)}K weighted pipeline</span>
            </div>
          </div>

          {/* Filters */}
          <div className="flex flex-wrap items-center gap-3">
            <Input
              placeholder="Search deals..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="max-w-xs"
            />
            <select
              value={stageFilter}
              onChange={(e) => setStageFilter(e.target.value)}
              className="rounded-md border border-gray-200 px-3 py-2 text-sm"
            >
              {stages.map((stage) => (
                <option key={stage} value={stage}>
                  {stage}
                </option>
              ))}
            </select>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="rounded-md border border-gray-200 px-3 py-2 text-sm"
            >
              <option value="amount-desc">Amount (High to Low)</option>
              <option value="amount-asc">Amount (Low to High)</option>
              <option value="probability-desc">Probability (High to Low)</option>
              <option value="probability-asc">Probability (Low to High)</option>
              <option value="name-asc">Name (A-Z)</option>
              <option value="name-desc">Name (Z-A)</option>
            </select>
          </div>

          {/* Pipeline Table */}
          <Card className={cn(TRS_CARD)}>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Deal</TableHead>
                    <TableHead>Client</TableHead>
                    <TableHead>Stage</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead>Probability</TableHead>
                    <TableHead>Weighted</TableHead>
                    <TableHead>Owner</TableHead>
                    <TableHead>Close Date</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredDeals.map((deal) => (
                    <TableRow key={deal.id} onClick={() => setSelectedDeal(deal)} className="cursor-pointer">
                      <TableCell className="font-medium">{deal.name}</TableCell>
                      <TableCell>{deal.client?.name || "N/A"}</TableCell>
                      <TableCell>
                        <Badge variant="outline">{deal.stage}</Badge>
                      </TableCell>
                      <TableCell>${(deal.amount / 1000).toFixed(0)}K</TableCell>
                      <TableCell>{deal.probability}%</TableCell>
                      <TableCell>
                        ${((deal.amount * (deal.probability || 0)) / 100000).toFixed(0)}K
                      </TableCell>
                      <TableCell>{deal.owner?.name || "N/A"}</TableCell>
                      <TableCell>
                        {deal.close_date
                          ? new Date(deal.close_date).toLocaleDateString()
                          : "TBD"}
                      </TableCell>
                      <TableCell>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedDeal(deal);
                          }}
                        >
                          View
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </div>
      )}

      {activeTab === "Commit" && (
        <Card className={cn(TRS_CARD, "p-6")}>
          <div className="text-center text-gray-500">
            <h3 className="text-lg font-semibold mb-2">Commit Forecast</h3>
            <p>Coming soon: Commit forecast with scenario planning</p>
          </div>
        </Card>
      )}

      {activeTab === "Forecast" && (
        <Card className={cn(TRS_CARD, "p-6")}>
          <div className="text-center text-gray-500">
            <h3 className="text-lg font-semibold mb-2">Forecast Analysis</h3>
            <p>Coming soon: Monte Carlo simulations and velocity intelligence</p>
          </div>
        </Card>
      )}

      {activeTab === "Health" && (
        <Card className={cn(TRS_CARD, "p-6")}>
          <div className="text-center text-gray-500">
            <h3 className="text-lg font-semibold mb-2">Pipeline Health</h3>
            <p>Coming soon: Health diagnostics and risk analysis</p>
          </div>
        </Card>
      )}

      {/* Deal Detail Modal */}
      {selectedDeal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <Card className={cn(TRS_CARD, "max-w-2xl w-full max-h-[80vh] overflow-y-auto")}>
            <CardContent className="p-6 space-y-4">
              <div className="flex items-start justify-between">
                <div>
                  <h2 className="text-xl font-semibold">{selectedDeal.name}</h2>
                  <p className="text-sm text-gray-500">{selectedDeal.client?.name}</p>
                </div>
                <Button variant="ghost" size="sm" onClick={() => setSelectedDeal(null)}>
                  ✕
                </Button>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-500">Amount</p>
                  <p className="font-medium">${(selectedDeal.amount / 1000).toFixed(0)}K</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Stage</p>
                  <p className="font-medium">{selectedDeal.stage}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Probability</p>
                  <p className="font-medium">{selectedDeal.probability}%</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Close Date</p>
                  <p className="font-medium">
                    {selectedDeal.close_date
                      ? new Date(selectedDeal.close_date).toLocaleDateString()
                      : "TBD"}
                  </p>
                </div>
              </div>

              <div>
                <h3 className="font-semibold mb-2">Notes</h3>
                <div className="space-y-2 max-h-60 overflow-y-auto">
                  {selectedDeal.notes?.map((note) => (
                    <div key={note.id} className="p-3 bg-gray-50 rounded-lg">
                      <p className="text-sm">{note.body}</p>
                      <p className="text-xs text-gray-500 mt-1">
                        {new Date(note.created_at).toLocaleString()}
                      </p>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <h3 className="font-semibold mb-2">Add Note</h3>
                <div className="flex gap-2">
                  <Input
                    placeholder="Add a note..."
                    value={newNote}
                    onChange={(e) => setNewNote(e.target.value)}
                    disabled={isPending}
                  />
                  <Button
                    onClick={() =>
                      handleAddNote(selectedDeal.id, selectedDeal.owner_id)
                    }
                    disabled={isPending}
                  >
                    Add
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
