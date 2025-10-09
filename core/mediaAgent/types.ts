export interface MediaIdea {
  id: string
  title: string
  persona: string
  stage: string
  objection: string
  expectedImpact: string
  effort: string
}

export type MediaProjectStatus = 'Planned' | 'Recording' | 'Post' | 'Scheduled' | 'Published'

export interface MediaProject {
  id: string
  ideaId: string
  status: MediaProjectStatus
  jellypodUrl?: string
  transcript?: string
  artifacts: {
    podcastUrl?: string
    youtubeUrl?: string
    shorts: string[]
    social: string[]
    emails: string[]
    thumbnailPrompt?: string
  }
}

export type MediaChannel = 'YouTube' | 'Podcast' | 'LinkedIn' | 'X' | 'Email' | 'Partner'

export interface MediaDistribution {
  id: string
  projectId: string
  channel: MediaChannel
  scheduledAt?: string | null
  publishedAt?: string | null
  utm?: string | null
}

export interface MediaMetrics {
  influenced: number
  advanced: number
  closedWon: number
  views: number
  ctr: number
}
