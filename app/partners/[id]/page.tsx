import { notFound } from "next/navigation"

import PartnerDetailView from "./PartnerDetailView"
import { getPartner } from "@/core/partners/actions"

export default async function PartnerPage({
  params,
}: {
  params: { id: string }
}) {
  const partner = await getPartner(params.id)

  if (!partner) {
    notFound()
  }

  return <PartnerDetailView partner={partner} />
}
