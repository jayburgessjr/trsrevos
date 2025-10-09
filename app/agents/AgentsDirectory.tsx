"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";

import { Card } from "@/components/kit/Card";
import type { AgentMeta } from "@/core/agents/types";

type AgentStatus = { enabled: boolean; lastRun?: string; lastSummary?: string; impact$?: number };

type AgentRecord = { meta: AgentMeta; status: AgentStatus };

const STATUS_TONES: Record<string, { badge: string }> = {
  Active: { badge: "bg-emerald-100 text-emerald-700" },
  Idle: { badge: "bg-amber-100 text-amber-700" },
  Offline: { badge: "bg-gray-200 text-gray-700" },
};

function computeStatus(enabled: boolean, lastRun?: string) {
  if (!enabled) {
    return "Offline" as const;
  }
  return lastRun ? ("Active" as const) : ("Idle" as const);
}

export default function AgentsDirectory({ agents }: { agents: AgentRecord[] }) {
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [statusOverrides, setStatusOverrides] = useState(() =>
    new Map(agents.map((agent) => [agent.meta.key, agent.status.enabled])),
  );

  useEffect(() => {
    setStatusOverrides(new Map(agents.map((agent) => [agent.meta.key, agent.status.enabled])));
  }, [agents]);

  const filteredAgents = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();

    return agents.filter((agent) => {
      const enabled = statusOverrides.get(agent.meta.key) ?? agent.status.enabled;
      const status = computeStatus(enabled, agent.status.lastRun);
      const matchesQuery =
        !normalizedQuery ||
        agent.meta.name.toLowerCase().includes(normalizedQuery) ||
        agent.meta.description.toLowerCase().includes(normalizedQuery) ||
        agent.meta.category.toLowerCase().includes(normalizedQuery);
      const matchesFilter =
        statusFilter === "all" ||
        (statusFilter === "active" && status === "Active") ||
        (statusFilter === "idle" && status === "Idle") ||
        (statusFilter === "offline" && status === "Offline");

      return matchesQuery && matchesFilter;
    });
  }, [agents, query, statusFilter, statusOverrides]);

  const handleToggle = (key: AgentMeta["key"]) => {
    setStatusOverrides((prev) => {
      const next = new Map(prev);
      const current = prev.get(key) ?? true;
      next.set(key, !current);
      return next;
    });
  };

  return (
    <div className="space-y-6">
      <header className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-black">TRS Agents</h1>
          <p className="mt-1 text-sm text-gray-600">
            Manage intelligence modules powering RevenueOS workflows.
          </p>
        </div>
        <div className="flex w-full flex-col gap-2 md:w-auto md:flex-row md:items-center">
          <input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search agents..."
            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-900 placeholder:text-gray-500 focus:border-black focus:outline-none focus:ring-2 focus:ring-black/10 md:w-64"
          />
          <select
            value={statusFilter}
            onChange={(event) => setStatusFilter(event.target.value)}
            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-900 focus:border-black focus:outline-none focus:ring-2 focus:ring-black/10 md:w-40"
          >
            <option value="all">All statuses</option>
            <option value="active">Active</option>
            <option value="idle">Idle</option>
            <option value="offline">Offline</option>
          </select>
        </div>
      </header>

      {filteredAgents.length === 0 ? (
        <Card className="border-dashed bg-gray-50 p-6 text-center text-sm text-gray-600">
          No agents match the current filters.
        </Card>
      ) : (
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-2 xl:grid-cols-3">
          {filteredAgents.map((agent) => {
            const enabled = statusOverrides.get(agent.meta.key) ?? agent.status.enabled;
            const status = computeStatus(enabled, agent.status.lastRun);
            const tone = STATUS_TONES[status];

            return (
              <Card key={agent.meta.key} className="flex h-full flex-col p-4 transition hover:shadow-sm">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <h2 className="text-sm font-semibold text-black">{agent.meta.name}</h2>
                    <p className="mt-1 text-xs leading-relaxed text-gray-600">{agent.meta.description}</p>
                  </div>
                  <span className="inline-flex items-center rounded-full bg-gray-100 px-2.5 py-1 text-[11px] font-medium uppercase tracking-wide text-gray-700">
                    {agent.meta.category}
                  </span>
                </div>

                <div className="mt-4 flex items-center justify-between text-xs">
                  <span className="font-medium text-gray-700">Status</span>
                  <span className={`inline-flex items-center rounded-full px-2 py-1 ${tone.badge}`}>
                    {status}
                  </span>
                </div>
                <div className="mt-2 grid grid-cols-2 gap-3 text-[11px] text-gray-600">
                  <div>
                    <div className="text-gray-500">Last run</div>
                    <div className="mt-0.5 text-gray-700">
                      {agent.status.lastRun
                        ? new Date(agent.status.lastRun).toLocaleString()
                        : 'No runs yet'}
                    </div>
                  </div>
                  <div>
                    <div className="text-gray-500">Impact generated</div>
                    <div className="mt-0.5 font-medium text-gray-800">
                      {agent.status.impact$
                        ? `$${Number(agent.status.impact$).toLocaleString()}`
                        : '—'}
                    </div>
                  </div>
                </div>

                <div className="mt-4 flex flex-col gap-2 text-xs font-medium text-gray-700 md:flex-row md:items-center md:justify-between">
                  <Link
                    href={`/agents/${agent.meta.key}`}
                    className="inline-flex items-center justify-center rounded-lg border border-gray-300 px-3 py-2 text-sm font-semibold text-black transition hover:border-black hover:bg-gray-50"
                  >
                    Open Agent
                  </Link>
                  <button
                    type="button"
                    onClick={() => handleToggle(agent.meta.key)}
                    className="inline-flex items-center justify-center rounded-lg border border-gray-300 px-3 py-2 text-sm font-semibold text-gray-700 transition hover:border-black hover:text-black"
                  >
                    {enabled ? 'Deactivate' : 'Activate'}
                  </button>
                </div>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
