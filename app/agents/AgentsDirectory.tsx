"use client";

import { useCallback, useEffect, useMemo, useState, useTransition } from "react";
import { usePathname, useSearchParams } from "next/navigation";
import Link from "next/link";

import { PageTabs } from "@/components/layout/PageTabs";
import { Card } from "@/components/kit/Card";
import { cn } from "@/lib/utils";
import { TRS_CARD } from "@/lib/style";
import { actionRunAgent, actionToggleAgent } from "@/core/agents/actions";
import type { AgentMeta } from "@/core/agents/types";
import { resolveTabs } from "@/lib/tabs";

type AgentStatus = {
  enabled: boolean;
  lastRun?: string;
  lastSummary?: string;
  impact$?: number;
};

type AgentRecord = { meta: AgentMeta; status: AgentStatus };

type GPTAgent = {
  name: string;
  description: string;
  url: string;
  category: string;
};

const STATUS_TONES: Record<string, { badge: string }> = {
  Active: { badge: "border border-gray-300 bg-white text-gray-700" },
  Idle: { badge: "border border-gray-300 bg-white text-gray-600" },
  Offline: { badge: "border border-gray-300 bg-white text-gray-500" },
};

const GPT_AGENTS: GPTAgent[] = [
  {
    name: "Revenue Science Advisor",
    description:
      "Expert guidance on revenue operations, pricing strategy, and growth frameworks. Helps analyze deals, optimize pricing, and build predictable revenue systems.",
    url: "https://chatgpt.com/g/g-686b5c0bdcec8191b43a5065baff3de7-revenue-science-advisor?model=gpt-4o",
    category: "Revenue Strategy",
  },
  {
    name: "Scholarly Mentor",
    description:
      "Academic research assistant and educational mentor. Provides scholarly insights, research guidance, and learning support across various disciplines.",
    url: "https://chatgpt.com/g/g-686c749ae3488191b09203dc7bc02ab6-scholarly-mentor?model=gpt-4o",
    category: "Education & Research",
  },
  {
    name: "Revenue Agent Architect",
    description:
      "Specialized in designing and architecting revenue agent systems. Helps build automated workflows, agent pipelines, and revenue intelligence frameworks.",
    url: "https://chatgpt.com/g/g-68e5382ab9f48191bf653cff8d80d0b1-revenue-agent-architect",
    category: "Agent Design",
  },
];

function computeStatus(enabled: boolean, lastRun?: string) {
  if (!enabled) {
    return "Offline" as const;
  }
  return lastRun ? ("Active" as const) : ("Idle" as const);
}

export default function AgentsDirectory({ agents }: { agents: AgentRecord[] }) {
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

  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [statusOverrides, setStatusOverrides] = useState(
    () =>
      new Map(agents.map((agent) => [agent.meta.key, agent.status.enabled])),
  );
  const [runMessage, setRunMessage] = useState<string | null>(null);
  const [runPending, startRun] = useTransition();
  const [togglePending, startToggle] = useTransition();

  useEffect(() => {
    setStatusOverrides(
      new Map(agents.map((agent) => [agent.meta.key, agent.status.enabled])),
    );
  }, [agents]);

  const filteredAgents = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();

    return agents.filter((agent) => {
      const enabled =
        statusOverrides.get(agent.meta.key) ?? agent.status.enabled;
      const status = computeStatus(enabled, agent.status.lastRun);

      // Filter by tab
      const matchesTab =
        activeTab === "All" ||
        (activeTab === "GPT Agents"
          ? false
          : agent.meta.category === activeTab);

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

      return matchesTab && matchesQuery && matchesFilter;
    });
  }, [agents, query, statusFilter, statusOverrides, activeTab]);

  const handleToggle = (key: AgentMeta["key"], currentEnabled: boolean) => {
    const nextEnabled = !currentEnabled;
    setStatusOverrides((prev) => {
      const next = new Map(prev);
      next.set(key, nextEnabled);
      return next;
    });

    startToggle(async () => {
      try {
        await actionToggleAgent(key, nextEnabled);
      } catch (error) {
        console.error("agents:toggle-failed", error);
      }
    });
  };

  const handleRun = (key: AgentMeta["key"]) => {
    startRun(async () => {
      const result = await actionRunAgent(key);
      setRunMessage(
        result.supabaseRunId
          ? `Agent ${key} run stored as ${result.supabaseRunId}`
          : `Agent ${key} run completed`,
      );
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
        {activeTab !== "GPT Agents" && (
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
        )}
      </header>

      <PageTabs tabs={tabs} activeTab={activeTab} hrefForTab={buildTabHref} />

      {runMessage ? (
        <div className="rounded-md border border-indigo-200 bg-indigo-50 p-3 text-xs text-indigo-800">
          {runMessage}
        </div>
      ) : null}

      {activeTab === "GPT Agents" ? (
        <div className="grid grid-cols-1 gap-3 lg:grid-cols-2 xl:grid-cols-3">
          {GPT_AGENTS.map((gptAgent) => (
            <Card
              key={gptAgent.name}
              className={cn(
                TRS_CARD,
                "flex h-full flex-col p-4 transition hover:shadow-sm",
              )}
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <h2 className="text-sm font-semibold text-black">
                    {gptAgent.name}
                  </h2>
                  <p className="mt-1 text-xs leading-relaxed text-gray-600">
                    {gptAgent.description}
                  </p>
                </div>
                <span className="inline-flex items-center rounded-full border border-gray-300 bg-white px-2.5 py-1 text-[11px] font-medium uppercase tracking-wide text-gray-700">
                  GPT
                </span>
              </div>

              <div className="mt-4 text-xs">
                <span className="font-medium text-gray-700">Category: </span>
                <span className="text-gray-600">{gptAgent.category}</span>
              </div>

              <div className="mt-4 flex flex-col gap-2">
                <a
                  href={gptAgent.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center justify-center rounded-lg border border-gray-300 px-3 py-2 text-sm font-semibold text-black transition hover:border-black hover:bg-gray-50"
                >
                  Open in ChatGPT
                </a>
              </div>
            </Card>
          ))}
        </div>
      ) : filteredAgents.length === 0 ? (
        <Card
          className={cn(
            TRS_CARD,
            "border-dashed bg-white p-6 text-center text-sm text-gray-600",
          )}
        >
          No agents match the current filters.
        </Card>
      ) : (
        <div className="grid grid-cols-1 gap-3 lg:grid-cols-2 xl:grid-cols-3">
          {filteredAgents.map((agent) => {
            const enabled =
              statusOverrides.get(agent.meta.key) ?? agent.status.enabled;
            const status = computeStatus(enabled, agent.status.lastRun);
            const tone = STATUS_TONES[status];

            return (
              <Card
                key={agent.meta.key}
                className={cn(
                  TRS_CARD,
                  "flex h-full flex-col p-4 transition hover:shadow-sm",
                )}
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <h2 className="text-sm font-semibold text-black">
                      {agent.meta.name}
                    </h2>
                    <p className="mt-1 text-xs leading-relaxed text-gray-600">
                      {agent.meta.description}
                    </p>
                  </div>
                  <span className="inline-flex items-center rounded-full border border-gray-300 bg-white px-2.5 py-1 text-[11px] font-medium uppercase tracking-wide text-gray-700">
                    {agent.meta.category}
                  </span>
                </div>

                <div className="mt-4 flex items-center justify-between text-xs">
                  <span className="font-medium text-gray-700">Status</span>
                  <span
                    className={`inline-flex items-center rounded-full px-2 py-1 ${tone.badge}`}
                  >
                    {status}
                  </span>
                </div>
                <div className="mt-2 grid grid-cols-2 gap-3 text-[11px] text-gray-600">
                  <div>
                    <div className="text-gray-500">Last run</div>
                    <div className="mt-0.5 text-gray-700">
                      {agent.status.lastRun
                        ? new Date(agent.status.lastRun).toLocaleString()
                        : "No runs yet"}
                    </div>
                  </div>
                  <div>
                    <div className="text-gray-500">Impact generated</div>
                    <div className="mt-0.5 font-medium text-gray-800">
                      {agent.status.impact$
                        ? `$${Number(agent.status.impact$).toLocaleString()}`
                        : "—"}
                    </div>
                  </div>
                </div>

                <div className="mt-4 flex flex-col gap-2 text-xs font-medium text-gray-700 md:flex-row md:items-center md:justify-between">
                  <button
                    type="button"
                    onClick={() => handleRun(agent.meta.key)}
                    disabled={runPending}
                    className="inline-flex items-center justify-center rounded-lg border border-gray-300 px-3 py-2 text-sm font-semibold text-gray-700 transition hover:border-black hover:text-black disabled:opacity-60"
                  >
                    {runPending ? "Running…" : "Run Agent"}
                  </button>
                  <Link
                    href={`/agents/${agent.meta.key}`}
                    className="inline-flex items-center justify-center rounded-lg border border-gray-300 px-3 py-2 text-sm font-semibold text-black transition hover:border-black hover:bg-gray-50"
                  >
                    Open Agent
                  </Link>
                  <button
                    type="button"
                    onClick={() => handleToggle(agent.meta.key, enabled)}
                    disabled={togglePending}
                    className="inline-flex items-center justify-center rounded-lg border border-gray-300 px-3 py-2 text-sm font-semibold text-gray-700 transition hover:border-black hover:text-black disabled:opacity-60"
                  >
                    {enabled ? "Deactivate" : "Activate"}
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
