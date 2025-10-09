"use client";

import { useRouter } from "next/navigation";

import { Card } from "@/components/kit/Card";
import { getClients } from "@/core/clients/store";

export default function ChurnPanel() {
  const router = useRouter();
  const clients = getClients().filter((client) => (client.churnRisk ?? 0) > 10);

  return (
    <div className="grid gap-3" style={{ gridTemplateColumns: "repeat(12,minmax(0,1fr))" }}>
      <Card className="col-span-12 p-3">
        <div className="mb-2 text-sm font-semibold text-black">High-Risk Clients</div>
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
            {clients.length === 0 ? (
              <tr>
                <td className="px-3 py-6 text-center text-gray-500" colSpan={4}>
                  No clients currently flagged as high risk.
                </td>
              </tr>
            ) : (
              clients.map((client) => (
                <tr
                  key={client.id}
                  onClick={() => router.push(`/clients/${client.id}`)}
                  className="cursor-pointer transition hover:bg-gray-50"
                >
                  <td className="px-3 py-2 font-medium text-black">{client.name}</td>
                  <td className="px-3 py-2 text-gray-700">{client.owner}</td>
                  <td className="px-3 py-2 text-gray-700">{client.health}%</td>
                  <td className="px-3 py-2 text-gray-700">{client.churnRisk}%</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </Card>
    </div>
  );
}
