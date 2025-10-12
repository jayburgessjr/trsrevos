import Link from "next/link";

import { createServerClient } from "@/lib/supabase/server";
import { ClientsSearch } from "./ClientsSearch";

function SummaryCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-gray-200 bg-white p-3">
      <div className="text-[11px] text-gray-500">{label}</div>
      <div className="text-2xl font-semibold text-black">{value}</div>
    </div>
  );
}

export default async function ClientsPage({
  searchParams,
}: {
  searchParams?: { q?: string; phase?: string };
}) {
  const supabase = createServerClient();
  const search = searchParams?.q?.trim() ?? "";
  const phaseFilter = (searchParams?.phase ?? "all").toLowerCase();

  let query = supabase
    .from("clients")
    .select(
      "id, name, status, phase, owner_id, arr, health, created_at, owner:users!clients_owner_id_fkey(name)"
    )
    .order("created_at", { ascending: false })
    .limit(200);

  if (search) {
    const pattern = `%${search.replace(/%/g, "\\%")}%`;
    query = query.or(
      `name.ilike.${pattern},industry.ilike.${pattern},region.ilike.${pattern}`
    );
  }

  const { data: clientsData, error } = await query;

  if (error) {
    throw error;
  }

  const clients = (clientsData ?? []).filter((client) => {
    const normalizedPhase = (client.phase ?? "").toLowerCase();
    const normalizedStatus = (client.status ?? "").toLowerCase();

    if (phaseFilter === "onboarding") {
      return normalizedPhase === "onboarding";
    }
    if (phaseFilter === "active") {
      return normalizedStatus === "active";
    }
    if (phaseFilter === "churned") {
      return normalizedStatus === "churned";
    }
    return true;
  });

  const ids = clients.map((c) => c.id);
  const overviewMap = new Map<string, any>();

  if (ids.length) {
    const { data: overviewRows } = await supabase
      .from("vw_client_overview")
      .select("client_id, pipeline_stage, pipeline_value, weighted_value, probability, mrr, ar_outstanding")
      .in("client_id", ids);

    overviewRows?.forEach((row) => {
      overviewMap.set(row.client_id, row);
    });
  }

  const totalArr = clients.reduce((sum, client) => sum + (client.arr ?? 0), 0);
  const avgHealth = clients.length
    ? Math.round(
        clients.reduce((sum, client) => sum + (client.health ?? 0), 0) /
          clients.length,
      )
    : 0;
  const onboardingCount = clients.filter(
    (client) => (client.phase ?? "").toLowerCase() === "onboarding",
  ).length;

  return (
    <div className="min-h-screen bg-white text-black">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-6 p-4">
        <header className="space-y-1">
          <h1 className="text-2xl font-semibold text-black">Clients</h1>
          <p className="text-sm text-gray-600">
            Production view of customers and onboarding progress powered by Supabase.
          </p>
        </header>

        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2 text-sm">
            {[
              { label: "All", value: "all" },
              { label: "Onboarding", value: "onboarding" },
              { label: "Active", value: "active" },
              { label: "Churned", value: "churned" },
            ].map((tab) => {
              const isActive = phaseFilter === tab.value;
              const params = new URLSearchParams(searchParams as Record<string, string> ?? {});
              if (tab.value === "all") {
                params.delete("phase");
              } else {
                params.set("phase", tab.value);
              }
              const href = params.size ? `/clients?${params.toString()}` : "/clients";

              return (
                <Link
                  key={tab.value}
                  href={href}
                  className={`rounded-full border px-3 py-1 transition ${
                    isActive
                      ? "border-gray-900 bg-gray-900 text-white"
                      : "border-gray-300 bg-white text-gray-600 hover:border-gray-400"
                  }`}
                >
                  {tab.label}
                </Link>
              );
            })}
          </div>
          <ClientsSearch initialValue={search} />
        </div>

        <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
          <SummaryCard label="Total ARR" value={`$${totalArr.toLocaleString()}`} />
          <SummaryCard label="Average Health" value={`${avgHealth}%`} />
          <SummaryCard label="Onboarding" value={`${onboardingCount}`} />
        </div>

        <div className="overflow-hidden rounded-xl border border-gray-200 bg-white">
          <table className="w-full text-sm">
            <thead className="bg-gray-50">
              <tr className="text-left text-[12px] text-gray-500">
                <th className="px-3 py-2">Client</th>
                <th className="px-3 py-2">Phase</th>
                <th className="px-3 py-2">Owner</th>
                <th className="px-3 py-2">Pipeline Stage</th>
                <th className="px-3 py-2">MRR</th>
                <th className="px-3 py-2">ARR</th>
                <th className="px-3 py-2">Health</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {clients.length === 0 ? (
                <tr>
                  <td className="px-4 py-6 text-center text-gray-500" colSpan={7}>
                    No clients found. Close a deal from pipeline to see it here.
                  </td>
                </tr>
              ) : (
                clients.map((client) => {
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
      </div>
    </div>
  );
}
