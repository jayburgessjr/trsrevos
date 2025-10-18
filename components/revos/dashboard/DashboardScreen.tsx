'use client'

import Link from 'next/link'
import { useMemo, useEffect, useState } from 'react'

import { useRevosData } from '@/app/providers/RevosDataProvider'
import { Badge } from '@/ui/badge'
import { Button } from '@/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/ui/table'
import { FileText, Users, Plus, TrendingUp } from 'lucide-react'

type NewsArticle = {
  title: string
  description: string
  url: string
  publishedAt: string
  source: string
}

export default function DashboardScreen() {
  const { projects, documents, content } = useRevosData()
  const [newsArticles, setNewsArticles] = useState<NewsArticle[]>([])
  const [newsLoading, setNewsLoading] = useState(true)

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
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      .slice(0, 5)
      .map(doc => ({
        id: doc.id,
        title: doc.title,
        project: projects.find((project) => project.id === doc.projectId)?.name ?? 'Unlinked',
        type: doc.type,
        createdAt: doc.createdAt,
      }))

    return {
      totalAnnualRevenue,
      totalMonthlyRevenue,
      totalRevenue: totalAnnualRevenue, // For display
      uniqueClients,
      activeProjects,
      totalDocuments,
      recentDocuments,
    }
  }, [projects, documents])

  return (
    <div className="space-y-8">
      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <MetricCard
          label="Annual Revenue"
          value={`$${metrics.totalAnnualRevenue.toLocaleString()}`}
          accent="emerald"
          subtitle="Total from all projects"
        />
        <MetricCard
          label="Monthly Revenue"
          value={`$${metrics.totalMonthlyRevenue.toLocaleString()}`}
          accent="emerald"
          subtitle="Average monthly recurring"
        />
        <MetricCard
          label="Number of Clients"
          value={metrics.uniqueClients}
          accent="slate"
          subtitle="Unique active clients"
        />
        <MetricCard
          label="Total Documents"
          value={metrics.totalDocuments}
          accent="orange"
          subtitle="Created across all projects"
        />
      </section>

      <section className="grid gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2 border-slate-200 dark:border-slate-800">
          <CardHeader className="flex flex-col gap-1 border-b border-slate-200/60 dark:border-slate-800/60 pb-4">
            <CardTitle className="text-lg font-semibold">Recent Documents Created</CardTitle>
            <CardDescription>Latest documents across all projects</CardDescription>
          </CardHeader>
          <CardContent className="px-0">
            <Table>
              <TableHeader>
                <TableRow className="hover:bg-transparent">
                  <TableHead className="px-6">Document</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Project</TableHead>
                  <TableHead>Created</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {metrics.recentDocuments.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={4} className="px-6 py-10 text-center text-sm text-slate-500 dark:text-slate-400">
                      No documents created yet.
                    </TableCell>
                  </TableRow>
                ) : (
                  metrics.recentDocuments.map((doc) => (
                    <TableRow key={doc.id} className="hover:bg-slate-50/60 dark:hover:bg-slate-800/60">
                      <TableCell className="px-6">
                        <div className="font-medium text-slate-900 dark:text-slate-100">{doc.title}</div>
                        <div className="text-xs text-slate-500 dark:text-slate-400">{doc.id}</div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className="border-slate-300 dark:border-slate-700 text-slate-600 dark:text-slate-400">
                          {doc.type}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-sm text-slate-600 dark:text-slate-400">{doc.project}</TableCell>
                      <TableCell className="text-xs text-slate-500 dark:text-slate-400">
                        {new Date(doc.createdAt).toLocaleDateString()}
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
            <CardTitle className="text-lg font-semibold">Business News Feed</CardTitle>
            <CardDescription>Latest business and market news</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4 pt-4">
            {newsLoading ? (
              <p className="text-sm text-slate-500 dark:text-slate-400">Loading news...</p>
            ) : newsArticles.length === 0 ? (
              <p className="text-sm text-slate-500 dark:text-slate-400">No news available</p>
            ) : (
              newsArticles.map((article, index) => (
                <a
                  key={index}
                  href={article.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block rounded-lg border border-slate-200/80 dark:border-slate-700/80 bg-white dark:bg-slate-800/50 p-4 text-sm shadow-sm hover:bg-slate-50 dark:hover:bg-slate-800/70 transition-colors"
                >
                  <p className="font-medium text-slate-900 dark:text-slate-100 line-clamp-2">{article.title}</p>
                  {article.description && (
                    <p className="mt-1 text-slate-600 dark:text-slate-400 text-xs line-clamp-2">{article.description}</p>
                  )}
                  <div className="mt-2 flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
                    <span>{article.source}</span>
                    <span>{new Date(article.publishedAt).toLocaleDateString()}</span>
                  </div>
                </a>
              ))
            )}
          </CardContent>
        </Card>
      </section>

      <section className="grid gap-6 lg:grid-cols-3">
        <Card className="border-slate-200 dark:border-slate-800">
          <CardHeader className="border-b border-slate-200/60 dark:border-slate-800/60 pb-4">
            <CardTitle className="text-lg font-semibold">Quick Actions</CardTitle>
            <CardDescription>Create new items in your workspace</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3 pt-4">
            <Button asChild className="w-full bg-[#015e32] hover:bg-[#01753d] justify-start" size="lg">
              <Link href="/projects">
                <Plus className="h-5 w-5 mr-2" />
                Create a Project
              </Link>
            </Button>
            <Button asChild className="w-full bg-[#015e32] hover:bg-[#01753d] justify-start" size="lg">
              <Link href="/clients-revos">
                <Users className="h-5 w-5 mr-2" />
                Create a Client
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
        <Card className="border-slate-200 dark:border-slate-800 lg:col-span-2">
          <CardHeader className="border-b border-slate-200/60 dark:border-slate-800/60 pb-4">
            <CardTitle className="text-lg font-semibold">Active Projects</CardTitle>
            <CardDescription>Currently active client engagements</CardDescription>
          </CardHeader>
          <CardContent className="px-0">
            <Table>
              <TableHeader>
                <TableRow className="hover:bg-transparent">
                  <TableHead className="px-6">Project</TableHead>
                  <TableHead>Client</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Revenue</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {projects.filter(p => p.status === 'Active').length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={4} className="px-6 py-10 text-center text-sm text-slate-500 dark:text-slate-400">
                      No active projects
                    </TableCell>
                  </TableRow>
                ) : (
                  projects.filter(p => p.status === 'Active').slice(0, 5).map((project) => (
                    <TableRow key={project.id} className="hover:bg-slate-50/60 dark:hover:bg-slate-800/60">
                      <TableCell className="px-6">
                        <div className="font-medium text-slate-900 dark:text-slate-100">{project.name}</div>
                      </TableCell>
                      <TableCell className="text-sm text-slate-600 dark:text-slate-400">{project.client}</TableCell>
                      <TableCell>
                        <Badge variant="outline" className="border-slate-300 dark:border-slate-700 text-slate-600 dark:text-slate-400">
                          {project.type}
                        </Badge>
                      </TableCell>
                      <TableCell className="font-semibold text-slate-900 dark:text-slate-100">
                        ${project.revenueTarget?.toLocaleString() || 0}
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </section>

      <section>
        <Card className="border-slate-200 dark:border-slate-800">
          <CardHeader className="border-b border-slate-200/60 dark:border-slate-800/60 pb-4">
            <CardTitle className="text-lg font-semibold">Content Pipeline</CardTitle>
            <CardDescription>Derivative assets created from project work.</CardDescription>
          </CardHeader>
          <CardContent className="px-0">
            <Table>
              <TableHeader>
                <TableRow className="hover:bg-transparent">
                  <TableHead className="px-6">Title</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Project</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {content.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={4} className="px-6 py-10 text-center text-sm text-slate-500 dark:text-slate-400">
                      No content generated yet.
                    </TableCell>
                  </TableRow>
                ) : (
                  content.map((item) => (
                    <TableRow key={item.id} className="hover:bg-slate-50/60 dark:hover:bg-slate-800/60">
                      <TableCell className="px-6">
                        <div className="font-medium text-slate-900 dark:text-slate-100">{item.title}</div>
                        <div className="text-xs text-slate-500 dark:text-slate-400">{new Date(item.createdAt).toLocaleDateString()}</div>
                      </TableCell>
                      <TableCell>{item.type}</TableCell>
                      <TableCell>
                        <Badge
                          variant="outline"
                          className={item.status === 'Published' ? 'border-emerald-500 dark:border-emerald-600 text-emerald-600 dark:text-emerald-400' : 'border-slate-300 dark:border-slate-700 text-slate-600 dark:text-slate-400'}
                        >
                          {item.status}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {item.sourceProjectId
                          ? projects.find((project) => project.id === item.sourceProjectId)?.name ?? 'Unlinked'
                          : 'Standalone'}
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </section>
    </div>
  )
}

type MetricCardProps = {
  label: string
  value: string | number
  accent: 'emerald' | 'orange' | 'slate'
  subtitle: string
}

function MetricCard({ label, value, accent, subtitle }: MetricCardProps) {
  const accentClasses = {
    emerald: 'border-emerald-500 dark:border-emerald-600 text-emerald-700 dark:text-emerald-400',
    orange: 'border-orange-500 dark:border-orange-600 text-orange-600 dark:text-orange-400',
    slate: 'border-slate-500 dark:border-slate-600 text-slate-600 dark:text-slate-400',
  }

  return (
    <Card className="border-slate-200 dark:border-slate-800">
      <CardHeader className="pb-3">
        <CardDescription className="uppercase tracking-widest text-xs text-slate-500 dark:text-slate-400">{label}</CardDescription>
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
