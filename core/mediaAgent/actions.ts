'use server'

import { revalidatePath } from 'next/cache'

import {
  attachGeneratedAssets,
  computeMediaMetrics,
  ensureProjectForIdea,
  getMediaState,
  listIdeas,
  scheduleMediaDistribution,
  saveTranscript,
  updateProjectStatus,
} from './store'
import { MediaChannel } from './types'
import { suggestMediaFromPipeline } from './recommender'

const CONTENT_PATH = '/content'

export async function actionSuggestIdeas() {
  return suggestMediaFromPipeline()
}

export async function actionCreateProjectFromIdea(ideaId: string) {
  const idea = listIdeas().find(entry => entry.id === ideaId)
  if (!idea) throw new Error(`Idea ${ideaId} not found`)
  const project = ensureProjectForIdea(idea)
  revalidatePath(CONTENT_PATH)
  return project
}

export async function actionMarkRecording(projectId: string) {
  const project = updateProjectStatus(projectId, 'Recording')
  revalidatePath(CONTENT_PATH)
  return project
}

export async function actionIngestTranscript(projectId: string, transcript: string) {
  const project = saveTranscript(projectId, transcript)
  revalidatePath(CONTENT_PATH)
  return project
}

export async function actionGenerateAssets(projectId: string) {
  const project = attachGeneratedAssets(projectId)
  revalidatePath(CONTENT_PATH)
  return project
}

export async function actionScheduleDistribution(projectId: string, channel: MediaChannel, whenISO?: string) {
  const distribution = scheduleMediaDistribution({
    projectId,
    channel,
    scheduledAt: whenISO ?? null,
  })
  revalidatePath(CONTENT_PATH)
  return distribution
}

export async function actionMediaMetrics() {
  return computeMediaMetrics()
}

export async function actionMediaState() {
  return getMediaState()
}
