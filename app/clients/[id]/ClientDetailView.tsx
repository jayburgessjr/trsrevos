"use client";

import { useMemo } from "react";
import { usePathname, useSearchParams } from "next/navigation";

import { Card } from "@/components/kit/Card";
import { resolveTabs } from "@/lib/tabs";
import type { Client } from "@/core/clients/types";

const formatCurrency = (value?: number) =>
  value != null ? `$${value.toLocaleString()}` : "—";

const formatPercent = (value?: number) =>
  value != null ? `${Math.round(value)}%` : "—";

export default function ClientDetailView({ client }: { client: Client }) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const tabs = useMemo(() => resolveTabs(pathname), [pathname]);
  const activeTab = useMemo(() => {
    const current = searchParams.get("tab");
    return current && tabs.includes(current) ? current : tabs[0];
  }, [searchParams, tabs]);

  const healthTone = client.health >= 70 ? "text-emerald-600" : client.health >= 40 ? "text-amber-600" : "text-rose-600";

  return (
    <div className="w-full px-6 py-6 space-y-6">
      <header className="flex flex-col gap-2">
        <h1 className="text-2xl font-semibold text-black">{client.name}</h1>
        <p className="text-sm text-gray-600">
          {client.segment} • {client.industry ?? "—"} • Owner {client.owner}
        </p>
      </header>

      {activeTab === "Overview" && (
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
          <Card className="p-4 lg:col-span-2">
            <div className="flex flex-col gap-3 md:flex-row md:justify-between">
              <div>
                <div className="text-sm font-semibold text-black">Client Summary</div>
                <p className="text-[13px] text-gray-600">
                  ARR {formatCurrency(client.arr)} • Health
                  <span className={`ml-1 font-semibold ${healthTone}`}>{formatPercent(client.health)}</span>
                  • Churn risk {formatPercent(client.churnRisk)}
                </p>
              </div>
              <div className="grid grid-cols-2 gap-3 text-sm text-gray-700">
                <div>
                  <div className="text-[11px] uppercase tracking-wide text-gray-500">Phase</div>
                  <div className="mt-1 font-semibold text-black">{client.phase}</div>
                </div>
                <div>
                  <div className="text-[11px] uppercase tracking-wide text-gray-500">QBR</div>
                  <div className="mt-1 font-semibold text-black">{client.qbrDate ?? "—"}</div>
                </div>
              </div>
            </div>
            <div className="mt-4 grid grid-cols-1 gap-3 md:grid-cols-2">
              <div className="rounded-lg border border-gray-200 p-3">
                <div className="text-[11px] uppercase tracking-wide text-gray-500">Opportunities</div>
                <ul className="mt-2 space-y-2 text-sm text-gray-700">
                  {client.opportunities.map((opportunity) => (
                    <li key={opportunity.id} className="flex items-center justify-between">
                      <span className="font-medium text-black">{opportunity.name}</span>
                      <span>{formatCurrency(opportunity.amount)}</span>
                    </li>
                  ))}
                </ul>
              </div>
              <div className="rounded-lg border border-gray-200 p-3">
                <div className="text-[11px] uppercase tracking-wide text-gray-500">Key Contacts</div>
                <ul className="mt-2 space-y-2 text-sm text-gray-700">
                  {client.contacts.map((contact) => (
                    <li key={contact.id} className="flex items-center justify-between">
                      <span className="font-medium text-black">{contact.name}</span>
                      <span className="text-gray-500">{contact.role}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </Card>
          <Card className="p-4">
            <div className="text-sm font-semibold text-black">Account Stats</div>
            <div className="mt-3 space-y-3 text-sm text-gray-700">
              <div>
                <div className="text-[11px] uppercase tracking-wide text-gray-500">Plan</div>
                <div className="mt-1 font-semibold text-black">{client.commercials?.plan ?? "—"}</div>
              </div>
              <div>
                <div className="text-[11px] uppercase tracking-wide text-gray-500">Term</div>
                <div className="mt-1 font-semibold text-black">
                  {client.commercials?.termMonths != null
                    ? `${client.commercials.termMonths} months`
                    : "—"}
                </div>
              </div>
              <div>
                <div className="text-[11px] uppercase tracking-wide text-gray-500">Discount</div>
                <div className="mt-1 font-semibold text-black">{formatPercent(client.commercials?.discountPct)}</div>
              </div>
              <div>
                <div className="text-[11px] uppercase tracking-wide text-gray-500">Payment terms</div>
                <div className="mt-1 font-semibold text-black">{client.commercials?.paymentTerms ?? "—"}</div>
              </div>
            </div>
          </Card>
        </div>
      )}

      {activeTab === "RevenueOS" && (
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
          <Card className="p-4">
            <div className="text-sm font-semibold text-black">Compounding Snapshot</div>
            <div className="mt-3 grid grid-cols-2 gap-3 text-sm text-gray-700">
              <div>
                <div className="text-[11px] uppercase tracking-wide text-gray-500">Baseline MRR</div>
                <div className="mt-1 font-semibold text-black">{formatCurrency(client.compounding?.baselineMRR)}</div>
              </div>
              <div>
                <div className="text-[11px] uppercase tracking-wide text-gray-500">Current MRR</div>
                <div className="mt-1 font-semibold text-black">{formatCurrency(client.compounding?.currentMRR)}</div>
              </div>
              <div>
                <div className="text-[11px] uppercase tracking-wide text-gray-500">Net New</div>
                <div className="mt-1 font-semibold text-black">{formatCurrency(client.compounding?.netNew)}</div>
              </div>
              <div>
                <div className="text-[11px] uppercase tracking-wide text-gray-500">Forecast QTD</div>
                <div className="mt-1 font-semibold text-black">{formatCurrency(client.compounding?.forecastQTD)}</div>
              </div>
            </div>
          </Card>
          <Card className="p-4">
            <div className="text-sm font-semibold text-black">Growth Drivers</div>
            <ul className="mt-3 space-y-2 text-sm text-gray-700">
              {client.compounding?.drivers?.map((driver) => (
                <li key={driver.name} className="flex items-center justify-between">
                  <span className="font-medium text-black">{driver.name}</span>
                  <span>{formatCurrency(driver.delta)}</span>
                </li>
              ))}
            </ul>
          </Card>
        </div>
      )}

      {activeTab === "Data" && (
        <Card className="p-4">
          <div className="text-sm font-semibold text-black">Data Coverage</div>
          <div className="mt-3 overflow-hidden rounded-lg border border-gray-200">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 text-left text-[12px] uppercase tracking-wide text-gray-500">
                <tr>
                  <th className="px-3 py-2 font-medium">Source</th>
                  <th className="px-3 py-2 font-medium">Category</th>
                  <th className="px-3 py-2 font-medium">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 bg-white">
                {client.data.map((source) => (
                  <tr key={source.id} className="hover:bg-gray-50">
                    <td className="px-3 py-2 font-medium text-black">{source.name}</td>
                    <td className="px-3 py-2 text-gray-700">{source.category}</td>
                    <td
                      className={`px-3 py-2 text-sm ${
                        source.status === "Collected"
                          ? "text-emerald-600"
                          : source.status === "Missing"
                          ? "text-rose-600"
                          : "text-amber-600"
                      }`}
                    >
                      {source.status}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      {activeTab === "Strategy" && (
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
          <Card className="p-4">
            <div className="text-sm font-semibold text-black">Discovery Signals</div>
            <ul className="mt-3 space-y-2 text-sm text-gray-700">
              {client.discovery.map((qa) => (
                <li key={qa.id} className="rounded-lg border border-gray-200 p-3">
                  <div className="text-xs uppercase tracking-wide text-gray-500">{qa.question}</div>
                  {qa.answer ? <div className="mt-1 text-sm text-black">{qa.answer}</div> : null}
                  {qa.lever ? (
                    <div className="mt-2 text-[12px] text-gray-600">Lever: {qa.lever}</div>
                  ) : null}
                </li>
              ))}
            </ul>
          </Card>
          <Card className="p-4">
            <div className="text-sm font-semibold text-black">Strategy Workspace</div>
            <p className="mt-2 text-sm text-gray-600">
              Draft compounding plays and send to the client team for review.
            </p>
            <div className="mt-3 h-36 rounded-lg border border-gray-200 bg-gray-50 p-3 text-sm text-gray-600">
              Intelligence agent prompt area
            </div>
            <div className="mt-3 text-[12px] uppercase tracking-wide text-gray-500">Recommended plays</div>
            <ul className="mt-2 space-y-1 text-sm text-gray-700">
              {client.qra?.pricing?.map((play) => (
                <li key={`pricing-${play}`}>• {play}</li>
              ))}
              {client.qra?.offers?.map((play) => (
                <li key={`offer-${play}`}>• {play}</li>
              ))}
              {client.qra?.retention?.map((play) => (
                <li key={`retention-${play}`}>• {play}</li>
              ))}
              {client.qra?.partners?.map((play) => (
                <li key={`partner-${play}`}>• {play}</li>
              ))}
            </ul>
          </Card>
        </div>
      )}

      {activeTab === "Results" && (
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
          <Card className="p-4">
            <div className="text-sm font-semibold text-black">Performance Summary</div>
            <div className="mt-3 grid grid-cols-2 gap-3 text-sm text-gray-700">
              <div>
                <div className="text-[11px] uppercase tracking-wide text-gray-500">Impact to Date</div>
                <div className="mt-1 font-semibold text-black">{formatCurrency(client.compounding?.netNew)}</div>
              </div>
              <div>
                <div className="text-[11px] uppercase tracking-wide text-gray-500">Expected Impact</div>
                <div className="mt-1 font-semibold text-black">{formatCurrency(client.qra?.expectedImpact)}</div>
              </div>
              <div>
                <div className="text-[11px] uppercase tracking-wide text-gray-500">Invoices Sent</div>
                <div className="mt-1 font-semibold text-black">{client.invoices.length}</div>
              </div>
              <div>
                <div className="text-[11px] uppercase tracking-wide text-gray-500">Open Balance</div>
                <div className="mt-1 font-semibold text-black">
                  {formatCurrency(
                    client.invoices
                      .filter((invoice) => invoice.status !== "Paid")
                      .reduce((sum, invoice) => sum + (invoice.amount ?? 0), 0),
                  )}
                </div>
              </div>
            </div>
          </Card>
          <Card className="p-4">
            <div className="text-sm font-semibold text-black">Latest Activity</div>
            <ul className="mt-3 space-y-2 text-sm text-gray-700">
              {client.notes ? <li className="rounded-lg border border-gray-200 p-3">{client.notes}</li> : null}
              {client.opportunities.map((opportunity) => (
                <li key={`activity-${opportunity.id}`} className="rounded-lg border border-gray-200 p-3">
                  {opportunity.stage}: next step {opportunity.nextStep ?? "TBD"}
                </li>
              ))}
            </ul>
          </Card>
        </div>
      )}
    </div>
  );
}
