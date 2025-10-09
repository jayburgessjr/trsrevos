import { listFlags, requireRole } from '@/core/flags/flags'
import { getSession } from '@/lib/session'
import { PageDescription, PageHeader, PageTitle } from '@/ui/page-header'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/ui/card'
import { FlagsTable } from './table'

export default async function FeatureFlagsPage() {
  const session = await getSession()
  requireRole(session.user, ['admin', 'revops'])
  const flags = listFlags()

  return (
    <div className="space-y-6">
      <PageHeader className="rounded-xl border border-[color:var(--color-outline)]">
        <PageTitle>Feature flags</PageTitle>
        <PageDescription>Toggle experiments and guard access. UI stubs only for now.</PageDescription>
      </PageHeader>
      <Card>
        <CardHeader>
          <CardTitle>Flag registry</CardTitle>
          <CardDescription>Changes are local to this session. TODO: persist to database and auditing pipeline.</CardDescription>
        </CardHeader>
        <CardContent>
          <FlagsTable initialFlags={flags} />
        </CardContent>
      </Card>
    </div>
  )
}
