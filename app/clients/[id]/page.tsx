import { notFound } from "next/navigation";

import ClientDetailView from "./ClientDetailView";
import { getClient } from "@/core/clients/store";
import { getProjectsByClient } from "@/core/projects/store";
import { actionListClientFinancials, actionListDeliverables } from "@/core/clients/actions";

export default async function ClientPage({ params }: { params: { id: string } }) {
  const client = getClient(params.id);

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
