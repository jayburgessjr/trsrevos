'use client'

import { useCallback, useEffect, useMemo, useState, useTransition } from 'react'
import { Badge } from '@/ui/badge'
import { Button } from '@/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/ui/card'
import { Input } from '@/ui/input'
import { Select } from '@/ui/select'
import { PageDescription, PageHeader, PageTitle } from '@/ui/page-header'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/ui/tabs'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/ui/table'
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from '@/ui/sheet'
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/ui/dialog'
import {
  ContentItem,
  ContentStatus,
  Distribution,
  Metrics,
  Touch,
  Variant,
} from '@/core/content/types'
import { ContentSuggestion } from '@/core/content/recommender'
import {
  createItem as actionCreateItem,
  createVariant as actionCreateVariant,
  getContentSnapshot,
  getMetrics as actionGetMetrics,
  getSuggestions as actionGetSuggestions,
  insertContentIntoEmail as actionInsertContentIntoEmail,
  markExperimentOutcome,
  recordTouch as actionRecordTouch,
  saveBrief as actionSaveBrief,
  scheduleDistribution as actionScheduleDistribution,
  updateItem as actionUpdateItem,
  updateStatus as actionUpdateStatus,
} from '@/core/content/actions'
import {
  MediaChannel,
  MediaDistribution,
  MediaIdea,
  MediaMetrics,
  MediaProject,
} from '@/core/mediaAgent/types'
import {
  actionCreateProjectFromIdea,
  actionGenerateAssets,
  actionIngestTranscript,
  actionMarkRecording,
  actionMediaMetrics,
  actionMediaState,
  actionScheduleDistribution as actionScheduleMediaDistribution,
  actionSuggestIdeas,
} from '@/core/mediaAgent/actions'

const statusOrder: ContentStatus[] = ['Idea', 'Draft', 'Review', 'Scheduled', 'Published']
const stageOptions: ContentItem['stage'][] = ['Discovery', 'Evaluation', 'Decision', 'Onboarding', 'Adoption']
const contentTypes = ['One-pager', 'Guide', 'Newsletter', 'Insight Report', 'Battlecard']
const distributionChannels = ['LinkedIn', 'Email', 'YouTube', 'Podcast', 'X', 'Partner']

export interface ContentStudioProps {
  initialItems: ContentItem[]
  initialVariants: Variant[]
  initialDistributions: Distribution[]
  initialTouches: Touch[]
  metrics: Metrics
  suggestions: ContentSuggestion[]
  mediaIdeas: MediaIdea[]
  mediaProjects: MediaProject[]
  mediaDistributions: MediaDistribution[]
  mediaMetrics: MediaMetrics
}

export function ContentStudio(props: ContentStudioProps) {
  const [items, setItems] = useState(props.initialItems)
  const [variants, setVariants] = useState(props.initialVariants)
  const [distributions, setDistributions] = useState(props.initialDistributions)
  const [touches, setTouches] = useState(props.initialTouches)
  const [metrics, setMetrics] = useState(props.metrics)
  const [suggestions, setSuggestions] = useState(props.suggestions)
  const [mediaIdeas, setMediaIdeas] = useState(props.mediaIdeas)
  const [mediaProjects, setMediaProjects] = useState(props.mediaProjects)
  const [mediaDistributions, setMediaDistributions] = useState(props.mediaDistributions)
  const [mediaMetrics, setMediaMetrics] = useState(props.mediaMetrics)

  const [selectedItemId, setSelectedItemId] = useState<string | null>(null)
  const [activeDrawerTab, setActiveDrawerTab] = useState('overview')
  const [isPending, startTransition] = useTransition()
  const [requestForm, setRequestForm] = useState({
    title: '',
    persona: '',
    stage: stageOptions[0],
    objection: '',
    priority: 'Medium',
  })
  const [transcriptTarget, setTranscriptTarget] = useState<MediaProject | null>(null)
  const [transcriptDraft, setTranscriptDraft] = useState('')
  const [composeMessage, setComposeMessage] = useState<string | null>(null)

  const selectedItem = useMemo(
    () => (selectedItemId ? items.find(item => item.id === selectedItemId) ?? null : null),
    [items, selectedItemId],
  )

  useEffect(() => {
    setComposeMessage(null)
  }, [selectedItemId])

  const relatedVariants = useMemo(
    () => (selectedItem ? variants.filter(variant => variant.contentId === selectedItem.id) : []),
    [selectedItem, variants],
  )

  const relatedDistributions = useMemo(
    () => (selectedItem ? distributions.filter(entry => entry.contentId === selectedItem.id) : []),
    [distributions, selectedItem],
  )

  const relatedTouches = useMemo(
    () => (selectedItem ? touches.filter(touch => touch.contentId === selectedItem.id) : []),
    [selectedItem, touches],
  )

  const mediaProjectsWithIdea = useMemo(() => {
    return mediaProjects.map(project => ({
      project,
      idea: mediaIdeas.find(idea => idea.id === project.ideaId) ?? null,
      scheduled: mediaDistributions.filter(entry => entry.projectId === project.id),
    }))
  }, [mediaDistributions, mediaIdeas, mediaProjects])

  const refreshContent = useCallback(async () => {
    const [snapshot, updatedMetrics, updatedSuggestions] = await Promise.all([
      getContentSnapshot(),
      actionGetMetrics(),
      actionGetSuggestions(),
    ])
    setItems(snapshot.items)
    setVariants(snapshot.variants)
    setDistributions(snapshot.distributions)
    setTouches(snapshot.touches)
    setMetrics(updatedMetrics)
    setSuggestions(updatedSuggestions)
  }, [])

  const refreshMedia = useCallback(async () => {
    const [state, updatedMetrics, ideas] = await Promise.all([
      actionMediaState(),
      actionMediaMetrics(),
      actionSuggestIdeas(),
    ])
    setMediaProjects(state.projects)
    setMediaDistributions(state.distributions)
    setMediaIdeas(ideas)
    setMediaMetrics(updatedMetrics)
  }, [])

  const handleMove = (item: ContentItem, direction: 'forward' | 'back') => {
    const index = statusOrder.indexOf(item.status)
    const nextIndex = direction === 'forward' ? index + 1 : index - 1
    if (nextIndex < 0 || nextIndex >= statusOrder.length) return
    const nextStatus = statusOrder[nextIndex]
    startTransition(async () => {
      await actionUpdateStatus(item.id, nextStatus)
      await refreshContent()
    })
  }

  const handleStatusChange = (status: ContentStatus) => {
    if (!selectedItem) return
    startTransition(async () => {
      await actionUpdateStatus(selectedItem.id, status)
      await refreshContent()
    })
  }

  const handleBriefSave = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (!selectedItem) return
    const formData = new FormData(event.currentTarget)
    const brief = {
      cta: (formData.get('cta') as string) ?? '',
      outline: (formData.get('outline') as string) ?? '',
      notes: (formData.get('notes') as string) ?? '',
    }
    startTransition(async () => {
      await actionSaveBrief(selectedItem.id, brief)
      await refreshContent()
    })
  }

  const handleVariantCreate = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (!selectedItem) return
    const formData = new FormData(event.currentTarget)
    startTransition(async () => {
      await actionCreateVariant({
        contentId: selectedItem.id,
        kind: (formData.get('kind') as string) || 'CTA',
        headline: (formData.get('headline') as string) || 'Untitled headline',
        cta: (formData.get('cta') as string) || 'Learn more',
        group: (formData.get('group') as string) as 'A' | 'B' | undefined,
      })
      event.currentTarget.reset()
      await refreshContent()
    })
  }

  const handleVariantDecision = (variant: Variant, decision: 'kill' | 'scale') => {
    const status = decision === 'kill' ? 'retired' : 'scaling'
    startTransition(async () => {
      await markExperimentOutcome(variant.id, status)
      await refreshContent()
    })
  }

  const handleTouchUpdate = (touch: Touch, action: Touch['action']) => {
    startTransition(async () => {
      await actionRecordTouch({
        id: touch.id,
        contentId: touch.contentId,
        opportunityId: touch.opportunityId,
        actor: touch.actor,
        action,
      })
      await refreshContent()
    })
  }

  const handleTouchCreate = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (!selectedItem) return
    const formData = new FormData(event.currentTarget)
    startTransition(async () => {
      await actionRecordTouch({
        contentId: selectedItem.id,
        opportunityId: (formData.get('opportunity') as string) || 'opportunity',
        actor: (formData.get('actor') as string) || 'sales-user',
        action: (formData.get('touch-action') as Touch['action']) || 'used',
      })
      event.currentTarget.reset()
      await refreshContent()
    })
  }

  const handleDistributionSchedule = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (!selectedItem) return
    const formData = new FormData(event.currentTarget)
    startTransition(async () => {
      await actionScheduleDistribution({
        contentId: selectedItem.id,
        channel: (formData.get('channel') as string) || 'LinkedIn',
        scheduledAt: formData.get('when') as string,
        utm: (formData.get('utm') as string) || undefined,
      })
      event.currentTarget.reset()
      await refreshContent()
    })
  }

  const handlePublishStub = () => {
    if (!selectedItem) return
    startTransition(async () => {
      await actionRecordTouch({
        contentId: selectedItem.id,
        opportunityId: 'marketing-release',
        actor: 'content-bot',
        action: 'used',
      })
      await refreshContent()
    })
  }

  const handleRequestSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const { title, persona, stage, objection, priority } = requestForm
    if (!title || !persona) return
    const sla = priority === 'High' ? '24h' : priority === 'Low' ? '5d' : '72h'
    startTransition(async () => {
      await actionCreateItem({
        title,
        type: 'Enablement request',
        persona,
        stage: stage as ContentItem['stage'],
        objection,
        ownerId: 'intake-bot',
        status: 'Idea',
        sla,
      })
      setRequestForm({ title: '', persona: '', stage: stageOptions[0], objection: '', priority: 'Medium' })
      await refreshContent()
    })
  }

  const handleCopySnippet = (item: ContentItem) => {
    const snippet = `${item.title} — ${item.persona} | ${item.stage}. CTA: ${item.brief?.cta ?? 'Book time.'}`
    if (typeof navigator !== 'undefined' && navigator.clipboard) {
      navigator.clipboard.writeText(snippet)
    }
  }

  const handleInsertIntoEmail = (item: ContentItem) => {
    setComposeMessage('Queueing email…')
    startTransition(async () => {
      const result = await actionInsertContentIntoEmail(item.id)
      if (result.ok) {
        setComposeMessage(result.message)
      } else {
        setComposeMessage(result.error ?? 'Unable to queue email draft.')
      }
    })
  }

  const handleCreateDraftFromSuggestion = (suggestion: ContentSuggestion) => {
    startTransition(async () => {
      await actionCreateItem({
        title: suggestion.title,
        type: contentTypes[0],
        persona: suggestion.persona,
        stage: suggestion.stage,
        objection: suggestion.objection,
        ownerId: 'qra-team',
        status: 'Draft',
        sla: '72h',
      })
      await refreshContent()
    })
  }

  const handleCreateMediaProject = (idea: MediaIdea) => {
    startTransition(async () => {
      await actionCreateProjectFromIdea(idea.id)
      await refreshMedia()
    })
  }

  const handleMarkRecording = (project: MediaProject) => {
    startTransition(async () => {
      await actionMarkRecording(project.id)
      await refreshMedia()
    })
  }

  const handleTranscriptSave = () => {
    if (!transcriptTarget) return
    startTransition(async () => {
      await actionIngestTranscript(transcriptTarget.id, transcriptDraft)
      setTranscriptTarget(null)
      setTranscriptDraft('')
      await refreshMedia()
    })
  }

  const handleGenerateAssets = (project: MediaProject) => {
    startTransition(async () => {
      await actionGenerateAssets(project.id)
      await refreshMedia()
    })
  }

  const handleScheduleMedia = (event: React.FormEvent<HTMLFormElement>, project: MediaProject) => {
    event.preventDefault()
    const formData = new FormData(event.currentTarget)
    startTransition(async () => {
      await actionScheduleMediaDistribution(
        project.id,
        ((formData.get('channel') as string) || 'LinkedIn') as MediaChannel,
        (formData.get('when') as string) ?? undefined,
      )
      event.currentTarget.reset()
      await refreshMedia()
    })
  }

  const usageRatePercent = useMemo(() => Math.round(metrics.usageRate * 100), [metrics.usageRate])

  return (
    <div className="space-y-6">
      <PageHeader className="rounded-xl border border-[color:var(--color-outline)]">
        <PageTitle>Content Studio</PageTitle>
        <PageDescription>
          Editorial calendar, revenue experiments, and media pipelines in one workspace.
        </PageDescription>
        <div className="flex flex-wrap items-center gap-2 text-sm">
          <Badge variant="success">{items.filter(item => item.status === 'Published').length} Published</Badge>
          <Badge variant="default">{items.filter(item => item.status !== 'Published').length} In Motion</Badge>
        </div>
      </PageHeader>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Influenced pipeline</CardTitle>
            <CardDescription>Attributed to content touches</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-semibold text-[color:var(--color-text)]">${metrics.influenced.toLocaleString()}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Advanced pipeline</CardTitle>
            <CardDescription>Opportunities moved forward</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-semibold text-[color:var(--color-text)]">${metrics.advanced.toLocaleString()}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Closed won</CardTitle>
            <CardDescription>Influenced via content</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-semibold text-[color:var(--color-text)]">${metrics.closedWon.toLocaleString()}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Usage rate</CardTitle>
            <CardDescription>Touches per asset</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-semibold text-[color:var(--color-text)]">{usageRatePercent}%</p>
            <p className="mt-1 text-xs text-[color:var(--color-text-muted)]">{metrics.views.toLocaleString()} views · {metrics.ctr}% CTR</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 xl:grid-cols-[2fr_minmax(320px,1fr)]">
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <CardTitle>QRA suggestions</CardTitle>
                  <CardDescription>Top content and media moves from pipeline gaps.</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <Tabs defaultValue="content">
                <TabsList>
                  <TabsTrigger value="content">Content</TabsTrigger>
                  <TabsTrigger value="media">Media Agent</TabsTrigger>
                </TabsList>
                <TabsContent value="content" className="border-none p-0">
                  <div className="grid gap-4 md:grid-cols-3">
                    {suggestions.map(suggestion => (
                      <div key={suggestion.id} className="rounded-lg border border-[color:var(--color-outline)] bg-white p-4">
                        <p className="font-medium text-[color:var(--color-text)]">{suggestion.title}</p>
                        <p className="mt-1 text-xs uppercase tracking-wide text-[color:var(--color-text-muted)]">
                          {suggestion.persona} · {suggestion.stage}
                        </p>
                        <p className="mt-2 text-sm text-[color:var(--color-text-muted)]">Objection: {suggestion.objection}</p>
                        <p className="mt-2 text-xs text-[color:var(--color-text-muted)]">
                          Impact {suggestion.expectedImpact} · Effort {suggestion.effort}
                        </p>
                        <Button
                          variant="primary"
                          size="sm"
                          className="mt-3"
                          onClick={() => handleCreateDraftFromSuggestion(suggestion)}
                          disabled={isPending}
                        >
                          Create draft
                        </Button>
                      </div>
                    ))}
                  </div>
                </TabsContent>
                <TabsContent value="media" className="border-none p-0">
                  <div className="grid gap-4 md:grid-cols-3">
                    {mediaIdeas.map(idea => (
                      <div key={idea.id} className="rounded-lg border border-[color:var(--color-outline)] bg-white p-4">
                        <p className="font-medium text-[color:var(--color-text)]">{idea.title}</p>
                        <p className="mt-1 text-xs uppercase tracking-wide text-[color:var(--color-text-muted)]">
                          {idea.persona} · {idea.stage}
                        </p>
                        <p className="mt-2 text-sm text-[color:var(--color-text-muted)]">{idea.objection}</p>
                        <p className="mt-2 text-xs text-[color:var(--color-text-muted)]">
                          Impact {idea.expectedImpact} · Effort {idea.effort}
                        </p>
                        <Button
                          variant="outline"
                          size="sm"
                          className="mt-3"
                          onClick={() => handleCreateMediaProject(idea)}
                          disabled={isPending}
                        >
                          Create media project
                        </Button>
                      </div>
                    ))}
                  </div>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Kanban</CardTitle>
              <CardDescription>Idea to published, ready for revenue activation.</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">
                {statusOrder.map(status => (
                  <div key={status} className="rounded-lg border border-[color:var(--color-outline)] bg-[color:var(--color-surface)] p-3">
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-semibold text-[color:var(--color-text)]">{status}</p>
                      <Badge variant="outline">{items.filter(item => item.status === status).length}</Badge>
                    </div>
                    <div className="mt-3 space-y-3">
                      {items
                        .filter(item => item.status === status)
                        .map(item => (
                          <div
                            key={item.id}
                            className="space-y-2 rounded-md border border-[color:var(--color-outline)] bg-white p-3 text-sm shadow-sm transition hover:border-[color:var(--color-accent-muted)]"
                          >
                            <button
                              type="button"
                              className="text-left text-[color:var(--color-text)]"
                              onClick={() => {
                                setSelectedItemId(item.id)
                                setActiveDrawerTab('overview')
                              }}
                            >
                              <span className="font-medium">{item.title}</span>
                              <span className="mt-1 block text-xs text-[color:var(--color-text-muted)]">
                                {item.persona} · {item.stage}
                              </span>
                            </button>
                            <div className="flex items-center gap-2">
                              <Button
                                size="sm"
                                className="h-7 px-2 text-[11px]"
                                variant="outline"
                                onClick={() => handleMove(item, 'back')}
                                disabled={status === 'Idea' || isPending}
                              >
                                Back
                              </Button>
                              <Button
                                size="sm"
                                className="h-7 px-2 text-[11px]"
                                variant="primary"
                                onClick={() => handleMove(item, 'forward')}
                                disabled={status === 'Published' || isPending}
                              >
                                Move
                              </Button>
                              <Button
                                size="sm"
                                className="h-7 px-2 text-[11px]"
                                variant="outline"
                                onClick={() => handleCopySnippet(item)}
                              >
                                Copy
                              </Button>
                            </div>
                          </div>
                        ))}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Media Agent</CardTitle>
              <CardDescription>Coordinate Jellypod production and distribution.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
                <Card className="border-dashed">
                  <CardHeader>
                    <CardTitle className="text-base">Influenced pipeline</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-2xl font-semibold text-[color:var(--color-text)]">
                      ${mediaMetrics.influenced.toLocaleString()}
                    </p>
                  </CardContent>
                </Card>
                <Card className="border-dashed">
                  <CardHeader>
                    <CardTitle className="text-base">Advanced</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-2xl font-semibold text-[color:var(--color-text)]">
                      ${mediaMetrics.advanced.toLocaleString()}
                    </p>
                  </CardContent>
                </Card>
                <Card className="border-dashed">
                  <CardHeader>
                    <CardTitle className="text-base">Closed won</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-2xl font-semibold text-[color:var(--color-text)]">
                      ${mediaMetrics.closedWon.toLocaleString()}
                    </p>
                  </CardContent>
                </Card>
                <Card className="border-dashed">
                  <CardHeader>
                    <CardTitle className="text-base">Reach</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-2xl font-semibold text-[color:var(--color-text)]">
                      {mediaMetrics.views.toLocaleString()} views
                    </p>
                    <p className="mt-1 text-xs text-[color:var(--color-text-muted)]">CTR {mediaMetrics.ctr}%</p>
                  </CardContent>
                </Card>
              </div>

              <div className="space-y-4">
                {mediaProjectsWithIdea.map(({ project, idea, scheduled }) => (
                  <div key={project.id} className="rounded-lg border border-[color:var(--color-outline)] bg-white p-4">
                    <div className="flex flex-wrap items-center justify-between gap-3">
                      <div>
                        <p className="font-semibold text-[color:var(--color-text)]">{idea?.title ?? 'Media project'}</p>
                        <p className="text-xs uppercase tracking-wide text-[color:var(--color-text-muted)]">
                          {idea?.persona ?? 'Persona'} · {idea?.stage ?? 'Stage'}
                        </p>
                      </div>
                      <Badge variant={project.status === 'Published' ? 'success' : 'outline'}>{project.status}</Badge>
                    </div>
                    <div className="mt-3 flex flex-wrap gap-2">
                      {project.jellypodUrl ? (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => window.open(project.jellypodUrl!, '_blank', 'noopener,noreferrer')}
                        >
                          Record in Jellypod
                        </Button>
                      ) : null}
                      <Button
                        size="sm"
                        variant="primary"
                        onClick={() => handleMarkRecording(project)}
                        disabled={isPending}
                      >
                        Mark recording
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => {
                          setTranscriptTarget(project)
                          setTranscriptDraft(project.transcript ?? '')
                        }}
                      >
                        Paste transcript
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleGenerateAssets(project)}
                        disabled={isPending}
                      >
                        Generate assets
                      </Button>
                    </div>
                    {project.artifacts.podcastUrl || project.artifacts.youtubeUrl ? (
                      <div className="mt-4 grid gap-2 text-sm text-[color:var(--color-text)]">
                        {project.artifacts.podcastUrl ? (
                          <a
                            href={project.artifacts.podcastUrl}
                            className="text-[color:var(--color-accent)] underline"
                            target="_blank"
                            rel="noreferrer"
                          >
                            Podcast episode
                          </a>
                        ) : null}
                        {project.artifacts.youtubeUrl ? (
                          <a
                            href={project.artifacts.youtubeUrl}
                            className="text-[color:var(--color-accent)] underline"
                            target="_blank"
                            rel="noreferrer"
                          >
                            YouTube cut
                          </a>
                        ) : null}
                        {project.artifacts.shorts.length ? (
                          <div>
                            <p className="font-medium">Shorts</p>
                            <ul className="mt-1 list-inside list-disc text-xs text-[color:var(--color-text-muted)]">
                              {project.artifacts.shorts.map(short => (
                                <li key={short}>{short}</li>
                              ))}
                            </ul>
                          </div>
                        ) : null}
                        {project.artifacts.social.length ? (
                          <div>
                            <p className="font-medium">Social copy</p>
                            <ul className="mt-1 list-inside list-disc text-xs text-[color:var(--color-text-muted)]">
                              {project.artifacts.social.map(post => (
                                <li key={post}>{post}</li>
                              ))}
                            </ul>
                          </div>
                        ) : null}
                        {project.artifacts.emails.length ? (
                          <div>
                            <p className="font-medium">Emails</p>
                            <ul className="mt-1 list-inside list-disc text-xs text-[color:var(--color-text-muted)]">
                              {project.artifacts.emails.map(email => (
                                <li key={email}>{email}</li>
                              ))}
                            </ul>
                          </div>
                        ) : null}
                        {project.artifacts.thumbnailPrompt ? (
                          <p className="text-xs text-[color:var(--color-text-muted)]">
                            Thumbnail: {project.artifacts.thumbnailPrompt}
                          </p>
                        ) : null}
                      </div>
                    ) : null}
                    <form className="mt-4 flex flex-wrap gap-2" onSubmit={event => handleScheduleMedia(event, project)}>
                      <Select name="channel" defaultValue="LinkedIn" className="w-32">
                        {distributionChannels.map(channel => (
                          <option key={channel} value={channel}>
                            {channel}
                          </option>
                        ))}
                      </Select>
                      <Input type="datetime-local" name="when" className="w-48" />
                      <Button type="submit" variant="outline" size="sm" disabled={isPending}>
                        Schedule
                      </Button>
                    </form>
                    {scheduled.length ? (
                      <div className="mt-3 text-xs text-[color:var(--color-text-muted)]">
                        <p className="font-medium text-[color:var(--color-text)]">Distribution</p>
                        <ul className="mt-1 space-y-1">
                          {scheduled.map(entry => (
                            <li key={entry.id}>
                              {entry.channel} · {entry.scheduledAt ? new Date(entry.scheduledAt).toLocaleString() : 'Pending'}
                            </li>
                          ))}
                        </ul>
                      </div>
                    ) : null}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Request intake</CardTitle>
              <CardDescription>Capture new briefs with SLA targets.</CardDescription>
            </CardHeader>
            <CardContent>
              <form className="space-y-3" onSubmit={handleRequestSubmit}>
                <Input
                  placeholder="Asset title"
                  value={requestForm.title}
                  onChange={event => setRequestForm(form => ({ ...form, title: event.target.value }))}
                />
                <Input
                  placeholder="Persona"
                  value={requestForm.persona}
                  onChange={event => setRequestForm(form => ({ ...form, persona: event.target.value }))}
                />
                <Select
                  value={requestForm.stage}
                  onChange={event => setRequestForm(form => ({ ...form, stage: event.target.value as ContentItem['stage'] }))}
                >
                  {stageOptions.map(option => (
                    <option key={option} value={option}>
                      {option}
                    </option>
                  ))}
                </Select>
                <Input
                  placeholder="Objection"
                  value={requestForm.objection}
                  onChange={event => setRequestForm(form => ({ ...form, objection: event.target.value }))}
                />
                <Select
                  value={requestForm.priority}
                  onChange={event => setRequestForm(form => ({ ...form, priority: event.target.value }))}
                >
                  <option value="High">High</option>
                  <option value="Medium">Medium</option>
                  <option value="Low">Low</option>
                </Select>
                <Button type="submit" variant="primary" disabled={isPending}>
                  Log request
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>

      <Sheet open={!!selectedItem} onOpenChange={open => !open && setSelectedItemId(null)}>
        <SheetContent className="max-w-lg overflow-y-auto">
          {selectedItem ? (
            <div className="flex h-full flex-col gap-4">
              <SheetHeader>
                <SheetTitle>{selectedItem.title}</SheetTitle>
                <p className="text-sm text-[color:var(--color-text-muted)]">
                  {selectedItem.persona} · {selectedItem.stage}
                </p>
              </SheetHeader>
              <Tabs value={activeDrawerTab} onValueChange={setActiveDrawerTab} defaultValue="overview">
                <TabsList className="w-full justify-start">
                  <TabsTrigger value="overview">Overview</TabsTrigger>
                  <TabsTrigger value="brief">Brief</TabsTrigger>
                  <TabsTrigger value="variants">Variants</TabsTrigger>
                  <TabsTrigger value="distribution">Distribution</TabsTrigger>
                  <TabsTrigger value="performance">Performance</TabsTrigger>
                </TabsList>
                <TabsContent value="overview">
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-medium text-[color:var(--color-text)]">Status</p>
                      <Badge variant="outline">SLA {selectedItem.sla}</Badge>
                    </div>
                    <Select value={selectedItem.status} onChange={event => handleStatusChange(event.target.value as ContentStatus)}>
                      {statusOrder.map(status => (
                        <option key={status} value={status}>
                          {status}
                        </option>
                      ))}
                    </Select>
                    <div className="grid grid-cols-2 gap-2 text-sm text-[color:var(--color-text-muted)]">
                      <div>
                        <p className="font-medium text-[color:var(--color-text)]">Owner</p>
                        <p>{selectedItem.ownerId}</p>
                      </div>
                      <div>
                        <p className="font-medium text-[color:var(--color-text)]">Created</p>
                        <p>{new Date(selectedItem.createdAt).toLocaleDateString()}</p>
                      </div>
                      <div>
                        <p className="font-medium text-[color:var(--color-text)]">Type</p>
                        <p>{selectedItem.type}</p>
                      </div>
                      <div>
                        <p className="font-medium text-[color:var(--color-text)]">Cost</p>
                        <p>${selectedItem.cost.toLocaleString()}</p>
                      </div>
                    </div>
                    <Button variant="outline" size="sm" onClick={() => handleCopySnippet(selectedItem)}>
                      Copy snippet
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      disabled={isPending}
                      onClick={() => handleInsertIntoEmail(selectedItem)}
                    >
                      Insert into email
                    </Button>
                    {composeMessage ? (
                      <p className="text-[11px] text-[color:var(--color-text-muted)]">{composeMessage}</p>
                    ) : null}
                  </div>
                </TabsContent>
                <TabsContent value="brief">
                  <form className="space-y-3" onSubmit={handleBriefSave}>
                    <Input name="cta" placeholder="CTA" defaultValue={selectedItem.brief?.cta} />
                    <textarea
                      name="outline"
                      placeholder="Outline"
                      defaultValue={selectedItem.brief?.outline}
                      className="h-24 w-full rounded-md border border-[color:var(--color-outline)] p-2 text-sm"
                    />
                    <textarea
                      name="notes"
                      placeholder="Notes"
                      defaultValue={selectedItem.brief?.notes}
                      className="h-20 w-full rounded-md border border-[color:var(--color-outline)] p-2 text-sm"
                    />
                    <Button type="submit" variant="primary" disabled={isPending}>
                      Save brief
                    </Button>
                  </form>
                </TabsContent>
                <TabsContent value="variants">
                  <div className="space-y-4">
                    <div className="space-y-2">
                      {relatedVariants.length ? (
                        relatedVariants.map(variant => {
                          const touchesForContent = relatedTouches.length
                          const shouldDecide = touchesForContent >= 5 || (metrics.views ?? 0) >= 200
                          return (
                            <div
                              key={variant.id}
                              className="rounded-md border border-[color:var(--color-outline)] bg-white p-3 text-sm"
                            >
                              <p className="font-medium text-[color:var(--color-text)]">{variant.headline}</p>
                              <p className="text-xs uppercase tracking-wide text-[color:var(--color-text-muted)]">
                                {variant.kind} · Group {variant.group ?? '—'}
                              </p>
                              <p className="mt-1 text-xs text-[color:var(--color-text-muted)]">CTA: {variant.cta}</p>
                              <p className="mt-2 text-xs text-[color:var(--color-accent)]">Status: {variant.status}</p>
                              {shouldDecide ? (
                                <div className="mt-2 flex gap-2">
                                  <Button
                                    size="sm"
                                    className="h-7 px-2 text-[11px]"
                                    variant="outline"
                                    onClick={() => handleVariantDecision(variant, 'kill')}
                                  >
                                    Kill
                                  </Button>
                                  <Button
                                    size="sm"
                                    className="h-7 px-2 text-[11px]"
                                    variant="primary"
                                    onClick={() => handleVariantDecision(variant, 'scale')}
                                  >
                                    Scale
                                  </Button>
                                </div>
                              ) : null}
                            </div>
                          )
                        })
                      ) : (
                        <p className="text-sm text-[color:var(--color-text-muted)]">No variants yet.</p>
                      )}
                    </div>
                    <form className="space-y-2" onSubmit={handleVariantCreate}>
                      <Input name="kind" placeholder="Variant type" />
                      <Input name="headline" placeholder="Headline" />
                      <Input name="cta" placeholder="CTA" />
                      <Select name="group" defaultValue="">
                        <option value="">Group</option>
                        <option value="A">A</option>
                        <option value="B">B</option>
                      </Select>
                      <Button type="submit" variant="outline" size="sm" disabled={isPending}>
                        New variant
                      </Button>
                    </form>
                  </div>
                </TabsContent>
                <TabsContent value="distribution">
                  <div className="space-y-4">
                    <form className="flex flex-col gap-2" onSubmit={handleDistributionSchedule}>
                      <Select name="channel" defaultValue="LinkedIn">
                        {distributionChannels.map(channel => (
                          <option key={channel} value={channel}>
                            {channel}
                          </option>
                        ))}
                      </Select>
                      <Input name="utm" placeholder="Generate UTM" />
                      <Input type="datetime-local" name="when" />
                      <Button type="submit" variant="outline" size="sm" disabled={isPending}>
                        Schedule drop
                      </Button>
                    </form>
                    <Button variant="primary" size="sm" onClick={handlePublishStub} disabled={isPending}>
                      Publish (stub)
                    </Button>
                    <div className="space-y-2 text-sm text-[color:var(--color-text)]">
                      {relatedDistributions.length ? (
                        relatedDistributions.map(entry => (
                          <div key={entry.id} className="rounded border border-[color:var(--color-outline)] p-2">
                            <p className="font-medium">{entry.channel}</p>
                            <p className="text-xs text-[color:var(--color-text-muted)]">
                              {entry.scheduledAt
                                ? `Scheduled ${new Date(entry.scheduledAt).toLocaleString()}`
                                : entry.publishedAt
                                  ? `Published ${new Date(entry.publishedAt).toLocaleString()}`
                                  : 'Pending'}
                            </p>
                            {entry.utm ? <p className="text-xs text-[color:var(--color-text-muted)]">{entry.utm}</p> : null}
                          </div>
                        ))
                      ) : (
                        <p className="text-sm text-[color:var(--color-text-muted)]">No distribution planned.</p>
                      )}
                    </div>
                  </div>
                </TabsContent>
                <TabsContent value="performance">
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-2 text-xs text-[color:var(--color-text-muted)]">
                      <div className="rounded-md border border-dashed border-[color:var(--color-outline)] p-3">
                        <p className="text-xs font-semibold text-[color:var(--color-text)]">Touches</p>
                        <p>{relatedTouches.length}</p>
                      </div>
                      <div className="rounded-md border border-dashed border-[color:var(--color-outline)] p-3">
                        <p className="text-xs font-semibold text-[color:var(--color-text)]">Variant decision</p>
                        <p>{relatedTouches.length >= 5 ? 'Ready for decision' : 'Collecting data'}</p>
                      </div>
                    </div>
                    <form className="grid gap-2" onSubmit={handleTouchCreate}>
                      <Input name="opportunity" placeholder="Opportunity ID" />
                      <Input name="actor" placeholder="Actor" />
                      <Select name="touch-action" defaultValue="used">
                        <option value="used">Used</option>
                        <option value="worked">Worked</option>
                        <option value="failed">Failed</option>
                      </Select>
                      <Button type="submit" size="sm" variant="outline" disabled={isPending}>
                        Log touch
                      </Button>
                    </form>
                    <div className="rounded-lg border border-[color:var(--color-outline)]">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Opportunity</TableHead>
                            <TableHead>Actor</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead>Logged</TableHead>
                            <TableHead className="text-right">Actions</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {relatedTouches.length ? (
                            relatedTouches.map(touch => (
                              <TableRow key={touch.id}>
                                <TableCell>{touch.opportunityId}</TableCell>
                                <TableCell>{touch.actor}</TableCell>
                                <TableCell>
                                  <Badge
                                    variant={
                                      touch.action === 'worked'
                                        ? 'success'
                                        : touch.action === 'failed'
                                          ? 'outline'
                                          : 'default'
                                    }
                                  >
                                    {touch.action}
                                  </Badge>
                                </TableCell>
                                <TableCell className="text-xs text-[color:var(--color-text-muted)]">
                                  {new Date(touch.ts).toLocaleString()}
                                </TableCell>
                                <TableCell className="space-x-1 text-right">
                                  <Button
                                    size="sm"
                                    className="h-7 px-2 text-[11px]"
                                    variant="outline"
                                    onClick={() => handleTouchUpdate(touch, 'worked')}
                                  >
                                    Worked
                                  </Button>
                                  <Button
                                    size="sm"
                                    className="h-7 px-2 text-[11px]"
                                    variant="outline"
                                    onClick={() => handleTouchUpdate(touch, 'failed')}
                                  >
                                    Failed
                                  </Button>
                                </TableCell>
                              </TableRow>
                            ))
                          ) : (
                            <TableRow>
                              <TableCell colSpan={5} className="text-center text-sm text-[color:var(--color-text-muted)]">
                                No touches recorded yet.
                              </TableCell>
                            </TableRow>
                          )}
                        </TableBody>
                      </Table>
                    </div>
                  </div>
                </TabsContent>
              </Tabs>
              <SheetFooter>
                <SheetClose>
                  <Button variant="outline">Close</Button>
                </SheetClose>
              </SheetFooter>
            </div>
          ) : null}
        </SheetContent>
      </Sheet>

      <Dialog open={!!transcriptTarget} onOpenChange={open => !open && setTranscriptTarget(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Ingest transcript</DialogTitle>
            <DialogDescription>Drop Jellypod transcript for asset generation.</DialogDescription>
          </DialogHeader>
          <textarea
            value={transcriptDraft}
            onChange={event => setTranscriptDraft(event.target.value)}
            className="mt-4 h-40 w-full rounded-md border border-[color:var(--color-outline)] p-2 text-sm"
            placeholder="Paste transcript..."
          />
          <DialogFooter>
            <DialogClose>
              <Button variant="outline">Cancel</Button>
            </DialogClose>
            <Button variant="primary" onClick={handleTranscriptSave} disabled={isPending || !transcriptDraft.trim()}>
              Save transcript
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
