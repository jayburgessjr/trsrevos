import { MediaIdea } from './types'
import { listIdeas } from './store'

export function suggestMediaFromPipeline(): MediaIdea[] {
  const allIdeas = listIdeas()
  return allIdeas.slice(0, 3)
}
