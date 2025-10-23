import { notFound } from 'next/navigation'
import { createServerClient } from '@/lib/supabase/server'
import ProjectWorkspace, { ProjectWorkspaceProject, TabKey } from './ProjectWorkspace'

const TAB_KEYS: TabKey[] = [
  'overview',
  'documents',
  'resources',
  'content',
  'activity',
  'financials',
]

export default async function ProjectDetailPage({
  params,
  searchParams,
}: {
  params: { id: string }
  searchParams?: { tab?: string }
}) {
  const supabase = createServerClient()
  const activeTabParam = (searchParams?.tab ?? '').toLowerCase()
  const initialTab = (TAB_KEYS.includes(activeTabParam as TabKey) ? (activeTabParam as TabKey) : 'overview') as TabKey

  // Fetch project data
  const { data: projectRow, error: projectError } = await supabase
    .from('revos_projects')
    .select('*')
    .eq('id', params.id)
    .maybeSingle()

  if (projectError) {
    throw projectError
  }

  if (!projectRow) {
    notFound()
  }

  // Fetch related data in parallel
  const [documentsResult, resourcesResult, contentResult] = await Promise.all([
    // Documents
    supabase
      .from('revos_documents')
      .select('*')
      .eq('project_id', params.id)
      .order('created_at', { ascending: false }),

    // Resources (filter by project_id in related_project_ids array)
    supabase
      .from('revos_resources')
      .select('*')
      .contains('related_project_ids', [params.id])
      .order('created_at', { ascending: false }),

    // Content
    supabase
      .from('revos_content')
      .select('*')
      .eq('source_project_id', params.id)
      .order('created_at', { ascending: false }),
  ])

  if (documentsResult.error) throw documentsResult.error
  if (resourcesResult.error) throw resourcesResult.error
  if (contentResult.error) throw contentResult.error

  const project: ProjectWorkspaceProject = {
    id: projectRow.id,
    name: projectRow.name,
    client: projectRow.client,
    type: projectRow.type,
    status: projectRow.status,
    team: projectRow.team || [],
    start_date: projectRow.start_date,
    end_date: projectRow.end_date,
    quickbooks_invoice_url: projectRow.quickbooks_invoice_url,
    revenue_target: projectRow.revenue_target,
    documents: projectRow.documents || [],
    agents: projectRow.agents || [],
    resources: projectRow.resources || [],
    created_at: projectRow.created_at,
    updated_at: projectRow.updated_at,
  }

  const documents = documentsResult.data || []
  const resources = resourcesResult.data || []
  const content = contentResult.data || []

  return (
    <div className="min-h-screen bg-white text-black">
      <div className="mx-auto flex w-full max-w-7xl flex-col gap-6 px-6 py-6">
        <ProjectWorkspace
          project={project}
          documents={documents}
          resources={resources}
          content={content}
          initialTab={initialTab}
        />
      </div>
    </div>
  )
}
