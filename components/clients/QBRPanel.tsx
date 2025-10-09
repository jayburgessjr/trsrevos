"use client";

import { useRouter } from "next/navigation";

import { Card } from "@/components/kit/Card";
import { getClients } from "@/core/clients/store";

export default function QBRPanel() {
  const router = useRouter();
  const clients = getClients().sort((a, b) => {
    if (!a.qbrDate) return 1;
    if (!b.qbrDate) return -1;
    return a.qbrDate.localeCompare(b.qbrDate);
  });

  return (
    <div className="grid gap-3" style={{ gridTemplateColumns: "repeat(12,minmax(0,1fr))" }}>
      <Card className="col-span-12 p-3">
        <div className="mb-2 text-sm font-semibold text-black">Upcoming QBRs</div>
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
            {clients.map((client) => (
              <tr
                key={client.id}
                onClick={() => router.push(`/clients/${client.id}`)}
                className="cursor-pointer transition hover:bg-gray-50"
              >
                <td className="px-3 py-2 font-medium text-black">{client.name}</td>
                <td className="px-3 py-2 text-gray-700">{client.owner}</td>
                <td className="px-3 py-2 text-gray-700">{client.qbrDate ?? "—"}</td>
                <td className="px-3 py-2 text-gray-700">{client.phase}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>
    </div>
  );
}
