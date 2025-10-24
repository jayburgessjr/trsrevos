import DocumentDetailPageClient from './DocumentDetailPageClient'

type DocumentDetailPageProps = {
  params: { documentId: string }
}

export const dynamic = 'force-dynamic'

export default function DocumentDetailPage({ params }: DocumentDetailPageProps) {
  return <DocumentDetailPageClient documentId={params.documentId} />
}
