import Link from "next/link";
import { notFound } from "next/navigation";

import { ensureOnboarding, setClientPhase } from "./actions";
import { createServerClient } from "@/lib/supabase/server";
import { Button } from "@/ui/button";
import { Card, CardContent } from "@/ui/card";

const TAB_ITEMS = [
  { key: "overview", label: "Overview" },
  { key: "deliverables", label: "Deliverables" },
  { key: "finance", label: "Finance" },
  { key: "onboarding", label: "Onboarding" },
];

const DEFAULT_DELIVERABLES = [
  "Executive Dashboard",
  "Operating KPIs",
  "Quarterly Review",
];

export default async function ClientPage({
  params,
  searchParams,
}: {
  params: { id: string };
  searchParams?: { tab?: string };
}) {
  const supabase = createServerClient();
  const activeTab = (searchParams?.tab ?? "overview").toLowerCase();

  const { data: client, error: clientError } = await supabase
    .from("clients")
    .select(
      "*, owner:users!clients_owner_id_fkey(name, email)"
    )
    .eq("id", params.id)
    .maybeSingle();

  if (clientError) {
    throw clientError;
  }

  if (!client) {
    notFound();
  }

  const [{ data: projects }, { data: deliverables }, { data: finance }, { data: events }] =
    await Promise.all([
      supabase
        .from("projects")
        .select("id, name, status, phase, health, progress, updated_at")
        .eq("client_id", client.id)
        .order("updated_at", { ascending: false }),
      supabase
        .from("client_deliverables")
        .select("id, title, type, status, url, created_at")
        .eq("client_id", client.id)
        .order("created_at", { ascending: false }),
      supabase
        .from("finance")
        .select("id, monthly_recurring_revenue, outstanding_invoices, updated_at")
        .eq("client_id", client.id)
        .maybeSingle(),
      supabase
        .from("analytics_events")
        .select("id, event_type, created_at, metadata")
        .eq("entity_type", "client")
        .eq("entity_id", client.id)
        .order("created_at", { ascending: false })
        .limit(5),
    ]);

  const projectList = projects ?? [];
  const deliverableList = deliverables ?? [];
  const financeRow = finance ?? null;
  const eventList = events ?? [];

  const hasImplementationProject = projectList.some(
    (project) => project.name === "RevOS Implementation"
  );
  const deliverableTitles = new Set(deliverableList.map((d) => d.title));
  const hasDefaultDeliverables = DEFAULT_DELIVERABLES.every((name) =>
    deliverableTitles.has(name)
  );
  const hasOwner = Boolean(client.owner_id);
  const hasQbrDate = Boolean(client.qbr_date);

  const startOnboarding = async () => {
    "use server";
    await ensureOnboarding(params.id);
    await setClientPhase(params.id, "Onboarding");
  };

  const markComplete = async () => {
    "use server";
    await setClientPhase(params.id, "Active");
  };

  return (
    <div className="min-h-screen bg-white text-black">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-6 p-4">
        <header className="space-y-1">
          <p className="text-[11px] uppercase tracking-wide text-gray-500">Client Profile</p>
          <h1 className="text-2xl font-semibold text-black">{client.name}</h1>
          <p className="text-sm text-gray-600">
            {client.segment ?? "Segment unknown"} • Owner {client.owner?.name ?? "Unassigned"}
          </p>
        </header>

        <nav className="flex items-center gap-2 text-sm">
          {TAB_ITEMS.map((tab) => {
            const paramsCopy = new URLSearchParams(searchParams as Record<string, string> ?? {});
            if (tab.key === "overview") {
              paramsCopy.delete("tab");
            } else {
              paramsCopy.set("tab", tab.key);
            }
            const href = paramsCopy.size
              ? `/clients/${client.id}?${paramsCopy.toString()}`
              : `/clients/${client.id}`;
            const isActive = activeTab === tab.key;
            return (
              <Link
                key={tab.key}
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
        </nav>

        <section className="grid grid-cols-1 gap-4 lg:grid-cols-3">
          <Card className="border-gray-200 lg:col-span-2">
            <CardContent className="space-y-3 p-4">
              <div className="flex flex-wrap items-center gap-3 text-sm text-gray-600">
                <span className="rounded-full border border-gray-300 bg-white px-3 py-1 font-medium text-gray-700">
                  Phase {client.phase ?? "—"}
                </span>
                <span className="rounded-full border border-gray-300 bg-white px-3 py-1 font-medium text-gray-700">
                  Status {client.status ?? "—"}
                </span>
                <span className="rounded-full border border-gray-300 bg-white px-3 py-1 font-medium text-gray-700">
                  ARR ${client.arr ? client.arr.toLocaleString() : "0"}
                </span>
                <span className="rounded-full border border-gray-300 bg-white px-3 py-1 font-medium text-gray-700">
                  Health {client.health ?? "—"}
                </span>
              </div>
              <div className="text-sm text-gray-600">
                {client.notes ??
                  "Command center for deliverables, analytics, and onboarding milestones."}
              </div>
            </CardContent>
          </Card>
          <Card className="border-gray-200">
            <CardContent className="space-y-2 p-4">
              <h2 className="text-sm font-semibold text-black">Recent Activity</h2>
              <ul className="space-y-2 text-sm text-gray-700">
                {eventList.length === 0 && (
                  <li className="text-gray-500">No analytics events yet.</li>
                )}
                {eventList.map((event) => (
                  <li key={event.id} className="flex justify-between">
                    <span className="font-medium text-black">{event.event_type}</span>
                    <span className="text-xs text-gray-500">
                      {event.created_at ? new Date(event.created_at).toLocaleDateString() : "—"}
                    </span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        </section>

        {activeTab === "deliverables" && (
          <Card className="border-gray-200">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <h2 className="text-sm font-semibold text-black">Deliverables</h2>
                <Button variant="outline" size="sm">
                  New Deliverable
                </Button>
              </div>
              <div className="mt-4 space-y-3">
                {deliverableList.length === 0 ? (
                  <p className="text-sm text-gray-500">No deliverables yet.</p>
                ) : (
                  deliverableList.map((item) => (
                    <div
                      key={item.id}
                      className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-gray-200 bg-white p-3 text-sm"
                    >
                      <div>
                        <div className="font-medium text-black">{item.title}</div>
                        <div className="text-xs text-gray-500">
                          {item.status ?? "Planned"} • {item.type ?? "dashboard"}
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button variant="outline" size="sm" disabled={!item.url}>
                          Open
                        </Button>
                        <Button variant="ghost" size="sm">
                          Edit
                        </Button>
                        <Button variant="ghost" size="sm">
                          Share
                        </Button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        )}

        {activeTab === "finance" && (
          <Card className="border-gray-200">
            <CardContent className="space-y-4 p-4">
              <div className="flex items-center justify-between">
                <h2 className="text-sm font-semibold text-black">Finance Summary</h2>
                <Button variant="outline" size="sm">
                  Create invoice
                </Button>
              </div>
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                <Metric label="MRR" value={`$${(financeRow?.monthly_recurring_revenue ?? 0).toLocaleString()}`} />
                <Metric label="Outstanding" value={`$${(financeRow?.outstanding_invoices ?? 0).toLocaleString()}`} />
                <Metric label="Updated" value={financeRow?.updated_at ? new Date(financeRow.updated_at).toLocaleDateString() : "—"} />
              </div>
            </CardContent>
          </Card>
        )}

        {activeTab === "onboarding" && (
          <Card className="border-gray-200">
            <CardContent className="space-y-4 p-4">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <h2 className="text-sm font-semibold text-black">Onboarding Checklist</h2>
                {client.phase !== "Onboarding" ? (
                  <form action={startOnboarding}>
                    <Button type="submit" size="sm" variant="outline">
                      Start Onboarding
                    </Button>
                  </form>
                ) : (
                  <form action={markComplete}>
                    <Button type="submit" size="sm" variant="outline">
                      Mark Complete
                    </Button>
                  </form>
                )}
              </div>
              <ul className="space-y-3 text-sm text-gray-700">
                <ChecklistItem label="RevOS Implementation project" complete={hasImplementationProject} />
                <ChecklistItem label="Default deliverables created" complete={hasDefaultDeliverables} />
                <ChecklistItem label="Client owner assigned" complete={hasOwner} />
                <ChecklistItem label="First QBR scheduled" complete={hasQbrDate} />
              </ul>
            </CardContent>
          </Card>
        )}

        {activeTab === "overview" && (
          <Card className="border-gray-200">
            <CardContent className="grid gap-4 p-4 md:grid-cols-2">
              <div className="space-y-3">
                <h2 className="text-sm font-semibold text-black">Projects</h2>
                <div className="space-y-2 text-sm text-gray-700">
                  {projectList.length === 0 ? (
                    <p className="text-gray-500">No active projects yet.</p>
                  ) : (
                    projectList.slice(0, 4).map((project) => (
                      <div key={project.id} className="rounded-lg border border-gray-200 bg-white p-3">
                        <div className="font-medium text-black">{project.name}</div>
                        <div className="text-xs text-gray-500">
                          {project.status} • {project.phase ?? "Discovery"} • Health {project.health ?? "—"}
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
              <div className="space-y-3">
                <h2 className="text-sm font-semibold text-black">Deliverables</h2>
                <div className="space-y-2 text-sm text-gray-700">
                  {deliverableList.length === 0 ? (
                    <p className="text-gray-500">No deliverables yet.</p>
                  ) : (
                    deliverableList.slice(0, 4).map((deliverable) => (
                      <div key={deliverable.id} className="rounded-lg border border-gray-200 bg-white p-3">
                        <div className="font-medium text-black">{deliverable.title}</div>
                        <div className="text-xs text-gray-500">
                          {deliverable.status ?? "Planned"} • {deliverable.type ?? "dashboard"}
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-gray-200 bg-white p-3">
      <div className="text-[11px] text-gray-500">{label}</div>
      <div className="text-lg font-semibold text-black">{value}</div>
    </div>
  );
}

function ChecklistItem({ label, complete }: { label: string; complete: boolean }) {
  return (
    <li className="flex items-center gap-3 rounded-lg border border-gray-200 bg-white p-3">
      <span className="text-lg">{complete ? "✅" : "○"}</span>
      <span className="text-sm text-gray-700">{label}</span>
    </li>
  );
}
