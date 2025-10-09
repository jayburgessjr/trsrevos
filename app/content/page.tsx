import { Badge } from '@/ui/badge'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/ui/card'
import { PageDescription, PageHeader, PageTitle } from '@/ui/page-header'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/ui/table'
import { Button } from '@/ui/button'
import { Input } from '@/ui/input'

const mockContent = [
  { id: '1', title: 'Q4 Revenue Growth Insights', type: 'Blog Post', status: 'Published', publishDate: '2025-10-05', author: 'Marketing Team', views: 1240 },
  { id: '2', title: 'Customer Success Best Practices', type: 'Guide', status: 'In Review', publishDate: '2025-10-20', author: 'Sarah Chen', views: 0 },
  { id: '3', title: 'Partner Enablement Deck', type: 'Presentation', status: 'Draft', publishDate: '2025-10-28', author: 'Alex Rivera', views: 0 },
  { id: '4', title: 'ROI Calculator Tool', type: 'Interactive', status: 'In Production', publishDate: '2025-11-01', author: 'Product Team', views: 450 },
  { id: '5', title: 'Weekly Revenue Briefing', type: 'Newsletter', status: 'Scheduled', publishDate: '2025-10-15', author: 'Mike Johnson', views: 0 },
]

const assetRequests = [
  { id: '1', title: 'Sales battle card for new feature', requestedBy: 'Sarah Chen', priority: 'High', status: 'In Progress', dueDate: '2025-10-18' },
  { id: '2', title: 'Case study: TechVentures success story', requestedBy: 'Mike Johnson', priority: 'Medium', status: 'Pending', dueDate: '2025-10-25' },
  { id: '3', title: 'Partner co-marketing one-pager', requestedBy: 'Alex Rivera', priority: 'Low', status: 'Pending', dueDate: '2025-11-01' },
]

export default function ContentPage() {
  return (
    <div className="space-y-6">
      <PageHeader className="rounded-xl border border-[color:var(--color-outline)]">
        <PageTitle>Content</PageTitle>
        <PageDescription>
          Editorial calendar, asset library, and enablement resources powering revenue narratives.
        </PageDescription>
        <div className="flex flex-wrap items-center gap-2 text-sm">
          <Badge variant="success">{mockContent.filter(c => c.status === 'Published').length} Published</Badge>
          <Badge variant="default">{mockContent.filter(c => c.status === 'Draft' || c.status === 'In Review').length} In Progress</Badge>
        </div>
      </PageHeader>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Total Content Pieces</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-semibold text-[color:var(--color-text)]">{mockContent.length}</p>
            <p className="mt-1 text-xs text-[color:var(--color-text-muted)]">Across all formats</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Total Views (30d)</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-semibold text-[color:var(--color-text)]">
              {mockContent.reduce((sum, c) => sum + c.views, 0).toLocaleString()}
            </p>
            <p className="mt-1 text-xs text-[color:var(--color-text-muted)]">Published content only</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Pending Requests</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-semibold text-[color:var(--color-text)]">
              {assetRequests.filter(r => r.status === 'Pending').length}
            </p>
            <p className="mt-1 text-xs text-[color:var(--color-text-muted)]">
              {assetRequests.filter(r => r.priority === 'High').length} high priority
            </p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <CardTitle>Content calendar</CardTitle>
              <CardDescription>All content pieces with publication status and engagement metrics.</CardDescription>
            </div>
            <Button variant="primary" size="sm">Create content</Button>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Title</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Author</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Publish Date</TableHead>
                <TableHead className="text-right">Views</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {mockContent.map((content) => (
                <TableRow key={content.id}>
                  <TableCell className="font-medium">{content.title}</TableCell>
                  <TableCell className="text-sm text-[color:var(--color-text-muted)]">{content.type}</TableCell>
                  <TableCell className="text-sm text-[color:var(--color-text-muted)]">{content.author}</TableCell>
                  <TableCell>
                    <Badge variant={
                      content.status === 'Published' ? 'success' :
                      content.status === 'Scheduled' ? 'default' :
                      'outline'
                    }>
                      {content.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-sm text-[color:var(--color-text-muted)]">
                    {new Date(content.publishDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                  </TableCell>
                  <TableCell className="text-right font-medium">
                    {content.views > 0 ? content.views.toLocaleString() : '—'}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Asset requests</CardTitle>
          <CardDescription>Design, copy, and enablement material requests from the team.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {assetRequests.map((request) => (
              <div key={request.id} className="rounded-lg border border-[color:var(--color-outline)] bg-white p-4">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <p className="font-medium text-[color:var(--color-text)]">{request.title}</p>
                    <p className="mt-1 text-sm text-[color:var(--color-text-muted)]">
                      Requested by {request.requestedBy}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant={request.priority === 'High' ? 'outline' : 'default'}>
                      {request.priority}
                    </Badge>
                    <Badge variant={request.status === 'In Progress' ? 'success' : 'outline'}>
                      {request.status}
                    </Badge>
                  </div>
                </div>
                <p className="mt-2 text-sm text-[color:var(--color-text-muted)]">
                  Due: {new Date(request.dueDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                </p>
              </div>
            ))}
          </div>
          <div className="mt-6 space-y-3 rounded-lg border border-dashed border-[color:var(--color-outline)] bg-[color:var(--color-surface-muted)]/40 p-4">
            <p className="text-sm font-medium text-[color:var(--color-text)]">Submit new request</p>
            <Input placeholder="Describe the asset you need..." />
            <div className="flex gap-2">
              <Button variant="primary" size="sm">Submit request</Button>
              <Button variant="outline" size="sm">Cancel</Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
