import { notFound } from "next/navigation";

import {
  actionGetClient,
  actionSetPhase,
  actionSaveDiscovery,
  actionSaveData,
  actionSaveKanban,
} from "@/core/clients/actions";
import type { RevOSPhase } from "@/core/clients/types";

const PHASES: RevOSPhase[] = ["Discovery", "Data", "Algorithm", "Architecture", "Compounding"];

const TABS = [
  "Overview",
  "Discovery",
  "Data",
  "Algorithm",
  "Architecture",
  "Compounding",
  "Commercials",
  "Close Plan",
  "Health",
  "Activity",
  "Files",
  "Share",
];

const formatCurrency = (value?: number) => {
  if (value == null) return "—";
  return `$${value.toLocaleString()}`;
};

export default async function ClientDetail({ params }: { params: { id: string } }) {
  const client = await actionGetClient(params.id);
  if (!client) return notFound();

  const clientId = client.id;

  async function SetPhase(formData: FormData) {
    "use server";
    const phase = formData.get("phase") as RevOSPhase;
    await actionSetPhase(clientId, phase);
  }
  async function SaveDiscovery(formData: FormData) {
    "use server";
    const qa = JSON.parse(String(formData.get("qa") ?? "[]"));
    await actionSaveDiscovery(clientId, qa);
  }
  async function SaveData(formData: FormData) {
    "use server";
    const data = JSON.parse(String(formData.get("data") ?? "[]"));
    await actionSaveData(clientId, data);
  }
  async function SaveKanban(formData: FormData) {
    "use server";
    const cards = JSON.parse(String(formData.get("cards") ?? "[]"));
    await actionSaveKanban(clientId, cards);
  }

  const comp = client.compounding;
  const commercials = client.commercials;

  return (
    <div className="space-y-6 p-6">
      <header className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
        <div>
          <h1 className="text-xl font-semibold">{client.name}</h1>
          <p className="text-sm text-gray-600 dark:text-neutral-400">
            {client.segment} • {client.industry ?? "—"} • Owner {client.owner}
          </p>
          <div className="mt-2 flex flex-wrap gap-2 text-xs">
            <span className="rounded-full bg-[var(--trs-accent)] px-2 py-[2px] text-white">{client.phase}</span>
            <span className="rounded-full border border-[color:var(--color-outline)] px-2 py-[2px]">
              ARR {formatCurrency(client.arr)}
            </span>
            <span
              className={`rounded-full px-2 py-[2px] ${
                client.health >= 70
                  ? "bg-emerald-50 text-emerald-700"
                  : client.health >= 40
                    ? "bg-amber-50 text-amber-700"
                    : "bg-rose-50 text-rose-700"
              }`}
            >
              Health {Math.round(client.health)}
            </span>
          </div>
        </div>
        <form action={SetPhase} className="flex items-center gap-2">
          <select
            name="phase"
            defaultValue={client.phase}
            className="rounded-md border border-[color:var(--color-outline)] px-2 py-1 text-sm dark:bg-neutral-950 dark:text-neutral-100"
          >
            {PHASES.map((phase) => (
              <option key={phase} value={phase}>
                {phase}
              </option>
            ))}
          </select>
          <button className="rounded-md bg-[var(--trs-accent)] px-3 py-2 text-xs text-white">Set phase</button>
        </form>
      </header>

      <div className="border-b border-[color:var(--color-outline)]">
        <nav className="flex flex-wrap gap-2">
          {TABS.map((tab) => {
            const isActive = tab === client.phase;
            return (
              <a
                key={tab}
                href={`#${tab.toLowerCase().replace(/ /g, "-")}`}
                className={`rounded-t px-3 py-2 text-sm transition ${
                  isActive
                    ? "bg-[var(--trs-accent)] text-white"
                    : "text-gray-600 hover:bg-gray-50 dark:text-neutral-400 dark:hover:bg-neutral-900"
                }`}
              >
                {tab}
              </a>
            );
          })}
        </nav>
      </div>

      <section id="overview" className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <div className="rounded-xl border border-[color:var(--color-outline)] bg-white p-4 dark:border-neutral-800 dark:bg-neutral-950">
          <h3 className="text-sm font-medium">Pipeline</h3>
          <ul className="mt-2 space-y-1 text-sm">
            {client.opportunities.map((opportunity) => (
              <li key={opportunity.id} className="flex items-center justify-between">
                <span>
                  {opportunity.name} • {opportunity.stage}
                </span>
                <span>{formatCurrency(opportunity.amount)}</span>
              </li>
            ))}
          </ul>
        </div>
        <div className="rounded-xl border border-[color:var(--color-outline)] bg-white p-4 dark:border-neutral-800 dark:bg-neutral-950">
          <h3 className="text-sm font-medium">AR &amp; Invoices</h3>
          <ul className="mt-2 space-y-1 text-sm">
            {client.invoices.map((invoice) => (
              <li key={invoice.id} className="flex items-center justify-between">
                <span>
                  {invoice.id} • {invoice.status}
                </span>
                <span>{formatCurrency(invoice.amount)}</span>
              </li>
            ))}
          </ul>
        </div>
        <div className="rounded-xl border border-[color:var(--color-outline)] bg-white p-4 dark:border-neutral-800 dark:bg-neutral-950">
          <h3 className="text-sm font-medium">Contacts</h3>
          <ul className="mt-2 space-y-1 text-sm">
            {client.contacts.map((contact) => (
              <li key={contact.id} className="flex items-center justify-between">
                <span>
                  {contact.name} • {contact.role}
                </span>
                <span className="text-gray-500 dark:text-neutral-400">{contact.power ?? ""}</span>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section id="discovery" className="rounded-xl border border-[color:var(--color-outline)] bg-white p-4 dark:border-neutral-800 dark:bg-neutral-950">
        <h3 className="text-sm font-medium">Gap Questions</h3>
        <form action={SaveDiscovery} className="mt-3 space-y-3">
          <textarea
            name="qa"
            className="h-48 w-full rounded-md border border-[color:var(--color-outline)] px-3 py-2 text-sm dark:bg-neutral-900 dark:text-neutral-100"
            defaultValue={JSON.stringify(client.discovery, null, 2)}
          />
          <button className="rounded-md bg-[var(--trs-accent)] px-3 py-2 text-xs text-white">Save answers</button>
        </form>
      </section>

      <section id="data" className="rounded-xl border border-[color:var(--color-outline)] bg-white p-4 dark:border-neutral-800 dark:bg-neutral-950">
        <h3 className="text-sm font-medium">Data Sources</h3>
        <div className="mt-3 grid grid-cols-1 gap-4 md:grid-cols-2">
          <div>
            <div className="text-xs text-gray-500 dark:text-neutral-400">Available / Missing</div>
            <ul className="mt-1 space-y-1 text-sm">
              {client.data
                .filter((source) => source.status !== "Collected")
                .map((source) => (
                  <li key={source.id} className="flex items-center justify-between">
                    <span>{source.name}</span>
                    <span className="text-gray-500 dark:text-neutral-400">{source.status}</span>
                  </li>
                ))}
            </ul>
          </div>
          <div>
            <div className="text-xs text-gray-500 dark:text-neutral-400">Collected</div>
            <ul className="mt-1 space-y-1 text-sm">
              {client.data
                .filter((source) => source.status === "Collected")
                .map((source) => (
                  <li key={source.id} className="flex items-center justify-between">
                    <span>{source.name}</span>
                    <span className="text-emerald-600">OK</span>
                  </li>
                ))}
            </ul>
          </div>
        </div>
        <form action={SaveData} className="mt-3">
          <textarea
            name="data"
            className="h-32 w-full rounded-md border border-[color:var(--color-outline)] px-3 py-2 text-sm dark:bg-neutral-900 dark:text-neutral-100"
            defaultValue={JSON.stringify(client.data, null, 2)}
          />
          <div className="mt-2">
            <button className="rounded-md bg-[var(--trs-accent)] px-3 py-2 text-xs text-white">Save data map</button>
          </div>
        </form>
      </section>

      <section id="algorithm" className="rounded-xl border border-[color:var(--color-outline)] bg-white p-4 dark:border-neutral-800 dark:bg-neutral-950">
        <h3 className="text-sm font-medium">QRA Strategy</h3>
        {client.qra ? (
          <div className="mt-3 grid gap-3 text-sm md:grid-cols-2">
            <div>
              <h4 className="text-xs uppercase text-gray-500 dark:text-neutral-400">Pricing</h4>
              <ul className="mt-1 list-disc space-y-1 pl-4">
                {client.qra.pricing.map((item, index) => (
                  <li key={`pricing-${index}`}>{item}</li>
                ))}
              </ul>
            </div>
            <div>
              <h4 className="text-xs uppercase text-gray-500 dark:text-neutral-400">Offers</h4>
              <ul className="mt-1 list-disc space-y-1 pl-4">
                {client.qra.offers.map((item, index) => (
                  <li key={`offer-${index}`}>{item}</li>
                ))}
              </ul>
            </div>
            <div>
              <h4 className="text-xs uppercase text-gray-500 dark:text-neutral-400">Retention</h4>
              <ul className="mt-1 list-disc space-y-1 pl-4">
                {client.qra.retention.map((item, index) => (
                  <li key={`retention-${index}`}>{item}</li>
                ))}
              </ul>
            </div>
            <div>
              <h4 className="text-xs uppercase text-gray-500 dark:text-neutral-400">Partners</h4>
              <ul className="mt-1 list-disc space-y-1 pl-4">
                {client.qra.partners.map((item, index) => (
                  <li key={`partner-${index}`}>{item}</li>
                ))}
              </ul>
            </div>
            <div className="md:col-span-2 text-sm text-gray-600 dark:text-neutral-300">
              Expected impact {formatCurrency(client.qra.expectedImpact)} / month.
            </div>
          </div>
        ) : (
          <p className="mt-2 text-sm text-gray-600 dark:text-neutral-400">
            Strategy inputs coming soon. Capture pricing, offer, retention, and partner plays here.
          </p>
        )}
      </section>

      <section id="architecture" className="rounded-xl border border-[color:var(--color-outline)] bg-white p-4 dark:border-neutral-800 dark:bg-neutral-950">
        <h3 className="text-sm font-medium">Build Kanban</h3>
        <form action={SaveKanban} className="mt-3 space-y-3">
          <textarea
            name="cards"
            className="h-48 w-full rounded-md border border-[color:var(--color-outline)] px-3 py-2 text-sm dark:bg-neutral-900 dark:text-neutral-100"
            defaultValue={JSON.stringify(client.kanban, null, 2)}
          />
          <button className="rounded-md bg-[var(--trs-accent)] px-3 py-2 text-xs text-white">Save Kanban</button>
        </form>
      </section>

      <section id="compounding" className="rounded-xl border border-[color:var(--color-outline)] bg-white p-4 dark:border-neutral-800 dark:bg-neutral-950">
        <h3 className="text-sm font-medium">Revenue Lift</h3>
        <div className="mt-2 space-y-1 text-sm">
          <div>
            Baseline MRR {formatCurrency(comp?.baselineMRR)} → Current {formatCurrency(comp?.currentMRR)} (Net New {formatCurrency(comp?.netNew)})
          </div>
          <div>Forecast QTD {formatCurrency(comp?.forecastQTD)}</div>
          {comp?.drivers?.length ? (
            <ul className="mt-2 list-disc space-y-1 pl-4">
              {comp.drivers.map((driver) => (
                <li key={driver.name}>
                  {driver.name} • {formatCurrency(driver.delta)}
                </li>
              ))}
            </ul>
          ) : null}
        </div>
      </section>

      <section id="commercials" className="rounded-xl border border-[color:var(--color-outline)] bg-white p-4 dark:border-neutral-800 dark:bg-neutral-950">
        <h3 className="text-sm font-medium">Commercials</h3>
        {commercials ? (
          <div className="mt-2 text-sm text-gray-700 dark:text-neutral-300">
            Plan {commercials.plan} • {formatCurrency(commercials.price)} / mo • Term {commercials.termMonths}m • Discount {commercials.discountPct}%
            {commercials.paymentTerms ? ` • Terms ${commercials.paymentTerms}` : ""}
            {commercials.renewalDate ? ` • Renewal ${commercials.renewalDate}` : ""}
          </div>
        ) : (
          <p className="mt-2 text-sm text-gray-600 dark:text-neutral-400">No commercial terms captured yet.</p>
        )}
      </section>

      <section id="close-plan" className="rounded-xl border border-[color:var(--color-outline)] bg-white p-4 dark:border-neutral-800 dark:bg-neutral-950">
        <h3 className="text-sm font-medium">Mutual Action Plan</h3>
        <p className="mt-2 text-sm text-gray-600 dark:text-neutral-400">
          Placeholder: next steps with owners and dates. Sync with pipeline once opportunity workflows are connected.
        </p>
      </section>

      <section id="health" className="rounded-xl border border-[color:var(--color-outline)] bg-white p-4 dark:border-neutral-800 dark:bg-neutral-950">
        <h3 className="text-sm font-medium">Health</h3>
        <p className="mt-2 text-sm text-gray-600 dark:text-neutral-400">
          Health score {Math.round(client.health)}. Risks, saves, and playbooks will surface here.
        </p>
      </section>

      <section id="activity" className="rounded-xl border border-[color:var(--color-outline)] bg-white p-4 dark:border-neutral-800 dark:bg-neutral-950">
        <h3 className="text-sm font-medium">Activity</h3>
        <p className="mt-2 text-sm text-gray-600 dark:text-neutral-400">Recent events will surface here. Hook to Media Agent feed next.</p>
      </section>

      <section id="files" className="rounded-xl border border-[color:var(--color-outline)] bg-white p-4 dark:border-neutral-800 dark:bg-neutral-950">
        <h3 className="text-sm font-medium">Files</h3>
        <p className="mt-2 text-sm text-gray-600 dark:text-neutral-400">Client artifacts placeholder.</p>
      </section>

      <section id="share" className="rounded-xl border border-[color:var(--color-outline)] bg-white p-4 dark:border-neutral-800 dark:bg-neutral-950">
        <h3 className="text-sm font-medium">Share Space</h3>
        <p className="mt-2 text-sm text-gray-600 dark:text-neutral-400">
          Create restricted, expiring share links for clients (stub). Integration to Shares service coming soon.
        </p>
      </section>
    </div>
  );
}
