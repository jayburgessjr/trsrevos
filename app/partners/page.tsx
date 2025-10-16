import { getPartners } from "@/core/partners/actions"

import PartnersPageClient from "./PartnersPageClient"

export default async function PartnersPage() {
  const partners = await getPartners()

  return <PartnersPageClient initialPartners={partners} />
}
