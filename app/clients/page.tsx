"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";

import { Card } from "@/components/kit/Card";
import { TopTabs } from "@/components/kit/TopTabs";
import ChurnPanel from "@/components/clients/ChurnPanel";
import HealthPanel from "@/components/clients/HealthPanel";
import HistoryPanel from "@/components/clients/HistoryPanel";
import QBRPanel from "@/components/clients/QBRPanel";
import { getClients } from "@/core/clients/store";

export default function ClientsPage() {
  const [tab, setTab] = useState("Accounts");
  const router = useRouter();
  const clients = useMemo(
    () =>
      getClients()
        .slice()
        .sort((a, b) => a.name.localeCompare(b.name)),
    [],
  );

  return (
    <div className="w-full p-3">
      <TopTabs value={tab} onChange={setTab} />
      {tab === "Accounts" && (
        <Card className="mt-3 p-3">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-200 text-left text-[12px] text-gray-500">
                <th className="px-3 py-2">Client</th>
                <th className="px-3 py-2">Owner</th>
                <th className="px-3 py-2">ARR</th>
                <th className="px-3 py-2">Health</th>
                <th className="px-3 py-2">Churn Risk</th>
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
                  <td className="px-3 py-2 text-gray-700">
                    {client.arr != null ? `$${client.arr.toLocaleString()}` : "—"}
                  </td>
                  <td className="px-3 py-2 text-gray-700">{client.health}%</td>
                  <td className="px-3 py-2 text-gray-700">
                    {client.churnRisk != null ? `${client.churnRisk}%` : "—"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </Card>
      )}
      {tab === "Health" && <HealthPanel />}
      {tab === "Churn" && <ChurnPanel />}
      {tab === "QBR" && <QBRPanel />}
      {tab === "History" && <HistoryPanel />}
    </div>
  );
}
