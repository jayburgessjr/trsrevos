"use client";

import { Card } from "@/components/kit/Card";
import { getClientStats } from "@/core/clients/store";

export default function HealthPanel() {
  const d = getClientStats();
  return (
    <div className="grid gap-3" style={{ gridTemplateColumns: "repeat(12,minmax(0,1fr))" }}>
      <Card className="col-span-4 p-3">
        <div className="text-sm font-semibold text-black">Portfolio Health</div>
        <div className="mt-2 grid grid-cols-2 gap-2">
          <Kpi label="Avg Health" value={`${d.avgHealth}%`} />
          <Kpi label="At Risk" value={d.atRisk.toString()} />
          <Kpi label="Expansions" value={d.expansions.toString()} />
          <Kpi label="Churned" value={d.churned.toString()} />
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
