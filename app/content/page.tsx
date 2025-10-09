import { ContentStudio } from './content-studio'
import { computeMetrics, getContentState } from '@/core/content/store'
import { nextBestContent } from '@/core/content/recommender'
import { computeMediaMetrics, getMediaState } from '@/core/mediaAgent/store'
import { suggestMediaFromPipeline } from '@/core/mediaAgent/recommender'

export default async function ContentPage() {
  const contentState = getContentState()
  const metrics = computeMetrics()
  const suggestions = nextBestContent()
  const mediaState = getMediaState()
  const mediaMetrics = computeMediaMetrics()
  const mediaIdeas = suggestMediaFromPipeline()

  return (
    <ContentStudio
      initialItems={contentState.items}
      initialVariants={contentState.variants}
      initialDistributions={contentState.distributions}
      initialTouches={contentState.touches}
      metrics={metrics}
      suggestions={suggestions}
      mediaIdeas={mediaIdeas}
      mediaProjects={mediaState.projects}
      mediaDistributions={mediaState.distributions}
      mediaMetrics={mediaMetrics}
    />
  )
}
