import { actionListClients } from "@/core/clients/actions";
import { ClientsTable } from "./client-table";
import { TopTabs } from "@/components/kit/TopTabs";

export default async function ClientsPage({
  searchParams,
}: {
  searchParams: { tab?: string };
}) {
  const tab = searchParams?.tab ?? "Overview";
  const data = await actionListClients();

  const body = (
    <div className="p-6 space-y-4">
      <header className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-xl font-semibold">Clients</h1>
          <p className="text-sm text-gray-500 dark:text-neutral-400">
            Search, filter, and click into a client dossier to guide revenue execution.
          </p>
        </div>
        <form action="#">
          <button className="rounded-md bg-[var(--trs-accent)] px-3 py-2 text-xs text-white">New Client</button>
        </form>
      </header>

      <ClientsTable data={data} />
    </div>
  );

  return (
    <div className="min-h-screen bg-white text-black">
      <div className="px-4 py-3 border-b border-gray-200 flex items-center justify-between">
        <TopTabs />
        <div className="text-xs text-gray-600">{tab}</div>
      </div>
      <main className="max-w-7xl mx-auto p-4">{body}</main>
    </div>
  );
}
