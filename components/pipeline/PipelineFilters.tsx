"use client";

import { useEffect, useState } from "react";
import { Input } from "@/ui/input";
import { Button } from "@/ui/button";
import { cn } from "@/lib/utils";
import type { OpportunityWithNotes } from "@/core/pipeline/actions";

type PipelineFiltersProps = {
  opportunities: OpportunityWithNotes[];
  onFilterChange: (filtered: OpportunityWithNotes[]) => void;
};

type Filters = {
  search: string;
  owner: string;
  minAmount: string;
  maxAmount: string;
  stage: string;
  minProbability: string;
};

export function PipelineFilters({ opportunities, onFilterChange }: PipelineFiltersProps) {
  const [filters, setFilters] = useState<Filters>({
    search: "",
    owner: "",
    minAmount: "",
    maxAmount: "",
    stage: "",
    minProbability: "",
  });
  const [isExpanded, setIsExpanded] = useState(false);
  const [filteredCount, setFilteredCount] = useState(opportunities.length);

  useEffect(() => {
    setFilteredCount(opportunities.length);
  }, [opportunities]);

  // Get unique owners for filter dropdown
  const uniqueOwners = Array.from(
    new Set(
      opportunities
        .map((opp) => opp.owner?.name)
        .filter((name): name is string => !!name)
    )
  ).sort();

  const applyFilters = (newFilters: Filters) => {
    setFilters(newFilters);

    let filtered = [...opportunities];

    // Search filter (name or client name)
    if (newFilters.search.trim()) {
      const searchLower = newFilters.search.toLowerCase();
      filtered = filtered.filter(
        (opp) =>
          opp.name.toLowerCase().includes(searchLower) ||
          opp.client?.name?.toLowerCase().includes(searchLower)
      );
    }

    // Owner filter
    if (newFilters.owner) {
      filtered = filtered.filter((opp) => opp.owner?.name === newFilters.owner);
    }

    // Amount range filter
    if (newFilters.minAmount) {
      const min = parseFloat(newFilters.minAmount);
      filtered = filtered.filter((opp) => opp.amount >= min);
    }
    if (newFilters.maxAmount) {
      const max = parseFloat(newFilters.maxAmount);
      filtered = filtered.filter((opp) => opp.amount <= max);
    }

    // Stage filter
    if (newFilters.stage) {
      filtered = filtered.filter((opp) => opp.stage === newFilters.stage);
    }

    // Probability filter
    if (newFilters.minProbability) {
      const minProb = parseInt(newFilters.minProbability);
      filtered = filtered.filter((opp) => opp.probability >= minProb);
    }

    setFilteredCount(filtered.length);
    onFilterChange(filtered);
  };

  const handleClearFilters = () => {
    const emptyFilters: Filters = {
      search: "",
      owner: "",
      minAmount: "",
      maxAmount: "",
      stage: "",
      minProbability: "",
    };
    setFilters(emptyFilters);
    setFilteredCount(opportunities.length);
    onFilterChange(opportunities);
  };

  const hasActiveFilters =
    filters.search ||
    filters.owner ||
    filters.minAmount ||
    filters.maxAmount ||
    filters.stage ||
    filters.minProbability;

  return (
    <div className="space-y-3">
      {/* Search Bar - Always Visible */}
      <div className="flex items-center gap-2">
        <div className="flex-1 relative">
          <Input
            value={filters.search}
            onChange={(e) => applyFilters({ ...filters, search: e.target.value })}
            placeholder="Search deals by name or company..."
            className="pr-8"
          />
          {filters.search && (
            <button
              onClick={() => applyFilters({ ...filters, search: "" })}
              className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
            >
              ✕
            </button>
          )}
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={() => setIsExpanded(!isExpanded)}
          className={cn(
            "flex items-center gap-2",
            hasActiveFilters && "border-black text-black"
          )}
        >
          <span>🔍</span>
          <span>Filters</span>
          {hasActiveFilters && (
            <span className="ml-1 px-1.5 py-0.5 bg-black text-white text-xs rounded-full">
              {
                Object.values(filters).filter((v) => v && v !== filters.search)
                  .length
              }
            </span>
          )}
        </Button>
        {hasActiveFilters && (
          <Button variant="ghost" size="sm" onClick={handleClearFilters}>
            Clear All
          </Button>
        )}
      </div>

      {/* Advanced Filters - Collapsible */}
      {isExpanded && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3 p-4 bg-gray-50 rounded-md">
          {/* Owner Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Owner
            </label>
            <select
              value={filters.owner}
              onChange={(e) => applyFilters({ ...filters, owner: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
            >
              <option value="">All Owners</option>
              {uniqueOwners.map((owner) => (
                <option key={owner} value={owner}>
                  {owner}
                </option>
              ))}
            </select>
          </div>

          {/* Amount Range */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Min Amount ($)
            </label>
            <Input
              type="number"
              value={filters.minAmount}
              onChange={(e) =>
                applyFilters({ ...filters, minAmount: e.target.value })
              }
              placeholder="0"
              className="text-sm"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Max Amount ($)
            </label>
            <Input
              type="number"
              value={filters.maxAmount}
              onChange={(e) =>
                applyFilters({ ...filters, maxAmount: e.target.value })
              }
              placeholder="1000000"
              className="text-sm"
            />
          </div>

          {/* Stage Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Stage
            </label>
            <select
              value={filters.stage}
              onChange={(e) => applyFilters({ ...filters, stage: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
            >
              <option value="">All Stages</option>
              <option value="Prospect">Prospect</option>
              <option value="Qualify">Qualify</option>
              <option value="Proposal">Proposal</option>
              <option value="Negotiation">Negotiation</option>
              <option value="ClosedWon">Closed Won</option>
              <option value="ClosedLost">Closed Lost</option>
            </select>
          </div>

          {/* Probability Filter */}
          <div className="md:col-span-2 lg:col-span-1">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Min Probability (%)
            </label>
            <Input
              type="number"
              value={filters.minProbability}
              onChange={(e) =>
                applyFilters({ ...filters, minProbability: e.target.value })
              }
              placeholder="0"
              min="0"
              max="100"
              className="text-sm"
            />
          </div>

          {/* Filter Stats */}
          <div className="md:col-span-2 lg:col-span-3 flex items-end">
            <div className="text-sm text-gray-600">
              Showing {filteredCount} of {opportunities.length} deals
              {hasActiveFilters && (
                <span className="ml-2 text-black font-medium">
                  (filtered)
                </span>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
