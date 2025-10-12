"use client"

import { useMemo } from "react"
import { useRouter } from "next/navigation"

import type { ClientOverview, ClientRow } from "@/core/projects/queries"

import type { Filters } from "./Filters"

type OpportunitySummary = {
  clientId: string
  nextStep: string | null
  dueDate: string | null
  stage: string | null
}

type OwnerOption = {
  id: string
  label: string
}

const currencyFormatter = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  maximumFractionDigits: 0,
})

const dateFormatter = new Intl.DateTimeFormat("en-US", {
  month: "short",
  day: "numeric",
})

export function ProjectsTable({
  rows,
  overview,
  filters,
  owners,
  opportunities,
}: {
  rows: ClientRow[]
  overview: ClientOverview[]
  filters: Filters
  owners: OwnerOption[]
  opportunities: OpportunitySummary[]
}) {
  const router = useRouter()

  const overviewMap = useMemo(() => {
    return overview.reduce<Map<string, ClientOverview>>((map, entry) => {
      map.set(entry.client_id, entry)
      return map
    }, new Map())
  }, [overview])

  const ownerMap = useMemo(() => {
    return owners.reduce<Map<string, string>>((map, owner) => {
      map.set(owner.id, owner.label)
      return map
    }, new Map())
  }, [owners])

  const opportunityMap = useMemo(() => {
    return opportunities.reduce<Map<string, OpportunitySummary>>((map, summary) => {
      map.set(summary.clientId, summary)
      return map
    }, new Map())
  }, [opportunities])

  const filteredRows = useMemo(() => {
    return rows.filter((row) => {
      if (filters.ownerId && row.owner_id !== filters.ownerId) {
        return false
      }
      if (filters.stages.length && !filters.stages.includes(row.stage ?? "")) {
        return false
      }
      if (filters.health.length && !filters.health.includes(row.health ?? "")) {
        return false
      }
      if (filters.q) {
        const search = filters.q.toLowerCase()
        const opportunityEntry = opportunityMap.get(row.id)
        const ownerName = ownerMap.get(row.owner_id ?? "") ?? ""
        const haystack = `${row.name} ${row.stage ?? ""} ${
          opportunityEntry?.nextStep ?? ""
        } ${opportunityEntry?.stage ?? ""} ${ownerName}`.toLowerCase()
        if (!haystack.includes(search)) {
          return false
        }
      }
      return true
    })
  }, [filters, opportunityMap, ownerMap, rows])

  if (!rows.length) {
    return (
      <div className="rounded-xl border border-gray-200 bg-white p-6 text-sm text-gray-600">
        No active clients found. Add active clients in Supabase to populate this view.
      </div>
    )
  }

  return (
    <div className="overflow-hidden rounded-xl border border-gray-200 bg-white">
      <table className="w-full text-sm">
        <thead className="border-b border-gray-200">
          <tr className="text-left text-[12px] text-gray-600">
            <th className="px-3 py-2">Client</th>
            <th className="px-3 py-2">Stage</th>
            <th className="px-3 py-2">Health</th>
            <th className="px-3 py-2">Owner</th>
            <th className="px-3 py-2">ARR</th>
            <th className="px-3 py-2">Weighted Pipeline</th>
            <th className="px-3 py-2">Next Step</th>
            <th className="px-3 py-2">Due</th>
          </tr>
        </thead>
        <tbody className="divide-y">
          {filteredRows.map((row) => {
            const overviewEntry = overviewMap.get(row.id)
            const opportunityEntry = opportunityMap.get(row.id)
            const ownerLabel = row.owner_id ? ownerMap.get(row.owner_id) : null
            const arrValue = row.arr ?? null
            const weightedValue = overviewEntry?.weighted_value ?? null
            const dueDate = opportunityEntry?.dueDate ?? null
            const dueDateLabel = dueDate
              ? (() => {
                  const parsed = new Date(dueDate)
                  return Number.isNaN(parsed.getTime())
                    ? dueDate
                    : dateFormatter.format(parsed)
                })()
              : "—"

            return (
              <tr
                key={row.id}
                className="cursor-pointer transition hover:bg-gray-50"
                onClick={() => router.push(`/clients/${row.id}`)}
              >
                <td className="px-3 py-2 text-black">{row.name}</td>
                <td className="px-3 py-2">{row.stage ?? "-"}</td>
                <td className="px-3 py-2">{row.health ?? "-"}</td>
                <td className="px-3 py-2">{ownerLabel ?? row.owner_id ?? "-"}</td>
                <td className="px-3 py-2">
                  {arrValue != null ? currencyFormatter.format(arrValue) : "-"}
                </td>
                <td className="px-3 py-2">
                  {weightedValue != null ? currencyFormatter.format(weightedValue) : "-"}
                </td>
                <td className="px-3 py-2">
                  {opportunityEntry?.nextStep ? opportunityEntry.nextStep : "—"}
                </td>
                <td className="px-3 py-2">{dueDateLabel}</td>
              </tr>
            )
          })}
        </tbody>
      </table>
      {!filteredRows.length ? (
        <div className="p-6 text-sm text-gray-600">No projects match current filters.</div>
      ) : null}
    </div>
  )
}
