"use client";

import { useMemo } from "react";

import { Card } from "@/components/kit/Card";
import { useWorkspaceClients } from "@/hooks/useWorkspaceClients";

export default function HealthPanel() {
  const { clients, isLoading, error, usingFallback } = useWorkspaceClients();

  const stats = useMemo(() => {
    const total = clients.length || 1;
    const avgHealth = Math.round(
      clients.reduce((sum, client) => sum + (client.health ?? 0), 0) / total,
    );
    const atRisk = clients.filter((client) => (client.churnRisk ?? 0) >= 15).length;
    const expansions = clients.filter((client) => client.isExpansion).length;
    const churned = clients.filter((client) => client.status === "churned").length;

    return { avgHealth, atRisk, expansions, churned };
  }, [clients]);

  return (
    <div className="grid gap-3" style={{ gridTemplateColumns: "repeat(12,minmax(0,1fr))" }}>
      <Card className="col-span-4 p-3">
        <div className="flex items-center justify-between text-sm font-semibold text-black">
          <span>Portfolio Health</span>
          {usingFallback && (
            <span className="text-[11px] font-medium text-amber-600">Cached</span>
          )}
        </div>
        {error && (
          <div className="mt-2 rounded-md border border-rose-200 bg-rose-50 p-2 text-[12px] text-rose-700">
            Live health telemetry is temporarily unavailable.
          </div>
        )}
        <div className="mt-2 grid grid-cols-2 gap-2">
          <Kpi label="Avg Health" value={formatPercent(stats.avgHealth, isLoading)} />
          <Kpi label="At Risk" value={formatValue(stats.atRisk, isLoading)} />
          <Kpi label="Expansions" value={formatValue(stats.expansions, isLoading)} />
          <Kpi label="Churned" value={formatValue(stats.churned, isLoading)} />
        </div>
      </Card>
      <Card className="col-span-8 p-3">
        <div className="text-sm font-semibold text-black">Trendline (Stub)</div>
        <div className="mt-3 flex h-[180px] items-center justify-center rounded-md border border-gray-200 text-xs text-gray-500">
          Trend Graph Placeholder
        </div>
      </Card>
    </div>
  );
}

function Kpi({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-md border border-gray-200 bg-white p-2 text-center">
      <div className="text-[11px] text-gray-500">{label}</div>
      <div className="text-lg font-semibold text-black">{value}</div>
    </div>
  );
}

function formatValue(value: number, isLoading: boolean) {
  return isLoading ? "…" : value.toString();
}

function formatPercent(value: number, isLoading: boolean) {
  return isLoading ? "…" : `${value}%`;
}
