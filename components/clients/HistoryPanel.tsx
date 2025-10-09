"use client";

import { Card } from "@/components/kit/Card";

export default function HistoryPanel() {
  return (
    <div className="grid gap-3" style={{ gridTemplateColumns: "repeat(12,minmax(0,1fr))" }}>
      <Card className="col-span-12 p-4">
        <div className="mb-2 text-sm font-semibold text-black">Engagement History</div>
        <div className="space-y-1 text-[13px] text-gray-700">
          <p>• 09/15 – Helio Systems upgraded to Architecture phase.</p>
          <p>• 09/12 – OmniVantage completed Compounding deployment.</p>
          <p>• 09/08 – Northwave entered Data tuning sprint.</p>
          <p>• 09/01 – Helio expansion approved, +$18K ARR.</p>
        </div>
      </Card>
    </div>
  );
}
