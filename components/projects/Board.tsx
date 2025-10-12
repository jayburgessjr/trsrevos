"use client"

import Link from "next/link"

import type { ClientRow } from "@/core/projects/queries"

const DEFAULT_STAGES = ["Discovery", "Data", "Algorithm", "Architecture", "Closed"] as const

export function ProjectBoard({ rows }: { rows: ClientRow[] }) {
  const extraStages = Array.from(
    new Set(
      rows
        .map((row) => row.stage)
        .filter((stage): stage is string => Boolean(stage) && !DEFAULT_STAGES.includes(stage as (typeof DEFAULT_STAGES)[number])),
    ),
  ).sort((a, b) => a.localeCompare(b))

  const stageOrder = [...DEFAULT_STAGES, ...extraStages]
  const stageBuckets = new Map<string, ClientRow[]>()
  stageOrder.forEach((stage) => {
    stageBuckets.set(stage, [])
  })

  rows.forEach((row) => {
    const stage = row.stage && stageBuckets.has(row.stage) ? row.stage : "Discovery"
    stageBuckets.get(stage)!.push(row)
  })

  return (
    <div className="grid gap-3 md:grid-cols-5">
      {stageOrder.map((stage) => {
        const bucket = stageBuckets.get(stage) ?? []
        return (
          <div key={stage} className="rounded-xl border border-gray-200 bg-white p-3">
            <div className="text-xs font-medium text-gray-700">{stage}</div>
            <div className="mt-2 space-y-2">
              {bucket.map((row) => (
                <Link
                  key={row.id}
                  href={`/clients/${row.id}`}
                  className="block rounded-lg border border-gray-200 p-2 transition hover:bg-gray-50"
                >
                  <div className="text-sm font-medium text-black">{row.name}</div>
                  <div className="text-[11px] text-gray-500">Health: {row.health ?? "-"}</div>
                </Link>
              ))}
              {!bucket.length ? (
                <div className="text-[12px] text-gray-500">No items</div>
              ) : null}
            </div>
          </div>
        )
      })}
    </div>
  )
}
