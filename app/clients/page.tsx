import { actionListClients } from "@/core/clients/actions";
import { ClientsTable } from "./client-table";

export default async function ClientsPage({
  searchParams,
}: {
  searchParams: { tab?: string };
}) {
  const tab = searchParams?.tab ?? "Overview";
  const data = await actionListClients();

  return (
    <div className="mx-auto max-w-7xl space-y-4 px-4 py-4">
      <header className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-xl font-semibold text-black">Clients</h1>
          <p className="text-sm text-gray-500">
            Search, filter, and click into a client dossier to guide revenue execution.
          </p>
          <div className="text-xs text-gray-500">Active view: {tab}</div>
        </div>
        <form action="#">
          <button className="rounded-md border border-gray-200 bg-white px-3 py-2 text-xs text-black">New Client</button>
        </form>
      </header>

      <ClientsTable data={data} />
    </div>
  );
}
