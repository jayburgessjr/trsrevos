"use client";

import Link from "next/link";

import type { ClientRow } from "@/core/projects/queries";

const STAGES = ["Discovery", "Data", "Algorithm", "Architecture", "Closed"] as const;

type StageKey = (typeof STAGES)[number];

export function ProjectBoard({ rows }: { rows: ClientRow[] }) {
  const stageBuckets = new Map<StageKey, ClientRow[]>();
  STAGES.forEach((stage) => {
    stageBuckets.set(stage, []);
  });

  rows.forEach((row) => {
    const stage = row.stage && STAGES.includes(row.stage as StageKey) ? (row.stage as StageKey) : "Discovery";
    stageBuckets.get(stage)!.push(row);
  });

  return (
    <div className="grid gap-3 md:grid-cols-5">
      {STAGES.map((stage) => {
        const bucket = stageBuckets.get(stage) ?? [];
        return (
          <div key={stage} className="rounded-xl border border-gray-200 bg-white p-3">
            <div className="text-xs font-medium text-gray-700">{stage}</div>
            <div className="mt-2 space-y-2">
              {bucket.map((row) => (
                <Link
                  key={row.id}
                  href={`/clients/${row.id}`}
                  className="block rounded-lg border border-gray-200 p-2 hover:bg-gray-50"
                >
                  <div className="text-sm font-medium text-black">{row.name}</div>
                  <div className="text-[11px] text-gray-500">
                    Health: {row.health ?? "-"}
                  </div>
                </Link>
              ))}
              {!bucket.length && (
                <div className="text-[12px] text-gray-500">No items</div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
