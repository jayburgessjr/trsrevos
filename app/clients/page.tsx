"use client";

import { useCallback, useMemo, useState, useTransition } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";

import { PageTabs } from "@/components/layout/PageTabs";
import { Badge } from "@/ui/badge";
import { Button } from "@/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/ui/card";
import { Input } from "@/ui/input";
import { PageDescription, PageTitle } from "@/ui/page-header";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/ui/table";
import { cn } from "@/lib/utils";
import { TRS_CARD, TRS_SECTION_TITLE, TRS_SUBTITLE } from "@/lib/style";
import { resolveTabs } from "@/lib/tabs";
import { syncClientHealth } from "@/core/clients/actions";
import { getClients, getClientStats } from "@/core/clients/store";

const healthLabel = (value: number) => {
  if (value >= 80) return { label: "Healthy", tone: "success" as const };
  if (value >= 60) return { label: "Monitoring", tone: "default" as const };
  return { label: "At risk", tone: "outline" as const };
};

const formatCurrency = (value?: number) =>
  value != null ? `$${value.toLocaleString()}` : "—";

export default function ClientsPage() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const tabs = useMemo(() => resolveTabs(pathname), [pathname]);
  const activeTab = useMemo(() => {
    const current = searchParams.get("tab");
    return current && tabs.includes(current) ? current : tabs[0];
  }, [searchParams, tabs]);

  const buildTabHref = useCallback(
    (tab: string) => {
      const params = new URLSearchParams(searchParams.toString());
      params.set("tab", tab);
      return `${pathname}?${params.toString()}`;
    },
    [pathname, searchParams],
  );

  const router = useRouter();
  const [syncMessage, setSyncMessage] = useState<string | null>(null);
  const [syncPending, startSync] = useTransition();
  const clients = useMemo(() => getClients(), []);
  const stats = useMemo(() => getClientStats(), []);

  const [search, setSearch] = useState("");
  const [segmentFilter, setSegmentFilter] = useState("all");
  const [ownerFilter, setOwnerFilter] = useState("all");
  const [sortBy, setSortBy] = useState("arr-desc");

  const segments = useMemo(
    () => Array.from(new Set(clients.map((client) => client.segment))),
    [clients],
  );
  const owners = useMemo(
    () => Array.from(new Set(clients.map((client) => client.owner))),
    [clients],
  );

  const totalArr = clients.reduce((sum, client) => sum + (client.arr ?? 0), 0);
  const expansionPipeline = clients.reduce(
    (sum, client) =>
      sum +
      client.opportunities.reduce(
        (value, opportunity) => value + (opportunity.amount ?? 0),
        0,
      ),
    0,
  );
  const upcomingQbrs = clients
    .filter((client) => client.qbrDate)
    .sort(
      (a, b) =>
        new Date(a.qbrDate ?? "").getTime() -
        new Date(b.qbrDate ?? "").getTime(),
    );
  const outstandingInvoices = clients.flatMap(
    (client) =>
      client.invoices
        ?.filter((invoice) => invoice.status !== "Paid")
        .map((invoice) => ({
          ...invoice,
          clientName: client.name,
          clientId: client.id,
        })) ?? [],
  );

  const filteredClients = useMemo(() => {
    let list = clients;

    if (search.trim()) {
      const term = search.trim().toLowerCase();
      list = list.filter(
        (client) =>
          client.name.toLowerCase().includes(term) ||
          (client.industry ?? "").toLowerCase().includes(term) ||
          (client.owner ?? "").toLowerCase().includes(term),
      );
    }

    if (segmentFilter !== "all") {
      list = list.filter((client) => client.segment === segmentFilter);
    }

    if (ownerFilter !== "all") {
      list = list.filter((client) => client.owner === ownerFilter);
    }

    return [...list].sort((a, b) => {
      switch (sortBy) {
        case "arr-asc":
          return (a.arr ?? 0) - (b.arr ?? 0);
        case "health-desc":
          return (b.health ?? 0) - (a.health ?? 0);
        case "health-asc":
          return (a.health ?? 0) - (b.health ?? 0);
        case "name-asc":
          return a.name.localeCompare(b.name);
        case "name-desc":
          return b.name.localeCompare(a.name);
        default:
          return (b.arr ?? 0) - (a.arr ?? 0);
      }
    });
  }, [clients, search, segmentFilter, ownerFilter, sortBy]);

  const dataCoverage = useMemo(() => {
    const totals = { collected: 0, available: 0, missing: 0 };
    clients.forEach((client) => {
      client.data.forEach((source) => {
        if (source.status === "Collected") totals.collected += 1;
        else if (source.status === "Available") totals.available += 1;
        else totals.missing += 1;
      });
    });
    return totals;
  }, [clients]);

  const churnSignals = useMemo(
    () => clients.filter((client) => (client.churnRisk ?? 0) >= 15),
    [clients],
  );

  return (
    <div className="mx-auto max-w-7xl space-y-4 px-4 py-4">
      <section className="space-y-3">
        <div className="space-y-1">
          <PageTitle className="text-xl font-semibold text-black">
            Client Portfolio
          </PageTitle>
          <PageDescription className="text-sm text-gray-500">
            Full-funnel visibility into active customers, health trends, and
            expansion momentum across TRS RevenueOS.
          </PageDescription>
        </div>

        <PageTabs tabs={tabs} activeTab={activeTab} hrefForTab={buildTabHref} />

        <div className="grid grid-cols-1 gap-3 md:grid-cols-2 lg:grid-cols-4">
          <Card className={cn(TRS_CARD)}>
            <CardContent className="p-4 space-y-2">
              <div className={TRS_SUBTITLE}>Portfolio ARR</div>
              <div className="text-2xl font-semibold text-black">
                {formatCurrency(totalArr)}
              </div>
              <div className="text-xs text-gray-600">
                Across {clients.length} active clients
              </div>
            </CardContent>
          </Card>
          <Card className={cn(TRS_CARD)}>
            <CardContent className="p-4 space-y-2">
              <div className={TRS_SUBTITLE}>Average Health</div>
              <div className="text-2xl font-semibold text-black">
                {stats.avgHealth}%
              </div>
              <div className="text-xs text-gray-600">
                {stats.atRisk} accounts monitored closely
              </div>
            </CardContent>
          </Card>
          <Card className={cn(TRS_CARD)}>
            <CardContent className="p-4 space-y-2">
              <div className={TRS_SUBTITLE}>Expansion Pipeline</div>
              <div className="text-2xl font-semibold text-black">
                {formatCurrency(expansionPipeline)}
              </div>
              <div className="text-xs text-gray-600">
                {stats.expansions} active expansion motions
              </div>
            </CardContent>
          </Card>
          <Card className={cn(TRS_CARD)}>
            <CardContent className="p-4 space-y-2">
              <div className={TRS_SUBTITLE}>Upcoming QBRs</div>
              <div className="text-2xl font-semibold text-black">
                {upcomingQbrs.slice(0, 3).length}
              </div>
              <div className="text-xs text-gray-600">
                within the next 45 days
              </div>
            </CardContent>
          </Card>
        </div>

        {activeTab === "Overview" && (
          <div className="space-y-4">
            <Card className={cn(TRS_CARD, "p-4 space-y-4")}>
              <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                <div className="space-y-1">
                  <PageTitle className="text-lg font-semibold text-black">
                    Customer Health Command Center
                  </PageTitle>
                  <PageDescription className="text-sm text-gray-500">
                    Blend renewal signals, enablement gaps, and expansion bets
                    into one decisive view.
                  </PageDescription>
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  <Button
                    variant="primary"
                    size="sm"
                    disabled={syncPending}
                    onClick={() =>
                      startSync(async () => {
                        const result = await syncClientHealth();
                        setSyncMessage(
                          result.ok
                            ? `Health sync captured ${result.processed ?? 0} snapshots`
                            : "Health sync failed"
                        );
                      })
                    }
                  >
                    {syncPending ? "Syncing…" : "Run health sync"}
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => router.push("/partners")}
                  >
                    Sync partners
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => router.push("/projects")}
                  >
                    Open delivery board
                  </Button>
                </div>
              </div>

              <div className="grid grid-cols-1 gap-3 lg:grid-cols-3">
                <div className="rounded-lg border border-gray-200 bg-white p-3">
                  <div className={TRS_SECTION_TITLE}>Health spotlight</div>
                  {syncMessage ? (
                    <div className="mt-2 text-xs text-gray-500">{syncMessage}</div>
                  ) : null}
                  <ul className="mt-3 space-y-2 text-sm text-gray-700">
                    {clients
                      .slice()
                      .sort((a, b) => (a.health ?? 0) - (b.health ?? 0))
                      .slice(0, 3)
                      .map((client) => (
                        <li
                          key={client.id}
                          className="flex items-center justify-between"
                        >
                          <div>
                            <div className="font-medium text-black">
                              {client.name}
                            </div>
                            <div className="text-xs text-gray-500">
                              Owner {client.owner}
                            </div>
                          </div>
                          <Badge variant={healthLabel(client.health ?? 0).tone}>
                            {client.health}%
                          </Badge>
                        </li>
                      ))}
                  </ul>
                </div>
                <div className="rounded-lg border border-gray-200 bg-white p-3">
                  <div className={TRS_SECTION_TITLE}>Next 30 days</div>
                  <ul className="mt-3 space-y-2 text-sm text-gray-700">
                    {upcomingQbrs.slice(0, 4).map((client) => (
                      <li
                        key={client.id}
                        className="flex items-center justify-between"
                      >
                        <div>
                          <div className="font-medium text-black">
                            {client.name}
                          </div>
                          <div className="text-xs text-gray-500">
                            QBR • {client.phase}
                          </div>
                        </div>
                        <span className="text-xs text-gray-600">
                          {new Date(client.qbrDate ?? "").toLocaleDateString(
                            "en-US",
                            { month: "short", day: "numeric" },
                          )}
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>
                <div className="rounded-lg border border-gray-200 bg-white p-3">
                  <div className={TRS_SECTION_TITLE}>Expansion focus</div>
                  <div className="mt-3 space-y-2 text-sm text-gray-700">
                    {clients
                      .filter((client) => client.isExpansion)
                      .slice(0, 3)
                      .map((client) => (
                        <div
                          key={client.id}
                          className="flex items-center justify-between"
                        >
                          <div>
                            <div className="font-medium text-black">
                              {client.name}
                            </div>
                            <div className="text-xs text-gray-500">
                              {client.opportunities[0]?.stage ?? "Discovery"} •{" "}
                              {client.opportunities[0]?.name ?? "Expansion"}
                            </div>
                          </div>
                          <span className="text-xs text-gray-600">
                            {formatCurrency(client.opportunities[0]?.amount)}
                          </span>
                        </div>
                      ))}
                  </div>
                </div>
              </div>
            </Card>

            <div className="grid grid-cols-1 gap-3 lg:grid-cols-2">
              <Card className={cn(TRS_CARD)}>
                <CardHeader>
                  <CardTitle className="text-sm font-medium">
                    Outstanding invoices
                  </CardTitle>
                  <CardDescription>
                    Cash flow watchlist across the portfolio.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  {outstandingInvoices.length === 0 ? (
                    <div className="rounded-lg border border-dashed border-gray-300 p-6 text-center text-sm text-gray-600">
                      No invoices outstanding.
                    </div>
                  ) : (
                    outstandingInvoices.map((invoice) => (
                      <div
                        key={invoice.id}
                        className="rounded-lg border border-gray-200 bg-white p-3"
                      >
                        <div className="flex items-center justify-between text-sm">
                          <span className="font-semibold text-black">
                            {invoice.clientName}
                          </span>
                          <span className="text-xs text-gray-500">
                            {invoice.status}
                          </span>
                        </div>
                        <div className="mt-1 text-xs text-gray-500">
                          Invoice {invoice.id}
                        </div>
                        <div className="mt-2 flex items-center justify-between text-sm text-gray-700">
                          <span>{formatCurrency(invoice.amount)}</span>
                          {invoice.dueAt && (
                            <span>
                              Due{" "}
                              {new Date(invoice.dueAt).toLocaleDateString(
                                "en-US",
                                { month: "short", day: "numeric" },
                              )}
                            </span>
                          )}
                        </div>
                      </div>
                    ))
                  )}
                </CardContent>
              </Card>

              <Card className={cn(TRS_CARD)}>
                <CardHeader>
                  <CardTitle className="text-sm font-medium">
                    Data coverage
                  </CardTitle>
                  <CardDescription>
                    Ensure every client powers the RevOS decision loop.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-3">
                    {["collected", "available", "missing"].map((band) => (
                      <div key={band} className="flex items-center gap-3">
                        <div className="w-20 text-xs font-semibold uppercase text-gray-400">
                          {band}
                        </div>
                        <div className="flex-1">
                          <div className="h-2 rounded-full bg-gray-100">
                            <div
                              className={`h-full ${
                                band === "collected"
                                  ? "bg-gray-900"
                                  : band === "available"
                                    ? "bg-gray-700"
                                    : "bg-gray-500"
                              }`}
                              style={{
                                width: `${
                                  dataCoverage.collected +
                                  dataCoverage.available +
                                  dataCoverage.missing
                                    ? (dataCoverage[
                                        band as keyof typeof dataCoverage
                                      ] /
                                        (dataCoverage.collected +
                                          dataCoverage.available +
                                          dataCoverage.missing)) *
                                      100
                                    : 0
                                }%`,
                              }}
                            />
                          </div>
                        </div>
                        <div className="w-10 text-right text-xs text-gray-500">
                          {dataCoverage[band as keyof typeof dataCoverage]}
                        </div>
                      </div>
                    ))}
                  </div>
                  <p className="text-sm text-gray-600">
                    Rally data integrations ahead of QBRs so every renewal
                    conversation is grounded in performance proof.
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        )}

        {activeTab === "Accounts" && (
          <Card className={cn(TRS_CARD)}>
            <CardHeader>
              <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
                <div>
                  <CardTitle>Client accounts</CardTitle>
                  <CardDescription>
                    Sort by health, ARR, or owner to plan your touchpoints.
                  </CardDescription>
                </div>
                <div className="flex flex-col gap-2 md:flex-row md:items-center">
                  <Input
                    value={search}
                    onChange={(event) => setSearch(event.target.value)}
                    placeholder="Search by name, owner, or industry"
                    className="h-9 md:w-72"
                  />
                  <div className="flex flex-wrap items-center gap-2">
                    <select
                      value={segmentFilter}
                      onChange={(event) => setSegmentFilter(event.target.value)}
                      className="h-9 rounded-md border border-gray-200 bg-white px-3 text-sm"
                    >
                      <option value="all">All Segments</option>
                      {segments.map((segment) => (
                        <option key={segment} value={segment}>
                          {segment}
                        </option>
                      ))}
                    </select>
                    <select
                      value={ownerFilter}
                      onChange={(event) => setOwnerFilter(event.target.value)}
                      className="h-9 rounded-md border border-gray-200 bg-white px-3 text-sm"
                    >
                      <option value="all">All Owners</option>
                      {owners.map((owner) => (
                        <option key={owner} value={owner}>
                          {owner}
                        </option>
                      ))}
                    </select>
                    <select
                      value={sortBy}
                      onChange={(event) => setSortBy(event.target.value)}
                      className="h-9 rounded-md border border-gray-200 bg-white px-3 text-sm"
                    >
                      <option value="arr-desc">ARR (High to Low)</option>
                      <option value="arr-asc">ARR (Low to High)</option>
                      <option value="health-desc">Health (High to Low)</option>
                      <option value="health-asc">Health (Low to High)</option>
                      <option value="name-asc">Name (A-Z)</option>
                      <option value="name-desc">Name (Z-A)</option>
                    </select>
                  </div>
                </div>
              </div>
            </CardHeader>
            <CardContent className="overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Client</TableHead>
                    <TableHead>Owner</TableHead>
                    <TableHead>Segment</TableHead>
                    <TableHead>Phase</TableHead>
                    <TableHead className="text-right">ARR</TableHead>
                    <TableHead className="text-right">Health</TableHead>
                    <TableHead className="text-right">Churn Risk</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredClients.map((client) => (
                    <TableRow
                      key={client.id}
                      className="cursor-pointer transition hover:bg-gray-50"
                      onClick={() => router.push(`/clients/${client.id}`)}
                    >
                      <TableCell>
                        <div className="font-medium text-black">
                          {client.name}
                        </div>
                        <div className="text-xs text-gray-500">
                          {client.industry ?? "—"}
                        </div>
                      </TableCell>
                      <TableCell className="text-sm text-gray-700">
                        {client.owner}
                      </TableCell>
                      <TableCell className="text-sm text-gray-700">
                        {client.segment}
                      </TableCell>
                      <TableCell className="text-sm text-gray-700">
                        {client.phase}
                      </TableCell>
                      <TableCell className="text-right font-medium text-black">
                        {formatCurrency(client.arr)}
                      </TableCell>
                      <TableCell className="text-right text-sm text-gray-700">
                        {client.health}%
                      </TableCell>
                      <TableCell className="text-right text-sm text-gray-700">
                        {client.churnRisk != null
                          ? `${client.churnRisk}%`
                          : "—"}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        )}

        {activeTab === "Engagement" && (
          <div className="grid grid-cols-1 gap-3 lg:grid-cols-2">
            <Card className={cn(TRS_CARD)}>
              <CardHeader>
                <CardTitle className="text-sm font-medium">
                  Discovery & enablement
                </CardTitle>
                <CardDescription>
                  Progress through the RevOS methodology.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3 text-sm text-gray-700">
                {clients.map((client) => (
                  <div
                    key={client.id}
                    className="rounded-lg border border-gray-200 bg-white p-3"
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="font-semibold text-black">
                          {client.name}
                        </div>
                        <div className="text-xs text-gray-500">
                          Phase {client.phase}
                        </div>
                      </div>
                      <Badge
                        variant={
                          client.discovery.some((qa) => qa.answer)
                            ? "success"
                            : "outline"
                        }
                      >
                        {client.discovery.some((qa) => qa.answer)
                          ? "In motion"
                          : "Pending"}
                      </Badge>
                    </div>
                    <div className="mt-2 text-xs text-gray-500">
                      {client.discovery.filter((qa) => qa.answer).length}{" "}
                      answered • {client.discovery.length} prompts
                    </div>
                    <div className="mt-2 text-xs text-gray-600">
                      Top lever:{" "}
                      {client.discovery.find((qa) => qa.answer)?.answer ??
                        "To be defined"}
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>

            <Card className={cn(TRS_CARD)}>
              <CardHeader>
                <CardTitle className="text-sm font-medium">
                  Product adoption signals
                </CardTitle>
                <CardDescription>
                  Key drivers fueling retention and growth.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3 text-sm text-gray-700">
                {clients.map((client) => (
                  <div
                    key={client.id}
                    className="rounded-lg border border-gray-200 bg-white p-3"
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="font-semibold text-black">
                          {client.name}
                        </div>
                        <div className="text-xs text-gray-500">
                          Net new this quarter
                        </div>
                      </div>
                      <span className="text-sm font-medium text-black">
                        {formatCurrency(client.compounding?.netNew)}
                      </span>
                    </div>
                    <div className="mt-2 text-xs text-gray-500">
                      Baseline MRR{" "}
                      {formatCurrency(client.compounding?.baselineMRR)} →
                      Current {formatCurrency(client.compounding?.currentMRR)}
                    </div>
                    <ul className="mt-2 space-y-1 text-xs text-gray-600">
                      {client.compounding?.drivers.map((driver) => (
                        <li key={driver.name}>
                          • {driver.name}: +{formatCurrency(driver.delta)}
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>
        )}

        {activeTab === "Renewals" && (
          <div className="grid grid-cols-1 gap-3 lg:grid-cols-2">
            <Card className={cn(TRS_CARD)}>
              <CardHeader>
                <CardTitle className="text-sm font-medium">
                  Renewal calendar
                </CardTitle>
                <CardDescription>
                  QBRs and contract checkpoints on deck.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3 text-sm text-gray-700">
                {upcomingQbrs.map((client) => (
                  <div
                    key={client.id}
                    className="rounded-lg border border-gray-200 bg-white p-3"
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="font-semibold text-black">
                          {client.name}
                        </div>
                        <div className="text-xs text-gray-500">
                          Owner {client.owner}
                        </div>
                      </div>
                      <span className="text-xs text-gray-600">
                        {new Date(client.qbrDate ?? "").toLocaleDateString(
                          "en-US",
                          { month: "short", day: "numeric" },
                        )}
                      </span>
                    </div>
                    <div className="mt-2 text-xs text-gray-500">
                      Plan {client.commercials?.plan ?? "—"}
                    </div>
                    <div className="mt-2 text-xs text-gray-600">
                      Next step:{" "}
                      {client.opportunities[0]?.nextStep ?? "Confirm agenda"}
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>

            <Card className={cn(TRS_CARD)}>
              <CardHeader>
                <CardTitle className="text-sm font-medium">
                  Commercial posture
                </CardTitle>
                <CardDescription>
                  Pricing, term, and approval guardrails at a glance.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3 text-sm text-gray-700">
                {clients.map((client) => (
                  <div
                    key={client.id}
                    className="rounded-lg border border-gray-200 bg-white p-3"
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="font-semibold text-black">
                          {client.name}
                        </div>
                        <div className="text-xs text-gray-500">
                          Term {client.commercials?.termMonths ?? "—"} months
                        </div>
                      </div>
                      <span className="text-xs text-gray-600">
                        Discount {client.commercials?.discountPct ?? 0}%
                      </span>
                    </div>
                    <div className="mt-2 text-xs text-gray-500">
                      Approvals:{" "}
                      {client.commercials?.approvals?.join(", ") ?? "N/A"}
                    </div>
                    <div className="mt-2 text-xs text-gray-600">
                      Payment terms:{" "}
                      {client.commercials?.paymentTerms ?? "Standard"}
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>
        )}

        {activeTab === "Signals" && (
          <div className="grid grid-cols-1 gap-3 lg:grid-cols-2">
            <Card className={cn(TRS_CARD)}>
              <CardHeader>
                <CardTitle className="text-sm font-medium">
                  Churn watchlist
                </CardTitle>
                <CardDescription>
                  Accounts requiring proactive outreach.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                {churnSignals.length === 0 ? (
                  <div className="rounded-lg border border-dashed border-gray-300 p-6 text-center text-sm text-gray-600">
                    No high-risk accounts. Keep the momentum.
                  </div>
                ) : (
                  churnSignals.map((client) => (
                    <div
                      key={client.id}
                      className="rounded-lg border border-gray-200 bg-white p-3"
                    >
                      <div className="flex items-center justify-between text-sm">
                        <span className="font-semibold text-black">
                          {client.name}
                        </span>
                        <Badge variant="outline">
                          {client.churnRisk}% risk
                        </Badge>
                      </div>
                      <div className="mt-1 text-xs text-gray-500">
                        Owner {client.owner}
                      </div>
                      <div className="mt-2 text-xs text-gray-600">
                        Latest note: {client.notes ?? "Schedule executive sync"}
                      </div>
                    </div>
                  ))
                )}
              </CardContent>
            </Card>

            <Card className={cn(TRS_CARD)}>
              <CardHeader>
                <CardTitle className="text-sm font-medium">
                  Partner leverage
                </CardTitle>
                <CardDescription>
                  Who can help reinforce retention stories.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3 text-sm text-gray-700">
                {clients.map((client) => (
                  <div
                    key={client.id}
                    className="rounded-lg border border-gray-200 bg-white p-3"
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="font-semibold text-black">
                          {client.name}
                        </div>
                        <div className="text-xs text-gray-500">
                          Partners: {client.qra?.partners?.join(", ") ?? "TBD"}
                        </div>
                      </div>
                      <Button
                        size="sm"
                        variant="outline"
                        className="h-7 px-3 text-xs"
                        onClick={() => router.push(`/partners?tab=Directory`)}
                      >
                        Explore partners
                      </Button>
                    </div>
                    <div className="mt-2 text-xs text-gray-600">
                      Retention plays:{" "}
                      {client.qra?.retention?.join(", ") ??
                        "Add retention plan"}
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>
        )}
      </section>
    </div>
  );
}
