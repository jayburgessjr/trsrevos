"use client";

import { useMemo } from "react";
import { useRouter } from "next/navigation";

import { Card } from "@/components/kit/Card";
import { useWorkspaceClients } from "@/hooks/useWorkspaceClients";

export default function ChurnPanel() {
  const router = useRouter();
  const { clients, isLoading, error, usingFallback } = useWorkspaceClients();

  const highRisk = useMemo(
    () => clients.filter((client) => (client.churnRisk ?? 0) > 10),
    [clients],
  );

  return (
    <div className="grid gap-3" style={{ gridTemplateColumns: "repeat(12,minmax(0,1fr))" }}>
      <Card className="col-span-12 p-3">
        <div className="mb-2 flex items-start justify-between text-sm font-semibold text-black">
          <span>High-Risk Clients</span>
          {usingFallback && (
            <span className="text-[11px] font-medium text-amber-600">
              Showing cached snapshot
            </span>
          )}
        </div>

        {error && (
          <div className="mb-2 rounded-md border border-rose-200 bg-rose-50 p-2 text-[12px] text-rose-700">
            Unable to refresh live client risk data. The panel is showing the most recent
            cached records.
          </div>
        )}

        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-200 text-left text-[12px] text-gray-500">
              <th className="px-3 py-2">Client</th>
              <th className="px-3 py-2">Owner</th>
              <th className="px-3 py-2">Health</th>
              <th className="px-3 py-2">Churn Risk</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 border-t border-gray-200">
            {isLoading && clients.length === 0 ? (
              <tr>
                <td className="px-3 py-6 text-center text-gray-500" colSpan={4}>
                  Loading live workspace data…
                </td>
              </tr>
            ) : highRisk.length === 0 ? (
              <tr>
                <td className="px-3 py-6 text-center text-gray-500" colSpan={4}>
                  No clients currently flagged as high risk.
                </td>
              </tr>
            ) : (
              highRisk.map((client) => (
                <tr
                  key={client.id}
                  onClick={() => router.push(`/clients/${client.id}`)}
                  className="cursor-pointer transition hover:bg-gray-50"
                >
                  <td className="px-3 py-2 font-medium text-black">{client.name}</td>
                  <td className="px-3 py-2 text-gray-700">{client.ownerName ?? "—"}</td>
                  <td className="px-3 py-2 text-gray-700">
                    {client.health != null ? `${client.health}%` : "—"}
                  </td>
                  <td className="px-3 py-2 text-gray-700">
                    {client.churnRisk != null ? `${client.churnRisk}%` : "—"}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </Card>
    </div>
  );
}
