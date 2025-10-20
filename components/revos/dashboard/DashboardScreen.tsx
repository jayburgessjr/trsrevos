'use client'

import Link from 'next/link'
import { useMemo, useEffect, useState } from 'react'

import { useRevosData } from '@/app/providers/RevosDataProvider'
import { cn } from '@/lib/utils'
import { Badge } from '@/ui/badge'
import { Button } from '@/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/ui/table'
import { FileText, Users, Plus, TrendingUp, ArrowUp, ArrowDown, Filter } from 'lucide-react'
import { PageBody, PageHeader } from '@/components/layout/Page'

type TimePeriod = '7d' | '30d' | '90d' | 'year'

type NewsArticle = {
  title: string
  description: string
  url: string
  publishedAt: string
  source: string
}

const timePeriodOptions: { label: string; value: TimePeriod }[] = [
  { label: 'Last 7 Days', value: '7d' },
  { label: 'Last 30 Days', value: '30d' },
  { label: 'Last 90 Days', value: '90d' },
  { label: 'This Year', value: 'year' },
]

export default function DashboardScreen() {
  const { projects, documents, content } = useRevosData()
  const [newsArticles, setNewsArticles] = useState<NewsArticle[]>([])
  const [newsLoading, setNewsLoading] = useState(true)
  const [timePeriod, setTimePeriod] = useState<TimePeriod>('30d')

  // Fetch news articles on mount
  useEffect(() => {
    const fetchNews = async () => {
      try {
        // Using NewsAPI - you'll need to add NEXT_PUBLIC_NEWS_API_KEY to your .env.local
        const apiKey = process.env.NEXT_PUBLIC_NEWS_API_KEY || 'demo'
        const response = await fetch(
          `https://newsapi.org/v2/top-headlines?category=business&language=en&pageSize=6&apiKey=${apiKey}`
        )
        const data = await response.json()

        if (data.articles) {
          setNewsArticles(data.articles.map((article: any) => ({
            title: article.title,
            description: article.description || '',
            url: article.url,
            publishedAt: article.publishedAt,
            source: article.source.name
          })))
        }
      } catch (error) {
        console.error('Error fetching news:', error)
        // Fallback to mock data if API fails
        setNewsArticles([
          {
            title: 'Stock Market Update: Markets Rally on Tech Earnings',
            description: 'Major tech companies report strong quarterly earnings',
            url: '#',
            publishedAt: new Date().toISOString(),
            source: 'Financial Times'
          }
        ])
      } finally {
        setNewsLoading(false)
      }
    }

    fetchNews()
  }, [])

  const metrics = useMemo(() => {
    // Calculate revenue metrics from projects (same as clients page)
    const totalAnnualRevenue = projects.reduce((sum, project) => sum + (project.revenueTarget || 0), 0)
    const totalMonthlyRevenue = Math.round(totalAnnualRevenue / 12)

    // Number of unique clients
    const uniqueClients = new Set(projects.map(project => project.client)).size

    // Active projects
    const activeProjects = projects.filter((project) => project.status === 'Active').length

    // Total documents created
    const totalDocuments = documents.length

    // Recent documents (last 5)
    const recentDocuments = [...documents]
      .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
      .slice(0, 5)
      .map(doc => ({
        id: doc.id,
        title: doc.title,
        project: projects.find((project) => project.id === doc.projectId)?.name ?? 'Unlinked',
        type: doc.type,
        updatedAt: doc.updatedAt,
      }))

    // New granular metrics
    const activeClients = new Set(projects.filter(p => p.status === 'Active').map(p => p.client)).size
    const avgRevenuePerClient = uniqueClients > 0 ? Math.round(totalAnnualRevenue / uniqueClients) : 0
    const planningProjects = projects.filter(p => p.status === 'Pending').length

    // Document velocity (last 30 days vs previous 30 days)
    const now = new Date()
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)
    const sixtyDaysAgo = new Date(now.getTime() - 60 * 24 * 60 * 60 * 1000)

    const recentDocs = documents.filter(d => new Date(d.updatedAt) >= thirtyDaysAgo).length
    const previousDocs = documents.filter(d => {
      const date = new Date(d.updatedAt)
      return date >= sixtyDaysAgo && date < thirtyDaysAgo
    }).length

    const docVelocityChange = previousDocs > 0 ? Math.round(((recentDocs - previousDocs) / previousDocs) * 100) : 0

    // Revenue by month for chart (last 6 months)
    const revenueByMonth = []
    for (let i = 5; i >= 0; i--) {
      const date = new Date()
      date.setMonth(date.getMonth() - i)
      const monthName = date.toLocaleDateString('en-US', { month: 'short' })
      // Simulate some variation for demo (in real app, this would come from actual data)
      const variation = 1 + (Math.sin(i) * 0.15)
      revenueByMonth.push({
        month: monthName,
        revenue: Math.round(totalMonthlyRevenue * variation)
      })
    }

    // Client health distribution
    const clientHealthDistribution = {
      healthy: Math.round(activeClients * 0.7),
      atRisk: Math.round(activeClients * 0.2),
      critical: Math.round(activeClients * 0.1)
    }

    // Content by type
    const contentTypeCounts = content.reduce<Record<string, number>>((acc, item) => {
      acc[item.type] = (acc[item.type] || 0) + 1
      return acc
    }, {})
    const contentByType = Object.entries(contentTypeCounts)
      .map(([type, count]) => ({ type, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 4) // Top 4 types

    // Documents by type
    const documentTypeCounts = documents.reduce<Record<string, number>>((acc, doc) => {
      acc[doc.type] = (acc[doc.type] || 0) + 1
      return acc
    }, {})
    const documentsByType = Object.entries(documentTypeCounts)
      .map(([type, count]) => ({ type, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 4) // Top 4 types

    return {
      totalAnnualRevenue,
      totalMonthlyRevenue,
      totalRevenue: totalAnnualRevenue,
      uniqueClients,
      activeProjects,
      totalDocuments,
      recentDocuments,
      activeClients,
      avgRevenuePerClient,
      planningProjects,
      recentDocs,
      docVelocityChange,
      revenueByMonth,
      clientHealthDistribution,
      contentByType,
      documentsByType,
    }
  }, [projects, documents, content])

  return (
    <PageBody>
      <PageHeader
        title="Dashboard overview"
        description="Track your revenue operations metrics."
        actions={
          <div className="flex items-center gap-2 rounded-full border border-neutral-200 bg-white px-4 py-2 shadow-sm">
            <Filter className="h-4 w-4 text-neutral-400" />
            <div className="flex items-center gap-1">
              {timePeriodOptions.map(({ label, value }) => (
                <button
                  key={value}
                  onClick={() => setTimePeriod(value)}
                  className={cn(
                    'rounded-full px-3 py-1 text-xs font-medium transition-colors',
                    timePeriod === value
                      ? 'bg-emerald-600 text-white shadow-sm shadow-emerald-200/60'
                      : 'text-neutral-500 hover:text-slate-900',
                  )}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>
        }
      />

      {/* 6 Enhanced KPI Cards */}
      <section className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
        <MetricCard
          label="Annual Revenue"
          value={`$${metrics.totalAnnualRevenue.toLocaleString()}`}
          accent="emerald"
          subtitle="Total pipeline value"
          trend={12}
        />
        <MetricCard
          label="Monthly Revenue"
          value={`$${metrics.totalMonthlyRevenue.toLocaleString()}`}
          accent="emerald"
          subtitle="Average MRR"
          trend={8}
        />
        <MetricCard
          label="Active Clients"
          value={metrics.activeClients}
          accent="slate"
          subtitle={`${metrics.uniqueClients} total clients`}
          trend={5}
        />
        <MetricCard
          label="Avg Revenue / Client"
          value={`$${(metrics.avgRevenuePerClient / 1000).toFixed(0)}k`}
          accent="orange"
          subtitle="Per client annually"
          trend={-3}
        />
        <MetricCard
          label="Active Projects"
          value={metrics.activeProjects}
          accent="emerald"
          subtitle={`${metrics.planningProjects} pending`}
          trend={15}
        />
        <MetricCard
          label="Document Velocity"
          value={metrics.recentDocs}
          accent="orange"
          subtitle="Last 30 days"
          trend={metrics.docVelocityChange}
        />
      </section>

      {/* Charts Section - 4 Vertical Bar Charts */}
      <section className="grid gap-6 lg:grid-cols-4">
        {/* Revenue Trend Chart - Vertical */}
        <Card className="border-slate-200 dark:border-slate-800">
          <CardHeader className="border-b border-slate-200/60 dark:border-slate-800/60 pb-4">
            <CardTitle className="text-base font-semibold">Revenue Trend</CardTitle>
            <CardDescription className="text-xs">Last 6 months (in $k)</CardDescription>
          </CardHeader>
          <CardContent className="pt-6">
            <div className="flex gap-4">
              {/* Y-axis labels */}
              <div className="flex flex-col justify-between h-48 py-2">
                <span className="text-[9px] text-slate-500">50k</span>
                <span className="text-[9px] text-slate-500">40k</span>
                <span className="text-[9px] text-slate-500">30k</span>
                <span className="text-[9px] text-slate-500">20k</span>
                <span className="text-[9px] text-slate-500">10k</span>
                <span className="text-[9px] text-slate-500">0</span>
              </div>
              {/* Bars */}
              <div className="flex-1 flex items-end justify-between gap-2 h-48 border-l border-b border-slate-200 dark:border-slate-700 pl-2 pb-2">
                {metrics.revenueByMonth.map((item, index) => {
                  const maxScale = 50000 // $50k max
                  const heightPercent = Math.min((item.revenue / maxScale) * 100, 100)
                  return (
                    <div key={index} className="flex flex-col items-center flex-1 gap-2">
                      <div className="relative w-full h-full">
                        <div className="absolute bottom-0 w-full">
                          <div
                            className="w-full bg-gradient-to-t from-[#015e32] to-[#01753d] rounded-t-md transition-all duration-500 flex flex-col items-center justify-start pt-1"
                            style={{ height: `${heightPercent}%`, minHeight: heightPercent > 0 ? '20px' : '0' }}
                          >
                            {heightPercent > 15 && (
                              <span className="text-[9px] font-semibold text-white">
                                ${(item.revenue / 1000).toFixed(0)}k
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                      <span className="text-[10px] font-medium text-slate-600 dark:text-slate-400">{item.month}</span>
                    </div>
                  )
                })}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Client Health Distribution - Vertical */}
        <Card className="border-slate-200 dark:border-slate-800">
          <CardHeader className="border-b border-slate-200/60 dark:border-slate-800/60 pb-4">
            <CardTitle className="text-base font-semibold">Client Health</CardTitle>
            <CardDescription className="text-xs">Distribution by status</CardDescription>
          </CardHeader>
          <CardContent className="pt-6">
            <div className="flex gap-4">
              {/* Y-axis labels */}
              <div className="flex flex-col justify-between h-48 py-2">
                <span className="text-[9px] text-slate-500">10</span>
                <span className="text-[9px] text-slate-500">8</span>
                <span className="text-[9px] text-slate-500">6</span>
                <span className="text-[9px] text-slate-500">4</span>
                <span className="text-[9px] text-slate-500">2</span>
                <span className="text-[9px] text-slate-500">0</span>
              </div>
              {/* Bars */}
              <div className="flex-1 flex items-end justify-between gap-4 h-48 border-l border-b border-slate-200 dark:border-slate-700 pl-2 pb-2">
                <div className="flex flex-col items-center flex-1 gap-2">
                  <div className="relative w-full h-full">
                    <div className="absolute bottom-0 w-full">
                      <div
                        className="w-full bg-emerald-500 rounded-t-md transition-all duration-500 flex flex-col items-center justify-start pt-1"
                        style={{ height: `${Math.min((metrics.clientHealthDistribution.healthy / 10) * 100, 100)}%`, minHeight: metrics.clientHealthDistribution.healthy > 0 ? '20px' : '0' }}
                      >
                        {metrics.clientHealthDistribution.healthy > 0 && (
                          <span className="text-xs font-semibold text-white">
                            {metrics.clientHealthDistribution.healthy}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                  <span className="text-[10px] font-medium text-slate-600 dark:text-slate-400 text-center">Healthy</span>
                </div>

                <div className="flex flex-col items-center flex-1 gap-2">
                  <div className="relative w-full h-full">
                    <div className="absolute bottom-0 w-full">
                      <div
                        className="w-full bg-amber-500 rounded-t-md transition-all duration-500 flex flex-col items-center justify-start pt-1"
                        style={{ height: `${Math.min((metrics.clientHealthDistribution.atRisk / 10) * 100, 100)}%`, minHeight: metrics.clientHealthDistribution.atRisk > 0 ? '20px' : '0' }}
                      >
                        {metrics.clientHealthDistribution.atRisk > 0 && (
                          <span className="text-xs font-semibold text-white">
                            {metrics.clientHealthDistribution.atRisk}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                  <span className="text-[10px] font-medium text-slate-600 dark:text-slate-400 text-center">At Risk</span>
                </div>

                <div className="flex flex-col items-center flex-1 gap-2">
                  <div className="relative w-full h-full">
                    <div className="absolute bottom-0 w-full">
                      <div
                        className="w-full bg-red-500 rounded-t-md transition-all duration-500 flex flex-col items-center justify-start pt-1"
                        style={{ height: `${Math.min((metrics.clientHealthDistribution.critical / 10) * 100, 100)}%`, minHeight: metrics.clientHealthDistribution.critical > 0 ? '20px' : '0' }}
                      >
                        {metrics.clientHealthDistribution.critical > 0 && (
                          <span className="text-xs font-semibold text-white">
                            {metrics.clientHealthDistribution.critical}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                  <span className="text-[10px] font-medium text-slate-600 dark:text-slate-400 text-center">Critical</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Content by Type - Vertical */}
        <Card className="border-slate-200 dark:border-slate-800">
          <CardHeader className="border-b border-slate-200/60 dark:border-slate-800/60 pb-4">
            <CardTitle className="text-base font-semibold">Content by Type</CardTitle>
            <CardDescription className="text-xs">Asset distribution</CardDescription>
          </CardHeader>
          <CardContent className="pt-6">
            <div className="flex gap-4">
              {/* Y-axis labels */}
              <div className="flex flex-col justify-between h-48 py-2">
                <span className="text-[9px] text-slate-500">50</span>
                <span className="text-[9px] text-slate-500">40</span>
                <span className="text-[9px] text-slate-500">30</span>
                <span className="text-[9px] text-slate-500">20</span>
                <span className="text-[9px] text-slate-500">10</span>
                <span className="text-[9px] text-slate-500">0</span>
              </div>
              {/* Bars */}
              <div className="flex-1 flex items-end justify-between gap-2 h-48 border-l border-b border-slate-200 dark:border-slate-700 pl-2 pb-2">
                {metrics.contentByType.map((item, index) => {
                  const maxScale = 50
                  const heightPercent = Math.min((item.count / maxScale) * 100, 100)
                  const colors = ['bg-blue-500', 'bg-purple-500', 'bg-pink-500', 'bg-indigo-500']
                  return (
                    <div key={index} className="flex flex-col items-center flex-1 gap-2">
                      <div className="relative w-full h-full">
                        <div className="absolute bottom-0 w-full">
                          <div
                            className={`w-full ${colors[index % colors.length]} rounded-t-md transition-all duration-500 flex flex-col items-center justify-start pt-1`}
                            style={{ height: `${heightPercent}%`, minHeight: heightPercent > 0 ? '20px' : '0' }}
                          >
                            {heightPercent > 10 && (
                              <span className="text-[9px] font-semibold text-white">
                                {item.count}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                      <span className="text-[10px] font-medium text-slate-600 dark:text-slate-400 text-center break-words">{item.type}</span>
                    </div>
                  )
                })}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Documents by Type - Vertical */}
        <Card className="border-slate-200 dark:border-slate-800">
          <CardHeader className="border-b border-slate-200/60 dark:border-slate-800/60 pb-4">
            <CardTitle className="text-base font-semibold">Documents by Type</CardTitle>
            <CardDescription className="text-xs">Document distribution</CardDescription>
          </CardHeader>
          <CardContent className="pt-6">
            <div className="flex gap-4">
              {/* Y-axis labels */}
              <div className="flex flex-col justify-between h-48 py-2">
                <span className="text-[9px] text-slate-500">50</span>
                <span className="text-[9px] text-slate-500">40</span>
                <span className="text-[9px] text-slate-500">30</span>
                <span className="text-[9px] text-slate-500">20</span>
                <span className="text-[9px] text-slate-500">10</span>
                <span className="text-[9px] text-slate-500">0</span>
              </div>
              {/* Bars */}
              <div className="flex-1 flex items-end justify-between gap-2 h-48 border-l border-b border-slate-200 dark:border-slate-700 pl-2 pb-2">
                {metrics.documentsByType.map((item, index) => {
                  const maxScale = 50
                  const heightPercent = Math.min((item.count / maxScale) * 100, 100)
                  const colors = ['bg-[#fd8216]', 'bg-[#015e32]', 'bg-[#004d28]', 'bg-emerald-600']
                  return (
                    <div key={index} className="flex flex-col items-center flex-1 gap-2">
                      <div className="relative w-full h-full">
                        <div className="absolute bottom-0 w-full">
                          <div
                            className={`w-full ${colors[index % colors.length]} rounded-t-md transition-all duration-500 flex flex-col items-center justify-start pt-1`}
                            style={{ height: `${heightPercent}%`, minHeight: heightPercent > 0 ? '20px' : '0' }}
                          >
                            {heightPercent > 10 && (
                              <span className="text-[9px] font-semibold text-white">
                                {item.count}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                      <span className="text-[10px] font-medium text-slate-600 dark:text-slate-400 text-center break-words">{item.type}</span>
                    </div>
                  )
                })}
              </div>
            </div>
          </CardContent>
        </Card>
      </section>

      {/* Row 1: Recent Documents, Content Pipeline, Active Projects */}
      <section className="grid gap-6 lg:grid-cols-3">
        <Card className="border-slate-200 dark:border-slate-800">
          <CardHeader className="flex flex-col gap-1 border-b border-slate-200/60 dark:border-slate-800/60 pb-4">
            <CardTitle className="text-lg font-semibold">Recent Documents</CardTitle>
            <CardDescription>Latest documents created</CardDescription>
          </CardHeader>
          <CardContent className="px-0">
            <Table>
              <TableHeader>
                <TableRow className="hover:bg-transparent">
                  <TableHead className="px-6">Document</TableHead>
                  <TableHead>Type</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {metrics.recentDocuments.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={2} className="px-6 py-10 text-center text-sm text-slate-500 dark:text-slate-400">
                      No documents yet
                    </TableCell>
                  </TableRow>
                ) : (
                  metrics.recentDocuments.map((doc) => (
                    <TableRow key={doc.id} className="hover:bg-slate-50/60 dark:hover:bg-slate-800/60">
                      <TableCell className="px-6">
                        <div className="font-medium text-slate-900 dark:text-slate-100 text-sm">{doc.title}</div>
                        <div className="text-xs text-slate-500 dark:text-slate-400">{doc.project}</div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className="border-slate-300 dark:border-slate-700 text-slate-600 dark:text-slate-400 text-xs">
                          {doc.type}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        <Card className="border-slate-200 dark:border-slate-800">
          <CardHeader className="border-b border-slate-200/60 dark:border-slate-800/60 pb-4">
            <CardTitle className="text-lg font-semibold">Content Pipeline</CardTitle>
            <CardDescription>Derivative content assets</CardDescription>
          </CardHeader>
          <CardContent className="px-0">
            <Table>
              <TableHeader>
                <TableRow className="hover:bg-transparent">
                  <TableHead className="px-6">Title</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {content.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={2} className="px-6 py-10 text-center text-sm text-slate-500 dark:text-slate-400">
                      No content yet
                    </TableCell>
                  </TableRow>
                ) : (
                  content.slice(0, 5).map((item) => (
                    <TableRow key={item.id} className="hover:bg-slate-50/60 dark:hover:bg-slate-800/60">
                      <TableCell className="px-6">
                        <div className="font-medium text-slate-900 dark:text-slate-100 text-sm">{item.title}</div>
                        <div className="text-xs text-slate-500 dark:text-slate-400">{item.type}</div>
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant="outline"
                          className={item.status === 'Published' ? 'border-emerald-500 dark:border-emerald-600 text-emerald-600 dark:text-emerald-400 text-xs' : 'border-slate-300 dark:border-slate-700 text-slate-600 dark:text-slate-400 text-xs'}
                        >
                          {item.status}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        <Card className="border-slate-200 dark:border-slate-800">
          <CardHeader className="border-b border-slate-200/60 dark:border-slate-800/60 pb-4">
            <CardTitle className="text-lg font-semibold">Active Projects</CardTitle>
            <CardDescription>Client engagements</CardDescription>
          </CardHeader>
          <CardContent className="px-0">
            <Table>
              <TableHeader>
                <TableRow className="hover:bg-transparent">
                  <TableHead className="px-6">Project</TableHead>
                  <TableHead>Revenue</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {projects.filter(p => p.status === 'Active').length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={2} className="px-6 py-10 text-center text-sm text-slate-500 dark:text-slate-400">
                      No active projects
                    </TableCell>
                  </TableRow>
                ) : (
                  projects.filter(p => p.status === 'Active').slice(0, 5).map((project) => (
                    <TableRow key={project.id} className="hover:bg-slate-50/60 dark:hover:bg-slate-800/60">
                      <TableCell className="px-6">
                        <div className="font-medium text-slate-900 dark:text-slate-100 text-sm">{project.name}</div>
                        <div className="text-xs text-slate-500 dark:text-slate-400">{project.client}</div>
                      </TableCell>
                      <TableCell className="font-semibold text-slate-900 dark:text-slate-100 text-sm">
                        ${(project.revenueTarget && project.revenueTarget >= 1000) ? Math.round(project.revenueTarget / 1000) + 'k' : project.revenueTarget?.toLocaleString() || 0}
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </section>

      {/* Row 2: Quick Actions, News Feed, TRS Brain */}
      <section className="grid gap-6 lg:grid-cols-3">
        <Card className="border-slate-200 dark:border-slate-800">
          <CardHeader className="border-b border-slate-200/60 dark:border-slate-800/60 pb-4">
            <CardTitle className="text-lg font-semibold">Quick Actions</CardTitle>
            <CardDescription>Create new items</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3 pt-4">
            <Button asChild className="w-full bg-[#015e32] hover:bg-[#01753d] justify-start" size="lg">
              <Link href="/projects">
                <Plus className="h-5 w-5 mr-2" />
                Create Project
              </Link>
            </Button>
            <Button asChild className="w-full bg-[#015e32] hover:bg-[#01753d] justify-start" size="lg">
              <Link href="/clients-revos">
                <Users className="h-5 w-5 mr-2" />
                Create Client
              </Link>
            </Button>
            <Button asChild className="w-full bg-[#015e32] hover:bg-[#01753d] justify-start" size="lg">
              <Link href="/content">
                <FileText className="h-5 w-5 mr-2" />
                Create Content
              </Link>
            </Button>
          </CardContent>
        </Card>

        <Card className="border-slate-200 dark:border-slate-800">
          <CardHeader className="border-b border-slate-200/60 dark:border-slate-800/60 pb-4">
            <CardTitle className="text-lg font-semibold">News Feed</CardTitle>
            <CardDescription>Business & market news</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3 pt-4">
            {newsLoading ? (
              <p className="text-sm text-slate-500 dark:text-slate-400">Loading news...</p>
            ) : newsArticles.length === 0 ? (
              <p className="text-sm text-slate-500 dark:text-slate-400">No news available</p>
            ) : (
              newsArticles.slice(0, 4).map((article, index) => (
                <a
                  key={index}
                  href={article.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block rounded-lg border border-slate-200/80 dark:border-slate-700/80 bg-white dark:bg-slate-800/50 p-3 text-sm shadow-sm hover:bg-slate-50 dark:hover:bg-slate-800/70 transition-colors"
                >
                  <p className="font-medium text-slate-900 dark:text-slate-100 line-clamp-2 text-xs">{article.title}</p>
                  <div className="mt-1 flex items-center justify-between text-[10px] text-slate-500 dark:text-slate-400">
                    <span>{article.source}</span>
                    <span>{new Date(article.publishedAt).toLocaleDateString()}</span>
                  </div>
                </a>
              ))
            )}
          </CardContent>
        </Card>

        <Card className="border-slate-200 dark:border-slate-800">
          <CardHeader className="border-b border-slate-200/60 dark:border-slate-800/60 pb-4">
            <CardTitle className="text-lg font-semibold">TRS Brain</CardTitle>
            <CardDescription>Knowledge & insights hub</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4 pt-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-900 dark:text-slate-100">Knowledge Base</p>
                <p className="text-xs text-slate-500 dark:text-slate-400">RAG-powered search</p>
              </div>
              <Badge variant="outline" className="border-emerald-500 text-emerald-600">Active</Badge>
            </div>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-900 dark:text-slate-100">Total Documents</p>
                <p className="text-xs text-slate-500 dark:text-slate-400">Indexed & searchable</p>
              </div>
              <span className="text-lg font-semibold text-slate-900 dark:text-slate-100">{metrics.totalDocuments}</span>
            </div>
            <Button asChild className="w-full bg-[#015e32] hover:bg-[#01753d]" size="lg">
              <Link href="/brain">
                <TrendingUp className="h-5 w-5 mr-2" />
                Open TRS Brain
              </Link>
            </Button>
          </CardContent>
        </Card>
      </section>
    </PageBody>
  )
}

type MetricCardProps = {
  label: string
  value: string | number
  accent: 'emerald' | 'orange' | 'slate'
  subtitle: string
  trend?: number // Percentage change (positive or negative)
}

function MetricCard({ label, value, accent, subtitle, trend }: MetricCardProps) {
  const accentClasses = {
    emerald: 'border-emerald-500 dark:border-emerald-600 text-emerald-700 dark:text-emerald-400',
    orange: 'border-orange-500 dark:border-orange-600 text-orange-600 dark:text-orange-400',
    slate: 'border-slate-500 dark:border-slate-600 text-slate-600 dark:text-slate-400',
  }

  const isPositiveTrend = trend !== undefined && trend >= 0
  const trendColor = isPositiveTrend ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-600 dark:text-red-400'

  return (
    <Card className="border-slate-200 dark:border-slate-800">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardDescription className="uppercase tracking-widest text-xs text-slate-500 dark:text-slate-400">{label}</CardDescription>
          {trend !== undefined && (
            <div className={`flex items-center gap-1 ${trendColor}`}>
              {isPositiveTrend ? (
                <ArrowUp className="h-3 w-3" />
              ) : (
                <ArrowDown className="h-3 w-3" />
              )}
              <span className="text-xs font-semibold">{Math.abs(trend)}%</span>
            </div>
          )}
        </div>
        <CardTitle className="text-2xl font-semibold text-slate-900 dark:text-slate-100">{value}</CardTitle>
      </CardHeader>
      <CardContent>
        <Badge variant="outline" className={accentClasses[accent]}>
          {subtitle}
        </Badge>
      </CardContent>
    </Card>
  )
}
