import { ContentItem } from './types'
import { listContentItems } from './store'

type ContentSuggestion = {
  id: string
  title: string
  persona: string
  stage: ContentItem['stage']
  objection: string
  expectedImpact: string
  effort: string
}

const stagePriority: Record<ContentItem['stage'], number> = {
  Discovery: 1,
  Evaluation: 3,
  Decision: 5,
  Onboarding: 2,
  Adoption: 4,
}

export function nextBestContent(_openOppsStub?: Array<{ stage: ContentItem['stage'] }>): ContentSuggestion[] {
  const items = listContentItems()
  const backlog = items.filter(item => item.status !== 'Published')

  const ranked = backlog
    .map(item => {
      const urgency = stagePriority[item.stage] + (item.status === 'Idea' ? 2 : item.status === 'Draft' ? 1 : 0)
      const impact = item.persona.includes('CFO') ? 'High' : item.persona.includes('COO') ? 'Medium' : 'Steady'
      const effort = item.cost > 1500 ? 'High' : item.cost > 900 ? 'Medium' : 'Low'
      return {
        id: item.id,
        title: item.title,
        persona: item.persona,
        stage: item.stage,
        objection: item.objection,
        score: urgency + (impact === 'High' ? 2 : impact === 'Medium' ? 1 : 0),
        expectedImpact: impact,
        effort,
      }
    })
    .sort((a, b) => b.score - a.score)

  return ranked.slice(0, 3).map(({ score, ...rest }) => rest)
}

export type { ContentSuggestion }
