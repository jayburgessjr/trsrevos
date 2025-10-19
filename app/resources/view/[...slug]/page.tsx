import { notFound } from 'next/navigation'
import { getResourceBySlug, getAllResources } from '@/lib/resources'
import ResourceViewer from './ResourceViewer'

export const dynamic = 'force-static'

export async function generateStaticParams() {
  const resources = getAllResources()
  return resources.map((resource) => ({
    slug: resource.slug.split('/'),
  }))
}

export default function ResourcePage({ params }: { params: { slug: string[] } }) {
  const slug = params.slug.join('/')
  const resource = getResourceBySlug(slug)

  if (!resource) {
    notFound()
  }

  return <ResourceViewer resource={resource} />
}
