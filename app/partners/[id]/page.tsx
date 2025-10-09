import { notFound } from "next/navigation"

import PartnerDetailView from "./PartnerDetailView"
import { getPartner } from "@/core/partners/store"

export default function PartnerPage({ params }: { params: { id: string } }) {
  const partner = getPartner(params.id)

  if (!partner) {
    notFound()
  }

  return <PartnerDetailView partner={partner} />
}
