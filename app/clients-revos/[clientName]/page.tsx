import ClientDetailPageClient from './ClientDetailPageClient'

export default function ClientDetailPage({ params }: { params: { clientName: string } }) {
  const clientName = decodeURIComponent(params.clientName)

  return <ClientDetailPageClient clientName={clientName} />
}
