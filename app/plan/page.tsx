import { PageDescription, PageHeader, PageTitle } from '@/ui/page-header'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/ui/card'
import { Button } from '@/ui/button'
import Link from 'next/link'

export default function PlanPage() {
  return (
    <div className="space-y-6">
      <PageHeader className="rounded-xl border border-[color:var(--color-outline)]">
        <PageTitle>Daily Plan</PageTitle>
        <PageDescription>Dedicated workspace for planning, prioritization, and focus management.</PageDescription>
      </PageHeader>

      <Card>
        <CardHeader>
          <CardTitle>Plan Module</CardTitle>
          <CardDescription>Advanced planning features coming soon.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="rounded-lg border border-dashed border-[color:var(--color-outline)] bg-[color:var(--color-surface-muted)]/40 p-8 text-center">
            <p className="text-lg font-medium text-[color:var(--color-text)]">This module is under construction</p>
            <p className="mt-2 text-sm text-[color:var(--color-text-muted)]">
              The dedicated plan workspace will include advanced prioritization, time blocking, and focus analytics.
            </p>
            <div className="mt-6">
              <Link href="/">
                <Button variant="primary">Back to Morning Briefing</Button>
              </Link>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
