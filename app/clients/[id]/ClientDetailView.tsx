"use client";

import { useMemo } from "react";
import { usePathname, useSearchParams } from "next/navigation";

import ClientTabs from "@/components/clients/ClientTabs";
import { resolveTabs } from "@/lib/tabs";
import { getContentPiecesByClient } from "@/core/content/store";
import type {
  Client,
  ClientDeliverable,
  ClientFinancialSnapshot,
} from "@/core/clients/types";
import type { Project } from "@/core/projects/types";

const currencyFormatter = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  maximumFractionDigits: 0,
});

const formatCurrency = (value?: number) =>
  value != null ? currencyFormatter.format(value) : "—";

const formatPercent = (value?: number) => {
  if (value == null) return "—";
  const normalized = value <= 1 ? value * 100 : value;
  return `${Math.round(normalized)}%`;
};

type ClientDetailViewProps = {
  client: Client;
  projects: Project[];
  deliverables: ClientDeliverable[];
  financials: ClientFinancialSnapshot[];
};

export default function ClientDetailView({
  client,
  projects,
  deliverables,
  financials,
}: ClientDetailViewProps) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const tabs = useMemo(() => resolveTabs(pathname), [pathname]);
  const activeTab = useMemo(() => {
    const current = searchParams.get("tab");
    return current && tabs.includes(current) ? current : tabs[0];
  }, [searchParams, tabs]);

  const clientContent = useMemo(() => getContentPiecesByClient(client.id), [client.id]);

  return (
    <div className="flex h-full flex-col bg-white">
      <div className="mx-auto flex w-full max-w-7xl flex-1 flex-col gap-6 px-4 py-4">
        <header className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="space-y-2">
              <div className="text-xs font-semibold uppercase tracking-wide text-gray-500">Client Profile</div>
              <h1 className="text-2xl font-semibold text-black">{client.name}</h1>
              <p className="text-sm text-gray-600">
                {client.segment} • {client.industry ?? "—"} • Owner {client.owner}
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-2 text-sm">
              <span className="rounded-full border border-gray-300 bg-white px-3 py-1 font-medium text-gray-700">
                Health {formatPercent(client.health)}
              </span>
              <span className="rounded-full border border-gray-300 bg-white px-3 py-1 font-medium text-gray-700">
                ARR {formatCurrency(client.arr)}
              </span>
              <span className="rounded-full border border-gray-300 bg-white px-3 py-1 font-medium text-gray-700">
                Phase {client.phase}
              </span>
            </div>
          </div>
          <p className="mt-4 text-sm text-gray-500">
            {client.notes ??
              "Command center view of deliverables, financial performance, and revenue programs for this account."}
          </p>
        </header>

        <div className="flex min-h-0 flex-1">
          <ClientTabs
            activeTab={activeTab}
            client={client}
            projects={projects}
            deliverables={deliverables}
            financials={financials}
            contentPieces={clientContent}
          />
        </div>
      </div>
    </div>
  );
}
