import { getAllResources, getAllCategories } from '@/lib/resources'
import ResourcesPageClient from './ResourcesPageClient'

export const dynamic = 'force-static'

export default function ResourcesPage() {
  const resources = getAllResources()
  const categories = getAllCategories()

  return <ResourcesPageClient resources={resources} categories={categories} />
}
