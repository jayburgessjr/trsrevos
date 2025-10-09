import { notFound } from "next/navigation";

import ClientDetailView from "./ClientDetailView";
import { getClient } from "@/core/clients/store";

export default function ClientPage({ params }: { params: { id: string } }) {
  const client = getClient(params.id);

  if (!client) {
    notFound();
  }

  return <ClientDetailView client={client} />;
}
