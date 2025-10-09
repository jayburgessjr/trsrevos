"use client";
import { cn } from "@/lib/utils";

function MiniSpark({ trend }: { trend: "up" | "down" | "flat" }) {
  const d = trend === "up" ? "M2,18 L8,12 L14,14 L20,6" : trend === "down" ? "M2,6 L8,12 L14,10 L20,18" : "M2,12 L20,12";
  return (
    <svg width="96" height="36" viewBox="0 0 22 20" className="text-gray-400">
      <path d={d} fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
}

export function StatCard(
  { label, value, delta, trend = "flat" }:
  { label: string; value: string; delta: string; trend?: "up" | "down" | "flat" }
) {
  return (
    <div className="rounded-xl border bg-white border-gray-200 p-3">
      <div className="flex items-center justify-between">
        <div>
          <div className="text-[11px] text-gray-500">{label}</div>
          <div className="text-[22px] font-semibold leading-tight mt-1 text-black">{value}</div>
          <div
            className={cn(
              "text-[11px] mt-1 inline-flex items-center gap-1",
              trend === "down" ? "text-gray-700" : trend === "up" ? "text-gray-600" : "text-gray-500",
            )}
          >
            {delta}
          </div>
        </div>
        <MiniSpark trend={trend} />
      </div>
    </div>
  );
}
