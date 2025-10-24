import { notFound } from 'next/navigation'
import DocumentDetailClient from './DocumentDetailClient'

// This would typically fetch from your database
// For now, we'll pass the document ID to the client component
export default function DocumentDetailPage({
  params,
}: {
  params: { id: string }
}) {
  return <DocumentDetailClient documentId={params.id} />
}
