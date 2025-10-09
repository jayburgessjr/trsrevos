import { actionListClients } from "@/core/clients/actions";
import { ClientsTable } from "./client-table";

export default async function ClientsPage() {
  const data = await actionListClients();

  return (
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
}
