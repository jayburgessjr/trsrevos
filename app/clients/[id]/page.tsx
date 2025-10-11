import { notFound } from "next/navigation";

import ClientDetailView from "./ClientDetailView";
import { actionGetClient, actionListClientFinancials, actionListDeliverables } from "@/core/clients/actions";
import { getProjectsByClient } from "@/core/projects/store";

export default async function ClientPage({ params }: { params: { id: string } }) {
  // Fetch client from Supabase
  const client = await actionGetClient(params.id);

  if (!client) {
    notFound();
  }

  const projects = getProjectsByClient(params.id);
  const [deliverables, financials] = await Promise.all([
    actionListDeliverables(params.id),
    actionListClientFinancials(params.id),
  ]);

  return (
    <ClientDetailView
      client={client}
      projects={projects}
      deliverables={deliverables}
      financials={financials}
    />
  );
}
