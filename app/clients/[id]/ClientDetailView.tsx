"use client";

import { useMemo } from "react";
import { usePathname, useSearchParams } from "next/navigation";
import Link from "next/link";

import { Card } from "@/components/kit/Card";
import { resolveTabs } from "@/lib/tabs";
import { getContentPiecesByClient } from "@/core/content/store";
import type { Client } from "@/core/clients/types";
import type { Project } from "@/core/projects/types";

const formatCurrency = (value?: number) =>
  value != null ? `$${value.toLocaleString()}` : "—";

const formatPercent = (value?: number) =>
  value != null ? `${Math.round(value)}%` : "—";

export default function ClientDetailView({ client, projects }: { client: Client; projects: Project[] }) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const tabs = useMemo(() => resolveTabs(pathname), [pathname]);
  const activeTab = useMemo(() => {
    const current = searchParams.get("tab");
    return current && tabs.includes(current) ? current : tabs[0];
  }, [searchParams, tabs]);

  const clientContent = useMemo(() => getContentPiecesByClient(client.id), [client.id]);

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

      {activeTab === "Projects" && (
        <div className="space-y-4">
          <Card className="p-4">
            <div className="flex items-center justify-between mb-4">
              <div>
                <div className="text-sm font-semibold text-black">Client Projects</div>
                <p className="text-[13px] text-gray-600">Active projects and deliverables for {client.name}</p>
              </div>
              <button className="text-xs px-3 py-1.5 rounded-md border border-gray-300 hover:bg-gray-100 bg-white">
                + New Project
              </button>
            </div>

            {projects.length === 0 ? (
              <div className="text-center py-8 text-sm text-gray-600">
                No projects yet. Create a project to get started.
              </div>
            ) : (
              <div className="overflow-hidden rounded-lg border border-gray-200">
                <table className="w-full text-sm">
                  <thead className="bg-gray-50 text-left text-[12px] uppercase tracking-wide text-gray-500">
                    <tr>
                      <th className="px-3 py-2 font-medium">Project</th>
                      <th className="px-3 py-2 font-medium">Phase</th>
                      <th className="px-3 py-2 font-medium">Owner</th>
                      <th className="px-3 py-2 font-medium">Health</th>
                      <th className="px-3 py-2 font-medium">Progress</th>
                      <th className="px-3 py-2 font-medium">Due Date</th>
                      <th className="px-3 py-2 font-medium">Budget</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200 bg-white">
                    {projects.map((project) => (
                      <tr key={project.id} className="hover:bg-gray-50">
                        <td className="px-3 py-2">
                          <div className="font-medium text-black">{project.name}</div>
                          {project.description && (
                            <div className="text-xs text-gray-600 mt-0.5">{project.description}</div>
                          )}
                        </td>
                        <td className="px-3 py-2 text-gray-700">{project.phase}</td>
                        <td className="px-3 py-2 text-gray-700">{project.owner}</td>
                        <td className="px-3 py-2">
                          <span
                            className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
                              project.health === "green"
                                ? "bg-emerald-100 text-emerald-700"
                                : project.health === "yellow"
                                ? "bg-amber-100 text-amber-700"
                                : "bg-rose-100 text-rose-700"
                            }`}
                          >
                            {project.health === "green" ? "On Track" : project.health === "yellow" ? "At Risk" : "Critical"}
                          </span>
                        </td>
                        <td className="px-3 py-2">
                          <div className="flex items-center gap-2">
                            <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
                              <div
                                className="h-full bg-black"
                                style={{ width: `${project.progress}%` }}
                              />
                            </div>
                            <span className="text-xs text-gray-600">{project.progress}%</span>
                          </div>
                        </td>
                        <td className="px-3 py-2 text-gray-700">{project.dueDate || "—"}</td>
                        <td className="px-3 py-2 text-gray-700">
                          {project.budget ? formatCurrency(project.budget) : "—"}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </Card>

          {projects.length > 0 && (
            <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
              <Card className="p-4">
                <div className="text-[11px] uppercase tracking-wide text-gray-500">Total Budget</div>
                <div className="mt-1 text-xl font-semibold text-black">
                  {formatCurrency(projects.reduce((sum, p) => sum + (p.budget || 0), 0))}
                </div>
              </Card>
              <Card className="p-4">
                <div className="text-[11px] uppercase tracking-wide text-gray-500">Total Spent</div>
                <div className="mt-1 text-xl font-semibold text-black">
                  {formatCurrency(projects.reduce((sum, p) => sum + (p.spent || 0), 0))}
                </div>
              </Card>
              <Card className="p-4">
                <div className="text-[11px] uppercase tracking-wide text-gray-500">Avg Progress</div>
                <div className="mt-1 text-xl font-semibold text-black">
                  {projects.length > 0
                    ? Math.round(projects.reduce((sum, p) => sum + p.progress, 0) / projects.length)
                    : 0}%
                </div>
              </Card>
            </div>
          )}
        </div>
      )}

      {activeTab === "Content" && (
        <div className="space-y-4">
          <Card className="p-4">
            <div className="flex items-center justify-between mb-4">
              <div>
                <div className="text-sm font-semibold text-black">Client Content</div>
                <p className="text-[13px] text-gray-600">Marketing content created for {client.name}</p>
              </div>
              <Link
                href={`/content?tab=Create`}
                className="text-xs px-3 py-1.5 rounded-md border border-gray-300 hover:bg-gray-100 bg-white"
              >
                + New Content
              </Link>
            </div>

            {clientContent.length === 0 ? (
              <div className="text-center py-8 text-sm text-gray-600">
                No content created for this client yet.
              </div>
            ) : (
              <div className="overflow-hidden rounded-lg border border-gray-200">
                <table className="w-full text-sm">
                  <thead className="bg-gray-50 text-left text-[12px] uppercase tracking-wide text-gray-500">
                    <tr>
                      <th className="px-3 py-2 font-medium">Title</th>
                      <th className="px-3 py-2 font-medium">Type</th>
                      <th className="px-3 py-2 font-medium">Format</th>
                      <th className="px-3 py-2 font-medium">Status</th>
                      <th className="px-3 py-2 font-medium">Purpose</th>
                      <th className="px-3 py-2 font-medium">Created</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200 bg-white">
                    {clientContent.map((content) => (
                      <tr key={content.id} className="hover:bg-gray-50">
                        <td className="px-3 py-2 font-medium text-black">
                          <Link href={`/content/${content.id}`} className="hover:text-blue-600 hover:underline">
                            {content.title}
                          </Link>
                        </td>
                        <td className="px-3 py-2 text-gray-700">{content.contentType}</td>
                        <td className="px-3 py-2 text-gray-700">{content.format}</td>
                        <td className="px-3 py-2">
                          <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${
                            content.status === 'Published' ? 'bg-emerald-100 text-emerald-800' :
                            content.status === 'Scheduled' ? 'bg-blue-100 text-blue-800' :
                            content.status === 'Review' ? 'bg-amber-100 text-amber-800' :
                            'bg-gray-100 text-gray-800'
                          }`}>
                            {content.status}
                          </span>
                        </td>
                        <td className="px-3 py-2 text-gray-700">{content.purpose}</td>
                        <td className="px-3 py-2 text-gray-700">
                          {new Date(content.createdAt).toLocaleDateString()}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
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
