import { notFound } from "next/navigation";

import ClientDetailView from "./ClientDetailView";
import { getClient } from "@/core/clients/store";
import { getProjectsByClient } from "@/core/projects/store";

export default function ClientPage({ params }: { params: { id: string } }) {
  const client = getClient(params.id);

  if (!client) {
    notFound();
  }

  const projects = getProjectsByClient(params.id);

  return <ClientDetailView client={client} projects={projects} />;
}
