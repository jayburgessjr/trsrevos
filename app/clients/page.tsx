import Link from "next/link";

import { listClients } from "@/core/clients/store";
import type { Client } from "@/core/clients/types";
import { createServerClient } from "@/lib/supabase/server";
import { ClientsSearch } from "./ClientsSearch";
import { ClientsPortfolioTable } from "./ClientsPortfolioTable";

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

const hasSupabaseCredentials = Boolean(
  process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

const stageOrder: Record<string, number> = {
  New: 1,
  Qualify: 2,
  Proposal: 3,
  Negotiation: 4,
  ClosedWon: 5,
  ClosedLost: 0,
};

const defaultProbabilities: Partial<Record<string, number>> = {
  New: 0.2,
  Qualify: 0.35,
  Proposal: 0.55,
  Negotiation: 0.7,
  ClosedWon: 1,
  ClosedLost: 0,
};

function mapStoreClient(client: Client): ClientRow {
  return {
    id: client.id,
    name: client.name,
    status: client.status ?? "active",
    phase: client.phase,
    owner_id: client.owner,
    arr: client.arr ?? 0,
    health: client.health ?? null,
    created_at: client.qbrDate ?? null,
    owner: [{ name: client.owner }],
  };
}

function calculateMonthlyRevenue(client: Client): number {
  if (!client.dealType) return 0;

  switch (client.dealType) {
    case "invoiced":
      return client.monthlyInvoiced ?? 0;
    case "equity_partnership":
      // $2500/mo + 2% of client MRR
      const clientMRR = client.compounding?.currentMRR ?? 0;
      return 2500 + (clientMRR * 0.02);
    case "equity":
      // 15% of client MRR
      const equityMRR = client.compounding?.currentMRR ?? 0;
      return equityMRR * (client.equityPercentage ?? 15) / 100;
    default:
      return 0;
  }
}

function computeFallbackOverview(client: Client) {
  const openOpps = client.opportunities.filter(
    (opp) => opp.stage !== "ClosedLost" && opp.stage !== "ClosedWon"
  );
  const pipelineValue = openOpps.reduce((sum, opp) => sum + (opp.amount ?? 0), 0);
  const weightedValue = openOpps.reduce((sum, opp) => {
    const probability = opp.probability ?? defaultProbabilities[opp.stage] ?? 0;
    return sum + probability * (opp.amount ?? 0);
  }, 0);
  const pipelineStage = openOpps.reduce((best, opp) => {
    if (!best) return opp.stage;
    return stageOrder[opp.stage] > stageOrder[best] ? opp.stage : best;
  }, "" as string);
  const invoicesDue = client.invoices.filter(
    (invoice) => invoice.status === "Overdue" || invoice.status === "Sent"
  );
  const arOutstanding = invoicesDue.reduce((sum, invoice) => sum + (invoice.amount ?? 0), 0);
  const mrr = client.arr ? Math.round(client.arr / 12) : 0;

  return {
    pipeline_stage: pipelineStage || null,
    pipeline_value: pipelineValue,
    weighted_value: Math.round(weightedValue),
    probability:
      pipelineValue > 0 ? Math.min(1, weightedValue / pipelineValue) : null,
    mrr,
    ar_outstanding: arOutstanding,
  };
}

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
  const search = searchParams?.q?.trim() ?? "";
  const phaseFilter = (searchParams?.phase ?? "all").toLowerCase();

  const overviewMap = new Map<string, any>();
  let clientsData: ClientRow[] = [];
  let usingFallback = !hasSupabaseCredentials;

  if (!usingFallback) {
    try {
      const supabase = createServerClient();
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

      const { data, error } = await query;

      if (error) {
        throw error;
      }

      clientsData = data ?? [];

      const ids = clientsData.map((c) => c.id);

      if (ids.length) {
        const { data: overviewRows, error: overviewError } = await supabase
          .from("vw_client_overview")
          .select(
            "client_id, pipeline_stage, pipeline_value, weighted_value, probability, mrr, ar_outstanding"
          )
          .in("client_id", ids);

        if (overviewError) {
          throw overviewError;
        }

        overviewRows?.forEach((row) => {
          overviewMap.set(row.client_id, row);
        });
      }
    } catch (error) {
      console.error("Failed to load clients from Supabase", error);
      usingFallback = true;
      clientsData = [];
    }
  }

  if (usingFallback) {
    const fallbackClients = listClients();
    clientsData = fallbackClients.map(mapStoreClient);
    fallbackClients.forEach((client) => {
      overviewMap.set(client.id, computeFallbackOverview(client));
    });
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

  // Calculate financial metrics (only available in fallback mode for now)
  let invoicedRevenue = 0;
  let equityRevenue = 0;
  let equityPartnershipRevenue = 0;
  let totalMonthlyRevenue = 0;

  if (usingFallback) {
    const fullClients = listClients();
    fullClients.forEach((client) => {
      const revenue = calculateMonthlyRevenue(client);
      totalMonthlyRevenue += revenue;

      if (client.dealType === "invoiced") {
        invoicedRevenue += revenue;
      } else if (client.dealType === "equity") {
        equityRevenue += revenue;
      } else if (client.dealType === "equity_partnership") {
        equityPartnershipRevenue += revenue;
      }
    });
  }

  return (
    <div className="min-h-screen bg-white text-black">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-6 p-4">
        <header className="space-y-1">
          <h1 className="text-2xl font-semibold text-black">Clients</h1>
          <p className="text-sm text-gray-600">
            Production view of customers and onboarding progress powered by Supabase.
          </p>
        </header>

        {usingFallback && (
          <div className="rounded-lg border border-amber-200 bg-amber-50 p-3 text-sm text-amber-900">
            Live Supabase data isn&rsquo;t available right now, so this view is showing
            seeded portfolio data instead.
          </div>
        )}

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

        {usingFallback && (
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-4">
            <SummaryCard label="Invoiced Revenue" value={`$${Math.round(invoicedRevenue).toLocaleString()}/mo`} />
            <SummaryCard label="Equity Revenue" value={`$${Math.round(equityRevenue).toLocaleString()}/mo`} />
            <SummaryCard label="Equity Partnership" value={`$${Math.round(equityPartnershipRevenue).toLocaleString()}/mo`} />
            <SummaryCard label="Total Monthly Revenue" value={`$${Math.round(totalMonthlyRevenue).toLocaleString()}/mo`} />
          </div>
        )}

        <ClientsPortfolioTable clients={clients} overviewMap={overviewMap} />
      </div>
    </div>
  );
}
