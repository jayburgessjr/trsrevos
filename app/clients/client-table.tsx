"use client";

import { useCallback, useMemo, useState, type KeyboardEvent } from "react";
import { useRouter } from "next/navigation";
import { ArrowUpDown } from "lucide-react";

import type { Client, RevOSPhase } from "@/core/clients/types";
import { Input } from "@/ui/input";
import { Select } from "@/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/ui/table";

const PHASES: RevOSPhase[] = ["Discovery", "Data", "Algorithm", "Architecture", "Compounding"];
const SEGMENTS: Client["segment"][] = ["SMB", "Mid", "Enterprise"];

type SortField = "name" | "segment" | "arr" | "owner" | "phase" | "health" | "dealType" | "monthlyRevenue";
type SortDirection = "asc" | "desc";

export function ClientsTable({ data }: { data: Client[] }) {
  const router = useRouter();
  const [search, setSearch] = useState("");
  const [segment, setSegment] = useState<string>("all");
  const [phase, setPhase] = useState<string>("all");
  const [sortField, setSortField] = useState<SortField>("name");
  const [sortDirection, setSortDirection] = useState<SortDirection>("asc");

  const calculateMonthlyRevenue = useCallback((client: Client): number => {
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
  }, []);

  const filtered = useMemo(() => {
    const query = search.trim().toLowerCase();
    let results = data.filter((client) => {
      const matchesQuery =
        !query ||
        client.name.toLowerCase().includes(query) ||
        client.owner.toLowerCase().includes(query) ||
        (client.industry?.toLowerCase().includes(query) ?? false);
      const matchesSegment = segment === "all" || client.segment === segment;
      const matchesPhase = phase === "all" || client.phase === phase;
      return matchesQuery && matchesSegment && matchesPhase;
    });

    // Sort results
    results.sort((a, b) => {
      let aValue: any;
      let bValue: any;

      switch (sortField) {
        case "name":
          aValue = a.name.toLowerCase();
          bValue = b.name.toLowerCase();
          break;
        case "segment":
          aValue = a.segment;
          bValue = b.segment;
          break;
        case "arr":
          aValue = a.arr ?? 0;
          bValue = b.arr ?? 0;
          break;
        case "owner":
          aValue = a.owner.toLowerCase();
          bValue = b.owner.toLowerCase();
          break;
        case "phase":
          aValue = a.phase;
          bValue = b.phase;
          break;
        case "health":
          aValue = a.health ?? 0;
          bValue = b.health ?? 0;
          break;
        case "dealType":
          aValue = a.dealType ?? "";
          bValue = b.dealType ?? "";
          break;
        case "monthlyRevenue":
          aValue = calculateMonthlyRevenue(a);
          bValue = calculateMonthlyRevenue(b);
          break;
        default:
          return 0;
      }

      if (aValue < bValue) return sortDirection === "asc" ? -1 : 1;
      if (aValue > bValue) return sortDirection === "asc" ? 1 : -1;
      return 0;
    });

    return results;
  }, [data, search, segment, phase, sortField, sortDirection, calculateMonthlyRevenue]);

  const toggleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortDirection("asc");
    }
  };

  const navigate = useCallback(
    (id: string) => {
      router.push(`/clients/${id}`);
    },
    [router],
  );

  const formatCurrency = useCallback((value?: number) => {
    if (value == null) return "—";
    return `$${value.toLocaleString()}`;
  }, []);

  const formatDealType = useCallback((dealType?: Client["dealType"]) => {
    if (!dealType) return "—";
    switch (dealType) {
      case "invoiced":
        return "Invoiced";
      case "equity_partnership":
        return "Equity Partnership";
      case "equity":
        return "Equity";
      default:
        return dealType;
    }
  }, []);

  const handleKeyDown = useCallback(
    (event: KeyboardEvent<HTMLTableRowElement>, id: string) => {
      if (event.key === "Enter" || event.key === " ") {
        event.preventDefault();
        navigate(id);
      }
    },
    [navigate],
  );

  return (
    <div className="space-y-4">
      <div className="grid gap-3 md:grid-cols-4">
        <div className="md:col-span-2">
          <Input
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search by name, owner, or industry"
            aria-label="Search clients"
            className="bg-white text-sm dark:bg-neutral-950 dark:text-neutral-100"
          />
        </div>
        <Select
          value={segment}
          onChange={(event) => setSegment(event.target.value)}
          aria-label="Filter by segment"
          className="bg-white text-sm dark:bg-neutral-950 dark:text-neutral-100"
        >
          <option value="all">All segments</option>
          {SEGMENTS.map((option) => (
            <option key={option} value={option}>
              {option}
            </option>
          ))}
        </Select>
        <Select
          value={phase}
          onChange={(event) => setPhase(event.target.value)}
          aria-label="Filter by phase"
          className="bg-white text-sm dark:bg-neutral-950 dark:text-neutral-100"
        >
          <option value="all">All phases</option>
          {PHASES.map((option) => (
            <option key={option} value={option}>
              {option}
            </option>
          ))}
        </Select>
      </div>

      <div className="rounded-xl border border-[color:var(--color-outline)] bg-white shadow-sm dark:border-neutral-800 dark:bg-neutral-950">
        <Table className="text-sm">
          <TableHeader>
            <TableRow>
              <TableHead>
                <button
                  onClick={() => toggleSort("name")}
                  className="flex items-center gap-1 hover:text-gray-900 dark:hover:text-white"
                >
                  Name
                  <ArrowUpDown className="h-3 w-3" />
                </button>
              </TableHead>
              <TableHead>
                <button
                  onClick={() => toggleSort("segment")}
                  className="flex items-center gap-1 hover:text-gray-900 dark:hover:text-white"
                >
                  Segment
                  <ArrowUpDown className="h-3 w-3" />
                </button>
              </TableHead>
              <TableHead>
                <button
                  onClick={() => toggleSort("arr")}
                  className="flex items-center gap-1 hover:text-gray-900 dark:hover:text-white"
                >
                  ARR
                  <ArrowUpDown className="h-3 w-3" />
                </button>
              </TableHead>
              <TableHead>
                <button
                  onClick={() => toggleSort("owner")}
                  className="flex items-center gap-1 hover:text-gray-900 dark:hover:text-white"
                >
                  Owner
                  <ArrowUpDown className="h-3 w-3" />
                </button>
              </TableHead>
              <TableHead>
                <button
                  onClick={() => toggleSort("phase")}
                  className="flex items-center gap-1 hover:text-gray-900 dark:hover:text-white"
                >
                  Phase
                  <ArrowUpDown className="h-3 w-3" />
                </button>
              </TableHead>
              <TableHead>
                <button
                  onClick={() => toggleSort("health")}
                  className="flex items-center gap-1 hover:text-gray-900 dark:hover:text-white"
                >
                  Health
                  <ArrowUpDown className="h-3 w-3" />
                </button>
              </TableHead>
              <TableHead>
                <button
                  onClick={() => toggleSort("dealType")}
                  className="flex items-center gap-1 hover:text-gray-900 dark:hover:text-white"
                >
                  Deal Type
                  <ArrowUpDown className="h-3 w-3" />
                </button>
              </TableHead>
              <TableHead>
                <button
                  onClick={() => toggleSort("monthlyRevenue")}
                  className="flex items-center gap-1 hover:text-gray-900 dark:hover:text-white"
                >
                  Monthly Revenue
                  <ArrowUpDown className="h-3 w-3" />
                </button>
              </TableHead>
              <TableHead>Open Opps</TableHead>
              <TableHead>AR</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.map((client) => {
              const openOpps = client.opportunities.filter(
                (opp) => opp.stage !== "ClosedWon" && opp.stage !== "ClosedLost",
              ).length;
              const outstanding = client.invoices
                .filter((invoice) => invoice.status === "Overdue" || invoice.status === "Sent")
                .reduce((sum, invoice) => sum + invoice.amount, 0);
              return (
                <TableRow
                  key={client.id}
                  role="button"
                  tabIndex={0}
                  className="cursor-pointer focus-visible:outline focus-visible:outline-2 focus-visible:outline-[var(--trs-accent)]"
                  onClick={() => navigate(client.id)}
                  onKeyDown={(event) => handleKeyDown(event, client.id)}
                >
                  <TableCell className="font-medium">{client.name}</TableCell>
                  <TableCell>{client.segment}</TableCell>
                  <TableCell>{formatCurrency(client.arr)}</TableCell>
                  <TableCell>{client.owner}</TableCell>
                  <TableCell>
                    <span className="rounded-full bg-[var(--trs-accent)] px-2 py-[2px] text-[10px] uppercase tracking-wide text-white">
                      {client.phase}
                    </span>
                  </TableCell>
                  <TableCell>{Math.round(client.health)}</TableCell>
                  <TableCell>{formatDealType(client.dealType)}</TableCell>
                  <TableCell>{formatCurrency(calculateMonthlyRevenue(client))}</TableCell>
                  <TableCell>{openOpps}</TableCell>
                  <TableCell>{formatCurrency(outstanding)}</TableCell>
                </TableRow>
              );
            })}
            {filtered.length === 0 && (
              <TableRow>
                <TableCell colSpan={10} className="text-center text-sm text-gray-500 dark:text-neutral-400">
                  No clients match the current filters.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
