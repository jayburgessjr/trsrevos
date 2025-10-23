"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { ArrowUpDown } from "lucide-react";

type ClientRow = {
  id: string;
  name: string;
  status: string | null;
  phase: string | null;
  owner_id: string | null;
  arr: number | null;
  health: number | null;
  created_at: string | null;
  owner: { name: string | null } | { name: string | null }[] | null;
};

type OverviewData = {
  pipeline_stage?: string | null;
  pipeline_value?: number;
  weighted_value?: number;
  probability?: number | null;
  mrr?: number;
  ar_outstanding?: number;
};

type SortField = "name" | "phase" | "owner" | "pipeline_stage" | "mrr" | "arr" | "health";
type SortDirection = "asc" | "desc";

interface ClientsPortfolioTableProps {
  clients: ClientRow[];
  overviewMap: Map<string, OverviewData>;
}

export function ClientsPortfolioTable({ clients, overviewMap }: ClientsPortfolioTableProps) {
  const [sortField, setSortField] = useState<SortField>("name");
  const [sortDirection, setSortDirection] = useState<SortDirection>("asc");

  const sortedClients = useMemo(() => {
    const sorted = [...clients];

    sorted.sort((a, b) => {
      let aValue: any;
      let bValue: any;

      const aOverview = overviewMap.get(a.id);
      const bOverview = overviewMap.get(b.id);

      switch (sortField) {
        case "name":
          aValue = a.name.toLowerCase();
          bValue = b.name.toLowerCase();
          break;
        case "phase":
          aValue = (a.phase ?? "").toLowerCase();
          bValue = (b.phase ?? "").toLowerCase();
          break;
        case "owner":
          const aOwnerRecord = Array.isArray(a.owner) ? a.owner[0] : a.owner;
          const bOwnerRecord = Array.isArray(b.owner) ? b.owner[0] : b.owner;
          aValue = (aOwnerRecord?.name ?? a.owner_id ?? "").toLowerCase();
          bValue = (bOwnerRecord?.name ?? b.owner_id ?? "").toLowerCase();
          break;
        case "pipeline_stage":
          aValue = (aOverview?.pipeline_stage ?? "").toLowerCase();
          bValue = (bOverview?.pipeline_stage ?? "").toLowerCase();
          break;
        case "mrr":
          aValue = aOverview?.mrr ?? 0;
          bValue = bOverview?.mrr ?? 0;
          break;
        case "arr":
          aValue = a.arr ?? 0;
          bValue = b.arr ?? 0;
          break;
        case "health":
          aValue = a.health ?? 0;
          bValue = b.health ?? 0;
          break;
        default:
          return 0;
      }

      if (aValue < bValue) return sortDirection === "asc" ? -1 : 1;
      if (aValue > bValue) return sortDirection === "asc" ? 1 : -1;
      return 0;
    });

    return sorted;
  }, [clients, overviewMap, sortField, sortDirection]);

  const toggleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortDirection("asc");
    }
  };

  return (
    <div className="overflow-hidden rounded-xl border border-gray-200 bg-white">
      <table className="w-full text-sm">
        <thead className="bg-gray-50">
          <tr className="text-left text-[12px] text-gray-500">
            <th className="px-3 py-2">
              <button
                onClick={() => toggleSort("name")}
                className="flex items-center gap-1 hover:text-gray-900"
              >
                Client
                <ArrowUpDown className="h-3 w-3" />
              </button>
            </th>
            <th className="px-3 py-2">
              <button
                onClick={() => toggleSort("phase")}
                className="flex items-center gap-1 hover:text-gray-900"
              >
                Phase
                <ArrowUpDown className="h-3 w-3" />
              </button>
            </th>
            <th className="px-3 py-2">
              <button
                onClick={() => toggleSort("owner")}
                className="flex items-center gap-1 hover:text-gray-900"
              >
                Owner
                <ArrowUpDown className="h-3 w-3" />
              </button>
            </th>
            <th className="px-3 py-2">
              <button
                onClick={() => toggleSort("pipeline_stage")}
                className="flex items-center gap-1 hover:text-gray-900"
              >
                Pipeline Stage
                <ArrowUpDown className="h-3 w-3" />
              </button>
            </th>
            <th className="px-3 py-2">
              <button
                onClick={() => toggleSort("mrr")}
                className="flex items-center gap-1 hover:text-gray-900"
              >
                MRR
                <ArrowUpDown className="h-3 w-3" />
              </button>
            </th>
            <th className="px-3 py-2">
              <button
                onClick={() => toggleSort("arr")}
                className="flex items-center gap-1 hover:text-gray-900"
              >
                ARR
                <ArrowUpDown className="h-3 w-3" />
              </button>
            </th>
            <th className="px-3 py-2">
              <button
                onClick={() => toggleSort("health")}
                className="flex items-center gap-1 hover:text-gray-900"
              >
                Health
                <ArrowUpDown className="h-3 w-3" />
              </button>
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-200">
          {sortedClients.length === 0 ? (
            <tr>
              <td className="px-4 py-6 text-center text-gray-500" colSpan={7}>
                No clients found. Close a deal from pipeline to see it here.
              </td>
            </tr>
          ) : (
            sortedClients.map((client) => {
              const overview = overviewMap.get(client.id);
              const ownerRecord = Array.isArray(client.owner)
                ? client.owner[0]
                : client.owner;
              const ownerName = ownerRecord?.name ?? client.owner_id ?? "—";
              return (
                <tr key={client.id} className="hover:bg-gray-50">
                  <td className="px-3 py-2 font-medium text-black">
                    <Link href={`/clients/${client.id}`} className="hover:underline">
                      {client.name}
                    </Link>
                  </td>
                  <td className="px-3 py-2 text-gray-700">{client.phase ?? "—"}</td>
                  <td className="px-3 py-2 text-gray-700">{ownerName}</td>
                  <td className="px-3 py-2 text-gray-700">
                    {overview?.pipeline_stage ?? "—"}
                  </td>
                  <td className="px-3 py-2 text-gray-700">
                    ${overview?.mrr ? overview.mrr.toLocaleString() : "0"}
                  </td>
                  <td className="px-3 py-2 text-gray-700">
                    ${client.arr ? client.arr.toLocaleString() : "0"}
                  </td>
                  <td className="px-3 py-2 text-gray-700">{client.health ?? "—"}</td>
                </tr>
              );
            })
          )}
        </tbody>
      </table>
    </div>
  );
}
