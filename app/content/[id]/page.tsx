import ContentDetailClient from './ContentDetailClient'

export default function ContentDetailPage({
  params,
}: {
  params: { id: string }
}) {
  return <ContentDetailClient contentId={params.id} />
}
