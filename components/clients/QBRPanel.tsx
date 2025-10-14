"use client";

import { useMemo } from "react";
import { useRouter } from "next/navigation";

import { Card } from "@/components/kit/Card";
import { useWorkspaceClients } from "@/hooks/useWorkspaceClients";

export default function QBRPanel() {
  const router = useRouter();
  const { clients, isLoading, error, usingFallback } = useWorkspaceClients();

  const sortedClients = useMemo(() => {
    return [...clients].sort((a, b) => {
      if (!a.qbrDate) return 1;
      if (!b.qbrDate) return -1;
      return a.qbrDate.localeCompare(b.qbrDate);
    });
  }, [clients]);

  return (
    <div className="grid gap-3" style={{ gridTemplateColumns: "repeat(12,minmax(0,1fr))" }}>
      <Card className="col-span-12 p-3">
        <div className="mb-2 flex items-start justify-between text-sm font-semibold text-black">
          <span>Upcoming QBRs</span>
          {usingFallback && (
            <span className="text-[11px] font-medium text-amber-600">Cached</span>
          )}
        </div>

        {error && (
          <div className="mb-2 rounded-md border border-rose-200 bg-rose-50 p-2 text-[12px] text-rose-700">
            Live QBR scheduling data is currently unavailable.
          </div>
        )}

        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-200 text-left text-[12px] text-gray-500">
              <th className="px-3 py-2">Client</th>
              <th className="px-3 py-2">Owner</th>
              <th className="px-3 py-2">Next QBR</th>
              <th className="px-3 py-2">Phase</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 border-t border-gray-200">
            {isLoading && clients.length === 0 ? (
              <tr>
                <td className="px-3 py-6 text-center text-gray-500" colSpan={4}>
                  Loading live workspace data…
                </td>
              </tr>
            ) : sortedClients.length === 0 ? (
              <tr>
                <td className="px-3 py-6 text-center text-gray-500" colSpan={4}>
                  No QBRs scheduled.
                </td>
              </tr>
            ) : (
              sortedClients.map((client) => (
                <tr
                  key={client.id}
                  onClick={() => router.push(`/clients/${client.id}`)}
                  className="cursor-pointer transition hover:bg-gray-50"
                >
                  <td className="px-3 py-2 font-medium text-black">{client.name}</td>
                  <td className="px-3 py-2 text-gray-700">{client.ownerName ?? "—"}</td>
                  <td className="px-3 py-2 text-gray-700">{client.qbrDate ?? "—"}</td>
                  <td className="px-3 py-2 text-gray-700">{client.phase ?? "—"}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </Card>
    </div>
  );
}
