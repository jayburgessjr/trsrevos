"use client";

import { useEffect, useMemo, useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

import { Card } from "@/components/kit/Card";
import { StatCard } from "@/components/kit/StatCard";
import {
  actionCreateDeliverable,
  actionRecordClientFinancials,
} from "@/core/clients/actions";
import type {
  Client,
  ClientDeliverable,
  ClientFinancialSnapshot,
} from "@/core/clients/types";
import type { Project } from "@/core/projects/types";
import type { ContentPiece } from "@/core/content/types";

const formatter = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  maximumFractionDigits: 0,
});

function formatCurrency(value?: number | null) {
  if (value == null) return "—";
  return formatter.format(value);
}

function formatPercent(value?: number | null) {
  if (value == null) return "—";
  const normalized = value <= 1 ? value * 100 : value;
  return `${Number(normalized).toFixed(normalized % 1 === 0 ? 0 : 1)}%`;
}

function formatDate(value?: string | null) {
  if (!value) return "—";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return value;
  }
  return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

type ClientTabsProps = {
  activeTab: string;
  client: Client;
  projects: Project[];
  deliverables: ClientDeliverable[];
  financials: ClientFinancialSnapshot[];
  contentPieces: ContentPiece[];
  canEditFinancials?: boolean;
};

export default function ClientTabs({
  activeTab,
  client,
  projects,
  deliverables: initialDeliverables,
  financials: initialFinancials,
  contentPieces,
  canEditFinancials = true,
}: ClientTabsProps) {
  const router = useRouter();
  const [deliverables, setDeliverables] = useState(initialDeliverables);
  const [financialHistory, setFinancialHistory] = useState(initialFinancials);
  const latestFinancial = useMemo(
    () => (financialHistory.length ? financialHistory[financialHistory.length - 1] : null),
    [financialHistory],
  );

  useEffect(() => {
    setDeliverables(initialDeliverables);
  }, [initialDeliverables]);

  useEffect(() => {
    setFinancialHistory(initialFinancials);
  }, [initialFinancials]);

  switch (activeTab) {
    case "Projects":
      return <ProjectsTab client={client} projects={projects} />;
    case "RevenueOS":
      return <RevenueOSTab client={client} />;
    case "Content":
      return <ContentTab client={client} contentPieces={contentPieces} />;
    case "Data":
      return <DataTab client={client} />;
    case "Strategy":
      return <StrategyTab client={client} />;
    case "Results":
      return <ResultsTab client={client} />;
    case "Deliverables":
      return (
        <DeliverablesTab
          clientId={client.id}
          items={deliverables}
          onCreate={(item) => {
            setDeliverables((prev) => [item, ...prev]);
            router.refresh();
          }}
        />
      );
    case "Finance":
      return (
        <FinanceTab
          client={client}
          history={financialHistory}
          onRecord={(entry) => {
            setFinancialHistory((prev) =>
              [...prev, entry].sort((a, b) => {
                const aDate = a.last_updated ? new Date(a.last_updated).getTime() : 0;
                const bDate = b.last_updated ? new Date(b.last_updated).getTime() : 0;
                return aDate - bDate;
              }),
            );
            router.refresh();
          }}
          canEdit={canEditFinancials}
        />
      );
    case "Overview":
    default:
      return (
        <OverviewTab
          client={client}
          projects={projects}
          deliverables={deliverables}
          contentPieces={contentPieces}
          latestFinancial={latestFinancial}
        />
      );
  }
}

type OverviewTabProps = {
  client: Client;
  projects: Project[];
  deliverables: ClientDeliverable[];
  contentPieces: ContentPiece[];
  latestFinancial: ClientFinancialSnapshot | null;
};

function OverviewTab({ client, projects, deliverables, contentPieces, latestFinancial }: OverviewTabProps) {
  const opportunityTotal = useMemo(
    () => client.opportunities.reduce((sum, opportunity) => sum + (opportunity.amount ?? 0), 0),
    [client.opportunities],
  );

  return (
    <div className="flex min-h-0 flex-1 flex-col gap-4">
      <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
        <StatCard
          label="ARR"
          value={formatCurrency(client.arr ?? 0)}
          delta={`Plan ${client.commercials?.plan ?? "—"}`}
          trend="up"
        />
        <StatCard
          label="Health"
          value={formatPercent(client.health)}
          delta={`Churn risk ${formatPercent(client.churnRisk)}`}
          trend={client.health >= 70 ? "up" : client.health >= 40 ? "flat" : "down"}
        />
        <StatCard
          label="Open Opportunity Value"
          value={formatCurrency(opportunityTotal)}
          delta={`${client.opportunities.length} open deals`}
          trend="up"
        />
      </div>

      <div className="grid flex-1 grid-cols-1 gap-4 lg:grid-cols-3">
        <Card className="flex flex-col gap-4 p-5 lg:col-span-2">
          <div className="flex flex-col gap-1">
            <h2 className="text-sm font-semibold text-black">Client Summary</h2>
            <p className="text-sm text-gray-600">
              {client.segment} • {client.industry ?? "—"} • Owner {client.owner} • Phase {client.phase}
            </p>
          </div>
          <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
            <div className="rounded-lg border border-gray-200 p-4">
              <div className="text-[11px] uppercase tracking-wide text-gray-500">Opportunities</div>
              <ul className="mt-3 space-y-2 text-sm text-gray-700">
                {client.opportunities.length === 0 && <li className="text-gray-500">No active opportunities</li>}
                {client.opportunities.slice(0, 4).map((opportunity) => (
                  <li key={opportunity.id} className="flex items-center justify-between gap-3">
                    <span className="font-medium text-black">{opportunity.name}</span>
                    <span>{formatCurrency(opportunity.amount)}</span>
                  </li>
                ))}
              </ul>
            </div>
            <div className="rounded-lg border border-gray-200 p-4">
              <div className="text-[11px] uppercase tracking-wide text-gray-500">Key Contacts</div>
              <ul className="mt-3 space-y-2 text-sm text-gray-700">
                {client.contacts.length === 0 && <li className="text-gray-500">No contacts captured</li>}
                {client.contacts.slice(0, 4).map((contact) => (
                  <li key={contact.id} className="flex items-center justify-between gap-3">
                    <span className="font-medium text-black">{contact.name}</span>
                    <span className="text-gray-500">{contact.role}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </Card>

        <Card className="flex flex-col p-5">
          <h2 className="text-sm font-semibold text-black">Account Snapshot</h2>
          <dl className="mt-4 space-y-3 text-sm text-gray-700">
            <div>
              <dt className="text-[11px] uppercase tracking-wide text-gray-500">QBR</dt>
              <dd className="mt-1 font-semibold text-black">{client.qbrDate ?? "—"}</dd>
            </div>
            <div>
              <dt className="text-[11px] uppercase tracking-wide text-gray-500">Payment Terms</dt>
              <dd className="mt-1 font-semibold text-black">{client.commercials?.paymentTerms ?? "—"}</dd>
            </div>
            <div>
              <dt className="text-[11px] uppercase tracking-wide text-gray-500">Equity Stake</dt>
              <dd className="mt-1 font-semibold text-black">{formatPercent(latestFinancial?.equity_stake)}</dd>
            </div>
            <div>
              <dt className="text-[11px] uppercase tracking-wide text-gray-500">Monthly Revenue</dt>
              <dd className="mt-1 font-semibold text-black">{formatCurrency(latestFinancial?.monthly_revenue)}</dd>
            </div>
            <div>
              <dt className="text-[11px] uppercase tracking-wide text-gray-500">Live Deliverables</dt>
              <dd className="mt-1 font-semibold text-black">{deliverables.length}</dd>
            </div>
          </dl>
        </Card>
      </div>

      <div className="grid min-h-0 grid-cols-1 gap-4 lg:grid-cols-3">
        <Card className="flex flex-col overflow-hidden p-0 lg:col-span-2">
          <div className="flex items-center justify-between border-b border-gray-200 px-5 py-4">
            <div>
              <h2 className="text-sm font-semibold text-black">Active Projects</h2>
              <p className="text-xs text-gray-500">Execution workstreams tied to this client</p>
            </div>
            <span className="text-xs text-gray-500">{projects.length} total</span>
          </div>
          <div className="flex-1 overflow-auto px-5 py-4">
            {projects.length === 0 ? (
              <div className="py-8 text-center text-sm text-gray-500">No active projects</div>
            ) : (
              <table className="w-full table-fixed text-sm">
                <thead className="text-left text-[11px] uppercase tracking-wide text-gray-500">
                  <tr>
                    <th className="pb-2 pr-4">Project</th>
                    <th className="pb-2 pr-4">Owner</th>
                    <th className="pb-2 pr-4">Phase</th>
                    <th className="pb-2 pr-4">Due</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {projects.slice(0, 5).map((project) => (
                    <tr key={project.id} className="align-top">
                      <td className="py-2 pr-4">
                        <div className="font-medium text-black">{project.name}</div>
                        {project.description && <div className="text-xs text-gray-500">{project.description}</div>}
                      </td>
                      <td className="py-2 pr-4 text-gray-700">{project.owner}</td>
                      <td className="py-2 pr-4 text-gray-700">{project.phase}</td>
                      <td className="py-2 pr-4 text-gray-700">{project.dueDate ?? "—"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </Card>

        <Card className="flex flex-col p-5">
          <h2 className="text-sm font-semibold text-black">Content Influence</h2>
          <p className="mt-2 text-sm text-gray-600">Materials and assets shaping the deal</p>
          <ul className="mt-4 space-y-3 text-sm text-gray-700">
            {contentPieces.length === 0 && <li className="text-gray-500">No content activity tracked</li>}
            {contentPieces.slice(0, 4).map((piece) => (
              <li key={piece.id} className="rounded-lg border border-gray-200 p-3">
                <div className="text-sm font-medium text-black">{piece.title}</div>
                <div className="mt-1 text-xs text-gray-500">
                  {piece.status} • {piece.contentType}
                </div>
              </li>
            ))}
          </ul>
        </Card>
      </div>
    </div>
  );
}

type ProjectsTabProps = { client: Client; projects: Project[] };

function ProjectsTab({ client, projects }: ProjectsTabProps) {
  const totals = useMemo(() => {
    if (!projects.length) {
      return { budget: 0, spent: 0, progress: 0 };
    }
    const budget = projects.reduce((sum, project) => sum + (project.budget || 0), 0);
    const spent = projects.reduce((sum, project) => sum + (project.spent || 0), 0);
    const progress = Math.round(projects.reduce((sum, project) => sum + project.progress, 0) / projects.length);
    return { budget, spent, progress };
  }, [projects]);

  return (
    <div className="flex min-h-0 flex-1 flex-col gap-4">
      <Card className="flex flex-col gap-4 p-5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="text-sm font-semibold text-black">Client Projects</h2>
            <p className="text-xs text-gray-500">Active projects and deliverables for {client.name}</p>
          </div>
          <button className="rounded-md border border-gray-300 bg-white px-3 py-1.5 text-xs font-medium text-black hover:bg-gray-100">
            + New Project
          </button>
        </div>

        {projects.length === 0 ? (
          <div className="py-10 text-center text-sm text-gray-500">No projects yet. Create a project to get started.</div>
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
                      {project.description && <div className="mt-0.5 text-xs text-gray-600">{project.description}</div>}
                    </td>
                    <td className="px-3 py-2 text-gray-700">{project.phase}</td>
                    <td className="px-3 py-2 text-gray-700">{project.owner}</td>
                    <td className="px-3 py-2">
                      <span
                        className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${
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
                        <div className="h-2 flex-1 overflow-hidden rounded-full bg-gray-200">
                          <div className="h-full bg-black" style={{ width: `${project.progress}%` }} />
                        </div>
                        <span className="text-xs text-gray-600">{project.progress}%</span>
                      </div>
                    </td>
                    <td className="px-3 py-2 text-gray-700">{project.dueDate || "—"}</td>
                    <td className="px-3 py-2 text-gray-700">{project.budget ? formatCurrency(project.budget) : "—"}</td>
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
            <div className="mt-1 text-xl font-semibold text-black">{formatCurrency(totals.budget)}</div>
          </Card>
          <Card className="p-4">
            <div className="text-[11px] uppercase tracking-wide text-gray-500">Total Spent</div>
            <div className="mt-1 text-xl font-semibold text-black">{formatCurrency(totals.spent)}</div>
          </Card>
          <Card className="p-4">
            <div className="text-[11px] uppercase tracking-wide text-gray-500">Avg Progress</div>
            <div className="mt-1 text-xl font-semibold text-black">{totals.progress}%</div>
          </Card>
        </div>
      )}
    </div>
  );
}

type RevenueOSTabProps = { client: Client };

function RevenueOSTab({ client }: RevenueOSTabProps) {
  return (
    <div className="grid min-h-0 flex-1 grid-cols-1 gap-4 lg:grid-cols-2">
      <Card className="p-5">
        <h2 className="text-sm font-semibold text-black">Compounding Snapshot</h2>
        <div className="mt-4 grid grid-cols-2 gap-3 text-sm text-gray-700">
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
      <Card className="p-5">
        <h2 className="text-sm font-semibold text-black">Growth Drivers</h2>
        <ul className="mt-4 space-y-2 text-sm text-gray-700">
          {client.compounding?.drivers?.map((driver) => (
            <li key={driver.name} className="flex items-center justify-between">
              <span className="font-medium text-black">{driver.name}</span>
              <span>{formatCurrency(driver.delta)}</span>
            </li>
          )) ?? <li className="text-gray-500">No growth drivers captured</li>}
        </ul>
      </Card>
    </div>
  );
}

type ContentTabProps = { client: Client; contentPieces: ContentPiece[] };

function ContentTab({ client, contentPieces }: ContentTabProps) {
  return (
    <div className="flex min-h-0 flex-1 flex-col gap-4">
      <Card className="flex flex-col gap-4 p-5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="text-sm font-semibold text-black">Client Content</h2>
            <p className="text-xs text-gray-500">Marketing content created for {client.name}</p>
          </div>
          <Link
            href="/content?tab=Create"
            className="rounded-md border border-gray-300 bg-white px-3 py-1.5 text-xs font-medium text-black hover:bg-gray-100"
          >
            + New Content
          </Link>
        </div>

        {contentPieces.length === 0 ? (
          <div className="py-10 text-center text-sm text-gray-500">No content created for this client yet.</div>
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
                {contentPieces.map((piece) => (
                  <tr key={piece.id} className="hover:bg-gray-50">
                    <td className="px-3 py-2 font-medium text-black">
                      <Link href={`/content/${piece.id}`} className="hover:text-blue-600 hover:underline">
                        {piece.title}
                      </Link>
                    </td>
                    <td className="px-3 py-2 text-gray-700">{piece.contentType}</td>
                    <td className="px-3 py-2 text-gray-700">{piece.format}</td>
                    <td className="px-3 py-2">
                      <span
                        className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${
                          piece.status === "Published"
                            ? "bg-emerald-100 text-emerald-800"
                            : piece.status === "Scheduled"
                            ? "bg-blue-100 text-blue-800"
                            : piece.status === "Review"
                            ? "bg-amber-100 text-amber-800"
                            : "bg-gray-100 text-gray-800"
                        }`}
                      >
                        {piece.status}
                      </span>
                    </td>
                    <td className="px-3 py-2 text-gray-700">{piece.purpose}</td>
                    <td className="px-3 py-2 text-gray-700">
                      {new Date(piece.createdAt).toLocaleDateString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </div>
  );
}

type DataTabProps = { client: Client };

function DataTab({ client }: DataTabProps) {
  return (
    <div className="flex min-h-0 flex-1 flex-col gap-4">
      <Card className="p-5">
        <h2 className="text-sm font-semibold text-black">Data Coverage</h2>
        <div className="mt-4 overflow-hidden rounded-lg border border-gray-200">
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
    </div>
  );
}

type StrategyTabProps = { client: Client };

function StrategyTab({ client }: StrategyTabProps) {
  return (
    <div className="grid min-h-0 flex-1 grid-cols-1 gap-4 lg:grid-cols-2">
      <Card className="p-5">
        <h2 className="text-sm font-semibold text-black">Discovery Signals</h2>
        <ul className="mt-4 space-y-2 text-sm text-gray-700">
          {client.discovery.map((qa) => (
            <li key={qa.id} className="rounded-lg border border-gray-200 p-3">
              <div className="text-xs uppercase tracking-wide text-gray-500">{qa.question}</div>
              {qa.answer ? <div className="mt-1 text-sm text-black">{qa.answer}</div> : null}
              {qa.lever ? <div className="mt-2 text-[12px] text-gray-600">Lever: {qa.lever}</div> : null}
            </li>
          ))}
          {client.discovery.length === 0 && <li className="text-gray-500">No discovery captured yet.</li>}
        </ul>
      </Card>
      <Card className="flex flex-col gap-4 p-5">
        <div>
          <h2 className="text-sm font-semibold text-black">Strategy Workspace</h2>
          <p className="mt-1 text-xs text-gray-500">Draft compounding plays and align the team.</p>
        </div>
        <div className="h-36 rounded-lg border border-gray-200 bg-gray-50 p-3 text-sm text-gray-600">
          Intelligence agent prompt area
        </div>
        <div>
          <div className="text-[12px] uppercase tracking-wide text-gray-500">Recommended plays</div>
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
            {!client.qra && <li className="text-gray-500">Insights coming soon.</li>}
          </ul>
        </div>
      </Card>
    </div>
  );
}

type ResultsTabProps = { client: Client };

function ResultsTab({ client }: ResultsTabProps) {
  const openBalance = useMemo(
    () =>
      client.invoices
        .filter((invoice) => invoice.status !== "Paid")
        .reduce((sum, invoice) => sum + (invoice.amount ?? 0), 0),
    [client.invoices],
  );

  return (
    <div className="grid min-h-0 flex-1 grid-cols-1 gap-4 lg:grid-cols-2">
      <Card className="p-5">
        <h2 className="text-sm font-semibold text-black">Performance Summary</h2>
        <div className="mt-4 grid grid-cols-2 gap-3 text-sm text-gray-700">
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
            <div className="mt-1 font-semibold text-black">{formatCurrency(openBalance)}</div>
          </div>
        </div>
      </Card>
      <Card className="p-5">
        <h2 className="text-sm font-semibold text-black">Latest Activity</h2>
        <ul className="mt-4 space-y-2 text-sm text-gray-700">
          {client.notes ? <li className="rounded-lg border border-gray-200 p-3">{client.notes}</li> : null}
          {client.opportunities.map((opportunity) => (
            <li key={`activity-${opportunity.id}`} className="rounded-lg border border-gray-200 p-3">
              {opportunity.stage}: next step {opportunity.nextStep ?? "TBD"}
            </li>
          ))}
          {client.opportunities.length === 0 && !client.notes && (
            <li className="rounded-lg border border-dashed border-gray-200 p-3 text-gray-500">No activity yet.</li>
          )}
        </ul>
      </Card>
    </div>
  );
}

type DeliverablesTabProps = {
  clientId: string;
  items: ClientDeliverable[];
  onCreate: (item: ClientDeliverable) => void;
};

function DeliverablesTab({ clientId, items, onCreate }: DeliverablesTabProps) {
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({ name: "", type: "", link: "", status: "" });
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!form.name.trim()) {
      setError("Name is required");
      return;
    }

    startTransition(async () => {
      const created = await actionCreateDeliverable({
        clientId,
        name: form.name.trim(),
        type: form.type,
        link: form.link,
        status: form.status,
      });

      if (!created) {
        setError("Failed to save deliverable");
        return;
      }

      onCreate(created);
      setForm({ name: "", type: "", link: "", status: "" });
      setError(null);
      setShowModal(false);
    });
  };

  return (
    <div className="flex min-h-0 flex-1 flex-col gap-4">
      <Card className="flex flex-1 flex-col overflow-hidden p-0">
        <div className="flex items-center justify-between border-b border-gray-200 px-5 py-4">
          <div>
            <h2 className="text-sm font-semibold text-black">Deliverables</h2>
            <p className="text-xs text-gray-500">Dashboards, decks, and models linked to this client</p>
          </div>
          <button
            onClick={() => {
              setError(null);
              setShowModal(true);
            }}
            className="rounded-md border border-gray-300 bg-white px-3 py-1.5 text-xs font-medium text-black hover:bg-gray-100"
          >
            + Add Deliverable
          </button>
        </div>
        <div className="flex-1 overflow-auto px-5 py-4">
          {items.length === 0 ? (
            <div className="py-10 text-center text-sm text-gray-500">No deliverables yet</div>
          ) : (
            <table className="w-full table-fixed text-sm">
              <thead className="text-left text-[11px] uppercase tracking-wide text-gray-500">
                <tr>
                  <th className="pb-2 pr-4">Name</th>
                  <th className="pb-2 pr-4">Type</th>
                  <th className="pb-2 pr-4">Status</th>
                  <th className="pb-2 pr-4">Last Updated</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {items.map((deliverable) => (
                  <tr
                    key={deliverable.id}
                    className="cursor-pointer align-top transition-colors hover:bg-gray-50"
                    onClick={() => {
                      if (deliverable.link) {
                        window.open(deliverable.link, "_blank", "noopener,noreferrer");
                      }
                    }}
                  >
                    <td className="py-3 pr-4">
                      <div className="font-medium text-black">{deliverable.name}</div>
                      {deliverable.link ? (
                        <div className="text-xs text-gray-500">{deliverable.link}</div>
                      ) : (
                        <div className="text-xs text-gray-400">No link provided</div>
                      )}
                    </td>
                    <td className="py-3 pr-4 text-gray-700">{deliverable.type ?? "—"}</td>
                    <td className="py-3 pr-4 text-gray-700">{deliverable.status ?? "—"}</td>
                    <td className="py-3 pr-4 text-gray-700">{formatDate(deliverable.updated_at)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </Card>

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-md rounded-xl border border-gray-200 bg-white shadow-xl">
            <form onSubmit={handleSubmit} className="space-y-4 p-5">
              <div className="space-y-1">
                <h3 className="text-base font-semibold text-black">Add Deliverable</h3>
                <p className="text-xs text-gray-500">Capture dashboards, ROI models, and supporting assets</p>
              </div>

              <div className="space-y-2 text-sm">
                <label className="flex flex-col gap-1">
                  <span className="text-xs font-semibold uppercase tracking-wide text-gray-500">Name</span>
                  <input
                    value={form.name}
                    onChange={(event) => setForm((prev) => ({ ...prev, name: event.target.value }))}
                    className="rounded-md border border-gray-300 px-3 py-2 text-sm text-gray-900 outline-none focus:border-gray-500"
                    placeholder="Revenue dashboard"
                    required
                  />
                </label>
                <label className="flex flex-col gap-1">
                  <span className="text-xs font-semibold uppercase tracking-wide text-gray-500">Type</span>
                  <input
                    value={form.type}
                    onChange={(event) => setForm((prev) => ({ ...prev, type: event.target.value }))}
                    className="rounded-md border border-gray-300 px-3 py-2 text-sm text-gray-900 outline-none focus:border-gray-500"
                    placeholder="Dashboard, report, model"
                  />
                </label>
                <label className="flex flex-col gap-1">
                  <span className="text-xs font-semibold uppercase tracking-wide text-gray-500">Link</span>
                  <input
                    value={form.link}
                    onChange={(event) => setForm((prev) => ({ ...prev, link: event.target.value }))}
                    className="rounded-md border border-gray-300 px-3 py-2 text-sm text-gray-900 outline-none focus:border-gray-500"
                    placeholder="https://"
                  />
                </label>
                <label className="flex flex-col gap-1">
                  <span className="text-xs font-semibold uppercase tracking-wide text-gray-500">Status</span>
                  <input
                    value={form.status}
                    onChange={(event) => setForm((prev) => ({ ...prev, status: event.target.value }))}
                    className="rounded-md border border-gray-300 px-3 py-2 text-sm text-gray-900 outline-none focus:border-gray-500"
                    placeholder="Active, In progress"
                  />
                </label>
                {error && <p className="text-xs text-rose-600">{error}</p>}
              </div>

              <div className="flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="rounded-md border border-gray-300 bg-white px-3 py-1.5 text-xs font-medium text-gray-600 hover:bg-gray-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isPending}
                  className="rounded-md border border-black bg-black px-3 py-1.5 text-xs font-medium text-white transition-opacity disabled:opacity-50"
                >
                  {isPending ? "Saving…" : "Save"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

type FinanceTabProps = {
  client: Client;
  history: ClientFinancialSnapshot[];
  onRecord: (entry: ClientFinancialSnapshot) => void;
  canEdit: boolean;
};

function FinanceTab({ client, history, onRecord, canEdit }: FinanceTabProps) {
  const latest = history.length ? history[history.length - 1] : null;
  const [form, setForm] = useState({
    equity: latest?.equity_stake?.toString() ?? "",
    monthly: latest?.monthly_revenue?.toString() ?? "",
    projected: latest?.projected_annual_revenue?.toString() ?? "",
    lastUpdated: latest?.last_updated ? latest.last_updated.slice(0, 10) : new Date().toISOString().slice(0, 10),
  });
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setForm({
      equity: latest?.equity_stake?.toString() ?? "",
      monthly: latest?.monthly_revenue?.toString() ?? "",
      projected: latest?.projected_annual_revenue?.toString() ?? "",
      lastUpdated: latest?.last_updated ? latest.last_updated.slice(0, 10) : new Date().toISOString().slice(0, 10),
    });
  }, [latest?.equity_stake, latest?.monthly_revenue, latest?.projected_annual_revenue, latest?.last_updated]);

  const trendData = useMemo(() => {
    if (history.length) {
      return history
        .filter((entry) => entry.monthly_revenue != null)
        .map((entry) => ({
          label: formatDate(entry.last_updated),
          value: entry.monthly_revenue as number,
        }));
    }

    const baseline = client.compounding?.baselineMRR ?? (client.arr ? client.arr / 12 : 0);
    const current = client.compounding?.currentMRR ?? baseline;
    return [
      { label: "Baseline", value: baseline * 0.9 },
      { label: "Current", value: baseline },
      { label: "Forecast", value: current },
    ];
  }, [client.arr, client.compounding, history]);

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);

    const equity = form.equity ? Number(form.equity) : null;
    const monthly = form.monthly ? Number(form.monthly) : null;
    const projected = form.projected ? Number(form.projected) : null;

    if (form.equity && Number.isNaN(equity)) {
      setError("Equity stake must be a number");
      return;
    }
    if (form.monthly && Number.isNaN(monthly)) {
      setError("Monthly revenue must be a number");
      return;
    }
    if (form.projected && Number.isNaN(projected)) {
      setError("Projected revenue must be a number");
      return;
    }

    startTransition(async () => {
      const entry = await actionRecordClientFinancials({
        clientId: client.id,
        equityStake: equity,
        monthlyRevenue: monthly,
        projectedAnnualRevenue: projected,
        lastUpdated: form.lastUpdated ? new Date(form.lastUpdated).toISOString() : undefined,
      });

      if (!entry) {
        setError("Failed to save financials");
        return;
      }

      onRecord(entry);
    });
  };

  return (
    <div className="flex min-h-0 flex-1 flex-col gap-4">
      <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
        <StatCard
          label="Equity Stake"
          value={formatPercent(latest?.equity_stake)}
          delta={latest?.last_updated ? `Updated ${formatDate(latest.last_updated)}` : "No entries"}
          trend="flat"
        />
        <StatCard
          label="Monthly Revenue"
          value={formatCurrency(latest?.monthly_revenue)}
          delta={latest?.monthly_revenue ? "Live from finance" : "Awaiting update"}
          trend="up"
        />
        <StatCard
          label="Projected Annual Revenue"
          value={formatCurrency(latest?.projected_annual_revenue)}
          delta={latest?.projected_annual_revenue ? "Based on current inputs" : "Set projection"}
          trend="up"
        />
      </div>

      <div className="grid min-h-0 grid-cols-1 gap-4 lg:grid-cols-3">
        <Card className="flex min-h-[260px] flex-col gap-4 p-5 lg:col-span-2">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-semibold text-black">Revenue Trend</h2>
            <span className="text-xs text-gray-500">{trendData.length} data points</span>
          </div>
          <div className="flex flex-1 items-center justify-center">
            {trendData.length === 0 ? (
              <div className="text-sm text-gray-500">No revenue history yet</div>
            ) : (
              <RevenueTrendChart data={trendData} />
            )}
          </div>
        </Card>

        <Card className="flex flex-col p-5">
          <h2 className="text-sm font-semibold text-black">Manual Update</h2>
          <p className="mt-1 text-xs text-gray-500">Admin-only override until HubSpot sync is live</p>
          {canEdit ? (
            <form onSubmit={handleSubmit} className="mt-4 space-y-3 text-sm">
              <label className="flex flex-col gap-1">
                <span className="text-xs font-semibold uppercase tracking-wide text-gray-500">Equity Stake (%)</span>
                <input
                  value={form.equity}
                  onChange={(event) => setForm((prev) => ({ ...prev, equity: event.target.value }))}
                  className="rounded-md border border-gray-300 px-3 py-2 text-sm text-gray-900 outline-none focus:border-gray-500"
                  placeholder="10"
                />
              </label>
              <label className="flex flex-col gap-1">
                <span className="text-xs font-semibold uppercase tracking-wide text-gray-500">Monthly Revenue ($)</span>
                <input
                  value={form.monthly}
                  onChange={(event) => setForm((prev) => ({ ...prev, monthly: event.target.value }))}
                  className="rounded-md border border-gray-300 px-3 py-2 text-sm text-gray-900 outline-none focus:border-gray-500"
                  placeholder="12000"
                />
              </label>
              <label className="flex flex-col gap-1">
                <span className="text-xs font-semibold uppercase tracking-wide text-gray-500">Projected Annual Revenue ($)</span>
                <input
                  value={form.projected}
                  onChange={(event) => setForm((prev) => ({ ...prev, projected: event.target.value }))}
                  className="rounded-md border border-gray-300 px-3 py-2 text-sm text-gray-900 outline-none focus:border-gray-500"
                  placeholder="150000"
                />
              </label>
              <label className="flex flex-col gap-1">
                <span className="text-xs font-semibold uppercase tracking-wide text-gray-500">Last Updated</span>
                <input
                  type="date"
                  value={form.lastUpdated}
                  onChange={(event) => setForm((prev) => ({ ...prev, lastUpdated: event.target.value }))}
                  className="rounded-md border border-gray-300 px-3 py-2 text-sm text-gray-900 outline-none focus:border-gray-500"
                />
              </label>
              {error && <p className="text-xs text-rose-600">{error}</p>}
              <div className="flex items-center justify-end">
                <button
                  type="submit"
                  disabled={isPending}
                  className="rounded-md border border-black bg-black px-3 py-1.5 text-xs font-medium text-white transition-opacity disabled:opacity-50"
                >
                  {isPending ? "Saving…" : "Save Metrics"}
                </button>
              </div>
            </form>
          ) : (
            <div className="mt-4 rounded-md border border-gray-200 bg-gray-50 p-3 text-xs text-gray-600">
              Financial editing restricted to administrators.
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}

type TrendDatum = { label: string; value: number };

function RevenueTrendChart({ data }: { data: TrendDatum[] }) {
  const max = Math.max(...data.map((item) => item.value), 1);
  const points = data.map((item, index) => ({
    x: index / Math.max(data.length - 1, 1),
    y: 1 - item.value / max,
  }));

  return (
    <svg viewBox="0 0 100 100" className="h-48 w-full text-black">
      <polyline
        fill="none"
        stroke="currentColor"
        strokeWidth={2}
        points={points.map((p) => `${p.x * 100},${p.y * 100}`).join(" ")}
      />
      {points.map((point, index) => (
        <circle key={index} cx={point.x * 100} cy={point.y * 100} r={1.8} fill="currentColor" />
      ))}
      {data.map((item, index) => (
        <text
          key={item.label + index}
          x={points[index].x * 100}
          y={100}
          dy={-2}
          textAnchor="middle"
          className="fill-gray-500 text-[8px]"
        >
          {item.label}
        </text>
      ))}
    </svg>
  );
}
