import { calculatePriorityScore } from './score'
import { Plan, PriorityItem } from './types'

const library: Array<Omit<PriorityItem, 'id' | 'score'>> = [
  {
    title: 'Reset top 10 opportunities forecast',
    summary: 'Tighten probability weights ahead of exec huddle.',
    nextAction: 'Review pipeline analytics and update Close IO records.',
    expectedImpact: 8,
    probability: 0.7,
    strategicWeight: 1.2,
    urgency: 1.1,
    confidence: 0.8,
    effort: 3,
    status: 'pending',
    ownerName: 'You',
  },
  {
    title: 'Draft partner enablement brief',
    summary: 'Refresh co-selling guidance for Q4 incentives.',
    nextAction: 'Outline talking points and assign SMEs for review.',
    expectedImpact: 6,
    probability: 0.65,
    strategicWeight: 1.3,
    urgency: 1,
    confidence: 0.7,
    effort: 2,
    status: 'pending',
    ownerName: 'You',
  },
  {
    title: 'Finance reconciliation sweep',
    summary: 'Confirm ARR deltas align with RevOps model.',
    nextAction: 'Sync with finance lead on flagged invoices.',
    expectedImpact: 7,
    probability: 0.6,
    strategicWeight: 1.4,
    urgency: 1.2,
    confidence: 0.75,
    effort: 2.5,
    status: 'pending',
    ownerName: 'You',
  },
  {
    title: 'Client renewal scenario planning',
    summary: 'Frame options for 3 at-risk customers.',
    nextAction: 'Draft next steps doc and share with AM team.',
    expectedImpact: 9,
    probability: 0.55,
    strategicWeight: 1.6,
    urgency: 1.3,
    confidence: 0.65,
    effort: 3.5,
    status: 'pending',
    ownerName: 'You',
  },
  {
    title: 'Content audit for weekly briefing',
    summary: 'Ensure stories align with TRS Score movements.',
    nextAction: 'Collect highlights from marketing insights.',
    expectedImpact: 5,
    probability: 0.7,
    strategicWeight: 1,
    urgency: 0.9,
    confidence: 0.8,
    effort: 1.5,
    status: 'pending',
    ownerName: 'You',
  },
  {
    title: 'Partner onboarding pulse',
    summary: 'Check readiness of two new ecosystem partners.',
    nextAction: 'Send enablement kit and confirm product access.',
    expectedImpact: 4,
    probability: 0.8,
    strategicWeight: 0.9,
    urgency: 1,
    confidence: 0.85,
    effort: 1.2,
    status: 'pending',
    ownerName: 'You',
  },
  {
    title: 'Executive briefing narrative',
    summary: 'Prep story for Monday leadership standup.',
    nextAction: 'Draft slides with refreshed revenue north star.',
    expectedImpact: 8,
    probability: 0.75,
    strategicWeight: 1.5,
    urgency: 1.2,
    confidence: 0.7,
    effort: 3,
    status: 'pending',
    ownerName: 'You',
  },
]

export async function computeDailyPlan(userId: string, date: Date): Promise<Plan> {
  const day = date.toISOString().slice(0, 10)
  const randomSpan = 5 + Math.floor(Math.random() * 3)
  const sampleSize = Math.min(library.length, randomSpan)
  const selected = library.slice(0, sampleSize).map((item, index) => {
    const score = calculatePriorityScore(item)
    return {
      ...item,
      id: `${day}-${index + 1}`,
      score,
    }
  })

  const sorted = [...selected].sort((a, b) => b.score - a.score)

  return {
    id: `${userId}-${day}`,
    userId,
    date: day,
    generatedAt: new Date().toISOString(),
    locked: false,
    items: sorted,
  }
}
