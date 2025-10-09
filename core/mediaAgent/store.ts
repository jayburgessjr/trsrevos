import {
  MediaChannel,
  MediaDistribution,
  MediaIdea,
  MediaMetrics,
  MediaProject,
  MediaProjectStatus,
} from './types'

const ideas: MediaIdea[] = [
  {
    id: 'idea-1',
    title: 'CFO price integrity briefing',
    persona: 'CFO',
    stage: 'Evaluation',
    objection: 'Need confidence in forecast',
    expectedImpact: 'High',
    effort: 'Medium',
  },
  {
    id: 'idea-2',
    title: 'COO rollout de-risking series',
    persona: 'COO',
    stage: 'Onboarding',
    objection: 'Worried about change fatigue',
    expectedImpact: 'Medium',
    effort: 'Medium',
  },
  {
    id: 'idea-3',
    title: 'Partner revenue playbook spotlight',
    persona: 'Partner leader',
    stage: 'Adoption',
    objection: 'Need repeatable joint wins',
    expectedImpact: 'High',
    effort: 'Low',
  },
]

const projects: MediaProject[] = [
  {
    id: 'proj-1',
    ideaId: 'idea-3',
    status: 'Post',
    jellypodUrl: 'https://jellypod.ai/new?topic=partner%20revenue%20playbook',
    transcript: 'Intro... partner co-sell wins...',
    artifacts: {
      podcastUrl: 'https://pods.example.com/partner-playbook',
      youtubeUrl: 'https://youtu.be/partner-playbook',
      shorts: ['https://shorts.example.com/partner-win'],
      social: ['Partner spotlight copy ready for LinkedIn'],
      emails: ['Draft email to partner community'],
      thumbnailPrompt: 'Partners high-fiving over dashboard',
    },
  },
]

const distributions: MediaDistribution[] = [
  {
    id: 'mdist-1',
    projectId: 'proj-1',
    channel: 'LinkedIn',
    publishedAt: new Date('2025-02-10T17:00:00Z').toISOString(),
    utm: 'utm_source=linkedin&utm_medium=social&utm_campaign=partner-playbook',
  },
]

const id = () => Math.random().toString(36).slice(2, 10)

function clone<T>(value: T): T {
  return JSON.parse(JSON.stringify(value))
}

export function listIdeas() {
  return ideas.map(idea => clone(idea))
}

export function listProjects() {
  return projects.map(project => clone(project))
}

export function listDistributions() {
  return distributions.map(entry => clone(entry))
}

export function getMediaState() {
  return {
    ideas: listIdeas(),
    projects: listProjects(),
    distributions: listDistributions(),
  }
}

export function ensureProjectForIdea(idea: MediaIdea) {
  const existing = projects.find(project => project.ideaId === idea.id)
  if (existing) {
    return clone(existing)
  }
  const project: MediaProject = {
    id: `proj-${id()}`,
    ideaId: idea.id,
    status: 'Planned',
    jellypodUrl: `https://jellypod.ai/new?topic=${encodeURIComponent(idea.title)}`,
    artifacts: {
      shorts: [],
      social: [],
      emails: [],
    },
  }
  projects.push(project)
  return clone(project)
}

export function updateProjectStatus(projectId: string, status: MediaProjectStatus) {
  const project = projects.find(entry => entry.id === projectId)
  if (!project) throw new Error(`Media project ${projectId} not found`)
  project.status = status
  if (status === 'Recording' && !project.jellypodUrl) {
    const idea = ideas.find(entry => entry.id === project.ideaId)
    project.jellypodUrl = idea
      ? `https://jellypod.ai/new?topic=${encodeURIComponent(idea.title)}`
      : `https://jellypod.ai/new?topic=${projectId}`
  }
  return clone(project)
}

export function saveTranscript(projectId: string, transcript: string) {
  const project = projects.find(entry => entry.id === projectId)
  if (!project) throw new Error(`Media project ${projectId} not found`)
  project.transcript = transcript
  if (project.status === 'Recording') {
    project.status = 'Post'
  }
  return clone(project)
}

export function attachGeneratedAssets(projectId: string) {
  const project = projects.find(entry => entry.id === projectId)
  if (!project) throw new Error(`Media project ${projectId} not found`)
  project.artifacts = {
    podcastUrl: `https://pods.example.com/${projectId}`,
    youtubeUrl: `https://youtube.com/watch?v=${projectId}`,
    shorts: [
      `https://shorts.example.com/${projectId}-clip-1`,
      `https://shorts.example.com/${projectId}-clip-2`,
    ],
    social: [
      'LinkedIn teaser copy about the ROI storyline',
      'X thread outline highlighting revenue wins',
    ],
    emails: [
      'Customer newsletter intro paragraph',
      'Sales follow-up template referencing the episode',
    ],
    thumbnailPrompt: 'Studio mic, revenue dashboard glow, confident host',
  }
  project.status = project.status === 'Planned' ? 'Post' : project.status
  return clone(project)
}

export function scheduleMediaDistribution(input: {
  projectId: string
  channel: MediaChannel
  scheduledAt?: string | null
}) {
  const distribution: MediaDistribution = {
    id: `mdist-${id()}`,
    projectId: input.projectId,
    channel: input.channel,
    scheduledAt: input.scheduledAt ?? null,
    publishedAt: null,
    utm: input.channel ? `utm_source=${input.channel.toLowerCase()}&utm_campaign=${input.projectId}` : null,
  }
  distributions.push(distribution)
  const project = projects.find(entry => entry.id === input.projectId)
  if (project) {
    project.status = project.status === 'Post' ? 'Scheduled' : project.status
  }
  return clone(distribution)
}

export function computeMediaMetrics(): MediaMetrics {
  const publishedCount = distributions.filter(entry => entry.publishedAt).length
  const scheduledCount = distributions.filter(entry => entry.scheduledAt && !entry.publishedAt).length
  return {
    influenced: (publishedCount + scheduledCount) * 8800,
    advanced: publishedCount * 6100,
    closedWon: Math.round(publishedCount * 22000 * 0.4),
    views: (publishedCount + 1) * 950,
    ctr: Number(((publishedCount / Math.max(scheduledCount + publishedCount, 1)) * 58).toFixed(2)),
  }
}
